/* ***********************
 * Require Statements
 *************************/
const baseController = require("./controllers/baseController");
const expressLayouts = require("express-ejs-layouts");
const express = require("express");
const env = require("dotenv").config();
const app = express();
const staticRoutes = require("./routes/static");
const inventoryRoute = require("./routes/inventoryRoute");
const utilities = require("./utilities"); // Ensure this exists and has getNav()

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

/* ***********************
 * Middleware for Static Files
 *************************/
app.use(express.static("public"));

/* ***********************
 * Routes
 *************************/
app.use(staticRoutes);
app.get("/", (req, res) => {
  res.render("index", { title: "Home" });
});
app.use("/inv", inventoryRoute);

/* ***********************
 * File Not Found Route
 * Must come AFTER routes
 *************************/
app.use(async (req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." });
});

/* ***********************
 * Global Error Handler
 *************************/
app.use(async (err, req, res, next) => {
  const nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  res.status(err.status || 500).render("errors/error", {
    title: err.status || "Server Error",
    message: err.message,
    nav,
  });
});

/* ***********************
 * Server Info
 *************************/
const port = process.env.PORT || 3000;
const host = process.env.HOST || "localhost";

console.log("PORT:", port);
console.log("HOST:", host);
console.log("Views directory:", app.get("views"));
console.log("Static middleware loaded: Serving static files from './public'");

app.listen(port, () => {
  console.log(`App listening on http://${host}:${port}`);
});
