// routes/static.js
const express = require("express");
const router = express.Router();
const baseController = require("../controllers/baseController");
const utilities = require("../utilities"); // to get handleErrors

router.get("/about", (req, res) => {
  res.render("about", { title: "About Us" });
});

// Index route
router.get("/", utilities.handleErrors(baseController.buildHome));

module.exports = router;
