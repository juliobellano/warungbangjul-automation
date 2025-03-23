import re
from datetime import datetime
from typing import Dict, List, Tuple

# Menu information (could be moved to database later)
MENU = {
    "SE": {"name": "Chicken with Salted Egg", "price": 130},
    "T": {"name": "Sunny Side Up Egg", "price": 15}
}

def parse_order(order_text: str) -> Dict:
    """
    Parse text-based order into structured data
    Format: "Name Quantity+Code Quantity+Code ..."
    Example: "John 2SE + 1T"
    
    Args:
        order_text: Text string containing the order
        
    Returns:
        Structured order data as a dictionary
    """
    # Split into customer name and order items
    parts = order_text.strip().split(' ', 1)
    if len(parts) < 2:
        raise ValueError("Invalid order format. Expected: 'Name Quantity+Code'")
    
    customer_name = parts[0]
    order_items_text = parts[1]
    
    # Extract order items using regex
    item_pattern = r'(\d+)([A-Za-z]+)'
    matches = re.findall(item_pattern, order_items_text)
    
    if not matches:
        raise ValueError("No valid order items found. Expected format: 'Quantity+Code'")
    
    # Process order items
    items = []
    total_amount = 0
    
    for quantity_str, code in matches:
        if code not in MENU:
            raise ValueError(f"Unknown menu code: {code}")
        
        quantity = int(quantity_str)
        unit_price = MENU[code]["price"]
        item_total = quantity * unit_price
        
        items.append({
            "code": code,
            "name": MENU[code]["name"],
            "quantity": quantity,
            "unit_price": unit_price,
            "item_total": item_total
        })
        
        total_amount += item_total
    
    # Create order structure
    order = {
        "customer_name": customer_name,
        "order_date": datetime.now(),
        "items": items,
        "total_amount": total_amount,
        "status": "new"
    }
    
    return order


def calculate_ingredients_for_order(order: Dict) -> Dict[str, float]:
    """
    Calculate required ingredients for a single order
    
    Args:
        order: Structured order data
        
    Returns:
        Dictionary mapping ingredient names to required quantities
    """
    # Recipe definitions (ingredient quantities per item)
    RECIPES = {
        "SE": {
            "chicken_breast": 150,     # grams
            "salted_egg_yolk": 1.33,   # pieces
            "flour_marinade": 10,      # grams
            "flour_batter" : 66.67,    # grams
            "salt_marinade": 0.83,     # grams 
            "salt_batter": 1.67,       # grams
            "fish_sauce": 2.5,         # grams
            "msg": 0.83,               # grams
            "garlic": 2.5,             # grams
            "baking_powder": 0.83,     # grams
            "white_pepper": 0.83,      # grams
            "oyster_sauce": 2.5,       # grams
            "condensed_milk": 3.33,    # grams
            "chili_big": 1,            # pieces
            "chili_small": 0.33,       # pieces
            "lime_leaves": 1,          # pieces
            "butter": 5,               # grams
            "chicken_powder": 1.25,    # grams
            "milk": 50                 # mL
        },
        "T": {
            "chicken_egg": 1,         # piece
            "oil": 0.01       # liter
        }
    }
    
    ingredients = {}
    
    for item in order["items"]:
        code = item["code"]
        quantity = item["quantity"]
        
        if code in RECIPES:
            for ingredient, amount in RECIPES[code].items():
                total_per_ingredient = amount * quantity
                if ingredient in ingredients:
                    ingredients[ingredient] += total_per_ingredient
                else:
                    ingredients[ingredient] = total_per_ingredient
    
    return ingredients