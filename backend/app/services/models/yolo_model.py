from ultralytics import YOLO
from pathlib import Path
import os
import psutil  # Added for memory logging

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

# Added memory logging function
def log_memory_usage(label=""):
    """Log current memory usage"""
    process = psutil.Process(os.getpid())
    memory_mb = process.memory_info().rss / (1024 * 1024)  # Convert to MB
    print(f"Memory usage {label}: {memory_mb:.2f} MB")

def get_model(model_path=None):
    """Get or load the YOLO model."""
    global _model
    
    log_memory_usage("Before model load")  # Added logging
    
    if _model is None:
        model_path = model_path or DEFAULT_MODEL_PATH
        try:
            _model = YOLO(model_path)
            print(f"Model loaded from: {model_path}")
            log_memory_usage("After model load")  # Added logging
        except Exception as e:
            print(f"Error loading model: {e}")
            return None
    else:
        log_memory_usage("Model already loaded")  # Added logging for cached model
    
    return _model

def predict(image_path, conf=0.8, save=False, output_path=None):
    """Run prediction with YOLO model."""
    log_memory_usage("Before getting model")  # Added logging
    
    model = get_model()
    if model is None:
        return None
    
    log_memory_usage("Before prediction")  # Added logging
    
    try:
        # Use the same parameters as in predictexample.py
        results = model.predict(
            source=image_path,
            conf=conf,
            save=save,
            save_crop=False,
            save_txt=False,
            half=True,
            line_width=2,
            show_labels=True,
            show_conf=True,
            project=str(TEMP_DIR) if save else None,
            name="" if save else None,
            exist_ok=True
        )
        
        log_memory_usage("After prediction")  # Added logging
        
        return results
    except Exception as e:
        print(f"Error predicting: {e}")
        return None