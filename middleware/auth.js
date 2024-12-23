const jwt = require("jsonwebtoken");

function checkAuth(req, res, next) {
  const token = req.cookies.jwt;
  if (!token) {
    res.locals.isLoggedIn = false;
    return next();
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      res.locals.isLoggedIn = false;
      return next();
    }
    res.locals.isLoggedIn = true;
    res.locals.firstName = decoded.account_firstname; // Add the first name to the locals
    next();
  });
}

module.exports = checkAuth;
