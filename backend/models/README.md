# YOLOv11 Model Directory

This directory is used to store your trained YOLOv11 model for ingredient detection. 

## Adding Your Model

1. Place your trained YOLOv11 model file (`yolov11_model.pt` or similar) in this directory
2. If your model has a different filename, update the `model_path` parameter in `YOLOv11Model` initialization or pass the custom path when creating the model instance

## Model Requirements

The YOLOv11 model should be trained to detect the following ingredients:

- chicken_egg
- flour_marinade
- flour_batter
- salt_marinade
- salt_batter
- chicken_breast
- milk
- garlic
- chili_big
- chili_small
- fish_sauce
- oyster_sauce
- condensed_milk
- butter
- chicken_powder
- white_pepper
- msg
- baking_powder
- lime_leaves
- salted_egg_yolk
- oil

## Integration Notes

If your model uses different class names, you'll need to update the mapping in the `YOLOv11Model` class in `app/services/models/yolo_model.py` to match the names expected by the inventory system.

## Testing Your Model

You can test your model using the provided test scripts:

```bash
# Test just the YOLOv11 model wrapper
python test_yolo.py --image path/to/test/image.jpg --output test_output.jpg

# Test the full image processing workflow
python test_image_processing.py --image path/to/test/image.jpg
``` 