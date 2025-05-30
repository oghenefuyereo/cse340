const express = require('express');
const router = express.Router();
const utilities = require('../utilities');
const regValidate = require('../utilities/account-validation');
const accountController = require('../controllers/accountController');

// Login view route
router.get('/login', utilities.handleErrors(accountController.buildLogin));

// Registration view route
router.get('/register', utilities.handleErrors(accountController.buildRegister));

// Registration processing
router.post(
  '/register',
  regValidate.registrationRules(), // Validation rules
  regValidate.checkRegData,        // Validation handler
  utilities.handleErrors(accountController.registerAccount)
);

// TEMP Login processing route (for now, no validation, just testing)
router.post(
  '/login',
  utilities.handleErrors(accountController.processLogin) // Just a placeholder for now
);

module.exports = router;
