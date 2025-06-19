const express = require("express");
const router = express.Router();
const favoriteController = require("../controllers/favoriteController");

router.post("/add", favoriteController.addFavorite);
router.get("/list", favoriteController.showFavorites);

module.exports = router;
