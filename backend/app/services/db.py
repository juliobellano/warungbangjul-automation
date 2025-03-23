import motor.motor_asyncio
from pymongo import IndexModel, ASCENDING
from datetime import datetime
import os
from dotenv import load_dotenv
from pathlib import Path
from bson.objectid import ObjectId

# Build path to .env
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent  # Adjust based on your file location
env_path = os.path.join(BASE_DIR, '.env')

# Load environment variables
load_dotenv(dotenv_path=env_path)

# Get MongoDB connection string from environment variables
MONGODB_URL = os.getenv("MONGODB_URL")
DB_NAME = os.getenv("DB_NAME", "warung_bangjul")


# Create MongoDB client
client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URL)
db = client[DB_NAME]


# Test MongoDB Connection
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)

# Collections
orders_collection = db.orders
menu_collection = db.menu
inventory_collection = db.inventory

async def setup_database():
    """Set up database indexes and initial data if needed"""
    try:
        # Create indexes for better query performance
        order_indexes = [
            IndexModel([("customer_name", ASCENDING)]),
            IndexModel([("order_date", ASCENDING)]),
            IndexModel([("status", ASCENDING)])
        ]
        
        # Create indexes
        await orders_collection.create_indexes(order_indexes)
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