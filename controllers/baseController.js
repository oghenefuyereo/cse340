const utilities = require("../utilities/");
const baseController = {};

baseController.buildHome = async function (req, res) {
  const nav = await utilities.getNav();
  res.render("index", { title: "Home", nav });
};
utilities.handleErrors(baseController.buildHome)
module.exports = baseController;
utilities.handleErrors(baseController.editInvItemView)




