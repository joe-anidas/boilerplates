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
  .connect(process.env.MONGO_URI)
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

// ==========================
// Dashboard Data Models
// ==========================
// Timeseries: Sales (date, amount)
const saleSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  amount: { type: Number, required: true, min: 0 }
});
const Sale = mongoose.model("Sale", saleSchema);

// Timeseries: Visitors (date, count)
const visitorSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  count: { type: Number, required: true, min: 0 }
});
const Visitor = mongoose.model("Visitor", visitorSchema);

// Categorical: Category stats (category, value)
const categoryStatSchema = new mongoose.Schema({
  category: { type: String, required: true, trim: true },
  value: { type: Number, required: true, min: 0 }
});
const CategoryStat = mongoose.model("CategoryStat", categoryStatSchema);

// ==========================
// Seed Random Data Endpoint
// ==========================
app.post("/seed/random", async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      salesCount = 20,
      salesMin = 10,
      salesMax = 500,
      visitorsCount = 20,
      visitorsMin = 50,
      visitorsMax = 2000,
      categories = ["Electronics", "Clothing", "Home", "Books", "Toys"],
      categoryItems = 15,
      categoryMin = 5,
      categoryMax = 200
    } = req.body || {};

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 1000 * 60 * 60 * 24 * 30);
    const end = endDate ? new Date(endDate) : new Date();
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return res.status(400).json({ error: "Invalid date range" });
    }

    const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + Number(min);
    const randFloat = (min, max) => Number((Math.random() * (max - min) + Number(min)).toFixed(2));
    const randDateBetween = () => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

    // Build random documents
    const salesDocs = Array.from({ length: Number(salesCount) }, () => ({
      date: randDateBetween(),
      amount: randFloat(salesMin, salesMax)
    }));

    const visitorsDocs = Array.from({ length: Number(visitorsCount) }, () => ({
      date: randDateBetween(),
      count: randInt(visitorsMin, visitorsMax)
    }));

    const categoryDocs = Array.from({ length: Number(categoryItems) }, () => ({
      category: categories[randInt(0, Math.max(categories.length - 1, 0))],
      value: randInt(categoryMin, categoryMax)
    }));

    const [salesResult, visitorsResult, categoriesResult] = await Promise.all([
      Sale.insertMany(salesDocs),
      Visitor.insertMany(visitorsDocs),
      CategoryStat.insertMany(categoryDocs)
    ]);

    res.status(201).json({
      message: "Random data seeded",
      inserted: {
        sales: salesResult.length,
        visitors: visitorsResult.length,
        categories: categoriesResult.length
      }
    });
  } catch (err) {
    console.error("Error seeding random data:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

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

// ==========================
// Sales Endpoints
// ==========================
// POST /sales → add a sale
app.post("/sales", async (req, res) => {
  try {
    const { date, amount } = req.body;
    if (!date || amount == null) {
      return res.status(400).json({ error: "date and amount are required" });
    }
    const sale = new Sale({ date: new Date(date), amount: Number(amount) });
    await sale.save();
    res.status(201).json({ message: "Sale created", sale });
  } catch (err) {
    console.error("Error creating sale:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /sales → list sales
app.get("/sales", async (_req, res) => {
  try {
    const sales = await Sale.find().sort({ date: 1 });
    res.json({ count: sales.length, sales });
  } catch (err) {
    console.error("Error fetching sales:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /dashboards/sales → timeseries aggregated by day
app.get("/dashboards/sales", async (_req, res) => {
  try {
    const data = await Sale.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" }
          },
          totalAmount: { $sum: "$amount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json({
      labels: data.map((d) => d._id),
      datasets: [
        { label: "Sales", data: data.map((d) => d.totalAmount) }
      ]
    });
  } catch (err) {
    console.error("Error aggregating sales:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ==========================
// Visitors Endpoints
// ==========================
// POST /visitors → add a visitor count
app.post("/visitors", async (req, res) => {
  try {
    const { date, count } = req.body;
    if (!date || count == null) {
      return res.status(400).json({ error: "date and count are required" });
    }
    const visitor = new Visitor({ date: new Date(date), count: Number(count) });
    await visitor.save();
    res.status(201).json({ message: "Visitor record created", visitor });
  } catch (err) {
    console.error("Error creating visitor record:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /visitors → list visitors records
app.get("/visitors", async (_req, res) => {
  try {
    const visitors = await Visitor.find().sort({ date: 1 });
    res.json({ count: visitors.length, visitors });
  } catch (err) {
    console.error("Error fetching visitors:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /dashboards/visitors → timeseries aggregated by day
app.get("/dashboards/visitors", async (_req, res) => {
  try {
    const data = await Visitor.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" }
          },
          totalCount: { $sum: "$count" }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json({
      labels: data.map((d) => d._id),
      datasets: [
        { label: "Visitors", data: data.map((d) => d.totalCount) }
      ]
    });
  } catch (err) {
    console.error("Error aggregating visitors:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ==========================
// Category Stats Endpoints
// ==========================
// POST /categories → add a category stat
app.post("/categories", async (req, res) => {
  try {
    const { category, value } = req.body;
    if (!category || value == null) {
      return res.status(400).json({ error: "category and value are required" });
    }
    const stat = new CategoryStat({ category, value: Number(value) });
    await stat.save();
    res.status(201).json({ message: "Category stat created", stat });
  } catch (err) {
    console.error("Error creating category stat:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /categories → list category stats (raw)
app.get("/categories", async (_req, res) => {
  try {
    const categories = await CategoryStat.find();
    res.json({ count: categories.length, categories });
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /dashboards/categories → aggregated totals by category
app.get("/dashboards/categories", async (_req, res) => {
  try {
    const data = await CategoryStat.aggregate([
      { $group: { _id: "$category", total: { $sum: "$value" } } },
      { $sort: { _id: 1 } }
    ]);
    res.json({
      labels: data.map((d) => d._id),
      datasets: [
        { label: "Categories", data: data.map((d) => d.total) }
      ]
    });
  } catch (err) {
    console.error("Error aggregating categories:", err);
    res.status(500).json({ error: "Internal server error" });
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
