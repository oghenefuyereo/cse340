const invModel = require("../models/inventoryModel");
const utilities = require("../utilities/");

const invCont = {};

// Build inventory view by classification ID
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);
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

// Get vehicle details by ID
invCont.getVehicleDetails = async function (req, res, next) {
  try {
    const vehicleId = req.params.invid;
    const vehicle = await invModel.getVehicleById(vehicleId); // Fetch the vehicle data
    let nav = await utilities.getNav();
    res.render("inventory/detail", {
      title: `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model} Details`,
      vehicle: vehicle,
      nav,
      utilities,
    });
  } catch (error) {
    console.error("Error fetching vehicle details:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Build the management view for inventory
invCont.buildManagementView = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList();
    res.render("./inventory/management", {
      title: "Manage Inventory",
      nav,
      classificationSelect,
      errors: null, // Placeholder for errors if needed
    });
  } catch (error) {
    console.error("Error building management view:", error);
    next(error);
  }
};

// Ensure backward compatibility for renderManagementView
invCont.renderManagementView = invCont.buildManagementView; // This allows 'renderManagementView' to work like 'buildManagementView'

// Add classification view
invCont.renderAddClassificationView = (req, res) => {
  const message = req.flash("info");
  res.render("inventory/add-classification", { message });
};

// Add a new classification
invCont.addClassification = async (req, res) => {
  try {
    const { classification_name } = req.body;
    if (!/^[a-zA-Z0-9_-]+$/.test(classification_name)) {
      req.flash("info", "Invalid classification name.");
      return res.redirect("/inv/add-classification");
    }

    await invModel.addClassification(classification_name);
    req.flash("info", "Classification added successfully!");
    res.redirect("/inv/");
  } catch (error) {
    req.flash("info", "Error adding classification.");
    res.redirect("/inv/add-classification");
  }
};

// Get inventory as JSON by classification ID
invCont.getInventoryJSON = async (req, res, next) => {
  try {
    const classification_id = parseInt(req.params.classification_id);
    const invData = await invModel.getInventoryByClassificationId(classification_id);
    if (invData[0].inv_id) {
      return res.json(invData);
    } else {
      next(new Error("No data returned"));
    }
  } catch (error) {
    next(error);
  }
};

// Build the edit inventory view
invCont.editInventoryView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id);
    let nav = await utilities.getNav();
    const itemData = await invModel.getInventoryById(inv_id);
    const classificationSelect = await utilities.buildClassificationList(itemData.classification_id);
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
    res.render("./inventory/edit-inventory", {
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
    console.error("Error building edit inventory view:", error);
    next(error);
  }
};

// Update the inventory item (Add or Edit logic can be added here later)
invCont.addInventoryItem = async function (req, res, next) {
  try {
    // Placeholder for adding inventory logic.
    res.send("Inventory item added!");
  } catch (error) {
    console.error("Error adding inventory item:", error);
    next(error);
  }
};

module.exports = invCont;
