const invModel = require("../models/inventoryModel");
const utilities = require("../utilities/");

const invCont = {};

invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(
      classification_id
    );
    const grid = await utilities.buildClassificationGrid(data);
    let nav = await utilities.getNav();
    const className = data[0].classification_name;
    res.render("./inventory/classification", {
      title: `${className} vehicles`,
      nav,
      grid,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
invCont.getVehicleDetails = async function (req, res, next) {
  const vehicleId = req.params.invid;
  const vehicle = await invModel.getVehicleById(vehicleId); // Fetch the vehicle data
  let nav = await utilities.getNav();
  // Render the vehicle details page, passing the vehicle data
  res.render("inventory/detail", {
    title: `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model} Details`,
    vehicle: vehicle,
    nav,
    utilities,
  });
};

invCont.buildManagementView = async function (req, res, next) {
  try {
    // Fetch the navigation bar HTML
    let nav = await utilities.getNav();

    // Fetch the classification select list
    const classificationSelect = await utilities.buildClassificationList();

    // Render the Inventory Management view
    res.render("./inventory/management", {
      title: "Manage Inventory", // Page title
      nav, // Navigation bar
      classificationSelect, // Dropdown for classification
      errors: null, // Placeholder for errors if needed
    });
  } catch (error) {
    console.error("Error building management view:", error);
    next(error); // Pass the error to Express error-handling middleware
  }
};

const inventoryModel = require("../models/inventoryModel");

exports.renderAddClassificationView = (req, res) => {
  const message = req.flash("info"); // Flash message
  res.render("inventory/add-classification", { message });
};

exports.addClassification = async (req, res) => {
  try {
    const { classification_name } = req.body;
    // Server-side validation
    if (!/^[a-zA-Z0-9_-]+$/.test(classification_name)) {
      req.flash("info", "Invalid classification name.");
      return res.redirect("/inv/add-classification");
    }

    await inventoryModel.addClassification(classification_name);
    req.flash("info", "Classification added successfully!");
    res.redirect("/inv/");
  } catch (error) {
    req.flash("info", "Error adding classification.");
    res.redirect("/inv/add-classification");
  }
};

invCont.buildManagementView = async function (req, res, next) {
  let nav = await utilities.getNav();
  const classificationSelect = await utilities.buildClassification();
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
    error: null,
    classificationSelect,
  });
};
/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id);
  const invData = await invModel.getInventoryByClassificationId(
    classification_id
  );
  if (invData[0].inv_id) {
    return res.json(invData);
  } else {
    next(new Error("No data returned"));
  }
};

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id);
  let nav = await utilities.getNav();
  const itemData = await invModel.getInventoryById(inv_id);
  const classificationSelect = await utilities.buildClassificationList(
    itemData.classification_id
  );
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
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
};

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
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
    res.redirect("/inv/");
  } else {
    const classificationSelect = await utilities.buildClassificationList(
      classification_id
    );
    const itemName = `${inv_make} ${inv_model}`;
    req.flash("notice", "Sorry, the insert failed.");
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
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
};

module.exports = invCont;
