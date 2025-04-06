import os
import uuid
import shutil
from pathlib import Path
from typing import Dict, List, Optional, Union, Any
from datetime import datetime, timedelta
import asyncio
import time

# Import direct YOLO functions
from app.services.models.yolo_model import predict, TEMP_DIR

# Define base directory for temporary image storage
BASE_DIR = Path(__file__).resolve().parent.parent.parent
if not os.path.exists(TEMP_DIR):
    os.makedirs(TEMP_DIR, exist_ok=True)

# Storage for detection results
detection_results = {}

async def cleanup_old_images():
    """Clean up images older than 30 minutes"""
    try:
        # Get current time
        now = datetime.now()
        
        # Check all files in temp directory
        for file_path in TEMP_DIR.glob("*"):
            if file_path.is_file():
                # Get file modification time
                mod_time = datetime.fromtimestamp(file_path.stat().st_mtime)
                
                # If file is older than 30 minutes, delete it
                if now - mod_time > timedelta(minutes=30):
                    os.remove(file_path)
                    print(f"Cleaned up old file: {file_path}")
                    
        # Clean up old detection results
        to_delete = []
        for detection_id, result in detection_results.items():
            if now - result["timestamp"] > timedelta(minutes=30):
                to_delete.append(detection_id)
                
        for detection_id in to_delete:
            del detection_results[detection_id]
            print(f"Cleaned up old detection result: {detection_id}")
                
    except Exception as e:
        print(f"Error cleaning up old images: {e}")


async def save_uploaded_image(file_data: bytes) -> str:
    """
    Save uploaded image to temporary storage
    
    Args:
        file_data: Binary image data
        
    Returns:
        Unique ID for the saved image
    """
    # Generate unique ID
    image_id = str(uuid.uuid4())
    
    # Define file path
    file_path = TEMP_DIR / f"{image_id}.jpg"
    
    # Save file
    with open(file_path, "wb") as f:
        f.write(file_data)
    
    # Schedule cleanup
    asyncio.create_task(cleanup_old_images())
    
    return image_id


async def get_image_path(image_id: str) -> Optional[Path]:
    """
    Get path to a temporarily stored image
    
    Args:
        image_id: Unique ID for the image
        
    Returns:
        Path to the image or None if not found
    """
    file_path = TEMP_DIR / f"{image_id}.jpg"
    
    if file_path.exists():
        return file_path
    
    return None


async def delete_image(image_id: str) -> bool:
    """
    Delete a temporarily stored image
    
    Args:
        image_id: Unique ID for the image
        
    Returns:
        True if deleted successfully, False otherwise
    """
    file_path = TEMP_DIR / f"{image_id}.jpg"
    
    if file_path.exists():
        os.remove(file_path)
        return True
    
    return False


async def process_image(image_id: str, defaults: List[Dict]) -> Dict:
    """
    Process an image with YOLOv11 model
    
    Args:
        image_id: Unique ID for the image
        defaults: List of default quantities for ingredients
        
    Returns:
        Dictionary with detection results
    """
    # Get image path
    image_path = await get_image_path(image_id)
    
    if not image_path:
        return {
            "success": False,
            "message": f"Image with ID {image_id} not found"
        }
    
    # Run prediction with YOLO
    results = predict(str(image_path))
    
    if not results or len(results) == 0:
        return {
            "success": False,
            "message": "No objects detected in the image"
        }
    
    # Generate annotated image path
    annotated_image_id = f"{image_id}_annotated"
    annotated_image_path = TEMP_DIR / f"{annotated_image_id}.jpg"
    
    # Create annotated image
    _ = predict(str(image_path), save=True)
    
    # Find where YOLO saved the file and move to our desired location
    pred_path = TEMP_DIR / Path(image_path).name
    if pred_path.exists():
        shutil.move(str(pred_path), str(annotated_image_path))
    else:
        # Try alternative location
        pred_path = Path(TEMP_DIR) / "runs" / "detect" / "predict" / Path(image_path).name
        if pred_path.exists():
            shutil.move(str(pred_path), str(annotated_image_path))
    
    # Extract detected classes from results
    result = results[0]
    detections = []
    
    # Process boxes to get class names and confidence
    boxes = result.boxes
    for i in range(len(boxes)):
        class_id = int(boxes[i].cls)
        class_name = result.names[class_id]
        confidence = float(boxes[i].conf)
        
        detections.append({
            "class_id": class_id,
            "class_name": class_name,
            "confidence": confidence
        })
    
    # Map detected ingredients to default quantities
    detected_ingredients = map_detections_to_ingredients(detections, defaults)
    
    # Store detection results
    result_data = {
        "detection_id": image_id,
        "ingredients": detected_ingredients,
        "annotated_image_id": annotated_image_id,
        "timestamp": datetime.now()
    }
    
    detection_results[image_id] = result_data
    
    return {
        "success": True,
        "detection_id": image_id,
        "ingredients_count": len(detected_ingredients)
    }


def map_detections_to_ingredients(detections: List[Dict], defaults: List[Dict]) -> List[Dict]:
    """
    Map detected objects to ingredients with default quantities
    
    Args:
        detections: List of detected objects from YOLOv11
        defaults: List of default quantities for ingredients
        
    Returns:
        List of ingredients with suggested quantities
    """
    # Create lookup dictionary from defaults
    default_lookup = {item["ingredient_name"]: item for item in defaults}
    
    # Map detections to ingredients
    ingredients = []
    
    for detection in detections:
        ingredient_name = detection["class_name"]
        confidence = detection["confidence"]
        
        # Get default quantity if available
        if ingredient_name in default_lookup:
            default = default_lookup[ingredient_name]
            ingredients.append({
                "ingredient_name": ingredient_name,
                "confidence": confidence,
                "suggested_quantity": default["default_quantity"],
                "unit": default["unit"]
            })
        else:
            # If no default available, use placeholder values
            ingredients.append({
                "ingredient_name": ingredient_name,
                "confidence": confidence,
                "suggested_quantity": 1.0,
                "unit": "unit"
            })
    
    return ingredients


async def get_detection_result(detection_id: str) -> Optional[Dict]:
    """
    Get detection result for a processed image
    
    Args:
        detection_id: Unique ID for the detection
        
    Returns:
        Detection result dictionary or None if not found
    """
    return detection_results.get(detection_id)


async def get_annotated_image_path(detection_id: str) -> Optional[Path]:
    """
    Get path to an annotated image
    
    Args:
        detection_id: Unique ID for the detection
        
    Returns:
        Path to the annotated image or None if not found
    """
    result = detection_results.get(detection_id)
    
    if not result:
        return None
    
    annotated_image_id = result["annotated_image_id"]
    file_path = TEMP_DIR / f"{annotated_image_id}.jpg"
    
    if file_path.exists():
        return file_path
    
    return None


# Start a background task to periodically clean up old images
async def start_cleanup_task():
    """Start a background task for periodic cleanup"""
    while True:
        await cleanup_old_images()
        await asyncio.sleep(300)  # Run every 5 minutes 