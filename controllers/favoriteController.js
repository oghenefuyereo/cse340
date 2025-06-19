const favoriteModel = require("../models/favorite-model");
const utilities = require("../utilities");

/* ========================
 * Add a vehicle to favorites
 * ======================== */
async function addFavorite(req, res, next) {
  try {
    const { inv_id } = req.body;
    const accountData = req.session.accountData;

    if (!accountData) {
      req.flash("error", "You must be logged in to add favorites.");
      return res.redirect("/account/login");
    }

    if (!inv_id) {
      req.flash("error", "No vehicle selected.");
      return res.redirect("/inv/");
    }

    await favoriteModel.addFavorite(accountData.account_id, inv_id);
    req.flash("success", "Vehicle added to favorites.");
  } catch (err) {
    if (err.code === "23505") {
      req.flash("info", "You already added this vehicle to favorites.");
    } else {
      console.error("Add favorite error:", err);
      req.flash("error", "Error adding to favorites.");
    }
  }

  // Always redirect to the detail view of the vehicle
  res.redirect("/favorites/list");

}

/* ========================
 * Show all favorites for the logged-in user
 * ======================== */
async function showFavorites(req, res, next) {
  try {
    const accountData = req.session.accountData;

    if (!accountData) {
      req.flash("error", "You must be logged in to view favorites.");
      return res.redirect("/account/login");
    }

    const nav = await utilities.getNav();
    const data = await favoriteModel.getFavoritesByUser(accountData.account_id);

    res.render("account/favorites", {
      title: "My Favorites",
      nav,
      favorites: data.rows || [],
      success: req.flash("success"),
      info: req.flash("info"),
      error: req.flash("error"),
    });
  } catch (err) {
    console.error("Error loading favorites:", err);
    next(err);
  }
}

module.exports = {
  addFavorite,
  showFavorites,
};
