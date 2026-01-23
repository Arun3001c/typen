"""
Flask Backend for Next Word Prediction App
Handles user registration with MongoDB and Clerk authentication
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Enable CORS to allow frontend requests from React app
CORS(app, origins=["http://localhost:5173", "http://localhost:3000"])

# MongoDB connection using environment variable
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "next_word_prediction")

# Initialize MongoDB client
try:
    # Connect with serverSelectionTimeoutMS to fail fast if connection issues
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    
    # Force connection test by calling server_info()
    client.server_info()
    
    db = client[DB_NAME]
    users_collection = db["users"]
    
    # Create index on clerkUserId for faster lookups (if doesn't exist)
    users_collection.create_index("clerkUserId", unique=True)
    
    print("✅ Connected to MongoDB successfully!")
    print(f"📁 Database: {DB_NAME}")
except Exception as e:
    print(f"❌ MongoDB connection error: {e}")
    print("Please check your MONGO_URI in .env file")


@app.route("/", methods=["GET"])
def home():
    """Health check endpoint"""
    return jsonify({
        "status": "success",
        "message": "Next Word Prediction API is running!"
    })


@app.route("/api/users/register", methods=["POST"])
def register_user():
    """
    Register a new user after Clerk signup
    Stores user details in MongoDB
    Prevents duplicate users based on Clerk User ID
    """
    try:
        # Get user data from request body
        data = request.get_json()
        
        # Validate required fields
        if not data:
            return jsonify({
                "status": "error",
                "message": "No data provided"
            }), 400
        
        clerk_user_id = data.get("clerkUserId")
        email = data.get("email")
        username = data.get("username")
        full_name = data.get("fullName")
        
        # Check if required fields are present
        if not clerk_user_id or not email:
            return jsonify({
                "status": "error",
                "message": "Clerk User ID and email are required"
            }), 400
        
        # Check if user already exists in database
        existing_user = users_collection.find_one({"clerkUserId": clerk_user_id})
        
        if existing_user:
            # User already exists, return success (for login flow)
            return jsonify({
                "status": "success",
                "message": "User already exists",
                "user": {
                    "clerkUserId": existing_user["clerkUserId"],
                    "email": existing_user["email"],
                    "username": existing_user.get("username"),
                    "fullName": existing_user.get("fullName")
                }
            }), 200
        
        # Create new user document
        new_user = {
            "clerkUserId": clerk_user_id,
            "email": email,
            "username": username or email.split("@")[0],  # Default username from email
            "fullName": full_name or "",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        
        # Insert user into MongoDB
        result = users_collection.insert_one(new_user)
        
        if result.inserted_id:
            return jsonify({
                "status": "success",
                "message": "User registered successfully",
                "user": {
                    "clerkUserId": clerk_user_id,
                    "email": email,
                    "username": new_user["username"],
                    "fullName": new_user["fullName"]
                }
            }), 201
        else:
            return jsonify({
                "status": "error",
                "message": "Failed to register user"
            }), 500
            
    except Exception as e:
        print(f"Error registering user: {e}")
        return jsonify({
            "status": "error",
            "message": "Internal server error"
        }), 500


@app.route("/api/users/<clerk_user_id>", methods=["GET"])
def get_user(clerk_user_id):
    """
    Get user details by Clerk User ID
    Used to fetch user data on dashboard
    """
    try:
        user = users_collection.find_one({"clerkUserId": clerk_user_id})
        
        if user:
            return jsonify({
                "status": "success",
                "user": {
                    "clerkUserId": user["clerkUserId"],
                    "email": user["email"],
                    "username": user.get("username"),
                    "fullName": user.get("fullName"),
                    "createdAt": user["createdAt"].isoformat() if user.get("createdAt") else None
                }
            }), 200
        else:
            return jsonify({
                "status": "error",
                "message": "User not found"
            }), 404
            
    except Exception as e:
        print(f"Error fetching user: {e}")
        return jsonify({
            "status": "error",
            "message": "Internal server error"
        }), 500


# Run the Flask app
if __name__ == "__main__":
    # Get port from environment or default to 5000
    PORT = int(os.getenv("PORT", 5000))
    DEBUG = os.getenv("FLASK_DEBUG", "True").lower() == "true"
    
    print(f"🚀 Starting Flask server on port {PORT}")
    app.run(host="0.0.0.0", port=PORT, debug=DEBUG)
