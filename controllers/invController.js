const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const { validationResult } = require("express-validator");

const invCont = {};

/* ***************************
 *  Inventory Management View (Task One)
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const message = req.flash("notice") || null; 

    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      flash: message,
    });
  } catch (error) {
    console.error("Error in buildManagementView:", error);
    next(error);
  }
};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);
    const grid = await utilities.buildClassificationGrid(data);
    const nav = await utilities.getNav();
    const className = data[0]?.classification_name || "Unknown";

    res.render("inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    });
  } catch (error) {
    console.error("Error in buildByClassificationId:", error);
    next(error);
  }
};

/* ***************************
 *  Build vehicle detail view
 * ************************** */
invCont.buildDetailView = async function (req, res, next) {
  try {
    const inv_id = req.params.inv_id;
    const data = await invModel.getInventoryById(inv_id);

    if (!data) {
      return next(); // triggers 404
    }

    const vehicleHtml = utilities.buildDetailHTML(data);
    const nav = await utilities.getNav();

    res.render("inventory/detail", {
      title: `${data.inv_year} ${data.inv_make} ${data.inv_model}`,
      nav,
      vehicleHtml,
    });
  } catch (error) {
    console.error("Error in buildDetailView:", error);
    next(error);
  }
};

/* ***************************
 *  Build Add Classification View (Task Two)
 * ************************** */
invCont.buildAddClassificationView = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const errors = req.flash("errors") || [];
    const message = req.flash("notice") || null;

    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors,
      flash: message,
    });
  } catch (error) {
    console.error("Error in buildAddClassificationView:", error);
    next(error);
  }
};

/* ***************************
 *  Handle Add Classification POST (Task Two)
 * ************************** */
invCont.handleAddClassification = async function (req, res, next) {
  try {
    const errors = validationResult(req);
    const nav = await utilities.getNav();
    const { classification_name } = req.body;

    if (!errors.isEmpty()) {
      // Validation errors - flash errors and re-render add-classification view
      const errorMessages = errors.array().map((err) => err.msg);
      req.flash("errors", errorMessages);
      return res.status(400).render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        errors: errorMessages,
        flash: null,
      });
    }

    // Insert classification into DB
    const insertResult = await invModel.addClassification(classification_name);

    if (insertResult) {
      // Success - rebuild nav, flash success, render management view
      const newNav = await utilities.getNav();
      req.flash("notice", `Successfully added classification: ${classification_name}`);

      return res.status(201).render("inventory/management", {
        title: "Inventory Management",
        nav: newNav,
        flash: req.flash("notice"),
      });
    } else {
      // Insert failed - render form with failure message
      const failureMsg = "Failed to add classification. Please try again.";
      return res.status(500).render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        errors: [failureMsg],
        flash: null,
      });
    }
  } catch (error) {
    console.error("Error in handleAddClassification:", error);
    next(error);
  }
};

/* ***************************
 *  Build Add Inventory View (Task Three)
 * ************************** */
invCont.buildAddInventoryView = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList();

    const errors = req.flash("errors") || [];
    const flash = req.flash("message") || null;

    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors,
      flash,
      // Sticky form inputs
      classification_id: req.body?.classification_id || '',
      inv_make: req.body?.inv_make || '',
      inv_model: req.body?.inv_model || '',
      inv_year: req.body?.inv_year || '',
      inv_description: req.body?.inv_description || '',
      inv_price: req.body?.inv_price || '',
      inv_miles: req.body?.inv_miles || '',
      inv_color: req.body?.inv_color || '',
      inv_image: req.body?.inv_image || '/images/no-image-available.png',
      inv_thumbnail: req.body?.inv_thumbnail || '/images/no-image-available.png',
    });
  } catch (error) {
    console.error("Error in buildAddInventoryView:", error);
    next(error);
  }
};

/* ***************************
 *  Handle Add Inventory POST (Task Three)
 * ************************** */
invCont.handleAddInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList();

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // Validation errors, flash errors and re-render add-inventory with sticky data
      const errorMessages = errors.array().map(err => err.msg);
      req.flash("errors", errorMessages);

      return res.status(400).render("inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        classificationList,
        errors: errorMessages,
        flash: null,
        ...req.body,  // pass form data for sticky inputs
      });
    }

    const {
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color,
      inv_image,
      inv_thumbnail,
    } = req.body;

    // Call the model method to insert inventory item
    const insertResult = await invModel.addInventoryItem({
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color,
      inv_image,
      inv_thumbnail,
    });

    if (insertResult) {
      req.flash("message", `Successfully added new inventory item: ${inv_make} ${inv_model}`);
      return res.redirect("/inv/"); // Redirect to inventory management page
    } else {
      // Insert failed
      const failureMsg = "Failed to add inventory item. Please try again.";
      return res.status(500).render("inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        classificationList,
        errors: [failureMsg],
        flash: null,
        ...req.body,
      });
    }
  } catch (error) {
    console.error("Error in handleAddInventory:", error);
    next(error);
  }
};

module.exports = invCont;
