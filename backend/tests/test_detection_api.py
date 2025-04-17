#!/usr/bin/env python3
"""
Test script for detection API endpoints
"""
import os
import sys
import asyncio
import json
import argparse
import requests
from pathlib import Path

# Default API URL
DEFAULT_API_URL = "http://localhost:8000"

def upload_image(api_url, image_path):
    """Upload an image to the API"""
    print(f"Uploading image: {image_path}")
    
    # Prepare the file for upload
    with open(image_path, "rb") as f:
        files = {"file": (os.path.basename(image_path), f, "image/jpeg")}
        
        # Send POST request to upload endpoint
        response = requests.post(f"{api_url}/api/inventory/upload", files=files)
    
    # Check the response
    if response.status_code == 200:
        result = response.json()
        print(f"Image uploaded successfully. Detection ID: {result['detection_id']}")
        print(f"Detected {result['ingredients_count']} ingredients")
        return result['detection_id']
    else:
        print(f"Error uploading image: {response.status_code} - {response.text}")
        return None

def get_detection_results(api_url, detection_id):
    """Get detection results from the API"""
    print(f"Getting detection results for ID: {detection_id}")
    
    # Send GET request to detection results endpoint
    response = requests.get(f"{api_url}/api/inventory/detected/{detection_id}")
    
    # Check the response
    if response.status_code == 200:
        result = response.json()
        print(f"Detection results retrieved successfully")
        print("Detected ingredients:")
        for i, ingredient in enumerate(result['ingredients']):
            print(f"  {i+1}. {ingredient['ingredient_name']} - "
                 f"{ingredient['suggested_quantity']} {ingredient['unit']} "
                 f"(confidence: {ingredient['confidence']:.2f})")
        
        print(f"Annotated image URL: {api_url}{result['image_url']}")
        return result
    else:
        print(f"Error getting detection results: {response.status_code} - {response.text}")
        return None

def update_inventory(api_url, detection_id, ingredients):
    """Update inventory based on detection results"""
    print(f"Updating inventory for detection ID: {detection_id}")
    
    # Prepare updates
    updates = {}
    for ingredient in ingredients:
        updates[ingredient['ingredient_name']] = ingredient['suggested_quantity']
    
    # Send POST request to update inventory
    response = requests.post(
        f"{api_url}/api/inventory/update/{detection_id}",
        json=updates
    )
    
    # Check the response
    if response.status_code == 200:
        result = response.json()
        print(f"Inventory updated successfully: {result['message']}")
        return result
    else:
        print(f"Error updating inventory: {response.status_code} - {response.text}")
        return None

def main():
    """Main function"""
    # Parse arguments
    parser = argparse.ArgumentParser(description="Test detection API endpoints")
    parser.add_argument("--api", type=str, default=DEFAULT_API_URL, help="API URL")
    parser.add_argument("--image", type=str, required=True, help="Path to image file")
    
    args = parser.parse_args()
    
    # Check if image exists
    if not os.path.exists(args.image):
        print(f"Error: Image not found at {args.image}")
        return
    
    # Run API test workflow
    print(f"Testing detection API at {args.api}")
    
    # Upload image
    detection_id = upload_image(args.api, args.image)
    if not detection_id:
        return
    
    # Get detection results
    results = get_detection_results(args.api, detection_id)
    if not results:
        return
    
    # Update inventory
    update_result = update_inventory(args.api, detection_id, results['ingredients'])
    if not update_result:
        return
    
    print("Test completed successfully!")

if __name__ == "__main__":
    main() 