function throwError(req, res, next) {
  throw new Error("Intentional Server Error");
}

module.exports = { throwError };
