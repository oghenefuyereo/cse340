const pool = require("../database");

/* *****************************
 * Register new account
 * *************************** */
async function registerAccount(
  account_firstname,
  account_lastname,
  account_email,
  account_password
) {
  try {
    const sql =
      "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *";
    const result = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_password,
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
    return result.rows[0]; // Return the first matching account
  } catch (error) {
    console.error("Error fetching account by email:", error.message);
    throw error; // Re-throw the error to be handled by the caller
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
    return result.rows[0]; // Return the first matching account
  } catch (error) {
    console.error("Error fetching account by ID:", error.message);
    throw error; // Re-throw the error to be handled by the caller
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
async function updatePassword(account_id, account_password) {
  try {
    const sql =
      "UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING *";
    const result = await pool.query(sql, [account_password, account_id]);
    if (result.rowCount === 0) {
      throw new Error("Password update failed: No rows affected.");
    }
    return result.rows[0]; // Return updated account
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
