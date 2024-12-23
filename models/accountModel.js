const pool = require("../database");
const bcrypt = require("bcrypt");
const validator = require("validator");

/* *****************************
 * Register new account
 * *************************** */
async function registerAccount(
  account_firstname,
  account_lastname,
  account_email,
  account_password
) {
  // Validate email format
  if (!validator.isEmail(account_email)) {
    throw new Error("Invalid email format");
  }

  // Ensure password is strong enough
  if (account_password.length < 6) {
    throw new Error("Password must be at least 6 characters long.");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(account_password, 10); // Salt rounds set to 10

  try {
    const sql =
      "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *";
    const result = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword,
    ]);
    return result.rows[0]; // Return the inserted row
  } catch (error) {
    console.error("Error registering account:", error.message);
    throw new Error("Error registering account, please try again later.");
  }
}

/* *****************************
 * Return account data using email address
 * ***************************** */
async function getAccountByEmail(account_email) {
  try {
    const result = await pool.query(
      "SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1",
      [account_email]
    );
    if (result.rows.length === 0) {
      throw new Error("No matching email found");
    }
    const account = result.rows[0];
    // Exclude password from returned data
    delete account.account_password;
    return account;
  } catch (error) {
    console.error("Error fetching account by email:", error.message);
    throw new Error("No account found with that email. Please try again.");
  }
}

/* *****************************
 * Return account data using account ID
 * ***************************** */
async function getAccountById(account_id) {
  try {
    const result = await pool.query(
      "SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_id = $1",
      [account_id]
    );
    if (result.rows.length === 0) {
      throw new Error("No matching account found");
    }
    const account = result.rows[0];
    // Exclude password from returned data
    delete account.account_password;
    return account;
  } catch (error) {
    console.error("Error fetching account by ID:", error.message);
    throw new Error("Account not found. Please try again.");
  }
}

/* *****************************
 * Update account information
 * ***************************** */
async function updateAccount({
  account_id,
  account_firstname,
  account_lastname,
  account_email,
}) {
  // Validate email format
  if (!validator.isEmail(account_email)) {
    throw new Error("Invalid email format");
  }

  try {
    const sql =
      "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *";
    const result = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_id,
    ]);
    if (result.rowCount === 0) {
      throw new Error("Account update failed: No rows affected.");
    }
    return result.rows[0]; // Return updated account
  } catch (error) {
    console.error("Error updating account:", error.message);
    throw new Error("Account update failed, please try again later.");
  }
}

/* *****************************
 * Update account password
 * ***************************** */
async function updatePassword(account_id, new_password) {
  // Validate password strength
  if (new_password.length < 6) {
    throw new Error("Password must be at least 6 characters long.");
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(new_password, 10); // Salt rounds set to 10

  try {
    const sql =
      "UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING *";
    const result = await pool.query(sql, [hashedPassword, account_id]);
    if (result.rowCount === 0) {
      throw new Error("Password update failed: No rows affected.");
    }
    return result.rows[0]; // Return updated account (without password)
  } catch (error) {
    console.error("Error updating password:", error.message);
    throw new Error("Password update failed, please try again later.");
  }
}

module.exports = {
  registerAccount,
  getAccountByEmail,
  getAccountById,
  updateAccount,
  updatePassword,
};
