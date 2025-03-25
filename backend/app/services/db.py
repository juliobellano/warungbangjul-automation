import motor.motor_asyncio
from pymongo import IndexModel, ASCENDING
from datetime import datetime
import os
from bson.objectid import ObjectId
from pymongo.errors import ServerSelectionTimeoutError

# Get MongoDB connection string from environment variables
MONGODB_URL = os.getenv("MONGODB_URL")
DB_NAME = os.getenv("DB_NAME", "warung_bangjul")

# Database connection pool
_db_client = None
_db = None

# Get database client with lazy initialization
def get_client():
    global _db_client
    if _db_client is None:
        if not MONGODB_URL:
            raise ValueError("MONGODB_URL environment variable not set")
        
        _db_client = motor.motor_asyncio.AsyncIOMotorClient(
            MONGODB_URL, 
            serverSelectionTimeoutMS=5000,
            maxPoolSize=10,
            minPoolSize=1
        )
    return _db_client

# Get database with lazy initialization
def get_db():
    global _db
    if _db is None:
        _db = get_client()[DB_NAME]
    return _db

# Get collection references
def get_orders_collection():
    return get_db().orders

def get_menu_collection():
    return get_db().menu

def get_inventory_collection():
    return get_db().inventory

# Database initialization and setup
async def setup_database():
    """Set up database indexes and initial data if needed"""
    try:
        db = get_db()
        orders_collection = db.orders
        menu_collection = db.menu
        
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
        result = await get_db().orders.insert_one(order_data)
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
        cursor = get_db().orders.find(query)
        orders = await cursor.to_list(length=100)
        return orders
    except Exception as e:
        print(f"Error retrieving orders: {e}")
        raise
        
async def get_menu_items():
    """Get all menu items with their recipes"""
    try:
        cursor = get_db().menu.find({})
        menu_items = await cursor.to_list(length=100)
        return menu_items
    except Exception as e:
        print(f"Error retrieving menu: {e}")
        raise

async def update_order_status(order_id, new_status):
    """Update the status of an order"""
    try:
        result = await get_db().orders.update_one(
            {"_id": ObjectId(order_id)},
            {"$set": {"status": new_status}}
        )
        return result.modified_count > 0
    except Exception as e:
        print(f"Error updating order status: {e}")
        raise