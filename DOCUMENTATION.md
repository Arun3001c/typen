# Typen - Next-Word Prediction Writing App

## Complete Project Documentation

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Installation & Setup](#4-installation--setup)
5. [Backend API Reference](#5-backend-api-reference)
6. [Frontend Components](#6-frontend-components)
7. [Features](#7-features)
8. [Database Schema](#8-database-schema)
9. [Authentication](#9-authentication)
10. [Configuration](#10-configuration)

---

## 1. Project Overview

**Typen** is a modern writing application that provides AI-powered next-word predictions to help authors and writers craft their content more efficiently. The application features a Microsoft Word-like editor with multi-page support, rich text formatting, and intelligent word suggestions powered by Cohere's language model.

### Key Highlights

- **AI-Powered Writing**: Real-time word predictions with both probable and creative suggestions
- **Professional Editor**: A4-sized document pages with full rich text formatting
- **Multi-Page Support**: Automatic page creation when content overflows
- **Cloud Storage**: Books and documents stored in MongoDB
- **Secure Authentication**: User management via Clerk

---

## 2. Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI Framework |
| Vite | 7.2.5 (rolldown) | Build Tool |
| React Router DOM | 7.13.0 | Client-side Routing |
| Clerk React | 5.59.5 | Authentication |
| Lucide React | 0.563.0 | Icons |
| Styled Components | 6.3.8 | CSS-in-JS Styling |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Flask | 3.0.0 | Web Framework |
| Flask-CORS | 4.0.0 | Cross-Origin Resource Sharing |
| Flask-Mail | 0.9.1 | Email Sending |
| PyMongo | 4.6.1 | MongoDB Driver |
| Cohere | 4.47 | AI Word Prediction |
| python-dotenv | 1.0.0 | Environment Variables |

### Database
- **MongoDB** - Document database for storing users and books

### External Services
- **Clerk** - Authentication and user management
- **Cohere API** - AI language model for predictions

---

## 3. Project Structure

```
typen/
├── backend/
│   ├── app.py                 # Flask application with all API endpoints
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables (not in repo)
│
├── frontend/
│   ├── public/
│   │   └── logo.svg           # Application logo
│   │
│   ├── src/
│   │   ├── App.jsx            # Main application with routing
│   │   ├── main.jsx           # React entry point
│   │   │
│   │   ├── components/
│   │   │   ├── landingpage.jsx    # Landing page
│   │   │   ├── Login.jsx          # Authentication page
│   │   │   │
│   │   │   ├── Dashboard/
│   │   │   │   ├── Dashboard.jsx  # Book library view
│   │   │   │   ├── Editor.jsx     # Main text editor
│   │   │   │   ├── editor.css     # Editor styles
│   │   │   │   ├── profile.jsx    # User profile
│   │   │   │   └── profile.css    # Profile styles
│   │   │   │
│   │   │   └── loading/
│   │   │       ├── GlobalLoader.jsx
│   │   │       ├── Loading.jsx
│   │   │       └── Loading.css
│   │   │
│   │   ├── context/
│   │   │   ├── index.js
│   │   │   └── LoadingContext.jsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── index.js
│   │   │   └── useAsyncLoading.js
│   │   │
│   │   └── styles/
│   │       ├── dashboard.css
│   │       ├── landingpage.css
│   │       └── login.css
│   │
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── eslint.config.js
│
└── .github/                   # GitHub workflows
```

---

## 4. Installation & Setup

### Prerequisites

- Node.js 18+ 
- Python 3.10+
- MongoDB (local or Atlas)
- Clerk account
- Cohere API key

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with required variables
# See Configuration section for details

# Run the server
python app.py
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file with Clerk keys
# VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
# VITE_API_URL=http://localhost:5000

# Run development server
npm run dev
```

### Environment Variables

**Backend (.env)**
```env
MONGO_URI=mongodb://localhost:27017
DB_NAME=next_word_prediction
COHERE_API_KEY=your_cohere_api_key
PORT=5000
FLASK_DEBUG=True

# Email Configuration (for contact form)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USE_SSL=False
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password_here
MAIL_DEFAULT_SENDER=your_email@gmail.com
```

> **Note**: For Gmail, you need to use an App Password instead of your regular password. Generate one at: https://myaccount.google.com/apppasswords

**Frontend (.env)**
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:5000
```

---

## 5. Backend API Reference

### Base URL
```
http://localhost:5000
```

### Health Check

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API health check |

**Response:**
```json
{
  "status": "success",
  "message": "Next Word Prediction API is running!"
}
```

---

### User Endpoints

#### Register User
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/users/register` | POST | Register new user from Clerk |

**Request Body:**
```json
{
  "clerkUserId": "user_abc123",
  "email": "user@example.com",
  "username": "johndoe",
  "fullName": "John Doe"
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "user": {
    "clerkUserId": "user_abc123",
    "email": "user@example.com",
    "username": "johndoe",
    "fullName": "John Doe"
  }
}
```

#### Get User
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/users/<clerk_user_id>` | GET | Get user details |

---

### Contact Endpoint

#### Send Contact Form
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/contact` | POST | Send contact form email |

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "subject": "Question about Typen",
  "message": "I have a question about..."
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Email sent successfully"
}
```

**Error Response (500):**
```json
{
  "status": "error",
  "message": "Failed to send email: <error details>"
}
```

---

### Book Endpoints

#### Create Book
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/books` | POST | Create new book |

**Request Body:**
```json
{
  "userId": "user_abc123",
  "title": "My Novel",
  "description": "A story about...",
  "genre": "fiction",
  "coverImage": "base64_encoded_image"
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Book created successfully",
  "book": {
    "id": "65abc123...",
    "title": "My Novel",
    "description": "A story about...",
    "coverImage": "...",
    "genre": "fiction",
    "status": "draft",
    "createdAt": "2026-02-14T10:00:00Z"
  }
}
```

#### Get User's Books
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/books/user/<user_id>` | GET | Get all books for user |

**Query Parameters:**
- `status` - Filter by status (draft, published)
- `favorite` - Filter favorites (true/false)
- `archived` - Filter archived (true/false)

#### Get Single Book
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/books/<book_id>` | GET | Get book by ID |

#### Update Book
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/books/<book_id>` | PUT | Update book |

**Request Body (partial update):**
```json
{
  "content": "<p>Chapter 1...</p>",
  "wordCount": 1500,
  "title": "Updated Title"
}
```

#### Delete Book
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/books/<book_id>` | DELETE | Delete book |

---

### AI Prediction Endpoint

#### Get Word Predictions
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/predict` | POST | Get AI word predictions |

**Request Body:**
```json
{
  "text": "The sun was setting over the",
  "genre": "fiction"
}
```

**Response:**
```json
{
  "status": "success",
  "predictions": [
    {"id": 1, "word": "horizon", "rank": "1", "type": "probable"},
    {"id": 2, "word": "mountains", "rank": "2", "type": "probable"},
    {"id": 3, "word": "ocean", "rank": "3", "type": "probable"},
    {"id": 4, "word": "city", "rank": "4", "type": "probable"},
    {"id": 5, "word": "valley", "rank": "5", "type": "probable"},
    {"id": 6, "word": "crimson", "rank": "C1", "type": "creative"},
    {"id": 7, "word": "ethereal", "rank": "C2", "type": "creative"},
    {"id": 8, "word": "forgotten", "rank": "C3", "type": "creative"}
  ]
}
```

---

## 6. Frontend Components

### Page Components

| Component | Path | Description |
|-----------|------|-------------|
| `LandingPage` | `/` | Marketing/landing page |
| `Login` | `/login` | Clerk authentication UI |
| `Dashboard` | `/dashboard` | Book library grid |
| `Editor` | `/editor/:id` | Main writing editor |
| `Profile` | `/profile` | User profile settings |

### Editor Sub-Components

#### TextEditorPanel
The main editing area featuring:
- **Toolbar Groups**: Edit, Format, Font, Colors, Lists, Align, Spacing, Actions
- **Multi-page A4 Editor**: Automatic page creation on overflow
- **Rich Text Formatting**: Bold, italic, underline, strikethrough
- **Font Controls**: Family selection, size with +/- buttons
- **Color Pickers**: Text color and highlight with MS Word-style palette
- **Spacing Controls**: Line spacing and word spacing dropdowns

#### WordPredictionPanel
Left sidebar showing:
- **Probable Words**: Top 5 predicted words
- **Creative Words**: 3 alternative creative suggestions
- **Regenerate Button**: Refresh predictions
- **Collapsible**: Can be minimized

#### WritingRibbon
Right sidebar showing:
- **Document Stats**: Word count, character count
- **Save Status**: Last saved timestamp
- **Genre & Style**: Genre and tone selectors
- **Writing Intensity Slider**
- **Focus Mode Toggle**
- **Document Insights**: Vocabulary richness, sentence length, passive voice percentage

---

## 7. Features

### Text Editor Features

| Feature | Description |
|---------|-------------|
| **Multi-page Support** | Automatic page creation when content overflows |
| **A4 Page Format** | 210mm × 297mm with proper margins |
| **Rich Text Formatting** | Bold, italic, underline, strikethrough |
| **Font Selection** | Multiple font families and sizes |
| **Text Colors** | 80-color palette + custom color picker |
| **Highlight Colors** | 20-color highlight palette |
| **Line Spacing** | 1, 1.15, 1.5, 2, 2.5, 3 options |
| **Word Spacing** | 0-10px adjustable |
| **Lists** | Bullet and numbered lists |
| **Alignment** | Left, center, right, justify |
| **Undo/Redo** | Full editing history |
| **Auto-save** | Saves after 2 seconds of inactivity |
| **Print Support** | Proper page breaks for printing |

### AI Prediction Features

| Feature | Description |
|---------|-------------|
| **Probable Words** | 5 most likely next words |
| **Creative Words** | 3 creative/literary alternatives |
| **Genre-aware** | Predictions based on selected genre |
| **Context Analysis** | Uses last 30 words for context |
| **Click to Insert** | One-click word insertion |
| **Regenerate** | Manual refresh predictions |

### Document Management

| Feature | Description |
|---------|-------------|
| **Create Books** | New book with title, description, genre, cover |
| **Edit Details** | Update book metadata |
| **Cover Images** | Base64 encoded cover images |
| **Favorites** | Star/unstar books |
| **Archive** | Archive old books |
| **Delete** | Permanently delete books |
| **Word Count** | Automatic word counting |

---

## 8. Database Schema

### Users Collection

```javascript
{
  _id: ObjectId,
  clerkUserId: String,      // Clerk user ID (unique)
  email: String,            // User email
  username: String,         // Display username
  fullName: String,         // Full name
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `clerkUserId` (unique)

### Books Collection

```javascript
{
  _id: ObjectId,
  userId: String,           // Owner's Clerk user ID
  title: String,            // Book title
  description: String,      // Book description
  coverImage: String,       // Base64 or URL
  genre: String,            // Genre category
  content: String,          // HTML content
  wordCount: Number,        // Word count
  status: String,           // "draft" | "published"
  isFavorite: Boolean,      // Starred
  isArchived: Boolean,      // Archived
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `userId`
- `userId` + `createdAt` (compound, descending)

---

## 9. Authentication

### Clerk Integration

The application uses **Clerk** for authentication:

1. **Sign Up Flow**:
   - User signs up via Clerk UI
   - On successful signup, user is registered in MongoDB
   - Clerk webhook or client-side call to `/api/users/register`

2. **Sign In Flow**:
   - User signs in via Clerk
   - Session managed by Clerk
   - User data fetched from MongoDB

3. **Protected Routes**:
   - Dashboard, Editor, Profile require authentication
   - `useUser()` hook from `@clerk/clerk-react`
   - Redirects to `/login` if not authenticated

### Code Example

```jsx
import { useUser } from '@clerk/clerk-react';

const Dashboard = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  
  if (!isLoaded) return <Loading />;
  if (!isSignedIn) return <Navigate to="/login" />;
  
  // Render dashboard...
};
```

---

## 10. Configuration

### Supported Genres

```javascript
const genres = [
  'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 
  'Sci-Fi', 'Fantasy', 'Thriller', 'Horror', 
  'Biography', 'Self-Help'
];
```

### Writing Tones

```javascript
const tones = [
  'Neutral', 'Formal', 'Casual', 'Dramatic', 
  'Humorous', 'Poetic', 'Suspenseful', 'Romantic'
];
```

### Font Options

```javascript
const fonts = [
  'Georgia', 'Times New Roman', 'Arial', 
  'Helvetica', 'Inter', 'Roboto'
];

const fontSizes = [
  8, 9, 10, 11, 12, 14, 16, 18, 
  20, 24, 28, 32, 36, 48, 72
];
```

### Line Spacing Options

```javascript
const lineSpacingOptions = [1, 1.15, 1.5, 2, 2.5, 3];
const wordSpacingOptions = [0, 1, 2, 3, 4, 5, 6, 8, 10];
```

---

## License

This project is proprietary software. All rights reserved.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Feb 2026 | Initial release with core features |

---

*Documentation generated on February 14, 2026*
