const express = require('express');
const router = express.Router();
const utilities = require('../utilities');
const accountController = require('../controllers/accountController');

// GET /account/login
router.get('/login', utilities.handleErrors(accountController.buildLogin));

// GET /account/register
router.get('/register', utilities.handleErrors(accountController.buildRegister));

// POST /account/register
router.post('/register', utilities.handleErrors(accountController.registerAccount));

module.exports = router;
