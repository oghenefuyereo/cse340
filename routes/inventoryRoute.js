const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");
const { body } = require("express-validator");

// ✅ Import your middleware
const {
  requireLogin,
  requireEmployeeOrManager,
} = require("../middleware/authMiddleware");

/* ***************************
 * Inventory Management View
 * 🔒 Only Employee or Manager
 * *************************** */
router.get(
  "/",
  requireLogin,
  requireEmployeeOrManager,
  utilities.handleErrors(invController.buildManagementView)
);

/* ***************************
 * Inventory by classification (HTML view)
 * (Open to all visitors)
 * *************************** */
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
);

/* ***************************
 * JSON inventory data by classification ID
 * (Open to all visitors)
 * *************************** */
router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
);

/* ***************************
 * Vehicle detail view
 * (Open to all visitors)
 * *************************** */
router.get(
  "/detail/:inv_id",
  utilities.handleErrors(invController.buildDetailView)
);

/* ***************************
 * Add Classification View
 * Only Employee or Admin allowed
 * *************************** */
router.get(
  "/add-classification",
  utilities.checkAdminOrEmployee,
  utilities.handleErrors(invController.buildAddClassificationView)
);

/* ***************************
 * Add Classification Submission
 * Only Employee or Admin allowed
 * *************************** */
router.post(
  "/add-classification",
  utilities.checkAdminOrEmployee,
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
 * Only Employee or Admin allowed
 * *************************** */
router.get(
  "/add-inventory",
  utilities.checkAdminOrEmployee,
  utilities.handleErrors(invController.buildAddInventoryView)
);

/* ***************************
 * Add Inventory Submission
 * Only Employee or Admin allowed
 * *************************** */
router.post(
  "/add-inventory",
  utilities.checkAdminOrEmployee,
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
 * Only Employee or Admin allowed
 * *************************** */
router.get(
  "/edit/:inv_id",
  utilities.checkAdminOrEmployee,
  utilities.handleErrors(invController.editInventoryView)
);

/* ***************************
 * Update Inventory Submission
 * Only Employee or Admin allowed
 * *************************** */
router.post(
  "/update/",
  utilities.checkAdminOrEmployee,
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
 * Only Employee or Admin allowed
 * *************************** */
router.get(
  "/delete/:inv_id",
  utilities.checkAdminOrEmployee,
  utilities.handleErrors(invController.buildDeleteView)
);

/* ***************************
 * Delete Inventory Submission
 * Only Employee or Admin allowed
 * *************************** */
router.post(
  "/delete",
  utilities.checkAdminOrEmployee,
  body("inv_id").isInt().withMessage("Invalid inventory ID").toInt(),
  utilities.handleErrors(invController.deleteInventoryItem)
);

module.exports = router;
