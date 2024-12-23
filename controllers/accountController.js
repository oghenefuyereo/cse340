const utilities = require("../utilities");
const accountModel = require("../models/accountModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
  });
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  });
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_password
  );

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    );
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    });
  }
}

/* ****************************************
 *  Process login request
 * *************************************** */
async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);

  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
    return;
  }

  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 * 1000 }
      );

      if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          secure: true,
          maxAge: 3600 * 1000,
        });
      }
      return res.redirect("/account/");
    } else {
      req.flash("notice", "Please check your credentials and try again.");
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(403).send("Access Forbidden");
  }
}

/* ****************************************
 *  Render Management View
 * *************************************** */
async function buildManagement(req, res) {
  let nav = await utilities.getNav();
  const user = req.user; // Assuming user info is stored in req.user (from JWT or session)

  if (!user) {
    return res.redirect("/login"); // Redirect to login if user is not logged in
  }

  const {
    account_firstname: firstName,
    account_type: accountType,
    account_id: userId,
  } = user;

  try {
    res.render("manageInventory", {
      title: "Manage Inventory",
      nav,
      firstName,
      accountType,
      userId,
      isLoggedIn: true,
      message: req.flash("message"),
      classificationSelect: await utilities.getClassificationSelectOptions(), // Fetch options
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error rendering management view.");
  }
}

/* ****************************************
 *  Deliver Account Update View
 * *************************************** */
async function buildAccountUpdateView(req, res, next) {
  let nav = await utilities.getNav();
  const accountId = req.user.account_id; // Assuming `req.user` contains logged-in user data

  try {
    const accountData = await accountModel.getAccountById(accountId);
    res.render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      message: req.flash("notice"),
      ...accountData,
    });
  } catch (err) {
    console.error("Error fetching account data:", err);
    next(err);
  }
}

/* ****************************************
 *  Process Account Update
 * *************************************** */
async function updateAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_id } =
    req.body;

  try {
    const updateResult = await accountModel.updateAccount({
      account_id,
      account_firstname,
      account_lastname,
      account_email,
    });

    if (updateResult) {
      req.flash("notice", "Account updated successfully.");
    } else {
      req.flash("notice", "Account update failed.");
    }

    const updatedAccountData = await accountModel.getAccountById(account_id);
    res.render("account/manage", {
      title: "Account Management",
      nav,
      message: req.flash("notice"),
      ...updatedAccountData,
    });
  } catch (err) {
    console.error("Error updating account:", err);
    req.flash("notice", "An error occurred during account update.");
    res.status(500).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      ...req.body, // Preserve the form data for user correction
    });
  }
}

/* ****************************************
 *  Process Password Change
 * *************************************** */
async function changePassword(req, res) {
  let nav = await utilities.getNav();
  const { new_password, account_id } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(new_password, 10);
    const updateResult = await accountModel.updatePassword(
      account_id,
      hashedPassword
    );

    if (updateResult) {
      req.flash("notice", "Password updated successfully.");
    } else {
      req.flash("notice", "Password update failed.");
    }

    const updatedAccountData = await accountModel.getAccountById(account_id);
    res.render("account/manage", {
      title: "Account Management",
      nav,
      message: req.flash("notice"),
      ...updatedAccountData,
    });
  } catch (err) {
    console.error("Error changing password:", err);
    req.flash("notice", "An error occurred during password change.");
    res.status(500).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      ...req.body, // Preserve the form data for user correction
    });
  }
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildManagement,
  buildAccountUpdateView,
  updateAccount,
  changePassword,
};
