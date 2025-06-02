const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Inventory Management View (Task One)
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const message = req.flash("notice") || null; // avoid undefined flash

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

module.exports = invCont;
