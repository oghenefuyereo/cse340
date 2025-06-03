const invModel = require("../models/inventory-model");
const Util = {};

const utilities = require(".");
const { body, validationResult } = require("express-validator");
const validate = {};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function () {
  let data = await invModel.getClassifications();
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
    list += "<li>";
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  list += "</ul>";
  return list;
};

/* **************************************
 * Build the classification view HTML
 ************************************** */
Util.buildClassificationGrid = async function (data) {
  let grid;
  if (data.length > 0) {
    grid = '<div class="inventory-grid">';
    data.forEach((vehicle) => {
      grid += '<div class="inventory-item">';
      grid +=
        '<a href="/inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details"><img src="' +
        vehicle.inv_thumbnail +
        '" alt="Image of ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' on CSE Motors" /></a>';
      grid += '<div class="namePrice">';
      grid += "<hr />";
      grid += "<h2>";
      grid +=
        '<a href="/inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</a>";
      grid += "</h2>";
      grid +=
        "<span>$" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</span>";
      grid += "</div>";
      grid += "</div>";
    });
    grid += "</div>"; // Close inventory-grid
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

/* **************************************
 * Build the single vehicle detail HTML
 ************************************** */
Util.buildDetailHTML = function (vehicle) {
  let html = `
    <section class="vehicle-detail">
      <h1>${vehicle.inv_make} ${vehicle.inv_model}</h1>
      <div class="vehicle-img">
        <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${
    vehicle.inv_model
  } on CSE Motors">
      </div>
      <div class="vehicle-info">
        <h2>Price: $${new Intl.NumberFormat("en-US").format(
          vehicle.inv_price
        )}</h2>
        <p><strong>Description:</strong> ${vehicle.inv_description}</p>
        <p><strong>Color:</strong> ${vehicle.inv_color}</p>
        <p><strong>Miles:</strong> ${new Intl.NumberFormat("en-US").format(
          vehicle.inv_miles
        )}</p>
      </div>
    </section>
  `;
  return html;
};

/* **************************************
 * Build classification list for forms (select options)
 ************************************** */
Util.buildClassificationList = async function () {
  try {
    const data = await invModel.getClassifications();
    let list = '<select name="classification_id" id="classificationList" required>';
    list += '<option value="" disabled selected>Choose a Classification</option>';
    data.rows.forEach((row) => {
      list += `<option value="${row.classification_id}">${row.classification_name}</option>`;
    });
    list += '</select>';
    return list;
  } catch (error) {
    console.error("Error building classification list: ", error);
    return null;
  }
};

/* ****************************************
 * Middleware For Handling Errors
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = Util;
