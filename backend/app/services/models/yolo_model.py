from ultralytics import YOLO
from pathlib import Path
import os

# Base directory for model files
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
MODEL_DIR = BASE_DIR / "models"
TEMP_DIR = BASE_DIR / "temp_images"

# Create model directory if it doesn't exist
os.makedirs(MODEL_DIR, exist_ok=True)

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

def predict(image_path, conf=0.8, save=False, output_path=None):
    """Run prediction with YOLO model."""
    model = get_model()
    if model is None:
        return None
    
    try:
        # Use the same parameters as in predictexample.py
        results = model.predict(
            source=image_path,
            conf=conf,
            save=save,
            save_txt=save,
            line_width=2,
            show_labels=True,
            show_conf=True,
            project=str(TEMP_DIR) if save else None,
            name="" if save else None,
            exist_ok=True
        )
        
        return results
    except Exception as e:
        print(f"Error predicting: {e}")
        return None 