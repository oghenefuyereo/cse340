const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");
const jwt = require("jsonwebtoken");
const inventoryModel = require("../models/inventoryModel");

/* *****************************
 * Middleware to Check Permissions
 ***************************** */
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

/* *****************************
 * Debugging Checks for Controller Methods
 ***************************** */
const requiredMethods = [
  { method: "renderManagementView", controller: invController },
  { method: "renderAddClassificationView", controller: invController },
  { method: "addInventoryItem", controller: invController },
];

requiredMethods.forEach(({ method, controller }) => {
  if (!controller[method]) {
    console.error(`Error: ${method} is not defined in invController.`);
  }
});

/* *****************************
 * Routes
 ***************************** */

// Management View Route
router.get(
  "/management",
  checkAdminOrEmployee,
  utilities.handleErrors(invController.renderManagementView)
);

// Add Classification View Route
router.get(
  "/add-classification",
  checkAdminOrEmployee,
  utilities.handleErrors(invController.renderAddClassificationView)
);

// Fetch Inventory Items by Classification ID
router.get(
  "/type/:id",
  utilities.handleErrors(async (req, res) => {
    try {
      const classificationId = req.params.id;
      const inventoryItems =
        await inventoryModel.getInventoryByClassificationId(classificationId);

      if (!inventoryItems || inventoryItems.length === 0) {
        req.flash("info", "No inventory items found for this classification.");
        return res.render("inventory/classification", {
          title: "Inventory Items",
          items: [],
          messages: req.flash("info"), // Include flash messages
        });
      }

      // Render the classification view with inventory items
      res.render("inventory/classification", {
        title: "Inventory Items",
        items: inventoryItems,
        messages: req.flash("info"), // Include flash messages
      });
    } catch (error) {
      console.error("Error fetching inventory items by classification:", error);
      req.flash("error", "Failed to load inventory items. Please try again.");
      res.redirect("/inv/management");
    }
  })
);

// Fetch Inventory Item Details by ID
router.get(
  "/detail/:id",
  utilities.handleErrors(async (req, res) => {
    try {
      const itemId = req.params.id;
      const inventoryItem = await inventoryModel.getInventoryById(itemId);

      if (!inventoryItem) {
        req.flash("info", "Inventory item not found.");
        return res.redirect("/inv/management");
      }

      res.render("inventory/inventoryDetail", {
        title: `Details for ${inventoryItem.inv_make} ${inventoryItem.inv_model}`,
        item: inventoryItem,
        messages: req.flash("info"), // Include flash messages
      });
    } catch (error) {
      console.error("Error fetching inventory item details:", error);
      req.flash("error", "Failed to load item details. Please try again.");
      res.redirect("/inv/management");
    }
  })
);

// Add Inventory Item Route
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

    // Validate required fields
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
