const friendsModel = require('../models/friends')
const { success, failed } = require('../helpers/response')

const hire = {
    addFriends: (req, res) => {
        try {
            const body = req.body
            
            friendsModel.addFriends(body)
            .then((result) => {
                const data = {
                    users: body.friend,
                    friend: body.users
                }
                friendsModel.addFriends(data)
                .then(() => {
                })
                .catch((err) => {
                    console.log(err)
                })
                success(res, result, 'Friend is added')
            })
            .catch((err) => {
                failed(res, [], err.message)
            })
        } catch (error) {
            failed(res, [], 'Internal server error')
        }
    },
    findFriends: (req, res) => {
        try {
            const username = req.params.username
            friendsModel.findFriends(username)
            .then((result) => {
                success(res, result, 'Here is your friends')
            })
            .catch((err) => {
                failed(res, [], err.message)
            })
        } catch (error) {
            failed(res, [], 'Internal server error')
        }
    }
}


module.exports = hire