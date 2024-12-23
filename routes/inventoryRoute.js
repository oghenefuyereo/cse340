const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");
const jwt = require("jsonwebtoken");
const inventoryModel = require("../models/inventoryModel");

// Middleware to check admin or employee permissions
const checkAdminOrEmployee = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.redirect("/login");
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (
      err ||
      !(decoded.account_type === "Employee" || decoded.account_type === "Admin")
    ) {
      req.flash(
        "error",
        "You do not have the required permissions to access this page."
      );
      return res.redirect("/login");
    }
    next();
  });
};

// Debug check for controller methods
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

// Management view route
router.get(
  "/management",
  checkAdminOrEmployee,
  utilities.handleErrors(invController.renderManagementView)
);

// Add classification view route
router.get(
  "/add-classification",
  checkAdminOrEmployee,
  utilities.handleErrors(invController.renderAddClassificationView)
);

// Route to fetch inventory items by classification type ID
router.get(
  "/type/:id",
  utilities.handleErrors(async (req, res) => {
    const typeId = req.params.id;

    try {
      // Fetch inventory items by type ID
      const inventoryItems = await inventoryModel.getInventoryByTypeId(typeId);

      if (!inventoryItems || inventoryItems.length === 0) {
        return res.status(404).send("No inventory items found for this type.");
      }

      // Render the inventory page with the found items
      res.render("inventoryDetail", { items: inventoryItems });
    } catch (error) {
      console.error("Error fetching inventory items:", error);
      req.flash("error", "Failed to fetch inventory items. Please try again.");
      res.redirect("/inv/management");
    }
  })
);

// Add inventory item route
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
      req.flash("error", "All required fields must be filled.");
      return res.redirect("/inv/add-inventory");
    }

    try {
      // Add the new inventory item
      await inventoryModel.addInventoryItem({
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        classification_id,
      });
      req.flash("success", "New inventory item added successfully!");
      res.redirect("/inv/management");
    } catch (error) {
      console.error("Error adding inventory item:", error);
      req.flash("error", "Failed to add inventory item. Try again.");
      res.redirect("/inv/add-inventory");
    }
  })
);

module.exports = router;
