/**************************************
 * Require Statements
 **************************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const dotenv = require("dotenv").config();
const baseController = require("./controllers/baseController");
const staticRoutes = require("./routes/static");
const inventoryRoute = require("./routes/inventoryRoute");
const utilities = require("./utilities"); // Should export getNav() and handleErrors

/**************************************
 * Express App Setup
 **************************************/
const app = express();

/**************************************
 * View Engine and Layouts
 **************************************/
app.set("view engine", "ejs"); // Set EJS as the view engine
app.use(expressLayouts); // Use express-ejs-layouts for layout support
app.set("layout", "./layouts/layout"); // Set default layout file path

/**************************************
 * Middleware Setup
 **************************************/
app.use(express.static("public")); // Serve static files from the "public" directory
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

/**************************************
 * Route Definitions
 **************************************/
app.use("/", staticRoutes); // Use staticRoutes for static pages
app.use("/inv", inventoryRoute); // Use inventoryRoute for inventory-related pages

// Home route using error-handling wrapper
app.get("/", utilities.handleErrors(baseController.buildHome));

/**************************************
 * Error Handling
 **************************************/

// 404 Error Handler: Placed after all valid routes
app.use((req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." });
});

// Global Error Handler: Handles all errors
app.use(async (err, req, res, next) => {
  const nav = await utilities.getNav(); // Fetch navigation data
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
// Route to manually trigger a 500 error for testing
app.get("/trigger-error", (req, res, next) => {
  next(new Error("This is a simulated server error"));
});

/**************************************
 * Server Configuration and Start
 **************************************/
const port = process.env.PORT || 3000; // Use environment variable PORT or default to 3000
const host = process.env.HOST || "localhost"; // Use environment variable HOST or default to localhost

// Start server
app.listen(port, () => {
  console.log(`Server running at http://${host}:${port}`);
});
