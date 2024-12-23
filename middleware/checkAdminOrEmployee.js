const jwt = require("jsonwebtoken");

function checkAdminOrEmployee(req, res, next) {
  const token = req.cookies.jwt;

  // If no JWT token exists, user is not logged in
  if (!token) {
    req.flash("notice", "You must be logged in to access this page.");
    return res.redirect("/account/login");
  }

  // Verify the token
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      req.flash("notice", "Your session has expired. Please log in again.");
      return res.redirect("/account/login");
    }

    // Check account type: Allow access if "Employee" or "Admin"
    if (
      decoded.account_type === "Employee" ||
      decoded.account_type === "Admin"
    ) {
      // Pass user info to the next middleware or route handler
      res.locals.accountType = decoded.account_type;
      res.locals.firstName = decoded.account_firstname; // You can use this in the views for greeting
      return next();
    } else {
      req.flash(
        "notice",
        "You do not have the required permissions to access this page."
      );
      return res.redirect("/account/login");
    }
  });
}

module.exports = checkAdminOrEmployee;
