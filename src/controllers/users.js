const usersModel = require('../models/users')
const { success, failed } = require('../helpers/response')
const bcrypt = require('bcrypt')

const users = {
    register: async (req, res) => {
        try {
            const body = req.body
            console.log(body)
            usersModel.register(body)
            .then((result) => {
                success(res, result, 'You are registered')
            })
            .catch((err) => {
                failed(res, [], err.message)
            })
            
        } catch (error) {
            failed(res, [], 'Internal server error')
        }
    },
    login: async (req, res) => {
        try {
            const body = req.body
            usersModel.login(body)
            .then((result) => {
                success(res, result, 'Login success')
            })
            .catch((err) => {
                failed(res, result, err.message)
            })
        } catch (error) {
            failed(res, [], 'Internal server error')
        }
    }
}

module.exports = users