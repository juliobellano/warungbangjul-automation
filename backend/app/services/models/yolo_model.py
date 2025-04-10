from ultralytics import YOLO
from pathlib import Path
import os
import psutil  # Added for memory logging
import torch
import gc

# Base directory for model files
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
MODEL_DIR = BASE_DIR / "models"
TEMP_DIR = BASE_DIR / "temp_images"

# Create model directory if it doesn't exist
os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(TEMP_DIR / "predict", exist_ok=True)

# Default model path
DEFAULT_MODEL_PATH = str(MODEL_DIR / "yolo11-model.pt")

# Global model instance (loaded once and reused)
_model = None

# Set memory limits for PyTorch
torch.set_num_threads(1)  # Limit CPU threads
torch.set_grad_enabled(False)  # Disable gradients for inference

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

def unload_model():
    """Unload the model to free memory"""
    global _model
    if _model is not None:
        del _model
        _model = None
        gc.collect()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        print("Model unloaded from memory")

def predict(image_path, conf=0.8, save=False, output_path=None, delete_after=False):
    """Run prediction with YOLO model."""
    log_memory_usage("Before getting model")  # Added logging
    
    model = get_model()
    if model is None:
        return None
    
    log_memory_usage("Before prediction")  # Added logging
    
    try:
        import cv2
        # Read the image into memory
        img = cv2.imread(str(image_path))
        img = cv2.resize(img, (640, 640))
        
        # Use the same parameters as in predictexample.py
        results = model.predict(
            source=img,
            imgsz=640,
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
        
        # Explicit cleanup of tensors
        for result in results:
            if hasattr(result, 'boxes') and hasattr(result.boxes, 'cpu'):
                result.boxes.cpu()
                if hasattr(result.boxes, 'numpy'):
                    _ = result.boxes.numpy()
        
        # Delete original image if requested
        if delete_after and os.path.exists(str(image_path)):
            try:
                os.remove(str(image_path))
                print(f"Original image deleted: {image_path}")
            except Exception as e:
                print(f"Error deleting original image: {e}")
        
        # Force garbage collection
        del img
        gc.collect()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            
        log_memory_usage("After prediction")  # Added logging
        
        return results
    except Exception as e:
        print(f"Error predicting: {e}")
        return None

def delete_annotated_image(image_id):
    """Delete annotated image by ID"""
    try:
        annotated_path = TEMP_DIR / "predict" / f"{image_id}.jpg"
        if os.path.exists(str(annotated_path)):
            os.remove(str(annotated_path))
            print(f"Annotated image deleted: {annotated_path}")
            return True
        return False
    except Exception as e:
        print(f"Error deleting annotated image: {e}")
        return False