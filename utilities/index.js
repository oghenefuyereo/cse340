const invModel = require("../models/inventoryModel");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
require("dotenv").config();

const Util = {};

/* ************************
 * Constructs the navigation HTML unordered list
 ************************** */
Util.getNav = async function () {
  try {
    const data = await invModel.getClassifications();
    let list = "<ul>";
    list += '<li><a href="/" title="Home page">Home</a></li>';
    data.rows.forEach((row) => {
      list += `<li>
                <a href="/inv/type/${row.classification_id}" title="See our inventory of ${row.classification_name} vehicles">
                  ${row.classification_name}
                </a>
               </li>`;
    });
    list += "</ul>";
    return list;
  } catch (error) {
    console.error("Error constructing navigation:", error.message);
    throw new Error(
      "Navigation could not be generated. Please try again later."
    );
  }
};

/* **************************************
 * Builds the classification view grid HTML
 ************************************** */
Util.buildClassificationGrid = function (data) {
  if (!data || data.length === 0) {
    return '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }

  return (
    `<ul id="inv-display">` +
    data
      .map(
        (vehicle) => `
          <li>
            <a href="/inv/detail/${vehicle.inv_id}" title="View ${
          vehicle.inv_make
        } ${vehicle.inv_model} details">
              <img src="${vehicle.inv_thumbnail}" alt="Image of ${
          vehicle.inv_make
        } ${vehicle.inv_model} on CSE Motors" />
            </a>
            <div class="namePrice">
              <hr />
              <h2>
                <a href="/inv/detail/${vehicle.inv_id}" title="View ${
          vehicle.inv_make
        } ${vehicle.inv_model} details">
                  ${vehicle.inv_make} ${vehicle.inv_model}
                </a>
              </h2>
              <span>${Util.formatCurrency(vehicle.inv_price)}</span>
            </div>
          </li>
        `
      )
      .join("") +
    "</ul>"
  );
};

/* **************************************
 * Utility function for formatting currency
 ************************************** */
Util.formatCurrency = function (amount) {
  return `$${Number(amount)
    .toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    })
    .slice(1)}`;
};

/* **************************************
 * Utility function for formatting mileage
 ************************************** */
Util.formatMileage = function (mileage) {
  return Number(mileage).toLocaleString(); // Formats mileage with commas
};

/* ****************************************
 * Middleware For Handling Errors
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.error("Error:", err.message);
    next(err); // Passes the error to the next middleware (error handler)
  });

/* ****************************************
 * Middleware to check token validity
 **************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      (err, accountData) => {
        if (err) {
          req.flash("error", "Please log in");
          res.clearCookie("jwt");
          return res.redirect("/account/login");
        }
        res.locals.accountData = accountData;
        res.locals.loggedin = true;
        next();
      }
    );
  } else {
    next();
  }
};

/* ****************************************
 * Middleware to check login status
 **************************************** */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    return next(); // User is logged in, proceed to the next middleware/route
  }
  req.flash("notice", "Please log in.");
  return res.redirect("/account/login"); // Redirect to login if not logged in
};

/* ****************************************
 * Middleware to handle validation errors
 **************************************** */
Util.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req); // Checks for validation errors in the request
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg); // Collects error messages
    req.flash("errors", errorMessages); // Pass errors to the next route with flash messages
    return res.redirect("back"); // Redirect back to the previous page
  }
  next(); // If no errors, proceed to the next middleware
};

module.exports = Util;
