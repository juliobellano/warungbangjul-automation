import motor.motor_asyncio
from pymongo import IndexModel, ASCENDING
from datetime import datetime
import os
from dotenv import load_dotenv
from pathlib import Path
from bson.objectid import ObjectId
from typing import Dict, List, Optional, Union, Any

# Build path to .env
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent  # Adjust based on your file location
env_path = os.path.join(BASE_DIR, '.env')

# Load environment variables
load_dotenv(dotenv_path=env_path)

# Get MongoDB connection string from environment variables
MONGODB_URL = os.getenv("MONGODB_URL")
DB_NAME = os.getenv("DB_NAME", "warung_bangjul")

# Global variables to hold MongoDB connection objects, initialized in setup_database
client = None
db = None

# Collections - these will be initialized in setup_database
orders_collection = None
menu_collection = None
inventory_collection = None
ingredient_defaults_collection = None

async def setup_database():
    """Set up database indexes and initial data if needed"""
    try:
        global client, db, orders_collection, menu_collection, inventory_collection, ingredient_defaults_collection
        
        # Create MongoDB client
        client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URL)
        db = client[DB_NAME]

        # Test MongoDB Connection
        try:
            await client.admin.command('ping')
            print("Pinged your deployment. You successfully connected to MongoDB!")
        except Exception as e:
            print(f"MongoDB connection error: {e}")
            return False
            
        # Initialize collections
        orders_collection = db.orders
        menu_collection = db.menu
        inventory_collection = db.inventory
        ingredient_defaults_collection = db.ingredient_defaults
        
        # Create indexes for better query performance
        order_indexes = [
            IndexModel([("customer_name", ASCENDING)]),
            IndexModel([("order_date", ASCENDING)]),
            IndexModel([("status", ASCENDING)])
        ]

        inventory_indexes = [
            IndexModel([("ingredient_name", ASCENDING)], unique=True)
        ]
        
        # Create indexes
        await orders_collection.create_indexes(order_indexes)
        await inventory_collection.create_indexes(inventory_indexes)
        print("Database indexes created successfully.")
        
        # Check if menu collection has data, if not, initialize with default menu
        if await menu_collection.count_documents({}) == 0:
            default_menu = [
                {
                    "code": "SE",
                    "name": "Chicken with Salted Egg",
                    "price": 130,
                    "ingredients": [
                        {"name": "chicken_breast", "quantity": 150, "unit": "grams"},
                        {"name": "salted_egg_yolk", "quantity": 1.33, "unit": "pieces"},
                        {"name": "flour_marinade", "quantity": 10, "unit": "grams"},
                        {"name": "flour_batter", "quantity": 66.67, "unit": "grams"},
                        {"name": "salt_marinade", "quantity": 0.83, "unit": "grams"},
                        {"name": "salt_batter", "quantity": 1.67, "unit": "grams"},
                        {"name": "fish_sauce", "quantity": 2.5, "unit": "grams"},
                        {"name": "msg", "quantity": 0.83, "unit": "grams"},
                        {"name": "garlic", "quantity": 2.5, "unit": "grams"},
                        {"name": "baking_powder", "quantity": 0.83, "unit": "grams"},
                        {"name": "white_pepper", "quantity": 0.83, "unit": "grams"},
                        {"name": "oyster_sauce", "quantity": 2.5, "unit": "grams"},
                        {"name": "condensed_milk", "quantity": 3.33, "unit": "grams"},
                        {"name": "chili_big", "quantity": 1, "unit": "pieces"},
                        {"name": "chili_small", "quantity": 0.33, "unit": "pieces"},
                        {"name": "lime_leaves", "quantity": 1, "unit": "pieces"},
                        {"name": "butter", "quantity": 5, "unit": "grams"},
                        {"name": "chicken_powder", "quantity": 1.25, "unit": "grams"},
                        {"name": "milk", "quantity": 50, "unit": "mL"}
                    ]
                },
                {
                    "code": "T",
                    "name": "Sunny Side Up Egg",
                    "price": 15,
                    "ingredients": [
                        {"name": "chicken_egg", "quantity": 1, "unit": "piece"},
                        {"name": "oil", "quantity": 0.01, "unit": "liter"}
                    ]
                }
            ]
            await menu_collection.insert_many(default_menu)
            print("Default menu items added to database.")
            
            # Initialize inventory with ingredients from menu
            await initialize_inventory_from_menu()
            
            # Initialize default quantities for ingredients
            await initialize_default_quantities()
        
        return True
    except Exception as e:
        print(f"Error setting up database: {e}")
        return False

