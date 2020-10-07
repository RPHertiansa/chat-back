const db = require('../configs/db')

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
            db.query(`SELECT * FROM users WHERE username = ? `,data.username, (err, result) => {
                if(err) {
                    reject(new Error(err))
                } else {
                    resolve(result)
                }
            })
        })
    },
    logout: (iduser) => {
        return new Promise((resolve, reject) => {
            db.query(`UPDATE users SET refreshtoken = null WHERE iduser = '${iduser}'`, (err, result) => {
                if (err) {
                    reject (new Error(err))
                } else {
                    resolve(result)
                }
            })
        })
    },
    getAll: () => {
        return new Promise ((resolve, reject) => {
            db.query(`SELECT * FROM users`, (err, result) => {
                if(err) {
                    reject(new Error(err))
                } else {
                    resolve(result)
                }
            })
        })
    },
    getDetail: (iduser) => {
        return new Promise((resolve, reject) => {
            db.query(`SELECT * FROM users WHERE iduser = '${iduser}'`, (err, result) => {
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
                if(err) {
                    reject(new Error(err))
                } else {
                    resolve(result)
                }
            })
        })
    }
}

module.exports = users