from typing import Dict, List, Union
from datetime import datetime
from app.services.db import orders_collection, menu_collection, db

async def calculate_today_ingredients() -> Dict[str, Dict]:
    """
    Calculate ingredients needed for today's orders
    
    Returns:
        Dictionary of ingredients with quantities needed for today's orders
    """
    # Define today's time range
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    tomorrow = today.replace(hour=23, minute=59, second=59, microsecond=999999)
    
    # Get all menu items with their recipes
    cursor = menu_collection.find({})
    menu_items = await cursor.to_list(length=None)
    
    # Create recipe lookup dictionary
    recipes = {}
    for item in menu_items:
        recipes[item["code"]] = {
            ingredient["name"]: {
                "quantity": ingredient["quantity"],
                "unit": ingredient["unit"]
            }
            for ingredient in item["ingredients"]
        }
    
    # Query to get today's orders
    query = {"order_date": {"$gte": today, "$lte": tomorrow}}
    cursor = orders_collection.find(query)
    today_orders = await cursor.to_list(length=None)
    
    # Count today's ordered items
    item_counts = {}
    for order in today_orders:
        for item in order["items"]:
            code = item["code"]
            quantity = item["quantity"]
            
            if code not in item_counts:
                item_counts[code] = 0
            item_counts[code] += quantity
    
    # Calculate required ingredients based on ordered items
    ingredients_needed = {}
    
    for code, quantity in item_counts.items():
        if code in recipes:
            for ingredient, details in recipes[code].items():
                required_quantity = quantity * details["quantity"]
                
                if ingredient not in ingredients_needed:
                    ingredients_needed[ingredient] = {
                        "quantity": required_quantity,
                        "unit": details["unit"]
                    }
                else:
                    ingredients_needed[ingredient]["quantity"] += required_quantity
    
    # Round quantities to 2 decimal places for readability
    for ingredient in ingredients_needed:
        ingredients_needed[ingredient]["quantity"] = round(ingredients_needed[ingredient]["quantity"], 2)
    
    # Add order summary for reference
    order_summary = {
        "total_orders": len(today_orders),
        "item_counts": item_counts
    }
    
    return {
        "ingredients_needed": ingredients_needed,
        "order_summary": order_summary
    }
    
async def update_ingredient_inventory(updates: Dict[str, Dict[str, Union[float, str]]]) -> Dict:
    """
    Update the ingredients inventory document
    
    Args:
        updates: Dictionary of ingredients to update in format: 
                {"ingredient_name": {"amount": amount, "unit": unit}}
                Example: {"salt": {"amount": 100, "unit": "g"}}
        
    Returns:
        Dictionary with status and message
    """
    # Create a reference to the ingredients collection
    ingredients_collection = db.ingredients
    
    try:
        # Get the current inventory document (there should be only one)
        inventory = await ingredients_collection.find_one({"_id": "inventory"})
        
        # If no inventory document exists, create one
        if not inventory:
            inventory = {
                "_id": "inventory",
                "last_updated": datetime.now()
            }
        
        # Update inventory with new values
        for ingredient, details in updates.items():
            inventory[ingredient] = details
        
        # Update the last_updated timestamp
        inventory["last_updated"] = datetime.now()
        
        # Save the updated inventory
        await ingredients_collection.replace_one(
            {"_id": "inventory"}, 
            inventory, 
            upsert=True
        )
        
        return {
            "status": "success",
            "message": f"Updated {len(updates)} ingredients",
            "updated_ingredients": list(updates.keys())
        }
            
    except Exception as e:
        return {
            "status": "error",
            "message": f"Database error: {str(e)}"
        }
        
async def get_ingredient_inventory() -> Dict:
    """
    Get current inventory of all ingredients
    
    Returns:
        Dictionary containing all ingredients with their amounts and units
    """
    # Create a reference to the ingredients collection
    ingredients_collection = db.ingredients
    
    try:
        inventory = await ingredients_collection.find_one({"_id": "inventory"})
        if not inventory:
            # Initialize empty inventory if it doesn't exist
            return {"_id": "inventory", "last_updated": datetime.now()}
        return inventory
    except Exception as e:
        print(f"Error retrieving ingredients: {e}")
        return {}
        
async def update_ingredients_from_today_orders() -> Dict:
    """
    Calculate today's ingredients and update the ingredients inventory
    by subtracting the required amounts
    
    Returns:
        Dictionary with status and results
    """
    try:
        # Get today's needed ingredients
        today_data = await calculate_today_ingredients()
        ingredients_needed = today_data["ingredients_needed"]
        
        # Get current inventory
        inventory = await get_ingredient_inventory()
        
        updates = {}
        insufficient_ingredients = []
        
        # Check each ingredient needed for today's orders
        for name, details in ingredients_needed.items():
            required_amount = details["quantity"]
            required_unit = details["unit"]
            
            # Check if ingredient exists in inventory
            if name in inventory and name != "_id" and name != "last_updated":
                current = inventory[name]
                current_amount = current["amount"]
                current_unit = current["unit"]
                
                # Check if units match
                if current_unit != required_unit:
                    insufficient_ingredients.append({
                        "name": name,
                        "issue": f"Unit mismatch: inventory has {current_unit}, recipe needs {required_unit}"
                    })
                    continue
                
                # Check if we have enough
                if current_amount >= required_amount:
                    # We have enough, subtract the used amount
                    new_amount = current_amount - required_amount
                    updates[name] = {"amount": new_amount, "unit": current_unit}
                else:
                    # Not enough of this ingredient
                    insufficient_ingredients.append({
                        "name": name,
                        "required": required_amount,
                        "available": current_amount,
                        "unit": current_unit,
                        "shortage": required_amount - current_amount
                    })
            else:
                # Ingredient not in inventory
                insufficient_ingredients.append({
                    "name": name,
                    "issue": "Not in inventory",
                    "required": required_amount,
                    "unit": required_unit
                })
        
        # Update inventory with the changes
        if updates:
            result = await update_ingredient_inventory(updates)
            update_status = result["status"]
            update_message = result["message"]
        else:
            update_status = "warning"
            update_message = "No ingredients updated"
        
        return {
            "status": update_status,
            "message": update_message,
            "updated_ingredients": list(updates.keys()),
            "insufficient_ingredients": insufficient_ingredients,
            "order_summary": today_data["order_summary"]
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error updating ingredients: {str(e)}"
        }