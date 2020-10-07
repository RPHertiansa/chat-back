const express = require('express')
const usersController  = require('../controllers/users')

const router = express.Router()

router
    .post('/register', usersController.register)
    .post('/login', usersController.login)
    .get('/getall', usersController.getAll)
    .get('/getdetail/:iduser', usersController.getDetail)
    .post('/insert', usersController.insert)
    .patch('/update/:iduser', usersController.update)
    .delete('/delete/:iduser', usersController.delete)
    .get('/activate/:token', usersController.activate)
    .post('/refreshToken', usersController.renewToken)
    .post('/logout/:iduser', usersController.logout)
    .post('/ForgotPassword', usersController.ForgotPassword)
    .post('/newPassword/:userkey', usersController.newPassword)
module.exports = router;