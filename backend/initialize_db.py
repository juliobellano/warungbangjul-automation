#!/usr/bin/env python3
"""
Initialize the database with default inventory items and quantities
"""
import os
import sys
import asyncio
from pathlib import Path

# Add parent directory to path
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

# Import services
from app.services.db import setup_database, initialize_default_quantities

async def main():
    """Main function to initialize the database"""
    print("Starting database initialization...")
    
    # Set up database (creates collections, indexes, etc.)
    success = await setup_database()
    if not success:
        print("Failed to set up database structure")
        return
    
    print("Database structure set up successfully")
    
    # Initialize default quantities
    success = await initialize_default_quantities()
    if not success:
        print("Failed to initialize default quantities")
        return
    
    print("Default quantities initialized successfully")
    print("Database initialization complete!")

if __name__ == "__main__":
    # Use the new event loop approach to fix the "attached to a different loop" issue
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(main())
    loop.close() 