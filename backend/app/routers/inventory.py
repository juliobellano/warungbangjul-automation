'''
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Body, Form
from fastapi.responses import FileResponse
from typing import Dict, List, Optional, Union, Any
from pydantic import BaseModel
import os
from datetime import datetime
import shutil

from app.services.models.yolo_model import TEMP_DIR



from app.models.inventory import (
    InventoryItem, 
    InventoryResponse, 
    InventoryItemUpdate, 
    InventoryBatchUpdate,
    DetectedIngredient,
    DetectionResult
)

from app.services.db import (
    get_inventory_items,
    get_inventory_item,
    update_inventory_item,
    update_multiple_inventory_items,
    get_ingredient_default_quantities,
    get_ingredient_default,
    update_ingredient_default
)

from app.services.image_service import (
    save_uploaded_image,
    process_image,
    get_detection_result,
    get_image_path,
    get_annotated_image_path,
    delete_image
)

router = APIRouter(
    prefix="/api/inventory",
    tags=["inventory"],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=InventoryResponse)
async def get_inventory():
    """Get all inventory items"""
    try:
        inventory_items = await get_inventory_items()
        return {"inventory": inventory_items}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.get("/{ingredient_name}")
async def get_ingredient(ingredient_name: str):
    """Get a specific inventory item by name"""
    try:
        item = await get_inventory_item(ingredient_name)
        if not item:
            raise HTTPException(status_code=404, detail=f"Ingredient '{ingredient_name}' not found")
        return item
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.put("/{ingredient_name}")
async def update_ingredient(ingredient_name: str, update: InventoryItemUpdate):
    """Update a specific inventory item"""
    try:
        result = await update_inventory_item(ingredient_name, update.quantity_to_add)
        if not result["success"]:
            raise HTTPException(status_code=404, detail=result["message"])
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.put("/")
async def update_inventory(updates: InventoryBatchUpdate):
    """Update multiple inventory items at once"""
    try:
        # Convert from model to dict of ingredient_name: quantity_to_add
        updates_dict = {name: update.quantity_to_add for name, update in updates.updates.items()}
        
        result = await update_multiple_inventory_items(updates_dict)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    """Upload an image for processing"""
    try:
        # Check file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read file content
        file_data = await file.read()
        
        # Save to temporary storage
        image_id = await save_uploaded_image(file_data)
        
        # Get defaults for detection
        defaults = await get_ingredient_default_quantities()
        
        # Process the image
        process_result = await process_image(image_id, defaults)
        
        if not process_result["success"]:
            raise HTTPException(status_code=400, detail=process_result["message"])
        
        return {
            "detection_id": process_result["detection_id"],
            "message": f"Image uploaded and processed successfully. Detected {process_result['ingredients_count']} ingredients."
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.get("/detected/{detection_id}")
async def get_detected_ingredients(detection_id: str):
    """Get detected ingredients from an uploaded image"""
    try:
        # Get detection result
        result = await get_detection_result(detection_id)
        
        if not result:
            raise HTTPException(status_code=404, detail=f"Detection result with ID {detection_id} not found")
        
        # Get the base URL for image
        base_url = f"/api/inventory/image/{result['annotated_image_id']}"
        
        return {
            "detection_id": detection_id,
            "ingredients": result["ingredients"],
            "image_url": base_url,
            "timestamp": result["timestamp"]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.get("/image/{image_id}")
async def get_image(image_id: str, annotated: bool = True):
    """Get an image by ID
    
    Args:
        image_id: The ID of the image
        annotated: Whether to return the annotated version (default: True)
    """
    try:
        if annotated:
            # Look for annotated image in the predict folder
            image_path = TEMP_DIR / "predict" / f"{image_id}.jpg"
            
            # If annotated doesn't exist, fall back to original
            if not image_path.exists():
                image_path = await get_image_path(image_id)
        else:
            # Get original image
            image_path = await get_image_path(image_id)
        
        if not image_path or not image_path.exists():
            raise HTTPException(status_code=404, detail=f"Image with ID {image_id} not found")
        
        # Return file response
        return FileResponse(
            path=str(image_path),
            media_type="image/jpeg",
            filename=f"{image_id}.jpg"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
@router.post("/update/{detection_id}")
async def confirm_inventory_update(
    detection_id: str,
    updates: Dict[str, Any] = Body(..., description="Dictionary of ingredients to update in format {ingredient_name: quantity_to_add} OR detection result format with ingredients array")
):
    """Update inventory based on confirmed quantities from detection
    
    Can accept two formats:
    1. Simple format: {"Ingredient Name": quantity_to_add, ...}
    2. Detection format: {"ingredients": [{"ingredient_name": "Name", ...}, ...]}
    """
    try:
        # Get detection result to verify it exists
        result = await get_detection_result(detection_id)
        
        if not result:
            raise HTTPException(status_code=404, detail=f"Detection result with ID {detection_id} not found")
        
        # Process the updates
        processed_updates = {}
        


        # Check if we have the detection format (with "ingredients" key)
        if "ingredients" in updates and isinstance(updates["ingredients"], list):
            # Convert from detection format to the expected update format
            for ingredient in updates["ingredients"]:
                if "ingredient_name" in ingredient:
                    # Use 1 as default quantity to add, or you can use suggested_quantity if present
                    quantity = ingredient.get("suggested_quantity", 1)
                    processed_updates[ingredient["ingredient_name"]] = quantity  # Or quantity if you want to use actual values

                    print(f"Raw detected ingredient: {ingredient}")
                    print(f"Suggested quantity: {ingredient.get('suggested_quantity')}")
                    print(f"Final quantity to add: {quantity}")
        else:
            # Already in the correct format
            processed_updates = updates
        
        # Log what we're updating for debugging
        print(f"Updating inventory with: {processed_updates}")
        
        # Update inventory with confirmed quantities
        update_result = await update_multiple_inventory_items(processed_updates)
        
        # Delete the images (both original and annotated)
        await delete_image(detection_id)
        await delete_image(result["annotated_image_id"])
        
        return {
            "success": True,
            "message": f"Inventory updated with {len(processed_updates)} ingredients",
            "update_result": update_result
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.get("/defaults")
async def get_defaults():
    """Get all default quantities for ingredients"""
    try:
        defaults = await get_ingredient_default_quantities()
        return {"defaults": defaults}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.get("/defaults/{ingredient_name}")
async def get_default(ingredient_name: str):
    """Get default quantity for a specific ingredient"""
    try:
        default = await get_ingredient_default(ingredient_name)
        if not default:
            raise HTTPException(status_code=404, detail=f"Default quantity for '{ingredient_name}' not found")
        return default
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@router.put("/defaults/{ingredient_name}")
async def update_default(
    ingredient_name: str,
    default_quantity: float,
    unit: str,
    packaging_description: Optional[str] = None
):
    """Update default quantity for a specific ingredient"""
    try:
        default_data = {
            "ingredient_name": ingredient_name,
            "default_quantity": default_quantity,
            "unit": unit
        }
        
        if packaging_description:
            default_data["packaging_description"] = packaging_description
        
        result = await update_ingredient_default(ingredient_name, default_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}") 
        '''