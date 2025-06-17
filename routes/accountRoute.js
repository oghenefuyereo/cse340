const express = require("express");
const router = express.Router();
const utilities = require("../utilities");
const regValidate = require("../utilities/account-validation");
const accountController = require("../controllers/accountController");

// Login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Account Management view (protected route)
router.get(
  "/",
  utilities.checkLogin, // Protect the account dashboard
  utilities.handleErrors(accountController.buildAccountManagement)
);

// Registration processing
router.post(
  "/register",
  regValidate.registrationRules(), // Validation rules
  regValidate.checkRegData, // Validation result handling
  utilities.handleErrors(accountController.registerAccount)
);

// Login processing
router.post(
  "/login",
  regValidate.loginRules(), // Validation rules
  regValidate.checkLoginData, // Validation result handling
  utilities.handleErrors(accountController.accountLogin)
);

// *** Added update account info routes ***

// Show update account info form (protected)
router.get(
  "/update/:id",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdateAccountView)
);

// Process update account info form (protected)
router.post(
  "/update/:id",
  utilities.checkLogin,
  regValidate.updateRules(),      // Validation rules for update - you need to implement this
  regValidate.checkUpdateData,    // Validation result handler for update - you need to implement this
  utilities.handleErrors(accountController.updateAccount)
);

// Logout route
router.get("/logout", (req, res) => {
  res.clearCookie("jwt");
  if (req.session) {
    req.session.destroy(() => {
      res.redirect("/");
    });
  } else {
    res.redirect("/");
  }
});

module.exports = router;
