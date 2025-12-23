 # Streamify - Video Chat Application

A full-stack video chat application built with React, Node.js, Express, and MongoDB.

## Features

- 🎥 Video calling with Stream.io
- 💬 Real-time chat messaging
- 👥 Friend requests and management
- 🔐 User authentication (JWT)
- 🎨 Multiple themes with DaisyUI
- 📱 Responsive design

## Tech Stack

**Frontend:**
- React 19
- Vite
- Tailwind CSS + DaisyUI
- Stream.io Video SDK
- Axios for API calls
- Zustand for state management

**Backend:**
- Node.js + Express
- MongoDB with Mongoose
- JWT Authentication
- Stream.io Chat API
- CORS enabled

## Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret
JWT_SECRET_KEY=your_jwt_secret
NODE_ENV=production
```

## Installation & Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm run build
   ```
3. Start the application:
   ```bash
   npm start
   ```

## Development

- Backend runs on http://localhost:5001
- Frontend runs on http://localhost:5173

## Deployment

The application is configured for deployment on platforms like Vercel, Railway, or Render.