async def save_order(order_data):
    """Save an order to the database"""
    try:
        result = await orders_collection.insert_one(order_data)
        return str(result.inserted_id)
    except Exception as e:
        print(f"Error saving order: {e}")
        raise

async def get_orders(start_date=None, end_date=None, status=None):
    """Get orders with optional filtering"""
    query = {}
    
    if start_date and end_date:
        query["order_date"] = {
            "$gte": start_date,
            "$lte": end_date
        }
    
    if status:
        query["status"] = status
        
    try:
        cursor = orders_collection.find(query)
        orders = await cursor.to_list(length=100)
        return orders
    except Exception as e:
        print(f"Error retrieving orders: {e}")
        raise
        
async def get_menu_items():
    """Get all menu items with their recipes"""
    try:
        cursor = menu_collection.find({})
        menu_items = await cursor.to_list(length=100)
        return menu_items
    except Exception as e:
        print(f"Error retrieving menu: {e}")
        raise

async def update_order_status(order_id, new_status):
    """Update the status of an order"""
    try:
        result = await orders_collection.update_one(
            {"_id": order_id},
            {"$set": {"status": new_status}}
        )
        return result.modified_count > 0
    except Exception as e:
        print(f"Error updating order status: {e}")
        raise

# New inventory management functions

async def initialize_inventory_from_menu():
    """Initialize inventory collection with ingredients from menu"""
    try:
        # Get all menu items
        menu_items = await get_menu_items()
        
        # Extract unique ingredients
        unique_ingredients = {}
        for item in menu_items:
            for ingredient in item["ingredients"]:
                name = ingredient["name"]
                unit = ingredient["unit"]
                
                if name not in unique_ingredients:
                    unique_ingredients[name] = {
                        "ingredient_name": name,
                        "quantity": 0,
                        "unit": unit,
                        "last_updated": datetime.now()
                    }
        
        # Add ingredients to inventory collection if they don't exist
        for name, data in unique_ingredients.items():
            await inventory_collection.update_one(
                {"ingredient_name": name},
                {"$setOnInsert": data},
                upsert=True
            )
        
        print(f"Initialized inventory with {len(unique_ingredients)} ingredients")
        return True
    except Exception as e:
        print(f"Error initializing inventory: {e}")
        return False

async def initialize_default_quantities():
    """Initialize default quantities for ingredients"""
    try:
        # Define default quantities for ingredients based on defaultquantity.md
        default_quantities = [
            {
                "ingredient_name": "AP Flour",
                "default_quantity": 1000.0,
                "unit": "grams",
                "packaging_description": "bag"
            },
            {
                "ingredient_name": "Salt",
                "default_quantity": 1000.0,
                "unit": "grams",
                "packaging_description": "pack"
            },
            {
                "ingredient_name": "Sugar",
                "default_quantity": 2000.0,
                "unit": "grams",
                "packaging_description": "bag"
            },
            {
                "ingredient_name": "Egg",
                "default_quantity": 10.0,
                "unit": "pieces",
                "packaging_description": "carton"
            },
            {
                "ingredient_name": "Onion",
                "default_quantity": 1.0,
                "unit": "pieces",
                "packaging_description": "single"
            },
            {
                "ingredient_name": "Baking Powder",
                "default_quantity": 90.0,
                "unit": "grams",
                "packaging_description": "bottle"
            },
            {
                "ingredient_name": "Rice Flour",
                "default_quantity": 600.0,
                "unit": "grams",
                "packaging_description": "bag"
            },
            # Keep some of the original items that might be used in the menu
            {
                "ingredient_name": "Egg",
                "default_quantity": 10.0,
                "unit": "pieces",
                "packaging_description": "carton"
            },
            {
                "ingredient_name": "flour_marinade",
                "default_quantity": 1000.0,
                "unit": "grams",
                "packaging_description": "pack"
            },
            {
                "ingredient_name": "flour_batter",
                "default_quantity": 1000.0,
                "unit": "grams",
                "packaging_description": "pack"
            },
            {
                "ingredient_name": "salt_marinade",
                "default_quantity": 500.0,
                "unit": "grams",
                "packaging_description": "pack"
            },
            {
                "ingredient_name": "salt_batter",
                "default_quantity": 500.0,
                "unit": "grams",
                "packaging_description": "pack"
            },
            {
                "ingredient_name": "chicken_breast",
                "default_quantity": 1000.0,
                "unit": "grams",
                "packaging_description": "pack"
            },
            {
                "ingredient_name": "milk",
                "default_quantity": 1000.0,
                "unit": "mL",
                "packaging_description": "carton"
            }
        ]
        
        # Add default quantities to database
        for default in default_quantities:
            await ingredient_defaults_collection.update_one(
                {"ingredient_name": default["ingredient_name"]},
                {"$set": default},
                upsert=True
            )
            
            # Also ensure this ingredient exists in the inventory collection
            await inventory_collection.update_one(
                {"ingredient_name": default["ingredient_name"]},
                {"$setOnInsert": {
                    "ingredient_name": default["ingredient_name"],
                    "quantity": 0,
                    "unit": default["unit"],
                    "last_updated": datetime.now()
                }},
                upsert=True
            )
        
        print(f"Initialized {len(default_quantities)} default quantities")
        return True
    except Exception as e:
        print(f"Error initializing default quantities: {e}")
        return False

