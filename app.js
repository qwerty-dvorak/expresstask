require("dotenv").config();
const express = require("express");
const path = require("node:path");
const session = require('express-session');
const connectDB = require("./config/db");
const tokenUpdateJob = require("./cron/tokenUpdate");
const flash = require('connect-flash');

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const indexRoutes = require("./routes/index");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Add body parser before routes
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
    secret: process.env.SESSION_SECRET || (() => {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('SESSION_SECRET must be set in production');
        }
        return 'dev-secret';
    })(),
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24,
        sameSite: 'strict'
    },
    name: 'sessionId'
};

app.use(session(sessionConfig));
app.use(flash()); // Add after session middleware

connectDB();
tokenUpdateJob.start();

// Routes
app.use("/", indexRoutes);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);

// Add after routes
app.use((err, req, res, next) => {
  req.flash('error', err.message);
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {}
  });
});

module.exports = app;
