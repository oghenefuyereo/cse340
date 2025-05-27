// routes/accountRoute.js

const express = require('express')
const router = express.Router()
const utilities = require('../utilities') // adjust path if needed
const accountController = require('../controllers/accountController')

// GET route for /account/login
router.get('/login', accountController.buildLogin, (error, req, res, next) => {
  console.error(error)
  res.status(500).send('Server Error')
})

module.exports = router
