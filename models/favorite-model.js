const pool = require('../database/');

async function addFavorite(account_id, inv_id) {
  const sql = `INSERT INTO favorites (account_id, inv_id) VALUES ($1, $2)`;
  try {
    await pool.query(sql, [account_id, inv_id]);
    return true;
  } catch (error) {
    throw error;  // let controller handle errors, e.g., duplicates
  }
}

async function getFavoritesByUser(account_id) {
  const sql = `
    SELECT f.inv_id, i.inv_make, i.inv_model, i.inv_year, i.inv_price
    FROM favorites f
    JOIN inventory i ON f.inv_id = i.inv_id
    WHERE f.account_id = $1
    ORDER BY i.inv_make, i.inv_model
  `;
  return pool.query(sql, [account_id]);
}

module.exports = {
  addFavorite,
  getFavoritesByUser,
};
