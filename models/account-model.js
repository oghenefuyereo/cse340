const pool = require('../database/index'); // adjust path if needed

/* *****************************
 *   Register new account
 * *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, hashed_password) {
  try {
    const sql = `
      INSERT INTO account 
        (account_firstname, account_lastname, account_email, account_password, account_type) 
      VALUES ($1, $2, $3, $4, 'Client') 
      RETURNING *`;

    const result = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      hashed_password
    ]);

    return result.rows[0]; // return the inserted user record
  } catch (error) {
    console.error("Error registering account:", error);
    return null;
  }
}

module.exports = {
  registerAccount
};
