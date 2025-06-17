const { body, validationResult } = require("express-validator");
const utilities = require("../utilities");

const validate = {};

/* ***************************
 * Validation rules for inventory data (used for add and update)
 * *************************** */
validate.inventoryRules = () => {
  return [
    body("classification_id")
      .notEmpty()
      .withMessage("Classification is required."),
    body("inv_make")
      .trim()
      .notEmpty()
      .withMessage("Make is required."),
    body("inv_model")
      .trim()
      .notEmpty()
      .withMessage("Model is required."),
    body("inv_year")
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage("Enter a valid year."),
    body("inv_price")
      .isFloat({ gt: 0 })
      .withMessage("Price must be greater than zero."),
    body("inv_miles")
      .isInt({ min: 0 })
      .withMessage("Miles must be zero or more."),
    body("inv_color")
      .trim()
      .notEmpty()
      .withMessage("Color is required."),
  ];
};

/* ***************************
 * Check validation errors for adding inventory
 * Render add-inventory view if errors found
 * *************************** */
validate.checkInventoryData = async (req, res, next) => {
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_price,
    inv_miles,
    inv_color,
  } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    return res.render("inventory/add-inventory", {
      errors: errors.array(),
      title: "Add Inventory",
      nav,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_price,
      inv_miles,
      inv_color,
    });
  }
  next();
};

/* ***************************
 * Check validation errors for updating inventory
 * Render edit view if errors found, include inv_id
 * *************************** */
validate.checkUpdateData = async (req, res, next) => {
  const {
    inv_id,
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_price,
    inv_miles,
    inv_color,
  } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    return res.render("inventory/edit", {
      errors: errors.array(),
      title: "Edit Inventory Item",
      nav,
      inv_id,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_price,
      inv_miles,
      inv_color,
    });
  }
  next();
};

module.exports = validate;
