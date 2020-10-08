const usersModel = require('../models/users')
const { success, failed, tokenStatus } = require('../helpers/response')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const nodemailer = require('nodemailer')
const { JWT_KEY, myemail, mypassword, URL } = require('../helpers/env')
const upload = require('../helpers/upload')

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
            .then(() => {
                const hashed = jwt.sign({
                    email: data.email,
                    username: data.username
                }, JWT_KEY)

                let transporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 587,
                    secure: false,
                    requireTLS: true,
                    auth: {
                        user: myemail,
                        pass: mypassword
                    }
                })

                let mailOptions = {
                    from    : `Telegram ${myemail}`,
                    to      : data.email,
                    subject : `Hello ${data.name}`,
                    html    : 
                    `Hi there! You have registered your account at telegram app <br>
                    Your username is ${data.username} <br>
                    Please click this <a href="${URL}users/activate/${hashed}">link</a> to activate your account`
                }

                transporter.sendMail(mailOptions, (err, result) => {
                    if(err) {
                        res.status(505)
                        failed(res, [], err.message)
                    } else {
                        success(res, result, 'Activation mail sent')
                    }
                })

                res.json({
                    message: `You are registered`
                })
            })
            .catch((err) => {
                failed(res, [], err.message)
            })
            
        } catch (error) {
            failed(res, [], 'Internal server error')
        }
    },
    activate: (req,res) => {
        const token = req.params.token
        if(token) {
            jwt.verify(token, JWT_KEY, (err,decode) => {
                if(err){
                    res.status(505)
                    failed(res, [], `Failed Activation`)
                }else{
                    const email = decode.email
                    usersModel.activateUsers(email)
                    .then((result) => {
                        if(result.affectedRows){
                            res.status(200)
                            // success(res, {email}, `Congrats Gaes`)
                            res.render('index', {email})
                        }else{
                            res.status(505)
                            failed(res, [], err.message)
                        }
                    })
                    .catch((err)=>{
                        res.status(505)
                        response.failed(res, [], err.message)
                    })
                }
            })
        }
    },
    login: async (req, res) => {
        try {
            const body = req.body
            usersModel.login(body)

            .then(async(result) => {
                const userData = result[0]
                const hashWord = userData.password
                const userRefreshToken = userData.refreshtoken
                const correct = await bcrypt.compare(body.password, hashWord)

                if (correct) {
                    if(userData.active == 1){
                        jwt.sign(
                            { 
                              email : userData.email,
                              username : userData.username,
                            },
                            JWT_KEY,
                            { expiresIn: 120 },
    
                            (err, token) => {
                                if (err) {
                                    console.log(err)
                                } else {
                                    if(userRefreshToken === null){
                                        const id = userData.iduser
                                        const refreshtoken = jwt.sign( 
                                            {id} , JWT_KEY)
                                        usersModel.updateRefreshToken(refreshtoken,id)
                                        .then(() => {
                                            const data = {
                                                iduser: userData.iduser,
                                                username: userData.username,
                                                token: token,
                                                refreshtoken: refreshtoken
                                            }
                                            tokenStatus(res, data, 'Login Success')
                                        }).catch((err) => {
                                            failed(res,[], err.message)
                                        })
                                    }else{
                                        const data = {
                                            iduser: userData.iduser,
                                            username: userData.username,
                                            token: token,
                                            refreshtoken: userRefreshToken
                                        }
                                        tokenStatus(res, data, 'Login Success')
                                    }
                                }
                            }
                        ) 
                    }else{
                        failed(res, [], "Need Activation")
                    }
                } else {
                    failed(res, [], "Incorrect password! Please try again")
                }
            })
            .catch((err) => {
                failed(res, [], err.message)
            })
        } catch (error) {
            failed(res, [], 'Internal server error!')
        }
    },
    renewToken: (req, res) =>{
        const refreshtoken = req.body.refreshtoken
        usersModel.checkRefreshToken(refreshtoken)
        .then((result)=>{
            if(result.length >=1){
                const user = result[0];
                const newToken = jwt.sign(
                    {
                        email: user.email,
                        username: user.username
                    },
                    JWT_KEY,
                    {expiresIn: 3600}
                )
                const data = {
                    token: newToken,
                    refreshtoken: refreshtoken
                }
                tokenStatus(res,data, `The token has been refreshed successfully`)
            }else{
                failed(res,[], `Refresh token not found`)
            }
        }).catch((err) => {
            failed(res, [], err.message)
        })
    },
    logout: (req,res) => {
        try {
            const destroy = req.params.iduser
            usersModel.logout(destroy)
            .then((result) => {
                success(res,result, `Logout Success`)
            }).catch((err) => {
                failed(res,[], err.message)
            })
        } catch (error) {
            failed(res, [], `Internal Server Error`)
        }
    },
    ForgotPassword: (req,res) => {
        try {
            const body = req.body
            const email = body.email
            usersModel.getEmailUsers(body.email)

            .then(() => {
                const userKey = jwt.sign({
                    email: body.email,
                    username: body.username
                }, JWT_KEY)

                usersModel.updateUserKey(userKey,email)
                .then(async() => {
                    let transporter = mailer.createTransport({
                        host: 'smtp.gmail.com',
                        port: 587,
                        secure: false,
                        requireTLS: true,
                        auth:{
                            user: emaill,
                            pass: passwordd
                        }
                    })
    
                    let mailOptions = {
                        from    : `ANKASA ${emaill}`,
                        to      : body.email,
                        subject : `Reset Password ${body.email}`,
                        html:
                        `Hai
                        This is an email to reset the password
                        KLIK --> <a href="${urlforgot}/forgot?userkey=${userKey}">Klik this link for Reset Password</a>  <---`
                    }
    
                    transporter.sendMail(mailOptions,(err, result) => {
                        if(err) {
                            res.status(505)
                            failed(res, [], err.message)
                        } else {
                            success(res, [result], `Send Mail Success`)
                        }
                    })
                    res.json({
                        message: `Please Check Email For Reset Password`
                    })
                }).catch((err) =>{
                    failed(res, [], err)
                })
            }).catch((err) =>{
                failed(res, [], err)
            })
        } catch (error) {
            failed(res, [], `Internal Server Error`)
        }
    },
    newPassword: async (req, res) => {
        try {
            const body = req.body
            
            const salt = await bcrypt.genSalt(10)
            const hashWord = await bcrypt.hash(body.password, salt)

            const key = req.params.userkey

            usersModel.newPassword(hashWord ,key)

            .then((result) => {
                success(res, result, `Update Password Success`)
                jwt.verify(key, JWT_KEY, (err,decode) =>{
                    if(err){
                        res.status(505)
                        failed(res, [], `Failed Reset userkey`)
                    }else{
                        const email = decode.email
                        console.log(email)
                        usersModel.resetKey(email)
                        .then((results) => {
                            if(results.affectedRows){
                                res.status(200)
                                success(res, results, `Update Password Success`)
                            }else{
                                res.status(505)
                                // failed(res,[],err.message)
                            }
                        }).catch((err) => {
                            // failed(res, [], err)
                        })
                    }
                })
            }).catch((err) => {
                failed(res, [], err)
            })        
        } catch (error) {
            failed(res, [], `Internal Server Error`)
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
    },
    insert: (req, res) => {
        try {
            upload.single('image')(req, req, (err) => {
                if(err) {
                    if(err.code === 'LIMIT_FILE_SIZE'){
                        failed(res, [], 'Image size is too big! Please upload another one with size <5mb')
                    } else {
                        failed(res, [], err)
                    }
                } else {
                    const body = req.body
                    body.image = req.file.filename
                    usersModel.insert(body)
                    .then((result) => {
                        success(res, result, 'Image is uploaded successfully')
                    })
                    .catch((err) => {
                        failed(res, [], err.message)
                    })
                }
            })
        } catch (error) {
            failed(res, [], 'Internal server error!')
        }
    },
    update:(req, res) => {
        try {
            upload.single('image')(req, res, (err) => {
                if(err){
                    if(err.code === 'LIMIT_FILE_SIZE'){
                        failed(res, [], 'Image size is too big! Please upload another one with size <5mb')
                    } else {
                        failed(res, [], err)
                    }
                } else {
                    const iduser = req.params.iduser
                    const body = req.body
                    usersModel.getDetail(iduser)
                    .then((result) => {
                        const oldImg = result[0].image
                        body.image = !req.file ? oldImg: req.file.filename
                        if (body.image !== oldImg) {
                            if (oldImg !== '404.png') {
                                fs.unlink(`src/uploads/${oldImg}`, (err) => {
                                    if (err) {
                                        failed(res, [], err.message)
                                    } else {
                                        usersModel.update(body, iduser)
                                            .then((result) => {
                                                success(res, result, 'Update success')
                                            })
                                            .catch((err) => {
                                                failed(res, [], err.message)
                                            })
                                    }
                                })
                            } else {
                                usersModel.update(body, iduser)
                                    .then((result) => {
                                        success(res, result, 'Update success')
                                    })
                                    .catch((err) => {
                                        failed(res, [], err.message)
                                    })
                            }
                        } else {
                            usersModel.update(body, iduser)
                                .then((result) => {
                                    success(res, result, 'Update success')
                                })
                                .catch((err) => {
                                    failed(res, [], err.message)
                                })
                        }
                    })
                }
            })
        } catch (error) {
            failed(res, [], 'Internal server error!')
        }
    },
    delete: (req, res) => {
        try {
            const iduser = req.params.iduser
            usersModel.getDetail(iduser)
            .then((result) => {
                const image = result[0].image
                if(image === '404.png'){
                    usersModel.delete(iduser)
                    .then((result) => {
                        success(res, result, `User with id=${iduser} is deleted!`)
                    })
                    .catch((err) => {
                        failed(res, [], err.message)
                    })
                }else{
                    fs.unlink(`src/uploads/${image}`, (err) => {
                        if(err) {
                            failed(res, [], err.message)
                        } else {
                            usersModel.delete(iduser)
                            .then((result) => {
                                success(res, result, `User with id ${iduser} is deleted!`)
                            })
                            .catch((err) => {
                                failed(res, [], err.message)
                            })
                        }
                    })
                }
            })
            .catch((err) => {
                failed(res, [], err.message)
            })
        } catch (error) {
            failed(res, [], 'Internal server error!')
        }
    }
}

module.exports = users