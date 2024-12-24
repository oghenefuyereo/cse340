const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");
const jwt = require("jsonwebtoken");
const inventoryModel = require("../models/inventoryModel");

// Middleware to Check Permissions
const checkAdminOrEmployee = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    req.flash("error", "Please log in to access this page.");
    return res.redirect("/login");
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (
      err ||
      !(decoded.account_type === "Employee" || decoded.account_type === "Admin")
    ) {
      req.flash("error", "You do not have permission to access this page.");
      return res.redirect("/login");
    }
    next();
  });
};

// Debugging Checks for Controller Methods
if (!invController.renderManagementView) {
  console.error("Error: renderManagementView is not defined in invController.");
}
if (!invController.renderAddClassificationView) {
  console.error(
    "Error: renderAddClassificationView is not defined in invController."
  );
}
if (!invController.addInventoryItem) {
  console.error("Error: addInventoryItem is not defined in invController.");
}

/* *****************************
 * Routes
 ***************************** */

// Register Route (GET)
router.get("/register", (req, res) => {
  res.render("account/register", { title: "Register", messages: req.flash() });
});

// Login Route (GET)
router.get("/login", (req, res) => {
  res.render("login", { title: "Login", messages: req.flash() }); // Ensure proper title for login page
});

// Login Route (POST)
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Replace with actual database validation logic
  if (username === "admin" && password === "admin123") {
    // Create a token (this is just a placeholder, you'd want to generate a real token)
    const token = jwt.sign(
      { username, account_type: "Admin" },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    // Set the token in the cookies
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Ensure security for production
    });

    req.flash("success", "Logged in successfully!");
    return res.redirect("/dashboard"); // Redirect to dashboard or home page
  }

  req.flash("error", "Invalid username or password.");
  res.redirect("/login"); // Redirect back to login on failure
});

// Management View Route (Admin/Employee)
router.get(
  "/management",
  checkAdminOrEmployee,
  utilities.handleErrors(invController.renderManagementView)
);

// Add Classification View Route (Admin/Employee)
router.get(
  "/add-classification",
  checkAdminOrEmployee,
  utilities.handleErrors(invController.renderAddClassificationView)
);

// Fetch Inventory Items by Classification ID
router.get(
  "/type/:id",
  utilities.handleErrors(async (req, res) => {
    const typeId = req.params.id;

    try {
      const inventoryItems = await inventoryModel.getInventoryByTypeId(typeId);

      if (!inventoryItems || inventoryItems.length === 0) {
        req.flash("info", "No inventory items found for this classification.");
        return res.redirect("/inv/management");
      }

      res.render("inventoryList", {
        items: inventoryItems,
        title: "Inventory List",
      });
    } catch (error) {
      console.error("Error fetching inventory items by type:", error);
      req.flash("error", "Failed to load inventory items. Please try again.");
      res.redirect("/inv/management");
    }
  })
);

// Fetch Inventory Item Details by ID
router.get(
  "/detail/:id",
  utilities.handleErrors(async (req, res) => {
    const itemId = req.params.id;

    try {
      const inventoryItem = await inventoryModel.getInventoryById(itemId);

      if (!inventoryItem) {
        req.flash("info", "Inventory item not found.");
        return res.redirect("/inv/management");
      }

      res.render("inventoryDetail", {
        item: inventoryItem,
        title: "Inventory Detail",
      });
    } catch (error) {
      console.error("Error fetching inventory item details:", error);
      req.flash("error", "Failed to load item details. Please try again.");
      res.redirect("/inv/management");
    }
  })
);

// Add Inventory Item Route (Admin/Employee)
router.post(
  "/add-inventory",
  checkAdminOrEmployee,
  utilities.handleErrors(async (req, res) => {
    const {
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      classification_id,
    } = req.body;

    if (!inv_make || !inv_model || !inv_description || !classification_id) {
      req.flash("error", "Please fill in all required fields.");
      return res.redirect("/inv/add-inventory");
    }

    try {
      await inventoryModel.addInventoryItem({
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        classification_id,
      });
      req.flash("success", "Inventory item added successfully!");
      res.redirect("/inv/management");
    } catch (error) {
      console.error("Error adding inventory item:", error);
      req.flash("error", "Unable to add inventory item. Please try again.");
      res.redirect("/inv/add-inventory");
    }
  })
);

module.exports = router;
