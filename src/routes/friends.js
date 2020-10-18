const express = require('express');
const friendsController = require('../controllers/friends')
const { authenticate, authorize } = require('../helpers/auth')

const router = express.Router();

router
    .post('/addfriends', authenticate, authorize, friendsController.addFriends)
    .get('/findfriends/:username', authenticate, authorize, friendsController.findFriends)
    
module.exports = router;