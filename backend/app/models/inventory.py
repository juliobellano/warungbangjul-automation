from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Union
from datetime import datetime


class InventoryItem(BaseModel):
    """Model for an inventory item"""
    ingredient_name: str = Field(..., description="Name of the ingredient")
    quantity: float = Field(..., description="Current amount in stock")
    unit: str = Field(..., description="Unit of measurement (e.g., 'grams', 'pieces')")
    last_updated: datetime = Field(default_factory=datetime.now, description="Last update timestamp")


class InventoryResponse(BaseModel):
    """Response model for inventory requests"""
    inventory: List[InventoryItem] = Field(..., description="List of inventory items")


class IngredientDefaultQuantity(BaseModel):
    """Default quantity mapping for detected ingredients"""
    ingredient_name: str = Field(..., description="Name of the ingredient")
    default_quantity: float = Field(..., description="Default quantity to add when detected")
    unit: str = Field(..., description="Unit of measurement")
    packaging_description: Optional[str] = Field(None, description="Description of the packaging (e.g., 'carton', 'pack')")


class InventoryItemUpdate(BaseModel):
    """Model for updating an inventory item"""
    quantity_to_add: float = Field(..., description="Quantity to add to current stock")


class InventoryBatchUpdate(BaseModel):
    """Model for batch updating multiple inventory items"""
    updates: Dict[str, InventoryItemUpdate] = Field(
        ..., 
        description="Dictionary of ingredient updates in format {ingredient_name: {quantity_to_add: value}}"
    )


class DetectedIngredient(BaseModel):
    """Model for an ingredient detected in the image"""
    ingredient_name: str = Field(..., description="Name of the detected ingredient")
    confidence: float = Field(..., description="Detection confidence score")
    suggested_quantity: float = Field(..., description="Suggested quantity based on default mapping")
    unit: str = Field(..., description="Unit of measurement")


class DetectionResult(BaseModel):
    """Model for the result of an image detection"""
    detection_id: str = Field(..., description="Unique ID for this detection")
    ingredients: List[DetectedIngredient] = Field(..., description="List of detected ingredients")
    image_url: str = Field(..., description="URL to the annotated image")
    timestamp: datetime = Field(default_factory=datetime.now, description="Detection timestamp") 