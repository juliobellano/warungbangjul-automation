#!/usr/bin/env python3
"""
A simple wrapper around the predictexample.py pattern
that can be used to test your model directly.
"""
import os
import sys
import argparse
from pathlib import Path

# Import YOLO
try:
    from ultralytics import YOLO
except ImportError:
    print("Error: ultralytics package not found. Install with 'pip install ultralytics'.")
    sys.exit(1)

def predict_image(model_path, image_path, confidence=0.6, show=False, save=True, 
                  save_crop=True, save_txt=True, classes=None):
    """
    Predict using YOLO model with the same pattern as predictexample.py
    """
    try:
        # Load model
        print(f"Loading model: {model_path}")
        model = YOLO(model_path)
        
        # Run prediction
        print(f"Running prediction on: {image_path}")
        results = model.predict(
            source=image_path,
            conf=confidence,
            show=show,
            save=save,
            line_width=2,
            save_crop=save_crop,
            save_txt=save_txt,
            show_labels=True,
            show_conf=True,
            classes=classes
        )
        
        # Print results
        result = results[0]
        boxes = result.boxes
        print(f"Detected {len(boxes)} objects:")
        
        for i in range(len(boxes)):
            class_id = int(boxes[i].cls)
            class_name = result.names[class_id]
            confidence = float(boxes[i].conf)
            print(f"  {i+1}. {class_name} ({confidence:.2f})")
        
        return results
    except Exception as e:
        print(f"Error: {e}")
        return None

def main():
    """Main function"""
    # Parse arguments
    parser = argparse.ArgumentParser(description="Run prediction with YOLO model")
    parser.add_argument("--model", type=str, default="yolo11-model.pt", help="Path to YOLO model")
    parser.add_argument("--image", type=str, default="testimage.jpeg", help="Path to image file")
    parser.add_argument("--conf", type=float, default=0.6, help="Confidence threshold")
    parser.add_argument("--show", action="store_true", help="Show prediction results")
    parser.add_argument("--classes", type=str, help="Classes to detect (comma-separated)")
    
    args = parser.parse_args()
    
    # Convert classes if provided
    classes = None
    if args.classes:
        classes = [int(c.strip()) for c in args.classes.split(",")]
    
    # Run prediction
    predict_image(
        model_path=args.model,
        image_path=args.image,
        confidence=args.conf,
        show=args.show,
        classes=classes
    )
    
    print("Done.")

if __name__ == "__main__":
    main() 