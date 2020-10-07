const express = require('express')
const usersController  = require('../controllers/users')

const router = express.Router()

router
    .post('/register', usersController.register)
    .post('/login', usersController.login)
    .get('/getall', usersController.getAll)
    .get('/getdetail/:iduser', usersController.getDetail)

module.exports = router;