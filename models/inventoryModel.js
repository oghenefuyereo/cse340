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
 *  Get all inventory items and classification_name by classification_id
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
    console.error("getclassificationsbyid error " + error);
    throw error;
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById,
};

async function getVehicleById(id) {
  const query = "SELECT * FROM public.inventory WHERE inv_id = $1";
  const result = await pool.query(query, [id]); // Parameterized query to avoid SQL injection
  return result.rows[0]; // Assuming the result is an array and we need the first object
}

/* ***************************
 *  Add new classification data
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
 *  Add a new vehicle
 * ************************** */
async function addVehicle(vehicleData) {
  const {
    vehicle_name,
    vehicle_price,
    vehicle_year,
    vehicle_mileage,
    vehicle_color,
    classification_id,
  } = vehicleData;

  // Validate required fields
  if (
    !vehicle_name ||
    !vehicle_price ||
    !vehicle_year ||
    !vehicle_mileage ||
    !classification_id
  ) {
    throw new Error("All fields are required.");
  }

  // Validate price to ensure it's a number
  if (isNaN(vehicle_price) || vehicle_price <= 0) {
    throw new Error("Vehicle price must be a positive number.");
  }

  // Validate mileage to ensure it's a valid number
  if (isNaN(vehicle_mileage) || vehicle_mileage < 0) {
    throw new Error("Mileage must be a valid number.");
  }

  // Validate year to ensure it's a valid 4-digit year
  if (isNaN(vehicle_year) || vehicle_year < 1000 || vehicle_year > 9999) {
    throw new Error("Vehicle year must be a valid 4-digit year.");
  }

  try {
    const result = await pool.query(
      "INSERT INTO public.inventory (vehicle_name, vehicle_price, vehicle_year, vehicle_mileage, vehicle_color, classification_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [
        vehicle_name,
        vehicle_price,
        vehicle_year,
        vehicle_mileage,
        vehicle_color,
        classification_id,
      ]
    );
    return result.rows[0]; // Return the newly inserted vehicle
  } catch (error) {
    console.error("Error in addVehicle:", error);
    throw error; // Propagate the error
  }
}

async function addClassification(classification_name) {
  if (!classification_name || classification_name.trim() === "") {
    throw new Error("Classification name is required.");
  }

  try {
    const result = await pool.query(
      "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *",
      [classification_name]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error in addClassification:", error);
    throw error;
  }
}

async function addVehicle(vehicleData) {
  const {
    vehicle_name,
    vehicle_price,
    vehicle_year,
    vehicle_mileage,
    vehicle_color,
    classification_id,
  } = vehicleData;

  if (
    !vehicle_name ||
    !vehicle_price ||
    !vehicle_year ||
    !vehicle_mileage ||
    !classification_id
  ) {
    throw new Error("All fields are required.");
  }

  if (isNaN(vehicle_price) || vehicle_price <= 0) {
    throw new Error("Vehicle price must be a positive number.");
  }

  if (isNaN(vehicle_mileage) || vehicle_mileage < 0) {
    throw new Error("Mileage must be a valid number.");
  }

  if (isNaN(vehicle_year) || vehicle_year < 1000 || vehicle_year > 9999) {
    throw new Error("Vehicle year must be a valid 4-digit year.");
  }

  try {
    const result = await pool.query(
      "INSERT INTO public.inventory (vehicle_name, vehicle_price, vehicle_year, vehicle_mileage, vehicle_color, classification_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [
        vehicle_name,
        vehicle_price,
        vehicle_year,
        vehicle_mileage,
        vehicle_color,
        classification_id,
      ]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error in addVehicle:", error);
    throw error;
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById,
  addClassification,
  addVehicle,
};
