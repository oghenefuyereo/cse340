const pool = require("../database");

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  return await pool.query(
    "SELECT * FROM public.classification ORDER BY classification_name"
  );
}

/* ***************************
 *  Get all inventory items by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getInventoryByClassificationId error: " + error);
    throw error;
  }
}

/* ***************************
 *  Get inventory item by ID
 * ************************** */
async function getInventoryById(id) {
  try {
    const query = "SELECT * FROM public.inventory WHERE inv_id = $1";
    const result = await pool.query(query, [id]); // Parameterized query to avoid SQL injection
    return result.rows[0]; // Assuming the result is an array and we need the first object
  } catch (error) {
    console.error("Error in getInventoryById:", error);
    throw error;
  }
}

/* ***************************
 *  Add new classification
 * ************************** */
async function addClassification(classification_name) {
  if (!classification_name || classification_name.trim() === "") {
    throw new Error("Classification name is required.");
  }

  try {
    const result = await pool.query(
      "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *",
      [classification_name]
    );
    return result.rows[0]; // Return the newly inserted classification
  } catch (error) {
    console.error("Error in addClassification:", error);
    throw error; // Propagate the error
  }
}

/* ***************************
 *  Add new inventory item (vehicle)
 * ************************** */
async function addInventoryItem(vehicleData) {
  const {
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = vehicleData;

  // Validate required fields
  if (
    !inv_make ||
    !inv_model ||
    !inv_description ||
    !inv_price ||
    !inv_year ||
    !inv_miles ||
    !inv_color ||
    !classification_id
  ) {
    throw new Error("All fields are required.");
  }

  // Validate price to ensure it's a number
  if (isNaN(inv_price) || inv_price <= 0) {
    throw new Error("Price must be a positive number.");
  }

  // Validate mileage to ensure it's a valid number
  if (isNaN(inv_miles) || inv_miles < 0) {
    throw new Error("Mileage must be a valid number.");
  }

  // Validate year to ensure it's a valid 4-digit year
  if (isNaN(inv_year) || inv_year < 1000 || inv_year > 9999) {
    throw new Error("Year must be a valid 4-digit year.");
  }

  try {
    const result = await pool.query(
      `INSERT INTO public.inventory 
      (inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, classification_id) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
        classification_id,
      ]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error in addInventoryItem:", error);
    throw error;
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
  inv_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    const sql = `UPDATE public.inventory 
      SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, 
      inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 
      WHERE inv_id = $11 RETURNING *`;

    const values = [
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id,
    ];

    const result = await pool.query(sql, values);
    return result.rows[0];
  } catch (error) {
    console.error("Error in updateInventory:", error);
    throw error;
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryById,
  addClassification,
  addInventoryItem,
  updateInventory,
};
