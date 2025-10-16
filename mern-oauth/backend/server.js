import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { CORS_ORIGIN, MONGO_URI, PORT } from "./config/env.js";
import { initializeFirebaseAdmin } from "./config/firebase-admin.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import protectedRoutes from "./routes/protectedRoutes.js";

const app = express();

// CORS configuration
const corsOptions = {
  origin: CORS_ORIGIN,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Middleware
app.use(cors(corsOptions));
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});
app.use(express.json());

// Initialize Firebase Admin
initializeFirebaseAdmin();

// MongoDB connection
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Health check
app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "ecommerce-backend" });
});

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/', protectedRoutes);

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
