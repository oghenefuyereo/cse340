function requireLogin(req, res, next) {
  if (req.session && req.session.accountData) {
    return next();
  }
  req.flash("notice", "Please log in to access this page.");
  return res.redirect("/account/login");
}

function requireEmployeeOrAdmin(req, res, next) {
  const rawRole = req.session?.accountData?.account_type;
  if (!rawRole) {
    console.log("🔒 Role not found in session");
    req.flash("notice", "Access denied. Employees or Admins only.");
    return res.redirect("/account/login");
  }

  const role = rawRole.trim().toLowerCase();
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
