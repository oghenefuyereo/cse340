const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const { validationResult } = require("express-validator");

const invCont = {};

/* Inventory Management View */
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

/* View Inventory by Classification */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);

    if (!data || data.length === 0) {
      const nav = await utilities.getNav();
      return res.status(404).render("inventory/classification", {
        title: "No vehicles found",
        nav,
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

/* Vehicle Detail View */
invCont.buildDetailView = async function (req, res, next) {
  try {
    const inv_id = req.params.inv_id;
    const data = await invModel.getInventoryById(inv_id);

    if (!data) return next(); // triggers 404

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

/* Add Classification View */
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

/* Handle Add Classification POST */
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
      return res.redirect("/inv/");
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

/* Add Inventory View */
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
      ...req.body,
    });
  } catch (error) {
    console.error("Error in buildAddInventoryView:", error);
    next(error);
  }
};

/* Handle Add Inventory POST */
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

    const insertResult = await invModel.addInventoryItem(req.body);

    if (insertResult) {
      req.flash("message", `Successfully added new inventory item: ${req.body.inv_make} ${req.body.inv_model}`);
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

/* Inventory JSON API */
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

/* Edit Inventory View */
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
      ...itemData,
    });
  } catch (error) {
    console.error("Error in editInventoryView:", error);
    next(error);
  }
};

/* Update Inventory */
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

    // Optionally, you can add validationResult check here as well

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
      req.flash("notice", `The ${inv_make} ${inv_model} was successfully updated.`);
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

/* Delete Inventory View */
invCont.buildDeleteView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id);
    const itemData = await invModel.getInventoryById(inv_id);

    if (!itemData) {
      req.flash("errors", ["Inventory item not found."]);
      return res.redirect("/inv/");
    }

    const nav = await utilities.getNav();

    res.render("inventory/delete-confirm", {
      title: "Delete " + itemData.inv_make + " " + itemData.inv_model,
      nav,
      errors: null,
      flash: req.flash("message"),
      ...itemData,
    });
  } catch (error) {
    console.error("Error in buildDeleteView:", error);
    next(error);
  }
};

/* Handle Delete POST */
invCont.deleteInventoryItem = async function (req, res, next) {
  try {
    const { inv_id } = req.body;
    const deleteResult = await invModel.deleteInventoryItem(parseInt(inv_id));

    if (deleteResult) {
      req.flash("notice", "The inventory item was successfully deleted.");
    } else {
      req.flash("notice", "Failed to delete the inventory item.");
    }

    return res.redirect("/inv/");
  } catch (error) {
    console.error("Error in deleteInventoryItem:", error);
    next(error);
  }
};

module.exports = invCont;
