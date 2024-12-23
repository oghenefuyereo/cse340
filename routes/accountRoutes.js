const express = require("express");
const router = new express.Router();
const utilities = require("../utilities");
const accountController = require("../controllers/accountController");
const { check, validationResult } = require("express-validator");
const regValidate = require("../utilities/account.validation");

// Route to handle login (POST request)
router.post(
  "/login",
  regValidate.loginRules(), // Ensure login data is validated
  regValidate.checkLoginData, // Check for any validation errors
  utilities.handleErrors(accountController.accountLogin) // Handle errors and invoke login function
);

// Route to process registration (POST request)
router.post(
  "/register",
  regValidate.registrationRules(), // Ensure registration data is validated
  regValidate.checkRegData, // Check registration data and return errors or continue
  utilities.handleErrors(accountController.registerAccount) // Handle errors and invoke registration function
);

// Route to handle logout (GET request)
router.get("/logout", (req, res) => {
  res.clearCookie("jwt"); // Clear the JWT cookie on logout
  res.redirect("/"); // Redirect to the home page after logging out
});

// Route to show the login page (GET request)
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Route to show the registration page (GET request)
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
);

// Route to update account info (GET request)
router.get(
  "/update",
  utilities.checkLogin, // Ensure user is logged in before updating
  utilities.handleErrors(accountController.buildAccountUpdateView)
);

// Route to process account updates (POST request)
router.post(
  "/update",
  [
    // Validation checks for account info
    check("account_firstname")
      .notEmpty()
      .withMessage("First name is required."),
    check("account_lastname").notEmpty().withMessage("Last name is required."),
    check("account_email")
      .isEmail()
      .withMessage("Valid email is required.")
      .custom(async (email, { req }) => {
        // Custom validation to check if email already exists
        const accountModel = require("../models/accountModel");
        const account = await accountModel.getAccountByEmail(email);
        if (account && account.account_id !== req.body.account_id) {
          throw new Error("Email address already exists.");
        }
      }),
  ],
  utilities.handleValidationErrors, // Handle validation errors if any
  utilities.handleErrors(accountController.updateAccount) // Call update function and handle errors
);

// Route to process password change (POST request)
router.post(
  "/change-password",
  [
    // Validation checks for password strength
    check("new_password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long.")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter.")
      .matches(/[a-z]/)
      .withMessage("Password must contain at least one lowercase letter.")
      .matches(/[0-9]/)
      .withMessage("Password must contain at least one number."),
  ],
  utilities.handleValidationErrors, // Handle validation errors
  utilities.handleErrors(accountController.changePassword) // Call password change function
);

// Route to process form submission (POST request) - example route
router.post(
  "/submit",
  [
    check("email").isEmail().withMessage("Please enter a valid email"),
    check("password").notEmpty().withMessage("Password cannot be empty"),
  ],
  utilities.handleValidationErrors, // Handle validation errors
  (req, res) => {
    res.send("Validation passed!"); // Placeholder response on success
  }
);

module.exports = router;
