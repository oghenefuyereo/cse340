const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const { body } = require("express-validator");

// Route to build management view
router.get("/", utilities.handleErrors(invController.buildManagementView));

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build vehicle detail view
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildDetailView));

// Route to show add-classification form
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassificationView));

// Route to handle add-classification form submission with validation
router.post(
  "/add-classification",
  body("classification_name")
    .trim()
    .matches(/^[a-zA-Z0-9]+$/)
    .withMessage("Classification name must not contain spaces or special characters."),
  utilities.handleErrors(invController.handleAddClassification)
);

module.exports = router;
