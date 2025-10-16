# MERN Stack with Firebase OAuth Authentication

This project has been migrated from JWT authentication to Firebase OAuth authentication, supporting both email/password and Google OAuth authentication.

## Features

- 🔐 Firebase Authentication with email/password and Google OAuth
- 🚀 MERN Stack (MongoDB, Express.js, React, Node.js)
- 🔒 Protected routes and middleware
- 👤 User management with Firebase UID
- 📱 Responsive design with Tailwind CSS

## Project Structure

```
mern-oauth/
├── backend/                 # Express.js API server
│   ├── config/             # Configuration files
│   │   ├── env.js          # Environment variables
│   │   └── firebase-admin.js # Firebase Admin SDK setup
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Authentication middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   └── server.js          # Main server file
├── frontend/              # React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks (useAuth)
│   │   ├── lib/           # Firebase config and API helpers
│   │   └── pages/         # Page components
│   └── package.json
└── next-oauth/           # Reference Next.js OAuth implementation
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB
- Firebase project with Authentication enabled

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password and Google providers
4. Generate service account key:
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Download the JSON file

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/oauth
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email
   FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key\n-----END PRIVATE KEY-----\n"
   CORS_ORIGIN=http://localhost:5173
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```env
   VITE_API_URL=http://localhost:3000
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /auth/users` - Save user data to database
- `GET /auth/users/:uid` - Get user by UID

### Protected Routes
- `GET /dashboard` - Get dashboard data (requires authentication)

### User Management
- `GET /users` - Get all users
- `GET /users/:uid` - Get user by UID
- `DELETE /users/:uid` - Delete user by UID

## Authentication Flow

1. **Registration/Login**: Users can register or login using email/password or Google OAuth
2. **Token Generation**: Firebase generates an ID token upon successful authentication
3. **Backend Verification**: The backend verifies the Firebase ID token using Firebase Admin SDK
4. **User Storage**: User data is stored in MongoDB with Firebase UID as the primary identifier
5. **Protected Routes**: Authentication middleware verifies tokens for protected routes

## Key Changes from JWT to OAuth

### Backend Changes
- Replaced `jsonwebtoken` with `firebase-admin` SDK
- Updated User model to use Firebase UID instead of MongoDB ObjectId
- Modified authentication middleware to verify Firebase ID tokens
- Updated controllers to work with Firebase user data

### Frontend Changes
- Integrated Firebase Authentication SDK
- Added Google OAuth provider
- Created custom `useAuth` hook for authentication state management
- Updated all pages to use Firebase authentication
- Modified API calls to use Firebase ID tokens

## Environment Variables

### Backend (.env)
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/oauth
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key\n-----END PRIVATE KEY-----\n"
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Running the Application

1. Start MongoDB
2. Start the backend server: `cd backend && npm run dev`
3. Start the frontend server: `cd frontend && npm run dev`
4. Open http://localhost:5173 in your browser

## Testing

1. Register a new account using email/password
2. Try logging in with Google OAuth
3. Test protected routes by accessing the dashboard
4. Verify user data is stored in MongoDB

## Troubleshooting

- Ensure Firebase project has Authentication enabled
- Verify all environment variables are correctly set
- Check that MongoDB is running
- Ensure CORS is properly configured for your frontend URL
- Verify Firebase service account permissions

## Security Notes

- Firebase ID tokens expire after 1 hour by default
- Tokens are automatically refreshed by the Firebase SDK
- User data is validated on both client and server side
- Protected routes require valid Firebase ID tokens
