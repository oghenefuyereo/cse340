// Needed Resources
const express = require("express");
const router = new express.Router();
const utilities = require("../utilities/");
const accountController = require("../controllers/accountController");
const { check, validationResult } = require("express-validator");
const regValidate = require("../utilities/account.validation");
console.log("regValidate contents:", regValidate);

// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
);

// Process the registration data
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
);
router.post("/login", utilities.handleErrors(accountController.buildLogin));
// Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin));

// Route to handle logout
router.get("/logout", (req, res) => {
  // Clears the JWT cookie from the client's browser
  res.clearCookie("jwt");

  // Redirects the user to the homepage or login page after logging out
  res.redirect("/");
});

// Route to build registration view
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
);

router.post(
  "/register",
  utilities.handleErrors(accountController.registerAccount)
);

router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildManagement)
);

// Deliver the account update view
router.get(
  "/update",
  utilities.checkLogin, // Ensure the user is logged in
  utilities.handleErrors(accountController.buildAccountUpdateView)
);

// Process account updates (first name, last name, email)
router.post(
  "/update",
  [
    check("account_firstname")
      .notEmpty()
      .withMessage("First name is required."),
    check("account_lastname").notEmpty().withMessage("Last name is required."),
    check("account_email")
      .isEmail()
      .withMessage("Valid email is required.")
      .custom(async (email, { req }) => {
        const accountModel = require("../models/accountModel");
        const account = await accountModel.getAccountByEmail(email);
        if (account && account.account_id !== req.body.account_id) {
          throw new Error("Email address already exists.");
        }
      }),
  ],
  utilities.handleValidationErrors,
  utilities.handleErrors(accountController.updateAccount)
);

// Process password change
router.post(
  "/change-password",
  [
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
  utilities.handleValidationErrors,
  utilities.handleErrors(accountController.changePassword)
);

// POST route to handle form submission
router.post(
  "/submit",
  [
    // Validation checks for email and password
    check("email").isEmail().withMessage("Please enter a valid email"),
    check("password").notEmpty().withMessage("Password cannot be empty"),
  ],
  Util.handleValidationErrors, // Handle validation errors
  (req, res) => {
    // If validation passed, handle the successful form submission
    res.send("Validation passed!");
  }
);

module.exports = router;
