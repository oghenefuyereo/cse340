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
const utilities = require("./utilities");
const bodyParser = require("body-parser"); 
const cookieParser = require("cookie-parser");

/**************************************
 * Express App Setup
 **************************************/
const app = express();

/**************************************
 * Middleware
 **************************************/
// Session store setup with connect-pg-simple
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    pool,
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,           // better to set false unless you need it true
  saveUninitialized: false, // better to set false for security reasons
  name: 'sessionId',
}));

// Flash messages middleware
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
app.set("layout", "layouts/layout"); // remove the leading "./" — just folder and filename

/**************************************
 * Middleware Setup for Body Parsing & Static Files
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
