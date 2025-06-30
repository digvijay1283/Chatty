import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

// import http from "http";
// import path from "path";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();


const PORT = process.env.PORT || 5001;

// Configure CORS
app.use(cors({
  origin: "http://localhost:5173", // Your frontend URL
  credentials: true
}));

// Middleware
app.use(express.json({ limit: '50mb' })); // Increased payload limit
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    code: err.code
  });

  // Handle Cloudinary errors
  if (err.http_code) {
    return res.status(err.http_code).json({ 
      message: err.message || "Image upload failed"
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: Object.values(err.errors).map(e => e.message).join(', ')
    });
  }

  // Handle other errors
  res.status(err.status || 500).json({ 
    message: err.message || "Something went wrong!",
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Connect to MongoDB and start server
connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch((err) => {
    console.log("Error connecting to MongoDB", err);
});
