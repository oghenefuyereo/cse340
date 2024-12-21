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

const inventoryModel = require('../models/inventoryModel');

exports.renderAddClassificationView = (req, res) => {
    const message = req.flash('info'); // Flash message
    res.render('inventory/add-classification', { message });
};

exports.addClassification = async (req, res) => {
    try {
        const { classification_name } = req.body;
        // Server-side validation
        if (!/^[a-zA-Z0-9_-]+$/.test(classification_name)) {
            req.flash('info', 'Invalid classification name.');
            return res.redirect('/inv/add-classification');
        }

        await inventoryModel.addClassification(classification_name);
        req.flash('info', 'Classification added successfully!');
        res.redirect('/inv/');
    } catch (error) {
        req.flash('info', 'Error adding classification.');
        res.redirect('/inv/add-classification');
    }
};

module.exports = invCont;
