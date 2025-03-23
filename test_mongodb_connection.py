# test_post_order.py

import asyncio
import motor.motor_asyncio
from dotenv import load_dotenv
import os
from pathlib import Path
from datetime import datetime
from pprint import pprint

async def test_post_order():
    # Build path to .env
    BASE_DIR = Path(__file__).resolve().parent  # Assuming test script is in project root
    env_path = os.path.join(BASE_DIR, '.env')
    
    # Load environment variables
    load_dotenv(dotenv_path=env_path)
    
    # Get MongoDB connection string
    MONGODB_URL = os.getenv("MONGODB_URL")
    DB_NAME = os.getenv("DB_NAME", "warung_bangjul")
    
    if not MONGODB_URL:
        print("ERROR: MONGODB_URL environment variable not set in .env file")
        return False
    
    print(f"Connecting to database: {DB_NAME}...")
    
    try:
        # Create client and get database
        client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URL)
        db = client[DB_NAME]
        
        # Test connection with ping
        await client.admin.command('ping')
        print("✅ Connected to MongoDB server")
        
        # Create a sample order
        test_order = {
            "customer_name": "Test Customer",
            "order_date": datetime.now(),
            "items": [
                {
                    "code": "SE",
                    "name": "Chicken with Salted Egg",
                    "quantity": 2,
                    "unit_price": 130,
                    "item_total": 260
                },
                {
                    "code": "T",
                    "name": "Sunny Side Up Egg",
                    "quantity": 1,
                    "unit_price": 15,
                    "item_total": 15
                }
            ],
            "total_amount": 275,
            "status": "new",
            "test_order": True  # Flag to identify test orders
        }
        
        print("\nAttempting to insert test order:")
        pprint(test_order)
        
        # Insert the test order
        result = await db.orders.insert_one(test_order)
        
        if result.inserted_id:
            print(f"\n✅ Successfully inserted test order with ID: {result.inserted_id}")
            
            # Retrieve the inserted order to verify
            retrieved_order = await db.orders.find_one({"_id": result.inserted_id})
            
            print("\nRetrieved order from database:")
            pprint(retrieved_order)
            
            # Clean up - delete the test order
            delete_result = await db.orders.delete_one({"_id": result.inserted_id})
            if delete_result.deleted_count == 1:
                print("\n✅ Test order was successfully deleted (cleanup completed)")
            else:
                print("\n⚠️ Warning: Could not delete test order")
                
            return True
        else:
            print("❌ Failed to insert test order")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    finally:
        # Close the connection
        if 'client' in locals():
            client.close()
            print("\nClosed MongoDB connection")

if __name__ == "__main__":
    # Run the async test function
    result = asyncio.run(test_post_order())
    if result:
        print("\n✅ ALL TESTS PASSED - Successfully inserted and retrieved data from MongoDB!")
    else:
        print("\n❌ TEST FAILED - Check the error messages above")