// Required Modules
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
const inventoryRoute = require("./routes/inventoryRoute"); // Ensure this is the correct path
const accountRoutes = require("./routes/accountRoutes");
const baseController = require("./controllers/baseController");

// Load environment variables
dotenv.config();

// Initialize the app
const app = express();

/*********************************************
 * Middleware Setup
 *********************************************/

// Cookie Parser should be before any routes that depend on cookies
app.use(cookieParser()); // Ensure cookie-parser is initialized before other middleware

// Session Middleware
app.use(
  session({
    store: new (require("connect-pg-simple")(session))({
      createTableIfMissing: true,
      pool,
    }),
    secret: process.env.SESSION_SECRET || "default-secret", // Use env variable for better security
    resave: true,
    saveUninitialized: true,
    name: "sessionId",
    cookie: {
      secure: process.env.NODE_ENV === "production", // Ensure secure cookies in production
      httpOnly: true, // Prevent client-side access to the cookie
      maxAge: 1000 * 60 * 60 * 24, // 1 day expiration
    },
  })
);

// Express Flash Messages Middleware
app.use(connectFlash());
app.use((req, res, next) => {
  res.locals.messages = req.flash(); // Use req.flash directly for messages
  next();
});

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded form data

// JWT Token Middleware (Only for relevant routes)
app.use("/account", utilities.checkJWTToken); // Apply middleware specifically for account routes

/*********************************************
 * EJS Template Engine Setup
 *********************************************/

// View Engine Setup
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // Layout file for EJS templates

/*********************************************
 * Static Files Middleware
 *********************************************/

// Serve Static Files from "public" folder
app.use(express.static("public"));
app.use("/css", express.static(__dirname + "/public/css"));
app.use("/js", express.static(__dirname + "/public/js"));
app.use("/images", express.static(__dirname + "/public/images"));

/*********************************************
 * Routes Setup
 *********************************************/

// Static Routes (for general routes)
app.use(staticRoutes);

// Inventory Routes
app.use("/inv", inventoryRoute); // Ensure the route is correctly set

// Account Routes
app.use("/account", accountRoutes);

// Base Route (Home)
app.get("/", utilities.handleErrors(baseController.buildHome));

// Login Route (GET) - Ensure the correct view path
app.get("/login", async (req, res) => {
  try {
    const nav = await utilities.getNav(); // Get nav data
    res.render("account/login", { title: "Login", messages: req.flash(), nav });
  } catch (error) {
    console.error("Error fetching nav:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Login Route (POST)
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  res.redirect("/dashboard"); // Redirect after successful login
});

// Register Route (GET)
app.get("/register", async (req, res) => {
  try {
    const nav = await utilities.getNav(); // Get nav data
    res.render("account/register", {
      title: "Register",
      messages: req.flash(),
      nav,
    });
  } catch (error) {
    console.error("Error fetching nav:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Register Route (POST)
app.post("/register", (req, res) => {
  const { username, password, email } = req.body;
  res.redirect("/login"); // Redirect to login page after successful registration
});

// Catch-all Route for Handling 404 Errors (must be the last route)
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

/*********************************************
 * Express Error Handler
 *********************************************/

// Express Error Handler (After all other middleware)
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav(); // Get nav data
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
    nav, // Pass nav data to error page
  });
});

/*********************************************
 * Local Server Information
 *********************************************/

// Server Port and Host Configuration
const port = process.env.PORT || 5500; // Default to port 5500 if not provided in .env
const host = process.env.HOST || "localhost"; // Default to localhost if not provided

/*********************************************
 * Start the Server
 *********************************************/

// Start the Express Server
const server = app.listen(port, () => {
  console.log(`App listening on http://${host}:${port}`);
});

// Error Handling for Server Start
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
