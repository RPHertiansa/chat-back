const db = require('../configs/db')

const friends = {
    addFriends : (data) => {
        return new Promise ((resolve, reject) => {
            db.query(`INSERT INTO friends SET ?`, data, (err, result) => {
                if(err) {
                    reject(new Error(err))
                } else {
                    resolve(result)
                }
            })
        })
    },
    findFriends : (username) => {
        return new Promise ((resolve, reject) => {
            db.query(`SELECT iduser, name, username, email, image, phonenumber, address, lat, lon, bio FROM friends INNER JOIN users ON friends.friend = users.username WHERE users = '${username}'`, (err, result) => {
                if(err) {
                    reject (new Error(err))
                } else {
                    resolve (result)
                }
            })
        })
    }
}

module.exports = friends