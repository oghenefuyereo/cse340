// Needed Resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");
router.get(
  "/management",
  utilities.handleErrors(invController.renderManagementView)
);
router.get(
  "inv/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
);

router.get(
  "/add-classification",
  utilities.handleErrors(invController.renderAddClassificationView)
);

// Route to handle inventory update
router.post("/update/", invController.updateInventory);

// Error handling
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

router.post(
  "/add-inventory",
  utilities.handleErrors(async (req, res) => {
    const {
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      classification_id,
    } = req.body;

    if (!inv_make || !inv_model || !inv_description || !classification_id) {
      req.flash("error", "All required fields must be filled.");
      return res.redirect("/inv/add-inventory");
    }

    try {
      await inventoryModel.addInventoryItem({
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        classification_id,
      });
      req.flash("success", "New inventory item added successfully!");
      res.redirect("/inv/management");
    } catch (error) {
      req.flash("error", "Failed to add inventory item. Try again.");
      res.redirect("/inv/add-inventory");
    }
  })
);

// Route to build inventory by classification view
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
);
router.get(
  "/detail/:invid",
  utilities.handleErrors(invController.getVehicleDetails)
);

// Route to get all classifications
router.get(
  "/classifications",
  utilities.handleErrors(async (req, res) => {
    try {
      const classifications = await inventoryModel.getClassifications();
      res.json(classifications.rows); // Send classifications as response
    } catch (error) {
      res.status(500).send("Error retrieving classifications.");
    }
  })
);

router.get(
  "/getInventory/:classification_id",
  utilities.checkAccountType,
  utilities.handleErrors(invController.getInventoryJSON)
);
// Route to add a new classification
router.post(
  "/classifications",
  utilities.handleErrors(async (req, res) => {
    const { classification_name } = req.body;

    if (!classification_name) {
      return res
        .status(400)
        .json({ message: "Classification name is required" });
    }

    try {
      const newClassification = await inventoryModel.addClassification(
        classification_name
      );
      res.status(201).json({
        message: "Classification added successfully",
        classification: newClassification,
      });
    } catch (error) {
      res.status(500).send("Error adding classification.");
    }
  })
);

// Route to get vehicles by classification ID
router.get(
  "/vehicles/classification/:classification_id",
  utilities.handleErrors(async (req, res) => {
    const classificationId = req.params.classification_id;
    try {
      const vehicles = await inventoryModel.getInventoryByClassificationId(
        classificationId
      );
      res.json(vehicles); // Send vehicles for the given classification
    } catch (error) {
      res.status(500).send("Error retrieving vehicles.");
    }
  })
);

// Route to add a new vehicle
router.post(
  "/vehicles",
  utilities.handleErrors(async (req, res) => {
    const {
      vehicle_name,
      vehicle_price,
      vehicle_year,
      vehicle_mileage,
      vehicle_color,
      classification_id,
    } = req.body;

    // Validate required fields
    if (
      !vehicle_name ||
      !vehicle_price ||
      !vehicle_year ||
      !vehicle_mileage ||
      !classification_id
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Additional validation could go here for things like price, mileage, etc.

    try {
      const newVehicle = await inventoryModel.addVehicle({
        vehicle_name,
        vehicle_price,
        vehicle_year,
        vehicle_mileage,
        vehicle_color,
        classification_id,
      });
      res.status(201).json({
        message: "Vehicle added successfully",
        vehicle: newVehicle,
      });
    } catch (error) {
      res.status(500).send("Error adding vehicle.");
    }
  })
);

// Middleware to check if the account is Employee or Admin
const checkAdminOrEmployee = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.redirect("/login"); // Redirect to login if no token is found
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (
      err ||
      !(decoded.account_type === "Employee" || decoded.account_type === "Admin")
    ) {
      req.flash(
        "error",
        "You do not have the required permissions to access this page."
      );
      return res.redirect("/login"); // Redirect if not Employee or Admin
    }
    next(); // Proceed to the next middleware or route handler if authorized
  });
};

// Use this middleware in routes that require Employee or Admin access
router.get(
  "/management",
  checkAdminOrEmployee, // Only Admin or Employee can access management
  utilities.handleErrors(invController.renderManagementView)
);

router.get(
  "/add-classification",
  checkAdminOrEmployee, // Only Admin or Employee can add classification
  utilities.handleErrors(invController.renderAddClassificationView)
);

router.post(
  "/update/",
  checkAdminOrEmployee, // Only Admin or Employee can update inventory
  invController.updateInventory
);

router.post(
  "/add-inventory",
  checkAdminOrEmployee, // Only Admin or Employee can add inventory
  utilities.handleErrors(async (req, res) => {
    // Add inventory logic here
  })
);

router.post(
  "/classifications",
  checkAdminOrEmployee, // Only Admin or Employee can add classifications
  utilities.handleErrors(async (req, res) => {
    // Add classification logic here
  })
);

router.post(
  "/vehicles",
  checkAdminOrEmployee, // Only Admin or Employee can add vehicles
  utilities.handleErrors(async (req, res) => {
    // Add vehicle logic here
  })
);

module.exports = router;
