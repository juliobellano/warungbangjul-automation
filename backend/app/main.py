from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Union
from datetime import datetime, timedelta
import uvicorn
import asyncio

import json
from app.utils.helpers import serialize_for_json

from app.services.order_parser import parse_order
from app.services.db import setup_database, save_order, get_orders, get_menu_items
from app.services.image_service import start_cleanup_task
from app.routers import inventory

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

# Include routers
app.include_router(inventory.router)

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
    
    # Start background task for cleaning up old images
    asyncio.create_task(start_cleanup_task())

@app.post("/api/orders", status_code=201)
async def create_order(order_input: OrderText):
    """Process a new text order"""
    try:
        # Parse the order text
        order_data = parse_order(order_input.order_text)
        
        # Save to database
        order_id = await save_order(order_data)
        
        # Serialize the response for JSON
        serializable_order = serialize_for_json(order_data)
        
        return {
            "success": True,
            "order_id": order_id,
            "order": serializable_order
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

        # Serialize orders for JSON response
        serialized_orders = serialize_for_json(orders)

        return {"orders": serialized_orders}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.get("/api/menu")
async def get_menu():
    """Get all menu items with their recipes"""
    try:
        menu = await get_menu_items()
        
        # Serialize menu for JSON response
        serialized_menu = serialize_for_json(menu)
        
        return {"menu": serialized_menu}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.get("/api/inventory/today")
async def get_today_inventory_needs():
    """Calculate ingredients needed for today's orders"""
    try:
        today_needs = await calculate_today_ingredients()
        
        # Serialize todays_needs for JSON response
        serialized_today_needs = serialize_for_json(today_needs)

        return serialized_today_needs
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.get("/api/inventory")
async def get_inventory():
    """Get current inventory of all ingredients"""
    try:
        inventory = await get_ingredient_inventory()
        
        # Serialize inventory for JSON response
        serialized_inventory = serialize_for_json(inventory)
        
        return {"inventory": serialized_inventory}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.post("/api/inventory")
async def update_inventory(updates: IngredientUpdates):
    """Update ingredient inventory with new values"""
    try:
        result = await update_ingredient_inventory(updates.ingredients)
        if result["status"] == "success":
            return serialize_for_json(result)
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
        return serialize_for_json(result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)