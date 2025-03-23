from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Union
from datetime import datetime, timedelta
import uvicorn

import json
from bson.objectid import ObjectId
from app.utils.helpers import json_serialize

from app.services.order_parser import parse_order
from app.services.db import setup_database, save_order, get_orders, get_menu_items
from app.services.inventory_calculator import (
    calculate_today_ingredients,
    get_ingredient_inventory,
    update_ingredient_inventory,
    update_ingredients_from_today_orders,
    orders_collection,
)

# Create FastAPI app
app = FastAPI(
    title="Warung Bang Jul Automation API",
    description="API for automating order processing, inventory management, and analytics",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class OrderText(BaseModel):
    order_text: str = Field(..., description="Text-based order in format 'Name Quantity+Code'")

class DateRange(BaseModel):
    start_date: Optional[datetime] = Field(None, description="Start date for filtering")
    end_date: Optional[datetime] = Field(None, description="End date for filtering")

class IngredientUpdate(BaseModel):
    amount: float = Field(..., description="Quantity of the ingredient")
    unit: str = Field(..., description="Unit of measurement (e.g., 'g', 'kg', 'pieces')")

class IngredientUpdates(BaseModel):
    ingredients: Dict[str, IngredientUpdate] = Field(
        ..., 
        description="Dictionary of ingredients to update in format {ingredient_name: {amount: value, unit: unit}}"
    )

# Startup event
@app.on_event("startup")
async def startup_event():
    success = await setup_database()
    if success:
        print("Database setup complete.")
    else:
        print("Database setup failed!")

# Routes
@app.post("/api/orders", status_code=201)
async def create_order(order_input: OrderText):
    try:
        # Parse the order text
        order_data = parse_order(order_input.order_text)
        
        # Save to database
        order_id = await save_order(order_data)
        
        # Get the saved order with any MongoDB-added fields (like _id)
        saved_order = await orders_collection.find_one({"_id": ObjectId(order_id)})
        
        # Convert the MongoDB document to a dictionary and handle ObjectId serialization
        serializable_order = json.loads(
            json.dumps(saved_order, default=json_serialize)
        )
        
        return {
            "success": True,
            "order_id": order_id,  # This is already a string from save_order
            "order": serializable_order if saved_order else order_data
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.get("/api/orders")
async def list_orders(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    status: Optional[str] = None
):
    """Get orders with optional filtering"""
    try:
        # Set default date range if not provided
        if not end_date:
            end_date = datetime.now()
        if not start_date:
            start_date = end_date - timedelta(days=30)
            
        orders = await get_orders(start_date, end_date, status)
        return {"orders": orders}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.get("/api/menu")
async def get_menu():
    """Get all menu items with their recipes"""
    try:
        menu = await get_menu_items()
        return {"menu": menu}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.get("/api/inventory/today")
async def get_today_inventory_needs():
    """Calculate ingredients needed for today's orders"""
    try:
        today_needs = await calculate_today_ingredients()
        return today_needs
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.get("/api/inventory")
async def get_inventory():
    """Get current inventory of all ingredients"""
    try:
        inventory = await get_ingredient_inventory()
        return {"inventory": inventory}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.post("/api/inventory")
async def update_inventory(updates: IngredientUpdates):
    """Update ingredient inventory with new values"""
    try:
        result = await update_ingredient_inventory(updates.ingredients)
        if result["status"] == "success":
            return result
        else:
            raise HTTPException(status_code=400, detail=result["message"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.post("/api/inventory/process-today")
async def process_today_orders():
    """Process today's orders and update inventory accordingly"""
    try:
        result = await update_ingredients_from_today_orders()
        if result["status"] == "error":
            raise HTTPException(status_code=400, detail=result["message"])
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")



if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)