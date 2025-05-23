/* ******************************************
 * This server.js file is the primary file of the
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const baseController = require("./controllers/baseController")
const expressLayouts = require("express-ejs-layouts");
const express = require("express");
const env = require("dotenv").config();
const app = express();
const staticRoutes = require("./routes/static"); // Ensure this file exists
const inventoryRoute = require("./routes/inventoryRoute"); 


/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // Layout file in the 'layouts' folder

/* ***********************
 * Middleware for Static Files
 *************************/
app.use(express.static("public")); // Serve static files from 'public' folder

/* ***********************
 * Routes
 *************************/
app.use(staticRoutes); // This is for any custom routes you may have in static.js

// Index route
app.get("/", function (req, res) {
  res.render("index", { title: "Home" });
});

// Inventory routes
app.use("/inv", inventoryRoute);


/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 3000;  // Default to 3000 if not provided
const host = process.env.HOST || "localhost";  // Default to 'localhost' if not provided

// Debug environment variables
console.log("PORT:", port);
console.log("HOST:", host);

// Debug views directory
console.log("Views directory:", app.get("views"));

// Debug middleware
console.log("Static middleware loaded: Serving static files from './public'");

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`App listening on http://${host}:${port}`);
});
