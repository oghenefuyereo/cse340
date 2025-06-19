function requireLogin(req, res, next) {
  if (req.session && req.session.accountData) {
    return next();
  }
  req.flash("notice", "Please log in to access this page.");
  return res.redirect("/account/login");
}

function requireEmployeeOrAdmin(req, res, next) {
  const role = req.session?.accountData?.account_type?.trim().toLowerCase();
  console.log("🔒 Checking role access:", role);

  if (role === "employee" || role === "admin") {
    return next();
  }
  req.flash("notice", "Access denied. Employees or Admins only.");
  return res.redirect("/account/login");
}

module.exports = {
  requireLogin,
  requireEmployeeOrAdmin,
};
