const { body, validationResult } = require("express-validator");
const utilities = require("../utilities");
const accountModel = require("../models/account-model");

const validate = {};

/* Registration Data Validation Rules */
validate.registrationRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email);
        if (emailExists) {
          throw new Error("Email exists. Please log in or use a different email");
        }
      }),
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ];
};

/* Login Data Validation Rules */
validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required."),
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password cannot be empty."),
  ];
};

/* Check registration data */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    return res.render("account/register", {
      errors: errors.array(),
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    });
  }
  next();
};

/* Check login data */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    return res.render("account/login", {
      errors: errors.array(),
      title: "Login",
      nav,
      account_email,
    });
  }
  next();
};

/* Update Account Info Validation Rules */
validate.updateRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a first name."),
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a last name."),
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email, { req }) => {
        // Check if email already exists for another account
        const accountId = req.params.id;
        const existingAccount = await accountModel.getAccountByEmail(account_email);
        if (existingAccount && existingAccount.account_id.toString() !== accountId) {
          throw new Error("Email already in use by another account.");
        }
      }),
  ];
};

/* Check update account info data */
validate.checkUpdateData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    return res.render("account/updateAccount", {
      errors: errors.array(),
      title: "Update Account",
      nav,
      account_firstname,
      account_lastname,
      account_email,
      account_id: req.params.id,
    });
  }
  next();
};

/* Password Update Validation Rules */
validate.passwordRules = () => {
  return [
    body("newPassword")
      .trim()
      .notEmpty()
      .withMessage("New password is required.")
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet complexity requirements."),
    body("confirmPassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error("Passwords do not match.");
        }
        return true;
      }),
  ];
};

/* Check password update data */
validate.checkPasswordData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    return res.render("account/updateAccount", {  // Adjust view if you have a dedicated password update view
      errors: errors.array(),
      title: "Change Password",
      nav,
      account_id: req.params.id,
      notice: errors.array().map(err => err.msg).join(" "),
    });
  }
  next();
};

module.exports = validate;
