from mangum import Mangum
from app.main import app

# Handler for Vercel Serverless Functions
handler = Mangum(app)