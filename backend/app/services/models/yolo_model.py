from ultralytics import YOLO
from pathlib import Path
import os
import shutil
import cv2
import numpy as np
import psutil
import datetime
import asyncio

# Base directory for model files
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
MODEL_DIR = BASE_DIR / "models"
TEMP_DIR = BASE_DIR / "temp_images"
PREDICT_DIR = TEMP_DIR / "predict"

# Create model directory if it doesn't exist
os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(PREDICT_DIR, exist_ok=True)

# Default model path
DEFAULT_MODEL_PATH = str(MODEL_DIR / "yolo11-model.pt")

# Global model instance (loaded once and reused)
_model = None

def log_memory_usage(label=""):
    """Log current memory usage"""
    process = psutil.Process(os.getpid())
    memory_mb = process.memory_info().rss / (1024 * 1024)  # Convert to MB
    print(f"Memory usage {label}: {memory_mb:.2f} MB")

def get_model(model_path=None):
    """Get or load the YOLO model."""
    global _model
    
    if _model is None:
        model_path = model_path or DEFAULT_MODEL_PATH
        try:
            log_memory_usage("Before loading model")
            _model = YOLO(model_path)
            log_memory_usage("After loading model")
            print(f"Model loaded from: {model_path}")
        except Exception as e:
            print(f"Error loading model: {e}")
            return None
    
    return _model

def predict(image_path, conf=0.7, save=False, output_path=None):
    """Run prediction with YOLO model."""
    log_memory_usage("Before model load")
    
    model = get_model()
    log_memory_usage("After model load")
    
    if model is None:
        return None
    
    try:
        # Extract the image ID from the path
        image_id = Path(image_path).stem
        
        log_memory_usage("Before image read")
        # Read and resize the image
        img = cv2.imread(str(image_path))
        img = cv2.resize(img, (640, 640))
        log_memory_usage("After image resize")

        # Run prediction on resized image
        results = model.predict(
            source=img,
            imgsz=640,
            conf=conf,
            save=save,
            save_txt=False,
            half=True,
            line_width=2,
            show_labels=True,
            show_conf=True,
            project=str(TEMP_DIR) if save else None,
            name="predict" if save else None,
            exist_ok=True
        )
        log_memory_usage("After prediction")
        
        # If save is True, make sure the annotated image exists with proper filename
        if save:
            log_memory_usage("Before saving annotated image")
            # The annotated image might have been saved with a numeric index
            # Let's find it and rename it to match the original image ID
            
            # Find the most recent plotted image in the predict directory
            # (Usually saved as 0.jpg, 1.jpg, etc.)
            plotted_images = list(PREDICT_DIR.glob("*.jpg"))
            if plotted_images:
                latest_image = max(plotted_images, key=lambda p: p.stat().st_mtime)
                
                # Set the target filename based on the original image ID
                target_filename = PREDICT_DIR / f"{image_id}.jpg"
                
                # Remove existing target file if it exists
                if target_filename.exists():
                    os.remove(target_filename)
                
                # Copy the latest plotted image to the target filename
                shutil.copy2(latest_image, target_filename)
                
                print(f"Saved annotated image for {image_id} at {target_filename}")
                #delete_all_temp_images()
                asyncio.create_task(delayed_cleanup())

            else:
                # If no plotted image was found, we need to create one manually
                # Get the plotted result from the results object
                result_img = results[0].plot()  # This returns the annotated image as a numpy array
                
                # Convert BGR to RGB (OpenCV uses BGR, but result might be RGB)
                if len(result_img.shape) == 3 and result_img.shape[2] == 3:
                    result_img = cv2.cvtColor(result_img, cv2.COLOR_RGB2BGR)
                
                # Save the annotated image with the image ID
                target_filename = PREDICT_DIR / f"{image_id}.jpg"
                cv2.imwrite(str(target_filename), result_img)
                
                print(f"Manually saved annotated image for {image_id} at {target_filename}")
            log_memory_usage("After saving annotated image")
        
        return results
    except Exception as e:
        print(f"Error predicting: {e}")
        import traceback
        traceback.print_exc()
        return None 

def cleanup_prediction_files(older_than_minutes=1):
    """Clean up prediction files older than the specified time"""
    log_memory_usage("Before cleanup")
    try:
        # Get current time
        now = datetime.datetime.now()
        
        # Check all files in predict directory
        cleaned_count = 0
        for file_path in PREDICT_DIR.glob("*"):
            if file_path.is_file():
                # Get file modification time
                mod_time = datetime.datetime.fromtimestamp(file_path.stat().st_mtime)
                
                # If file is older than specified minutes, delete it
                if now - mod_time > datetime.timedelta(minutes=older_than_minutes):
                    os.remove(file_path)
                    cleaned_count += 1
        
        if cleaned_count > 0:
            print(f"Cleaned up {cleaned_count} old prediction files")
        
        log_memory_usage("After cleanup")
        return cleaned_count
    except Exception as e:
        print(f"Error cleaning up prediction files: {e}")
        return 0 

def delete_prediction_file(image_id: str) -> bool:
    """
    Delete a prediction image from the predict directory
    
    Args:
        image_id: ID of the image to delete
        
    Returns:
        True if deleted successfully, False otherwise
    """
    log_memory_usage(f"Before deleting prediction for {image_id}")
    
    # Path to the prediction file
    file_path = PREDICT_DIR / f"{image_id}.jpg"
    
    # Delete if it exists
    if file_path.exists():
        os.remove(file_path)
        print(f"Deleted prediction file: {file_path}")
        log_memory_usage(f"After deleting prediction for {image_id}")
        return True
    
    log_memory_usage(f"After checking prediction for {image_id} (not found)")
    return False 

def delete_all_temp_images():
    """Delete all image files in both TEMP_DIR and PREDICT_DIR"""
    deleted_count = 0
    
    # Delete files in TEMP_DIR
    for ext in ['*.jpg', '*.jpeg', '*.JPG', '*.JPEG']:
        for file_path in TEMP_DIR.glob(ext):
            if file_path.is_file():
                try:
                    os.remove(file_path)
                    deleted_count += 1
                except Exception as e:
                    print(f"Error deleting {file_path}: {e}")
    
    # Delete files in PREDICT_DIR
    for ext in ['*.jpg', '*.jpeg', '*.JPG', '*.JPEG']:
        for file_path in PREDICT_DIR.glob(ext):
            if file_path.is_file():
                try:
                    os.remove(file_path)
                    deleted_count += 1
                except Exception as e:
                    print(f"Error deleting {file_path}: {e}")
    
    return deleted_count 

async def delayed_cleanup():
    """Wait 10 seconds then delete all temporary images"""
    await asyncio.sleep(60)  # Non-blocking sleep
    delete_all_temp_images()