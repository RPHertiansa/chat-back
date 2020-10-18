const db = require('../configs/db');

const users = {
    register: (data) => {
        return new Promise((resolve, reject) => {
            db.query(`INSERT INTO users SET ?`, data, (err, result) => {
                if (err) {
                    reject(new Error(err))
                } else {
                    resolve(result)
                }
            })
        })
    },
    login: (data) => {
        return new Promise((resolve, reject) => {
            db.query(`SELECT * FROM users WHERE username = '${data.username}'`,  (err, result) => {
                if (err) {
                    reject (new Error(err))
                } else {
                    resolve(result)
                }
            })
        })
    },
    logout:(iduser) => {
        return new Promise((resolve,reject) => {
            db.query(`UPDATE users SET refreshToken = null WHERE iduser='${iduser}'`,
            (err,result)=> {
                if (err) {
                    reject (new Error(err))
                } else {
                    resolve(result)
                }
            })
        })
    }, 
    updateRefreshToken:(token,iduser) => {
        return new Promise((resolve,reject) => {
            db.query(`UPDATE users SET refreshToken='${token}' WHERE iduser='${iduser}'`,
            (err,result) => {
                if(err) {
                    reject(new Error(err))
                }else{
                    resolve(result)
                }
            })
        })
    },
    newPassword:(password,userkey) => {
        return new Promise((resolve,reject) => {
            db.query(`UPDATE users SET password='${password}' WHERE userkey='${userkey}'`,
            (err,result) => {
                if(err) {
                    reject(new Error(err))
                }else{
                    resolve(result)
                }
            })
        })
    },
    resetKey:(email) => {
        return new Promise((resolve,reject) => {
            db.query(`UPDATE users SET userkey= null WHERE email='${email}'`,
            (err,result) => {
                if(err) {
                    reject(new Error(err))
                }else{
                    resolve(result)
                }
            })
        })
    },
    updateUserKey:(userKey,email) => {
        return new Promise((resolve,reject) => {
            db.query(`UPDATE users SET userkey='${userKey}' WHERE email='${email}'`,
            (err,result) => {
                if(err) {
                    reject(new Error(err))
                }else{
                    resolve(result)
                }
            })
        })
    },
    checkRefreshToken: (refreshToken) => {
        return new Promise((resolve,reject)=>{
            db.query(`SELECT *FROM users WHERE refreshToken='${refreshToken}'`, 
            (err,result) =>{
                if(err){
                    reject(new Error(err))
                }else{
                    resolve(result)
                }
            })
        })  
    },
    getAll: () => {
        return new Promise((resolve, reject) => {
            db.query(`SELECT * FROM users`, (err, result) => {
                if (err) {
                    reject (new Error(err))
                } else {
                    resolve(result)
                }
            })
        })
    },
    getDetail: (iduser) => {
        return new Promise((resolve, reject) => {
            db.query(`SELECT * FROM users WHERE iduser ='${iduser}'`, (err, result) => {
                if (err) {
                    reject(new Error(err))
                } else {
                    resolve(result)
                }
            })
        })
    },
    update: (data, iduser) => {
        return new Promise((resolve, reject) => {
            db.query(`UPDATE users SET ? WHERE iduser=?`, [data, iduser], (err, result) => {
                if(err) {
                    reject(new Error(err))
                } else {
                    resolve(result)
                }
            })
        })
    },
    delete: (iduser) => {
        return new Promise((resolve, reject) => {
            db.query(`DELETE FROM users WHERE iduser = '${iduser}'`, (err, result) => {
                if (err) {
                    reject(new Error(err))
                } else {
                    resolve(result)
                }
            })
        })
    },
    activateUser: (data) => {
        return new Promise((resolve, reject) => {
            db.query(`UPDATE users SET is_active = 1 WHERE email = '${data}'`, (err,result) => {
                if(err){
                    reject(new Error(err))
                }else{
                    resolve(result)
                }
            })
        })
    },
    getEmail: (email) => {
        return new Promise((resolve, reject) => {
            db.query(`SELECT * FROM users WHERE email ='${email}'`, (err, result) => {
                if(err){
                    reject(new Error(err))
                }else{
                    if(result.length > 0){
                        resolve(result)
                    }else{
                        reject(`Email tidak ditemukan`)
                    }
                }
            })
        })
    }
};
module.exports = users