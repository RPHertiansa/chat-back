const db = require('../configs/db')

const message = {
    sendMessage : (payload) => {
      return new Promise ((resolve, reject) => {
          db.query(`INSERT INTO message (sender, receiver, message) VALUES ('${payload.sender}', '${payload.receiver}', '${payload.message}')`, (err, result) => {
              if(err) {
                  reject (new Error(err))
              } else {
                  resolve(result)
              }
          })
      })
  },
  getMessages : (payload) => {
      return new Promise ((resolve, reject) => {
          db.query(`SELECT * FROM message WHERE (sender = '${payload.sender}' AND receiver = '${payload.receiver}') OR (sender = '${payload.receiver}' AND receiver = '${payload.sender}') `,(err, result) => {
              if (err) {
                  reject(new Error(err))
              } else {
                  resolve(result)
              }
          })
      })
  }
}

module.exports = message