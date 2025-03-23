from bson.objectid import ObjectId

def json_serialize(obj):
    """
    Custom JSON serializer for objects not serializable by default json code
    Especially handles MongoDB ObjectId
    """
    if isinstance(obj, ObjectId):
        return str(obj)
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")