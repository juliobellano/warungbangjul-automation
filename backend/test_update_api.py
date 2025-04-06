#!/usr/bin/env python3
"""
Test script for inventory update API with both formats
"""
import requests
import argparse
import json
from pprint import pprint

def test_direct_update(api_url, detection_id):
    """Test updating with direct format: {ingredient_name: quantity}"""
    print("\nTesting direct update format...")
    
    # Define updates in the simple format
    updates = {
        "AP Flour": 1,
        "Salt": 1,
        "Sugar": 1
    }
    
    # Send update request
    response = requests.post(
        f"{api_url}/api/inventory/update/{detection_id}",
        json=updates,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Status code: {response.status_code}")
    if response.status_code == 200:
        print("Success! Result:")
        pprint(response.json())
    else:
        print(f"Error: {response.text}")
    
    return response.status_code == 200

def test_detection_format_update(api_url, detection_id):
    """Test updating with detection format: {ingredients: [{ingredient_name: ...}]}"""
    print("\nTesting detection format update...")
    
    # First get the detection result to use as input
    print(f"Getting detection data for ID: {detection_id}")
    get_response = requests.get(f"{api_url}/api/inventory/detected/{detection_id}")
    
    if get_response.status_code != 200:
        print(f"Error getting detection: {get_response.text}")
        return False
    
    # Use the detection result directly for the update
    detection_data = get_response.json()
    print(f"Found {len(detection_data['ingredients'])} ingredients in detection")
    
    # Send update request using detection format
    response = requests.post(
        f"{api_url}/api/inventory/update/{detection_id}",
        json=detection_data,  # Pass the whole detection response
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Status code: {response.status_code}")
    if response.status_code == 200:
        print("Success! Result:")
        pprint(response.json())
    else:
        print(f"Error: {response.text}")
    
    return response.status_code == 200

def main():
    parser = argparse.ArgumentParser(description="Test inventory update API with different formats")
    parser.add_argument("--detection-id", required=True, help="Detection ID to use for testing")
    parser.add_argument("--api", default="http://localhost:8000", help="API base URL")
    
    args = parser.parse_args()
    
    # Test both update formats
    direct_success = test_direct_update(args.api, args.detection_id)
    detection_success = test_detection_format_update(args.api, args.detection_id)
    
    # Show summary
    print("\nTest Summary:")
    print(f"Direct update format: {'SUCCESS' if direct_success else 'FAILED'}")
    print(f"Detection format update: {'SUCCESS' if detection_success else 'FAILED'}")
    
    if direct_success and detection_success:
        print("\nAll tests passed! The API now accepts both update formats.")
    else:
        print("\nSome tests failed. Check the error messages above.")

if __name__ == "__main__":
    main() 