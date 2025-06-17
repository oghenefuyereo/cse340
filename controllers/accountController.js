const accountModel = require('../models/account-model');
const utilities = require('../utilities');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* Deliver login view */
async function buildLogin(req, res, next) {
  try {
    const nav = await utilities.getNav();
    res.render('account/login', {
      title: 'Login',
      nav,
      errors: null,
      notice: req.flash("notice"),
    });
  } catch (error) {
    next(error);
  }
}

/* Deliver registration view */
async function buildRegister(req, res, next) {
  try {
    const nav = await utilities.getNav();
    res.render('account/register', {
      title: 'Register',
      nav,
      errors: null,
      notice: req.flash("notice"),
    });
  } catch (error) {
    next(error);
  }
}

/* Process registration */
async function registerAccount(req, res) {
  try {
    const { account_firstname, account_lastname, account_email, account_password } = req.body;
    const nav = await utilities.getNav();
    const hashedPassword = await bcrypt.hash(account_password, 10);

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    );

    if (regResult) {
      req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`);
      return res.redirect("/account/login");
    } else {
      req.flash("notice", "Sorry, the registration failed.");
      return res.status(501).render("account/register", {
        title: "Register",
        nav,
        errors: null,
        notice: req.flash("notice"),
      });
    }
  } catch (error) {
    const nav = await utilities.getNav();
    req.flash("notice", "Sorry, the registration failed due to an error.");
    return res.status(500).render("account/register", {
      title: "Register",
      nav,
      errors: null,
      notice: req.flash("notice"),
    });
  }
}

/* Process login */
async function accountLogin(req, res) {
  const { account_email, account_password } = req.body;
  const nav = await utilities.getNav();
  const accountData = await accountModel.getAccountByEmail(account_email);

  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
      notice: req.flash("notice"),
    });
  }

  try {
    const passwordMatch = await bcrypt.compare(account_password, accountData.account_password);
    if (passwordMatch) {
      delete accountData.account_password;

      req.session.accountData = accountData; // Store in session

      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });

      res.cookie("jwt", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        maxAge: 3600000,
      });

      return res.redirect("/account/");
    } else {
      req.flash("notice", "Please check your credentials and try again.");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
        notice: req.flash("notice"),
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
      notice: req.flash("notice"),
    });
  }
}

/* Account Management view */
async function buildAccountManagement(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const accountData = req.session.accountData;

    if (!accountData) {
      req.flash("notice", "Please log in to access your account.");
      return res.redirect("/account/login");
    }

    res.render("account/accountManagement", {
      title: "Account Management",
      nav,
      errors: null,
      messages: req.flash("notice"),
      accountData,
    });
  } catch (error) {
    next(error);
  }
}

/* Build account update view */
async function buildUpdateAccountView(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const account_id = req.params.id;
    const accountData = await accountModel.getAccountById(account_id);

    if (!accountData) {
      req.flash("notice", "Account not found.");
      return res.redirect("/account/");
    }

    res.render("account/updateAccount", {
      title: "Update Account",
      nav,
      errors: null,
      accountData,
      notice: req.flash("notice"),
    });
  } catch (error) {
    next(error);
  }
}

/* Update account info */
async function updateAccount(req, res, next) {
  try {
    const { account_firstname, account_lastname, account_email } = req.body;
    const account_id = req.params.id;
    const nav = await utilities.getNav();

    const existingAccount = await accountModel.getAccountByEmail(account_email);
    if (existingAccount && existingAccount.account_id.toString() !== account_id) {
      req.flash("notice", "Email address already in use by another account.");
      const accountData = await accountModel.getAccountById(account_id);
      return res.status(409).render("account/updateAccount", {
        title: "Update Account",
        nav,
        errors: null,
        accountData,
        notice: req.flash("notice"),
      });
    }

    // *** FIXED PARAMETER ORDER HERE ***
    const updateResult = await accountModel.updateAccountInfo(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    );

    const updatedAccount = await accountModel.getAccountById(account_id);
    req.session.accountData = updatedAccount;

    req.flash("notice", updateResult ? "Account information updated successfully." : "Failed to update account.");
    return res.render("account/accountManagement", {
      title: "Account Management",
      nav,
      errors: null,
      messages: req.flash("notice"),
      accountData: updatedAccount,
    });
  } catch (error) {
    next(error);
  }
}

/* Update password */
async function updatePassword(req, res, next) {
  try {
    const { newPassword, confirmPassword } = req.body;
    const account_id = req.params.id;
    const nav = await utilities.getNav();

    if (!newPassword || newPassword.length < 12) {
      req.flash("notice", "Password must be at least 12 characters.");
      const accountData = await accountModel.getAccountById(account_id);
      return res.status(400).render("account/updateAccount", {
        title: "Update Password",
        nav,
        errors: null,
        accountData,
        notice: req.flash("notice"),
      });
    }

    if (newPassword !== confirmPassword) {
      req.flash("notice", "Passwords do not match.");
      const accountData = await accountModel.getAccountById(account_id);
      return res.status(400).render("account/updateAccount", {
        title: "Update Password",
        nav,
        errors: null,
        accountData,
        notice: req.flash("notice"),
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updateResult = await accountModel.updateAccountPassword(hashedPassword, account_id);
    const accountData = await accountModel.getAccountById(account_id);
    req.session.accountData = accountData;

    req.flash("notice", updateResult ? "Password updated successfully." : "Password update failed.");
    return res.render("account/accountManagement", {
      title: "Account Management",
      nav,
      errors: null,
      messages: req.flash("notice"),
      accountData,
    });
  } catch (error) {
    next(error);
  }
}

/* Logout */
function accountLogout(req, res) {
  res.clearCookie("jwt");
  if (req.session) {
    req.session.destroy(() => {
      res.redirect("/");
    });
  } else {
    res.redirect("/");
  }
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccountManagement,
  buildUpdateAccountView,
  updateAccount,
  updatePassword,
  accountLogout,
};
