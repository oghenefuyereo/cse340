const invModel = require("../models/inventory-model");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const Util = {};

const { body, validationResult } = require("express-validator");

/* ****************************************
 * Constructs the nav HTML unordered list
 **************************************** */
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

/* ****************************************
 * Middleware to check token validity
 **************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("notice", "Please log in");
          res.clearCookie("jwt");
          return res.redirect("/account/login");
        }
        res.locals.accountData = accountData;
        res.locals.loggedin = 1;
        next();
      }
    );
  } else {
    next();
  }
};

/* ****************************************
 * Middleware to check for logged-in user
 **************************************** */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next();
  } else {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
};

/* ****************************************
 * Middleware to allow only Employee or Admin account types
 **************************************** */
Util.checkAdminOrEmployee = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    // No token found
    return res.status(401).render("account/login", {
      title: "Login",
      messages: ["You must be logged in to access this page."],
      account_email: "",
    });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      // Token invalid or expired
      return res.status(401).render("account/login", {
        title: "Login",
        messages: ["Session expired or invalid. Please log in again."],
        account_email: "",
      });
    }

    // Check account type
    if (decoded.account_type === "Employee" || decoded.account_type === "Admin") {
      res.locals.accountData = decoded; // Optionally set this here too
      res.locals.loggedin = 1;
      return next();
    } else {
      // Unauthorized access
      return res.status(403).render("account/login", {
        title: "Login",
        messages: ["You do not have permission to access this page."],
        account_email: "",
      });
    }
  });
};

module.exports = Util;
