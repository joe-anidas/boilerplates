import 'dotenv/config';
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();

// CORS configuration
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin: allowedOrigins, // allow Vite dev server (and any others via env)
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  // credentials: true, // enable if you start using cookies/auth headers
};

// Middleware
app.use(cors(corsOptions)); // enable CORS for frontend origin
// Handle preflight requests globally (Express 5 doesn't accept '*' path patterns)
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});
app.use(express.json()); // parse JSON body

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/ecommerce")
  .then(() => console.log("✅ MongoDB connected to ecommerce database"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Schema & Model
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model("User", userSchema);

// ✅ POST /users → add new user
app.post("/users", async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ 
        error: 'Name and email are required' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'User with this email already exists' 
      });
    }

    const user = new User({ name, email });
    await user.save();
    res.status(201).json({
      message: 'User created successfully',
      user
    });
  } catch (err) {
    console.error('Error creating user:', err);
    if (err.name === 'ValidationError') {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// ✅ GET /users → fetch all users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({
      message: 'Users fetched successfully',
      count: users.length,
      users
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ GET /users/:id → fetch single user
app.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      message: 'User fetched successfully',
      user
    });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ DELETE /users/:id → delete user
app.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      message: 'User deleted successfully',
      user
    });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 3000;

// Health check / root route
app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "ecommerce-backend" });
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
