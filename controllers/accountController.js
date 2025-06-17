const accountModel = require('../models/account-model');
const utilities = require('../utilities');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render('account/login', {
      title: 'Login',
      nav,
      errors: null,
      notice: req.flash("notice"), // ✅ added
    });
  } catch (error) {
    next(error);
  }
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render('account/register', {
      title: 'Register',
      nav,
      errors: null,
      notice: req.flash("notice"), // ✅ added
    });
  } catch (error) {
    next(error);
  }
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  try {
    let nav = await utilities.getNav();
    const { account_firstname, account_lastname, account_email, account_password } = req.body;

    const hashedPassword = await bcrypt.hash(account_password, 10);

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    );

    if (regResult) {
      req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`);
      return res.status(201).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        notice: req.flash("notice"), // ✅ added
      });
    } else {
      req.flash("notice", "Sorry, the registration failed.");
      return res.status(501).render("account/register", {
        title: "Registration",
        nav,
        errors: null,
        notice: req.flash("notice"), // ✅ added
      });
    }
  } catch (error) {
    console.error("Registration error: ", error);
    req.flash("notice", "Sorry, the registration failed due to an error.");
    res.status(500).render("account/register", {
      title: "Registration",
      nav: await utilities.getNav(),
      errors: null,
      notice: req.flash("notice"), // ✅ added
    });
  }
}

/* ****************************************
 *  TEMP login process handler
 * *************************************** */
async function processLogin(req, res) {
  res.status(200).send("login process");
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
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
      notice: req.flash("notice"), // ✅ added
    });
  }

  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;

      req.session.user = {
        id: accountData.account_id,
        firstName: accountData.account_firstname,
        lastName: accountData.account_lastname,
        email: accountData.account_email,
      };

      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });

      res.cookie("jwt", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        maxAge: 3600000, // 1 hour
      });

      console.log("✅ Login successful. Redirecting...");
      return res.redirect("/account/");
    } else {
      req.flash("notice", "Please check your credentials and try again.");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
        notice: req.flash("notice"), // ✅ added
      });
    }
  } catch (error) {
    console.error("❌ Login error:", error);
    req.flash("notice", "Login failed due to an internal error.");
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
      notice: req.flash("notice"), // ✅ added
    });
  }
}

/* ****************************************
 *  Build Account Management view
 * *************************************** */
async function buildAccountManagement(req, res, next) {
  const nav = await utilities.getNav();
  const user = req.session.user;

  res.render("account/accountManagement", {
    title: "Account Management",
    nav,
    errors: null,
    messages: req.flash("notice"),
    firstName: user?.firstName || "",
  });
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  processLogin,
  accountLogin,
  buildAccountManagement,
};
