# backend/app/utils/helpers.py
from bson import ObjectId
from datetime import datetime
from typing import Any, Dict, List, Union

class JSONEncoder:
    """Custom JSON encoder for MongoDB and datetime objects"""
    
    @staticmethod
    def encode(obj: Any) -> Any:
        """Convert non-serializable objects to serializable format"""
        if isinstance(obj, ObjectId):
            return str(obj)
        elif isinstance(obj, datetime):
            return obj.isoformat()
        elif isinstance(obj, dict):
            return {k: JSONEncoder.encode(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [JSONEncoder.encode(item) for item in obj]
        else:
            return obj

def serialize_for_json(data: Union[Dict, List]) -> Union[Dict, List]:
    """
    Serialize MongoDB and datetime objects for JSON responses
    
    Args:
        data: Dictionary or list containing data with potentially non-serializable objects
        
    Returns:
        Data structure with all objects serialized for JSON
    """
    return JSONEncoder.encode(data)