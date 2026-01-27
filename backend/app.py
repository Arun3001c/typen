"""
Flask Backend for Next Word Prediction App
Handles user registration with MongoDB and Clerk authentication
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timezone
import os
from dotenv import load_dotenv
import base64

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
    books_collection = db["books"]
    
    # Create index on clerkUserId for faster lookups (if doesn't exist)
    users_collection.create_index("clerkUserId", unique=True)
    books_collection.create_index("userId")
    books_collection.create_index([("userId", 1), ("createdAt", -1)])
    
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


# ==================== BOOK/DOCUMENT ENDPOINTS ====================

@app.route("/api/books", methods=["POST"])
def create_book():
    """
    Create a new book/document
    Requires: userId, title
    Optional: description, coverImage (base64), genre
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "status": "error",
                "message": "No data provided"
            }), 400
        
        user_id = data.get("userId")
        title = data.get("title")
        
        if not user_id or not title:
            return jsonify({
                "status": "error",
                "message": "User ID and title are required"
            }), 400
        
        # Create new book document
        new_book = {
            "userId": user_id,
            "title": title,
            "description": data.get("description", ""),
            "coverImage": data.get("coverImage", ""),  # Base64 or URL
            "genre": data.get("genre", ""),
            "content": "",  # Will be updated in editor
            "wordCount": 0,
            "status": "draft",
            "isFavorite": False,
            "isArchived": False,
            "createdAt": datetime.now(timezone.utc),
            "updatedAt": datetime.now(timezone.utc)
        }
        
        result = books_collection.insert_one(new_book)
        
        if result.inserted_id:
            return jsonify({
                "status": "success",
                "message": "Book created successfully",
                "book": {
                    "id": str(result.inserted_id),
                    "title": new_book["title"],
                    "description": new_book["description"],
                    "coverImage": new_book["coverImage"],
                    "genre": new_book["genre"],
                    "status": new_book["status"],
                    "createdAt": new_book["createdAt"].isoformat()
                }
            }), 201
        else:
            return jsonify({
                "status": "error",
                "message": "Failed to create book"
            }), 500
            
    except Exception as e:
        print(f"Error creating book: {e}")
        return jsonify({
            "status": "error",
            "message": "Internal server error"
        }), 500


@app.route("/api/books/user/<user_id>", methods=["GET"])
def get_user_books(user_id):
    """
    Get all books for a user
    Supports filtering by status, favorites, archived
    """
    try:
        # Build query
        query = {"userId": user_id}
        
        # Optional filters
        status = request.args.get("status")
        is_favorite = request.args.get("favorite")
        is_archived = request.args.get("archived")
        
        if status:
            query["status"] = status
        if is_favorite == "true":
            query["isFavorite"] = True
        if is_archived == "true":
            query["isArchived"] = True
        elif is_archived == "false":
            query["isArchived"] = False
        
        # Get books sorted by updatedAt descending
        books = list(books_collection.find(query).sort("updatedAt", -1))
        
        # Format response
        formatted_books = []
        for book in books:
            formatted_books.append({
                "id": str(book["_id"]),
                "title": book["title"],
                "description": book.get("description", ""),
                "coverImage": book.get("coverImage", ""),
                "genre": book.get("genre", ""),
                "content": book.get("content", "")[:100] + "..." if book.get("content") else "",
                "wordCount": book.get("wordCount", 0),
                "status": book.get("status", "draft"),
                "isFavorite": book.get("isFavorite", False),
                "isArchived": book.get("isArchived", False),
                "createdAt": book["createdAt"].isoformat() if book.get("createdAt") else None,
                "updatedAt": book["updatedAt"].isoformat() if book.get("updatedAt") else None
            })
        
        return jsonify({
            "status": "success",
            "books": formatted_books,
            "count": len(formatted_books)
        }), 200
        
    except Exception as e:
        print(f"Error fetching books: {e}")
        return jsonify({
            "status": "error",
            "message": "Internal server error"
        }), 500


@app.route("/api/books/<book_id>", methods=["GET"])
def get_book(book_id):
    """
    Get a single book by ID
    """
    try:
        book = books_collection.find_one({"_id": ObjectId(book_id)})
        
        if book:
            return jsonify({
                "status": "success",
                "book": {
                    "id": str(book["_id"]),
                    "userId": book["userId"],
                    "title": book["title"],
                    "description": book.get("description", ""),
                    "coverImage": book.get("coverImage", ""),
                    "genre": book.get("genre", ""),
                    "content": book.get("content", ""),
                    "wordCount": book.get("wordCount", 0),
                    "status": book.get("status", "draft"),
                    "isFavorite": book.get("isFavorite", False),
                    "isArchived": book.get("isArchived", False),
                    "createdAt": book["createdAt"].isoformat() if book.get("createdAt") else None,
                    "updatedAt": book["updatedAt"].isoformat() if book.get("updatedAt") else None
                }
            }), 200
        else:
            return jsonify({
                "status": "error",
                "message": "Book not found"
            }), 404
            
    except Exception as e:
        print(f"Error fetching book: {e}")
        return jsonify({
            "status": "error",
            "message": "Internal server error"
        }), 500


@app.route("/api/books/<book_id>", methods=["PUT"])
def update_book(book_id):
    """
    Update a book's content or metadata
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "status": "error",
                "message": "No data provided"
            }), 400
        
        # Build update document
        update_data = {"updatedAt": datetime.now(timezone.utc)}
        
        # Fields that can be updated
        updatable_fields = ["title", "description", "coverImage", "genre", 
                           "content", "wordCount", "status", "isFavorite", "isArchived"]
        
        for field in updatable_fields:
            if field in data:
                update_data[field] = data[field]
        
        result = books_collection.update_one(
            {"_id": ObjectId(book_id)},
            {"$set": update_data}
        )
        
        if result.modified_count > 0:
            return jsonify({
                "status": "success",
                "message": "Book updated successfully"
            }), 200
        else:
            return jsonify({
                "status": "error",
                "message": "Book not found or no changes made"
            }), 404
            
    except Exception as e:
        print(f"Error updating book: {e}")
        return jsonify({
            "status": "error",
            "message": "Internal server error"
        }), 500


@app.route("/api/books/<book_id>", methods=["DELETE"])
def delete_book(book_id):
    """
    Delete a book
    """
    try:
        result = books_collection.delete_one({"_id": ObjectId(book_id)})
        
        if result.deleted_count > 0:
            return jsonify({
                "status": "success",
                "message": "Book deleted successfully"
            }), 200
        else:
            return jsonify({
                "status": "error",
                "message": "Book not found"
            }), 404
            
    except Exception as e:
        print(f"Error deleting book: {e}")
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
