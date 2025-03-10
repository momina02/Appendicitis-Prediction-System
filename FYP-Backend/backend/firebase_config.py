import firebase_admin
from firebase_admin import credentials, firestore

# Load Firebase credentials
cred = credentials.Certificate("key.json")
firebase_admin.initialize_app(cred)

# Get Firestore database instance
db = firestore.client()
