/* ******************************************
 * This server.js file is the primary file of
 * the application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const dotenv = require("dotenv");
const session = require("express-session");
const pool = require("./database/");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const expressLayouts = require("express-ejs-layouts");
const connectFlash = require("connect-flash");

const utilities = require("./utilities/");
const staticRoutes = require("./routes/static");
const inventoryRoute = require("./routes/inventoryRoute");
const accountRoutes = require("./routes/accountRoutes"); // Ensure this file exists
const baseController = require("./controllers/baseController");

// Load environment variables
dotenv.config();

// Initialize the app
const app = express();

/* ***********************
 * Middleware
 ************************/
app.use(
  session({
    store: new (require("connect-pg-simple")(session))({
      createTableIfMissing: true,
      pool,
    }),
    secret: process.env.SESSION_SECRET || "default-secret", // Ensure a fallback secret
    resave: true,
    saveUninitialized: true,
    name: "sessionId",
    cookie: {
      secure: process.env.NODE_ENV === "production", // Ensure cookies are secure in production
      httpOnly: true, // Prevent access to cookies via JavaScript
      maxAge: 1000 * 60 * 60 * 24, // 1 day expiration
    },
  })
);

// Express Messages Middleware for flash messages
app.use(connectFlash());
app.use((req, res, next) => {
  res.locals.messages = req.flash(); // Using req.flash directly for messages
  next();
});

// Body parser to handle form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded form data
app.use(cookieParser());

// JWT Token check only for relevant routes
app.use("/account", utilities.checkJWTToken); // Apply middleware specifically for account routes

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // Layout file for EJS templates

/* ***********************
 * Middleware for Static Files
 *************************/
app.use(express.static("public")); // Serve static files from "public" folder
app.use("/css", express.static(__dirname + "/public/css"));
app.use("/js", express.static(__dirname + "/public/js"));
app.use("/images", express.static(__dirname + "/public/images"));

/* ***********************
 * Routes
 *************************/
app.use(staticRoutes); // Serve static routes

// Inventory routes
app.use("/inv", inventoryRoute); // Serve inventory-related routes

// Account routes
app.use("/account", accountRoutes); // Serve account-related routes

// Base route (Home)
app.get("/", utilities.handleErrors(baseController.buildHome));

// Catch-all route for handling 404 errors (must be the last route)
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 5500; // Default to port 5500 if not provided in .env
const host = process.env.HOST || "localhost"; // Default to localhost if not provided

/* ***********************
 * Express Error Handler
 * Place after all other middleware
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(
    `Error occurred at ${req.originalUrl}: ${err.message}`,
    err.stack
  );
  const message =
    err.status === 404
      ? err.message
      : "An unexpected error occurred. Please try again later.";
  res.status(err.status || 500).render("errors/error", {
    title: err.status || "Server Error",
    message,
    nav,
  });
});

/* ***********************
 * Log statement to confirm server operation
 *************************/
const server = app.listen(port, () => {
  console.log(`App listening on http://${host}:${port}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.log(`Port ${port} is already in use, trying another port...`);
    if (process.env.NODE_ENV === "development") {
      server.close(() => {
        app.listen(0, () => {
          console.log(`App is now listening on a different port.`);
        });
      });
    } else {
      console.error(`Error: Port ${port} is in use. Please free up the port.`);
    }
  } else {
    console.error("Error starting server:", err);
  }
});
