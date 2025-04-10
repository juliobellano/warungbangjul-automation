from ultralytics import YOLO
from pathlib import Path
import os
import shutil
import cv2
import numpy as np

# Base directory for model files
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
MODEL_DIR = BASE_DIR / "models"
TEMP_DIR = BASE_DIR / "temp_images"
PREDICT_DIR = TEMP_DIR / "predict"

# Create model directory if it doesn't exist
os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(PREDICT_DIR, exist_ok=True)

# Default model path
DEFAULT_MODEL_PATH = str(MODEL_DIR / "yolo11-model.pt")

# Global model instance (loaded once and reused)
_model = None

def get_model(model_path=None):
    """Get or load the YOLO model."""
    global _model
    
    if _model is None:
        model_path = model_path or DEFAULT_MODEL_PATH
        try:
            _model = YOLO(model_path)
            print(f"Model loaded from: {model_path}")
        except Exception as e:
            print(f"Error loading model: {e}")
            return None
    
    return _model

def predict(image_path, conf=0.7, save=False, output_path=None):
    """Run prediction with YOLO model."""
    model = get_model()
    if model is None:
        return None
    
    try:
        # Extract the image ID from the path
        image_id = Path(image_path).stem
        
        # Read and resize the image
        img = cv2.imread(str(image_path))
        img = cv2.resize(img, (640, 640))

        # Run prediction on resized image
        results = model.predict(
            source=img,
            conf=conf,
            save=save,
            save_txt=save,
            half=True,
            line_width=2,
            show_labels=True,
            show_conf=True,
            project=str(TEMP_DIR) if save else None,
            name="predict" if save else None,
            exist_ok=True
        )
        
        # If save is True, make sure the annotated image exists with proper filename
        if save:
            # The annotated image might have been saved with a numeric index
            # Let's find it and rename it to match the original image ID
            
            # Find the most recent plotted image in the predict directory
            # (Usually saved as 0.jpg, 1.jpg, etc.)
            plotted_images = list(PREDICT_DIR.glob("*.jpg"))
            if plotted_images:
                latest_image = max(plotted_images, key=lambda p: p.stat().st_mtime)
                
                # Set the target filename based on the original image ID
                target_filename = PREDICT_DIR / f"{image_id}.jpg"
                
                # Remove existing target file if it exists
                if target_filename.exists():
                    os.remove(target_filename)
                
                # Copy the latest plotted image to the target filename
                shutil.copy2(latest_image, target_filename)
                
                print(f"Saved annotated image for {image_id} at {target_filename}")
            else:
                # If no plotted image was found, we need to create one manually
                # Get the plotted result from the results object
                result_img = results[0].plot()  # This returns the annotated image as a numpy array
                
                # Convert BGR to RGB (OpenCV uses BGR, but result might be RGB)
                if len(result_img.shape) == 3 and result_img.shape[2] == 3:
                    result_img = cv2.cvtColor(result_img, cv2.COLOR_RGB2BGR)
                
                # Save the annotated image with the image ID
                target_filename = PREDICT_DIR / f"{image_id}.jpg"
                cv2.imwrite(str(target_filename), result_img)
                
                print(f"Manually saved annotated image for {image_id} at {target_filename}")
        
        return results
    except Exception as e:
        print(f"Error predicting: {e}")
        import traceback
        traceback.print_exc()
        return None 