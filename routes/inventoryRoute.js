const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const { body } = require("express-validator");

// Management page
router.get("/", utilities.handleErrors(invController.buildManagementView));

// Inventory by classification
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Vehicle detail
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildDetailView));

// Add classification form
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassificationView));

// Add classification submission
router.post(
  "/add-classification",
  body("classification_name")
    .trim()
    .matches(/^[a-zA-Z0-9]+$/)
    .withMessage("Classification name must not contain spaces or special characters."),
  utilities.handleErrors(invController.handleAddClassification)
);

// Add inventory form (NEW)
router.get(
  "/add-inventory",
  utilities.handleErrors(invController.buildAddInventoryView)
);

// Add inventory submission (NEW)
router.post(
  "/add-inventory",
  body("classification_id").notEmpty().withMessage("Classification is required"),
  body("inv_make").trim().notEmpty().withMessage("Make is required"),
  body("inv_model").trim().notEmpty().withMessage("Model is required"),
  body("inv_year")
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage("Enter a valid year"),
  body("inv_price").isFloat({ gt: 0 }).withMessage("Price must be greater than zero"),
  body("inv_miles").isInt({ min: 0 }).withMessage("Miles must be zero or more"),
  body("inv_color").trim().notEmpty().withMessage("Color is required"),
  utilities.handleErrors(invController.handleAddInventory)
);

module.exports = router;
