const db = require('../configs/db')

const message = {
    insert: (data) => {
        return new Promise((resolve, reject) => {
          db.query('INSERT INTO message SET ?', data, (err, result) => {
            if(err) {
              reject(new Error(err))
            } else {
              resolve(result)
            }
          })
        })
      },
      get: (payload) => {
        return new Promise((resolve, reject) => {
          db.query(`SELECT * FROM message WHERE (sender='${payload.sender}' AND receiver='${payload.receiver}') OR (sender='${payload.receiver}' AND receiver='${payload.sender}')`, (err, result) => {
            if(err) {
              reject(new Error(err))
            } else {
              resolve(result)
            }
          })
        })
      }
}

module.exports = message