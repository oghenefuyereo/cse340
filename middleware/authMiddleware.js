function requireLogin(req, res, next) {
  if (req.session && req.session.accountData) {
    return next();
  }
  req.flash("notice", "Please log in to access this page.");
  return res.redirect("/account/login");
}

function requireEmployeeOrManager(req, res, next) {
  const role = req.session.accountData?.account_type;
  if (role === "Employee" || role === "Manager") {
    return next();
  }
  req.flash("notice", "Access denied. Employees or Managers only.");
  return res.redirect("/account/login");
}

module.exports = { requireLogin, requireEmployeeOrManager };
