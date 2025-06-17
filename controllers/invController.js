const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const { validationResult } = require("express-validator");

const invCont = {};

/* ***************************
 *  Inventory Management View
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList();
    const message = req.flash("message") || null;
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect,
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
    if (!data || data.length === 0) {
      return res.status(404).render("inventory/classification", {
        title: "No vehicles found",
        nav: await utilities.getNav(),
        grid: "",
      });
    }
    const grid = await utilities.buildClassificationGrid(data);
    const nav = await utilities.getNav();
    const className = data[0]?.classification_name || "Unknown";

    res.render("inventory/classification", {
      title: `${className} vehicles`,
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
 *  Build Add Classification View
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
 *  Handle Add Classification POST
 * ************************** */
invCont.handleAddClassification = async function (req, res, next) {
  try {
    const errors = validationResult(req);
    const nav = await utilities.getNav();
    const { classification_name } = req.body;

    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((err) => err.msg);
      req.flash("errors", errorMessages);
      return res.status(400).render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        errors: errorMessages,
        flash: null,
      });
    }

    const insertResult = await invModel.addClassification(classification_name);

    if (insertResult) {
      req.flash("notice", `Successfully added classification: ${classification_name}`);
      return res.status(201).render("inventory/management", {
        title: "Inventory Management",
        nav,
        flash: req.flash("notice"),
      });
    } else {
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
 *  Build Add Inventory View
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
 *  Handle Add Inventory POST
 * ************************** */
invCont.handleAddInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList();
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg);
      req.flash("errors", errorMessages);
      return res.status(400).render("inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        classificationList,
        errors: errorMessages,
        flash: null,
        ...req.body,
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
      return res.redirect("/inv/");
    } else {
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

/* ***************************
 *  Return inventory items as JSON by classification ID
 * ************************** */
invCont.getInventoryJSON = async function (req, res, next) {
  try {
    const classification_id = req.params.classification_id;
    const data = await invModel.getInventoryByClassificationId(classification_id);
    if (!data || data.length === 0) {
      return res.status(404).json({ message: "No inventory found for this classification" });
    }
    return res.json(data);
  } catch (error) {
    console.error("Error in getInventoryJSON:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id);
    const itemData = await invModel.getInventoryById(inv_id);

    if (!itemData) {
      req.flash("errors", ["Inventory item not found."]);
      return res.redirect("/inv/");
    }

    const nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList(itemData.classification_id);
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;

    res.render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id,
    });
  } catch (error) {
    console.error("Error in editInventoryView:", error);
    next(error);
  }
};

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const {
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
    } = req.body;

    const updateResult = await invModel.updateInventory(
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id
    );

    if (updateResult) {
      const itemName = updateResult.inv_make + " " + updateResult.inv_model;
      req.flash("notice", `The ${itemName} was successfully updated.`);
      return res.redirect("/inv/");
    } else {
      const classificationSelect = await utilities.buildClassificationList(classification_id);
      const itemName = `${inv_make} ${inv_model}`;
      req.flash("notice", "Sorry, the update failed.");
      return res.status(501).render("inventory/edit-inventory", {
        title: "Edit " + itemName,
        nav,
        classificationSelect,
        errors: null,
        inv_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id,
      });
    }
  } catch (error) {
    console.error("Error in updateInventory:", error);
    next(error);
  }
};

module.exports = invCont;
