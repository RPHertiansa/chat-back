const usersModel = require('../models/users')
const { success, failed, tokenStatus } = require('../helpers/response')
const { JWT_KEY, myemail, mypassword, url, urlforgot } = require('../helpers/env')
const upload = require('../helpers/uploads')
const fs = require('fs')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const mailer = require('nodemailer')
const response = require('../helpers/response')

const users = {
    register: async (req, res) => {
        try {
            const body = req.body

            const salt = await bcrypt.genSalt(10)
            const hashWord = await bcrypt.hash(body.password, salt)
            const username = body.name.replace(/[^0-9a-z]/gi, '')

            const data = {
                name : body.name,
                email : body.email,
                username : username,
                password : hashWord,
                image : 'pp.jpg'
            }

            usersModel.register(data)
            .then(() => {
                const hashWord = jwt.sign({
                    email: data.email,
                    name: data.name
                }, JWT_KEY)

                let transporter = mailer.createTransport({
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
                    from: `PEWORLD ${myemail}`,
                    to: data.email,
                    subject: `HELLO ${data.name}`,
                    html:
                        `Hai <h1><b>${data.name}<b></h1> </br>
                    PLEASE ACTIVATE YOUR EMAIL ! <br>
                    and You can Login with your <b>Nama Perekrut : ${data.name}<b> <br>
                    CLICK --> <a href="${url}users/verify/${hashWord}"> Activation</a>  <---`
                }

                transporter.sendMail(mailOptions, (err, result) => {
                    if (err) {
                        res.status(505)
                        failed(res, [], err.message)
                    } else {
                        success(res, [result], `Success Registration, Please activate your email`)
                        // success(res, [result], `Send Mail Success`)
                    }
                })

                res.json({
                    message: `Success Registration, Please activate your email`
                })
            })
            .catch((err) => {
                failed(res, [], err.message)
            })
        } catch (error) {
            failed(res, [], 'Internal server error!')            
        }
    },
    verify: (req,res) => {
        const token = req.params.token
        if(token) {
            jwt.verify(token, JWT_KEY, (err,decode) => {
                if(err){
                    res.status(505)
                    failed(res, [], `Failed Activation`)
                }else{
                    const email = decode.email
                    const name = decode.name
                    usersModel.activateUser(email)
                    .then((result) => {
                        if(result.affectedRows){
                            res.status(200)
                            res.render('perekrut', {email, name})
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
                const userRefreshToken = userData.refreshToken
                const correct = await bcrypt.compare(body.password, hashWord)

                if (correct) {
                    if(userData.is_active === 1){
                        jwt.sign(
                            { 
                              username : userData.username,
                              name : userData.name,
                            },
                            JWT_KEY,
                            { expiresIn: 120 },
    
                            (err, token) => {
                                if (err) {
                                    console.log(err)
                                } else {
                                    if(userRefreshToken === null){
                                        const id = userData.iduser
                                        const refreshToken = jwt.sign( 
                                            {id} , JWT_KEY)
                                        usersModel.updateRefreshToken(refreshToken,id)
                                        .then(() => {
                                            const data = {
                                                iduser: userData.iduser,
                                                name: userData.name,
                                                username: userData.username,
                                                email: userData.email,
                                                token: token,
                                                refreshToken: refreshToken
                                            }
                                            tokenStatus(res, data, 'Login Success')
                                        }).catch((err) => {
                                            failed(res,[], err.message)
                                        })
                                    }else{
                                        const data = {
                                            iduser: userData.iduser,
                                            name: userData.name,
                                            username: userData.username,
                                            email: userData.email,
                                            token: token,
                                            refreshToken: userRefreshToken
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
        const refreshToken = req.body.refreshToken
        usersModel.checkRefreshToken(refreshToken)
        .then((result)=>{
            if(result.length >= 1){
                const userData = result[0];
                const newToken = jwt.sign(
                    {
                        email : userData.email,
                        name : userData.name 
                    },
                    JWT_KEY,
                    {expiresIn: 3600}
                )
                const data = {
                    token: newToken,
                    refreshToken: refreshToken
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
            const iduser = req.params.iduser
            usersModel.logout(iduser)
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
            usersModel.getEmail(email)
            .then(() => {
                const userkey = jwt.sign({
                    email: body.email,
                    name: body.name
                }, JWT_KEY)

                usersModel.updateUserKey(userkey, email)
                .then(async() => {
                    let transporter = mailer.createTransport({
                        host: 'smtp.gmail.com',
                        port: 587,
                        secure: false,
                        requireTLS: true,
                        auth:{
                            user: myemail,
                            pass: mypassword
                        }
                    })
    
                    let mailOptions = {
                        from    : `PEWORLD ${myemail}`,
                        to      : body.email,
                        subject : `Reset Password ${body.email}`,
                        html:
                        `Hai
                        This is an email to reset the password
                        KLIK --> <a href="${urlforgot}/resetpass-perekrut?userkey=${userkey}">Klik this link for Reset Password</a>  <---`
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
                failed(res, [], err.message)
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
                success(res, result, 'Here are the perekrut that data you requested')
            })
            .catch((err) => {
                failed(res, [], err)
            })
        } catch (error) {
            failed(res, [], 'Internal server error!')
        }
    },
    getDetail: (req, res) => {
        try {
            const iduser = req.params.iduser
            console.log(iduser)
            usersModel.getDetail(iduser)
            .then((result) => {
                success(res, result, `Here is the user with id ${iduser}`)
            })
            .catch((err) => {
                failed(res, [], err.message)
            })
        } catch (error) {
            failed(res, [], 'Internal server error!')
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
                        const body = req.body
                        console.log(body)
                    }
                } else {
                    const iduser = req.params.iduser
                    const body = req.body
                    usersModel.getDetail(iduser)
                    .then((result) => {
                        const oldImg = result[0].image
                        body.image = !req.file ? oldImg: req.file.filename
                        if (body.image !== oldImg) {
                            if (oldImg !== 'pp.jpg') {
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
                if(image === 'pp.jpg'){
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