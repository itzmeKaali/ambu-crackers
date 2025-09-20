from dotenv import load_dotenv
import os

load_dotenv()

FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", '')
ORDERS_BUCKET = os.getenv("ORDERS_BUCKET", '')
PRODUCTS_BUCKET = os.getenv("PRODUCTS_BUCKET", '')
PRICE_LIST_BLOB = os.getenv("PRICE_LIST_BLOB", '')
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY", '')
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", '')
FROM_EMAIL = os.getenv("FROM_EMAIL", ADMIN_EMAIL)
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN")
GMAIL_EMAIL = os.getenv("GMAIL_EMAIL", '')
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD", '')
