from mangum import Mangum
from app.main import app

# For Vercel Serverless Functions
handler = Mangum(app)