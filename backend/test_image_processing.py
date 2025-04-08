#!/usr/bin/env python3
"""
Test script for the image processing workflow
This script simulates the upload and processing of an image through the API
"""
import os
import sys
import asyncio
import shutil
from pathlib import Path

# Add parent directory to path
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

# Import services
from app.services.db import setup_database,get_ingredient_default_quantities
from app.services.image_service import (
    save_uploaded_image,
    process_image,
    get_detection_result,
    get_image_path,
    get_annotated_image_path,
    delete_image
)

async def run_test_workflow(test_image_path=None):
    """Run the image processing workflow test"""
    print("=== Testing Image Processing Workflow ===")
    
    # Initialize database connection
    print("Setting up database connection...")
    success = await setup_database()
    if not success:
        print("Failed to set up database connection")
        return
    print("Database connection established successfully")
    
    # Default to testimage.jpeg if none provided
    if not test_image_path:
        test_image_path = str(BASE_DIR / "testimage.jpeg")
        print(f"Using default test image: {test_image_path}")
        
        if not os.path.exists(test_image_path):
            print(f"Error: Default test image not found at {test_image_path}")
            print("Please provide a test image path or place testimage.jpeg in the backend directory")
            return
    
    try:
        # Read test image
        print(f"Reading test image from {test_image_path}")
        with open(test_image_path, "rb") as f:
            image_data = f.read()
        
        # Save image to temporary storage
        print("Saving image to temporary storage...")
        image_id = await save_uploaded_image(image_data)
        print(f"Image saved with ID: {image_id}")
        
        # Get default quantities
        print("Getting default quantities...")
        defaults = await get_ingredient_default_quantities()
        print(f"Retrieved {len(defaults)} default quantities")
        
        # Process image
        print("Processing image with YOLO model...")
        process_result = await process_image(image_id, defaults)
        
        if not process_result["success"]:
            print(f"Error processing image: {process_result['message']}")
            return
        
        print(f"Image processed successfully. Detected {process_result['ingredients_count']} ingredients.")
        
        # Get detection result
        print("Getting detection result...")
        detection_id = process_result["detection_id"]
        result = await get_detection_result(detection_id)
        
        if not result:
            print(f"Detection result not found for ID: {detection_id}")
            return
        
        print(f"Detection result retrieved. Found {len(result['ingredients'])} ingredients:")
        for i, ingredient in enumerate(result["ingredients"]):
            print(f"  {i+1}. {ingredient['ingredient_name']} - "
                 f"{ingredient['suggested_quantity']} {ingredient['unit']} "
                 f"(confidence: {ingredient['confidence']:.2f})")
        
        # Get annotated image path
        print("Getting annotated image path...")
        annotated_image_id = result["annotated_image_id"]
        annotated_image_path = await get_image_path(annotated_image_id)
        
        if not annotated_image_path:
            print(f"Annotated image not found for ID: {annotated_image_id}")
            return
        
        print(f"Annotated image retrieved from {annotated_image_path}")
        
        # Copy the annotated image to a test output location
        output_path = str(BASE_DIR / "test_output.jpg")
        shutil.copy(annotated_image_path, output_path)
        print(f"Annotated image copied to {output_path}")
        
        # Simulate inventory update
        print("Simulating inventory update...")
        updates = {
            ingredient["ingredient_name"]: ingredient["suggested_quantity"]
            for ingredient in result["ingredients"]
        }
        print(f"Inventory updates to apply: {updates}")
        
        # Clean up
        print("Cleaning up...")
        await delete_image(image_id)
        await delete_image(annotated_image_id)
        print("Images deleted from temporary storage")
        
        print("=== Test completed successfully ===")
    except Exception as e:
        print(f"Error during test: {e}")

def main():
    """Main function"""
    # Set up argument parser
    import argparse
    parser = argparse.ArgumentParser(description="Test image processing workflow")
    parser.add_argument("--image", type=str, help="Path to test image file")
    args = parser.parse_args()
    
    # Run the test workflow
    asyncio.run(run_test_workflow(args.image))

if __name__ == "__main__":
    main() 