require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose"); // ✅ Import mongoose
const connectDB = require("./config/db"); // ✅ Import DB connection
require("./config/passportConfig"); // ✅ Import Passport configuration

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const newsRoutes = require("./routes/newsRoutes");
const bookmarkRoutes = require("./routes/bookmarkRoutes");

const app = express();

// 🔹 Connect to Database
connectDB();

// 🔹 Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// ✅ Fix Content Security Policy (Helmet Blocking Google Fonts & Scripts)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://apis.google.com"],
        styleSrc: ["'self'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://lh3.googleusercontent.com"], // Allow Google profile images
      },
    },
  })
);


app.use(morgan("dev"));

// 🔹 Session Middleware (Required for Passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "newsapp",
    resave: false,
    saveUninitialized: true,
  })
);

// 🔹 Initialize Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// 🔹 Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/bookmark", bookmarkRoutes);

// 🔹 Start Server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);

// 🔹 Graceful Shutdown (Handle server exit)
process.on("SIGINT", async () => {
  console.log("\n🔻 Shutting down server...");
  try {
    await mongoose.disconnect(); // ✅ Properly disconnect DB
    console.log("✅ Database disconnected.");
  } catch (err) {
    console.error("❌ Error disconnecting database:", err);
  }
  server.close(() => {
    console.log("✅ Server closed.");
    process.exit(0);
  });
});