async def get_inventory_items():
    """Get all inventory items"""
    try:
        cursor = inventory_collection.find({})
        inventory_items = await cursor.to_list(length=None)
        return inventory_items
    except Exception as e:
        print(f"Error retrieving inventory: {e}")
        raise

async def get_inventory_item(ingredient_name: str):
    """Get a specific inventory item by name"""
    try:
        item = await inventory_collection.find_one({"ingredient_name": ingredient_name})
        return item
    except Exception as e:
        print(f"Error retrieving inventory item: {e}")
        raise

async def update_inventory_item(ingredient_name: str, quantity_to_add: float):
    """Update quantity of a specific inventory item"""
    try:
        # Get current item
        current_item = await get_inventory_item(ingredient_name)
        
        if not current_item:
            return {
                "success": False,
                "message": f"Inventory item '{ingredient_name}' not found"
            }
        
        # Calculate new quantity
        new_quantity = current_item["quantity"] + quantity_to_add
        
        # Update the item
        result = await inventory_collection.update_one(
            {"ingredient_name": ingredient_name},
            {
                "$set": {
                    "quantity": new_quantity,
                    "last_updated": datetime.now()
                }
            }
        )
        
        return {
            "success": result.modified_count > 0,
            "message": f"Updated {ingredient_name} quantity to {new_quantity}",
            "new_quantity": new_quantity,
            "unit": current_item["unit"]
        }
    except Exception as e:
        print(f"Error updating inventory item: {e}")
        raise

async def update_multiple_inventory_items(updates: Dict[str, float]):
    """Update multiple inventory items at once"""
    try:
        results = {}
        
        for ingredient_name, quantity_to_add in updates.items():
            result = await update_inventory_item(ingredient_name, quantity_to_add)
            results[ingredient_name] = result
        
        return {
            "success": True,
            "updated_count": len(results),
            "results": results
        }
    except Exception as e:
        print(f"Error updating multiple inventory items: {e}")
        raise

async def get_ingredient_default_quantities():
    """Get all default quantities for ingredients"""
    try:
        cursor = ingredient_defaults_collection.find({})
        defaults = await cursor.to_list(length=None)
        return defaults
    except Exception as e:
        print(f"Error retrieving default quantities: {e}")
        raise

async def get_ingredient_default(ingredient_name: str):
    """Get default quantity for a specific ingredient"""
    try:
        default = await ingredient_defaults_collection.find_one({"ingredient_name": ingredient_name})
        return default
    except Exception as e:
        print(f"Error retrieving default quantity: {e}")
        raise

async def update_ingredient_default(ingredient_name: str, default_data: Dict[str, Any]):
    """Update default quantity for a specific ingredient"""
    try:
        # Ensure the last_updated field is set
        default_data["last_updated"] = datetime.now()
        
        result = await ingredient_defaults_collection.update_one(
            {"ingredient_name": ingredient_name},
            {"$set": default_data},
            upsert=True
        )
        
        return {
            "success": True,
            "message": f"Updated default quantity for {ingredient_name}"
        }
    except Exception as e:
        print(f"Error updating default quantity: {e}")
        raise