/* ******************************************
 * This server.js file is the primary file of the
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const utilities = require("./utilities");
const express = require("express");
require("dotenv").config();
const app = express();
const staticRoutes = require("./routes/static"); // Renamed to clarify it serves static files
const inventoryRoute = require("./routes/inventoryRoute"); // Added inventory route
const expressLayouts = require("express-ejs-layouts");

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

/* ***********************
 * Routes
 *************************/
app.use(staticRoutes); // Corrected: Ensure we use the right variable for static routes

// Inventory routes
app.use("/inv", inventoryRoute); // Added inventory routes

const baseController = require("./controllers/baseController");
app.get("/", baseController.buildHome);

/* ***********************
 * Express Error Handler
 * Place after all other middleware
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  res.render("errors/error", {
    title: err.status || "Server Error",
    message: err.message,
    nav,
  });
});

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT;
const host = process.env.HOST;

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`App listening on http://${host}:${port}`);
});

// Error handler function
function errorHandler(err, req, res, next) {
  console.error(err.stack);
  res.status(500).render("error", { message: "Something went wrong!" });
}

app.use(errorHandler); // Apply error handler middleware after all routes

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

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." });
});

// Index route
app.get("/", utilities.handleErrors(baseController.buildHome));
