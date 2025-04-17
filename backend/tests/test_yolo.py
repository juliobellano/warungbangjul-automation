#!/usr/bin/env python3
"""
Test script for YOLO model
This script tests the basic functionality of the YOLO model for ingredient detection.
"""
import os
import sys
import argparse
from pathlib import Path

# Add parent directory to path
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

# Import the YOLO predict function
from app.services.models.yolo_model import predict, get_model

def main():
    """Test YOLO model prediction"""
    # Create argument parser
    parser = argparse.ArgumentParser(description="Test YOLO model prediction")
    parser.add_argument("--image", type=str, help="Path to test image file")
    parser.add_argument("--output", type=str, default="test_output.jpg", help="Path to output image file")
    parser.add_argument("--conf", type=float, default=0.6, help="Confidence threshold")
    
    # Parse arguments
    args = parser.parse_args()
    
    # Initialize model
    print("Loading YOLO model...")
    model = get_model()
    if model is None:
        print("Failed to load model")
        return
    
    # Check if image path is provided
    if args.image and os.path.exists(args.image):
        print(f"Running prediction on {args.image}...")
        
        # Run prediction without saving
        results = predict(args.image, conf=args.conf, save=False)
        
        if results is None:
            print("Prediction failed")
            return
        
        # Print detections
        result = results[0]  # first image result
        boxes = result.boxes
        print(f"Detected {len(boxes)} objects:")
        
        for i in range(len(boxes)):
            class_id = int(boxes[i].cls)
            class_name = result.names[class_id]
            confidence = float(boxes[i].conf)
            print(f"  {i+1}. {class_name} ({confidence:.2f})")
        
        # Save annotated image
        print(f"Creating annotated image: {args.output}")
        results = predict(args.image, conf=args.conf, save=True)
        
        # Find and move the saved image
        pred_path = Path(args.image).parent / Path(args.image).name
        if pred_path.exists():
            os.rename(pred_path, args.output)
            print(f"Output saved to {args.output}")
        else:
            # Try alternative location
            pred_dir = Path(args.image).parent / "runs" / "detect" / "predict"
            if pred_dir.exists():
                for file in pred_dir.glob("*"):
                    if file.is_file():
                        os.rename(file, args.output)
                        print(f"Output saved to {args.output}")
                        break
            else:
                print("Could not find the output image")
    else:
        print("No image file provided or file does not exist.")
        print("Please provide a valid image file with --image")
    
    print("Test completed.")

if __name__ == "__main__":
    main() 