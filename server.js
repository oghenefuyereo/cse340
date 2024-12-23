/* ******************************************
 * This server.js file is the primary file of the
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const utilities = require("./utilities/");
const express = require("express");
require("dotenv").config();
const session = require("express-session");
const pool = require("./database/");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const staticRoutes = require("./routes/static"); // Renamed to clarify it serves static files
const inventoryRoute = require("./routes/inventoryRoute"); // Added inventory route
const expressLayouts = require("express-ejs-layouts");
const accountRoutes = require("./routes/accountRoutes"); // Import the account routes
/* ***********************
 * Middleware
 * ************************/
app.use(
  session({
    store: new (require("connect-pg-simple")(session))({
      createTableIfMissing: true,
      pool,
    }),
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    name: "sessionId",
  })
);

app.use("/account", accountRoutes); // Use these routes for paths prefixed with "/account"
// Express Messages Middleware
app.use(require("connect-flash")());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

// Process Registration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser());
app.use(utilities.checkJWTToken);
/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // Not at views root

/* ***********************
 * Middleware for Static Files
 *************************/
app.use(express.static("public")); // This serves static files from the "public" folder
app.use("/css", express.static(__dirname + "/public/css"));
app.use("/js", express.static(__dirname + "/public/js"));
app.use("/images", express.static(__dirname + "/public/images"));
app.use(utilities.checkJWTToken);
/* ***********************
 * Routes
 *************************/
app.use(staticRoutes); // Corrected: Ensure we use the right variable for static routes

// Inventory routes
app.use("/inv", inventoryRoute); // Added inventory routes
app.use("/account", require("./routes/accountRoute"));
const baseController = require("./controllers/baseController");
app.get("/", utilities.handleErrors(baseController.buildHome));
// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." });
});

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT;
const host = process.env.HOST;

/* ***********************
 * Express Error Handler
 * Place after all other middleware
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  if (err.status == 404) {
    message = err.message;
  } else {
    message = "Oh no! There was a crash. Maybe try a different route?";
  }
  res.render("errors/error", {
    title: err.status || "Server Error",
    message,
    nav,
  });
});

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`App listening on http://${host}:${port}`);
});
