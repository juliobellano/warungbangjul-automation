# Warung Bang Jul Automation - Backend

This is the backend service for the Warung Bang Jul Automation project, providing APIs for order processing, inventory management, and computer vision-based ingredient detection.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create a `.env` file with the following variables:
```
MONGODB_URL=mongodb://localhost:27017
DB_NAME=warung_bangjul
```

3. Initialize the database:
```bash
python initialize_db.py
```

4. Place your trained YOLO model file (`yolo11-model.pt`) in the `models/` directory.

5. Start the server:
```bash
uvicorn app.main:app --reload
```

## Inventory Management API

The system includes a comprehensive API for managing inventory:

### Basic Inventory Management

- `GET /api/inventory` - Get all inventory items
- `GET /api/inventory/{ingredient_name}` - Get a specific inventory item
- `PUT /api/inventory/{ingredient_name}` - Update a specific inventory item
- `PUT /api/inventory` - Update multiple inventory items at once

### Computer Vision Integration

- `POST /api/inventory/upload` - Upload an image for processing with YOLO model
- `GET /api/inventory/detected/{detection_id}` - Get detected ingredients from an image
- `GET /api/inventory/image/{image_id}` - Get the original or annotated image
- `POST /api/inventory/update/{detection_id}` - Update inventory based on detected ingredients

### Default Quantities Management

- `GET /api/inventory/defaults` - Get all default quantities for ingredients
- `GET /api/inventory/defaults/{ingredient_name}` - Get default quantity for a specific ingredient
- `PUT /api/inventory/defaults/{ingredient_name}` - Update default quantity for a specific ingredient

## Testing

### Unit Tests

Run the unit tests with:
```bash
pytest
```

### API Testing

Test the detection API endpoints with:
```bash
python test_detection_api.py --image testimage.jpeg
```

### Model Testing

Test the YOLO model directly with:
```bash
python test_yolo.py --image testimage.jpeg
```

Or using the wrapper around the original predictexample.py:
```bash
python predictexample_wrapper.py --image testimage.jpeg
```

## Workflow

1. Initialize database with default inventory items and quantities
2. Upload an image of ingredients using the upload endpoint
3. Get the detection results with ingredient suggestions
4. Update the inventory based on the detected ingredients
5. Manage inventory through the API

## Default Ingredient Quantities

Default quantities for common ingredients are defined in the system:

- AP Flour: 1000 grams
- Salt: 1000 grams
- Sugar: 2000 grams
- Egg: 10 pieces
- Onion: 1 piece
- Baking Powder: 90 grams
- Rice Flour: 600 grams

These default quantities are used when ingredients are detected in uploaded images. 