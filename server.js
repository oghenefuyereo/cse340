/**************************************
 * Require Statements
 **************************************/
const express = require("express");
const session = require("express-session");
const pool = require('./database/');
const expressLayouts = require("express-ejs-layouts");
const dotenv = require("dotenv").config();
const baseController = require("./controllers/baseController");
const staticRoutes = require("./routes/static");
const inventoryRoute = require("./routes/inventoryRoute"); 
const accountRoute = require("./routes/accountRoute");
const favoritesRoute = require("./routes/favoriteRoute"); // adjust filename if different
const utilities = require("./utilities");
const bodyParser = require("body-parser"); 
const cookieParser = require("cookie-parser");

/**************************************
 * Express App Setup
 **************************************/
const app = express();

/**************************************
 * Middleware - Session Setup
 **************************************/
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    pool,
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: 'sessionId',
}));

/**************************************
 * Middleware - Flash Messages
 **************************************/
app.use(require('connect-flash')());
app.use((req, res, next) => {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

/**************************************
 * Middleware - Expose session data to views
 **************************************/
app.use((req, res, next) => {
  res.locals.accountData = req.session.accountData || null;
  next();
});

/**************************************
 * View Engine and Layouts
 **************************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "layouts/layout");

/**************************************
 * Middleware - Static & Parsing
 **************************************/
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(utilities.checkJWTToken);

/**************************************
 * Route Definitions
 **************************************/
app.use("/", staticRoutes);
app.use("/inv", inventoryRoute);
app.use("/account", accountRoute);
app.use("/favorites", favoritesRoute); 
app.get("/", utilities.handleErrors(baseController.buildHome));

/**************************************
 * Error Handling
 **************************************/
app.use((req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." });
});

app.use(async (err, req, res, next) => {
  const nav = await utilities.getNav();
  console.error(`Error at "${req.originalUrl}": ${err.message}`);
  const message = err.status === 404
    ? err.message
    : "Oh no! There was a crash. Maybe try a different route?";
  res.status(err.status || 500).render("errors/error", {
    title: err.status || "Server Error",
    message,
    nav,
  });
});

/**************************************
 * Test Route (Optional)
 **************************************/
app.get("/trigger-error", (req, res, next) => {
  next(new Error("This is a simulated server error"));
});

/**************************************
 * Server Start
 **************************************/
const port = process.env.PORT || 3000;
const host = process.env.HOST || "localhost";

app.listen(port, () => {
  console.log(`Server running at http://${host}:${port}`);
});
