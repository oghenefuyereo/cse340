// routes/static.js
const express = require("express");
const router = express.Router();
const baseController = require("../controllers/baseController");


router.get("/about", (req, res) => {
  res.render("about", { title: "About Us" });
});

// Index route
router.get("/",baseController.buildHome);

module.exports = router;
