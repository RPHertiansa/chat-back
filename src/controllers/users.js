const usersModel = require('../models/users')
const { success, failed, tokenStatus } = require('../helpers/response')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const nodemailer = require('nodemailer')
const { JWT_KEY, email, password } = require('../helpers/env')


const users = {
    register: async (req, res) => {
        try {
            const body = req.body

            const salt = await bcrypt.genSalt(10)
            const hashword = await bcrypt.hash(body.password, salt)

            const makeUsername = body.name.replace(/[^0-9a-z]/gi, '')

            const data = {
                name : body.name,
                email : body.email,
                username : makeUsername,
                password : hashword,
                active : 0,
                refreshtoken : null,
                image: '404.png'
            }
            usersModel.register(data)
            .then((result) => {
                success(res, result, 'You are registered')
                // const hashed = jwt.sign({
                //     email: data.email,
                //     username: data.username
                // }, JWT_KEY)

                // let transporter = nodemailer.createTransport({
                //     host: 'smtp.gmail.com',
                //     port: 587,
                //     secure: false,
                //     requireTLS: true,
                //     auth: {
                //         user: email,
                //         pass: password
                //     }
                // })

                // let mailOptions = {
                //     from    : `${email}`,
                //     to      : data.email,
                //     subject : `Hello ${data.name}`,
                //     html    : 
                //     `Hi there! You have registered your account at telegram app <br>
                //     Your username is ${data.username} <br>
                //     Please click this <a href="">link</a> to activate your account`
                // }

                // transporter.sendMail(mailOptions, (err, result) => {
                //     if(err) {
                //         res.status(505)
                //         failed(res, [], err.message)
                //     } else {
                //         success(res, result, 'Activation mail sent')
                //     }
                // })

                // res.json({
                //     message: `${data.name} you are registered! Please check your email to activate your account.`
                // })
            })
            .catch((err) => {
                failed(res, [], err.message)
            })
            
        } catch (error) {
            failed(res, [], 'Internal server error')
        }
    },
    verify: async (req, res) => {
        const token = req.params.token
        if(token) {
            jwt.verify(token, JWT_KEY, (err, decode) => {
                if(err) {
                    res.status(505)
                    failed(res, [], `Activation failed`)
                } else {
                    const email = decode.email
                    usersModel
                }
            })
        }
    },
    login: async (req, res) => {
        try {
            const body = req.body
            usersModel.login(body)
            .then(async (result) => {

                const userData = result[0]
                const password = userData.password
                const correct = await bcrypt.compare(body.password, password)
                if (correct) {
                    jwt.sign(
                        {
                            email: userData.email
                        },
                        JWT_KEY,
                        {expiresIn: 3600},
                        (err, token) => {
                            if(err) {
                                console.log(err)
                            } else {
                                tokenStatus(res, {token: token}, "Login success!")
                            }
                        }
                    )
                } else {
                    failed(res, [], 'Password incorrect, please check again')
                }
            })
            .catch((err) => {
                failed(res, [], err.message)
            })
        } catch (error) {
            failed(res, [], 'Internal server error')
        }
    },
    getAll: (req, res) => {
        try {
            const body = req.params.body
            usersModel.getAll()
            .then((result) => {
                success(res, result, 'Here are all the users data you requested')
            })
            .catch((err) => {
                failed(res, [], err.message)
            })
        } catch (error) {
            failed(res, [], `Internal server error`)
        }
    },
    getDetail: (req, res) => {
        try {
            const iduser = req.params.iduser
            usersModel.getDetail(iduser)
            .then((result) => {
                success(res, result, `This is user data with id = ${iduser}`)
            })
            .catch((err) => {
                failed(res, [], err.message)
            })
        } catch (error) {
            failed(res, [], 'Internal server error')
        }
    }
}

module.exports = users