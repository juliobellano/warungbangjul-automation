import sys
import os

# Add the backend directory to the path so imports work correctly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mangum import Mangum
from app.main import app

# Handler for Vercel Serverless Functions
handler = Mangum(app)