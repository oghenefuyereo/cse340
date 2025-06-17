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

module.exports = router;
