const express = require('express')
const usersController  = require('../controllers/users')

const router = express.Router()

router
    .post('/register', usersController.register)
    .post('/login', usersConyytroller.login)

module.exports = router;