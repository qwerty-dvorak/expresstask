require("dotenv").config();
const express = require("express");
const path = require("node:path");
const session = require('express-session');
const connectDB = require("./config/db");
const tokenUpdateJob = require("./cron/tokenUpdate");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const indexRoutes = require("./routes/index");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'fallback-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
};

app.use(session(sessionConfig));

connectDB();
tokenUpdateJob.start();

// Routes
app.use("/", indexRoutes);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);

module.exports = app;
