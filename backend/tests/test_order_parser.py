import pytest
from datetime import datetime
from app.services.order_parser import parse_order, calculate_ingredients_for_order

def test_valid_order_parsing():
    # Test case with one item
    order_text = "John 2SE"
    result = parse_order(order_text)
    
    assert result["customer_name"] == "John"
    assert len(result["items"]) == 1
    assert result["items"][0]["code"] == "SE"
    assert result["items"][0]["quantity"] == 2
    assert result["items"][0]["item_total"] == 260  # 2 * 130
    assert result["total_amount"] == 260
    assert result["status"] == "new"
    
    # Test case with multiple items
    order_text = "Mary 1SE + 3T"
    result = parse_order(order_text)
    
    assert result["customer_name"] == "Mary"
    assert len(result["items"]) == 2
    assert result["items"][0]["code"] == "SE"
    assert result["items"][0]["quantity"] == 1
    assert result["items"][1]["code"] == "T"
    assert result["items"][1]["quantity"] == 3
    assert result["total_amount"] == 175  # (1 * 130) + (3 * 15)

def test_invalid_order_format():
    # Missing items
    with pytest.raises(ValueError) as exc_info:
        parse_order("John")
    assert "Invalid order format" in str(exc_info.value)
    
    # Invalid item format
    with pytest.raises(ValueError) as exc_info:
        parse_order("John SE")
    assert "No valid order items found" in str(exc_info.value)
    
    # Unknown menu code
    with pytest.raises(ValueError) as exc_info:
        parse_order("John 2XX")
    assert "Unknown menu code" in str(exc_info.value)

def test_ingredient_calculation():
    # Create a sample order
    order = {
        "customer_name": "Test Customer",
        "items": [
            {"code": "SE", "quantity": 2},
            {"code": "T", "quantity": 1}
        ]
    } 
    
    ingredients = calculate_ingredients_for_order(order)
    
    # Check calculated ingredients for SE (2 orders)
    assert ingredients["chicken_breast"] == 300  # 2 * 150
    assert ingredients["salted_egg_yolk"] == 2.66  # 2 * 1.33
    assert ingredients["flour_marinade"] == 20  # 2 * 10
    assert ingredients["flour_batter"] == 133.34  # 2 * 66.67
    assert ingredients["salt_marinade"] == 1.66  # 2 * 0.83
    assert ingredients["salt_batter"] == 3.34  # 2 * 1.67
    assert ingredients["fish_sauce"] == 5  # 2 * 2.5
    assert ingredients["msg"] == 1.66  # 2 * 0.83
    assert ingredients["garlic"] == 5  # 2 * 2.5
    assert ingredients["baking_powder"] == 1.66  # 2 * 0.83
    assert ingredients["white_pepper"] == 1.66  # 2 * 0.83
    assert ingredients["oyster_sauce"] == 5  # 2 * 2.5
    assert ingredients["condensed_milk"] == 6.66  # 2 * 3.33
    assert ingredients["chili_big"] == 2  # 2 * 1
    assert ingredients["chili_small"] == 0.66  # 2 * 0.33
    assert ingredients["lime_leaves"] == 2  # 2 * 1
    assert ingredients["butter"] == 10  # 2 * 5
    assert ingredients["chicken_powder"] == 2.5  # 2 * 1.25
    assert ingredients["milk"] == 100  # 2 * 50
    
    # Check calculated ingredients for T (1 order)
    assert ingredients["chicken_egg"] == 1  # 1 * 1
    assert ingredients["oil"] == 0.01  # 1 * 0.01