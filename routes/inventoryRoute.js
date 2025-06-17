const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const { body } = require("express-validator");

/* ***************************
 * Inventory Management View
 * *************************** */
router.get("/", utilities.handleErrors(invController.buildManagementView));

/* ***************************
 * Inventory by classification (HTML view)
 * *************************** */
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
);

/* ***************************
 * JSON inventory data by classification ID
 * *************************** */
router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
);

/* ***************************
 * Vehicle detail view
 * *************************** */
router.get(
  "/detail/:inv_id",
  utilities.handleErrors(invController.buildDetailView)
);

/* ***************************
 * Add Classification View
 * *************************** */
router.get(
  "/add-classification",
  utilities.handleErrors(invController.buildAddClassificationView)
);

/* ***************************
 * Add Classification Submission
 * *************************** */
router.post(
  "/add-classification",
  body("classification_name")
    .trim()
    .matches(/^[a-zA-Z0-9\s-]+$/)
    .withMessage(
      "Classification name must contain only letters, numbers, spaces, or hyphens."
    )
    .escape(),
  utilities.handleErrors(invController.handleAddClassification)
);

/* ***************************
 * Add Inventory View
 * *************************** */
router.get(
  "/add-inventory",
  utilities.handleErrors(invController.buildAddInventoryView)
);

/* ***************************
 * Add Inventory Submission
 * *************************** */
router.post(
  "/add-inventory",
  body("classification_id")
    .notEmpty()
    .withMessage("Classification is required")
    .toInt(),
  body("inv_make").trim().notEmpty().withMessage("Make is required").escape(),
  body("inv_model").trim().notEmpty().withMessage("Model is required").escape(),
  body("inv_year")
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage("Enter a valid year")
    .toInt(),
  body("inv_price")
    .isFloat({ gt: 0 })
    .withMessage("Price must be greater than zero")
    .toFloat(),
  body("inv_miles")
    .isInt({ min: 0 })
    .withMessage("Miles must be zero or more")
    .toInt(),
  body("inv_color").trim().notEmpty().withMessage("Color is required").escape(),
  utilities.handleErrors(invController.handleAddInventory)
);

/* ***************************
 * Edit Inventory View
 * *************************** */
router.get(
  "/edit/:inv_id",
  utilities.handleErrors(invController.editInventoryView)
);

/* ***************************
 * Update Inventory Submission
 * *************************** */
router.post(
  "/update/",
  body("classification_id")
    .notEmpty()
    .withMessage("Classification is required")
    .toInt(),
  body("inv_make").trim().notEmpty().withMessage("Make is required").escape(),
  body("inv_model").trim().notEmpty().withMessage("Model is required").escape(),
  body("inv_year")
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage("Enter a valid year")
    .toInt(),
  body("inv_price")
    .isFloat({ gt: 0 })
    .withMessage("Price must be greater than zero")
    .toFloat(),
  body("inv_miles")
    .isInt({ min: 0 })
    .withMessage("Miles must be zero or more")
    .toInt(),
  body("inv_color").trim().notEmpty().withMessage("Color is required").escape(),
  utilities.handleErrors(invController.updateInventory)
);

/* ***************************
 * Delete Inventory View (Confirmation)
 * *************************** */
router.get(
  "/delete/:inv_id",
  utilities.handleErrors(invController.buildDeleteView) // fixed name here
);

/* ***************************
 * Delete Inventory Submission
 * *************************** */
router.post(
  "/delete",
  body("inv_id").isInt().withMessage("Invalid inventory ID").toInt(),
  utilities.handleErrors(invController.deleteInventoryItem)
);

module.exports = router;
