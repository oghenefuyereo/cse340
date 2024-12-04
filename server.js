/* ******************************************
 * This server.js file is the primary file of the
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express");
require("dotenv").config();
const app = express();
const staticRoutes = require("./routes/static"); // Renamed to clarify it serves static files
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

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 5500; // Default to 5500 if PORT is not provided
const host = process.env.HOST || "localhost"; // Default to localhost if HOST is undefined

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`App listening on http://${host}:${port}`);
});

// Index route
app.get("/", function (req, res) {
  res.render("index", { title: "Home" });
});

const baseController = require("./controllers/baseController");

// Index route
app.get("/", baseController.buildHome);
