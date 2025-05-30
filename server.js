/**************************************
 * Require Statements
 **************************************/
const session = require("express-session");
const pool = require('./database/');
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const dotenv = require("dotenv").config();
const baseController = require("./controllers/baseController");
const staticRoutes = require("./routes/static");
const inventoryRoute = require("./routes/inventoryRoute");
const accountRoute = require("./routes/accountRoute"); // ✅ New line added
const utilities = require("./utilities"); // Should export getNav() and handleErrors
const bodyParser = require("body-parser"); 

/**************************************
 * Express App Setup
 **************************************/
const app = express();

/**************************************
 * Middleware
 **************************************/
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res);
  next();
});

/**************************************
 * View Engine and Layouts
 **************************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

/**************************************
 * Middleware Setup for Body Parsing & Static Files
 **************************************/
app.use(express.static("public"));
app.use(bodyParser.json());                           // <-- body-parser json middleware
app.use(bodyParser.urlencoded({ extended: true }));  // <-- body-parser urlencoded middleware

/**************************************
 * Route Definitions
 **************************************/
app.use("/", staticRoutes);
app.use("/inv", inventoryRoute);
app.use("/account", accountRoute); // 

// Home route using error-handling wrapper
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
  const message =
    err.status === 404
      ? err.message
      : "Oh no! There was a crash. Maybe try a different route?";
  res.status(err.status || 500).render("errors/error", {
    title: err.status || "Server Error",
    message,
    nav,
  });
});

/**************************************
 * Additional Route for Testing
 **************************************/
app.get("/trigger-error", (req, res, next) => {
  next(new Error("This is a simulated server error"));
});

/**************************************
 * Server Configuration and Start
 **************************************/
const port = process.env.PORT || 3000;
const host = process.env.HOST || "localhost";

app.listen(port, () => {
  console.log(`Server running at http://${host}:${port}`);
});
