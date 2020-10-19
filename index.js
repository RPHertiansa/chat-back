const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const ejs = require('ejs')
const path = require('path')
const http  = require('http')
const socketio = require('socket.io')
const { PORT } = require('./src/helpers/env')
const messageModel = require('./src/models/message')
const userModel = require('./src/models/users')
const usersRouter = require('./src/routes/users')
const friendsRouter = require('./src/routes/friends')
const friendsModel = require('./src/models/friends')

const app = express()
app.set('views', path.join(__dirname,'src/views'))
app.set('view engine', 'ejs')

// app.use(express.static(path.join(__dirname, './dist')))

// app.use('*', (req,res) => {
//     res.sendFile(__dirname, './dist/index.html')
// })

// app.get('/*', (req,res) => {
//     res.sendFile(path.join(__dirname, './dist/index.html'))
// })

const server = http.createServer(app)
const io = socketio(server)



app.use(bodyParser.urlencoded({ extended: false}))
app.use(bodyParser.json())

app.use(express.static('src/uploads'))

app.use(cors())

app.use('/api/v1/users', usersRouter)
app.use('/api/v1/friends', friendsRouter)

io.on('connection', (socket) => {
    console.log('user connected')

    socket.on('join-room', (payload) => {
        socket.join(payload)
    })
    socket.on('get-all-friends',(payload)=> {
        friendsModel.findFriends(payload.username)
        .then((result) => {
            io.emit('friendList',result)
        })
        .catch((err) => {
            console.log(err)
        })
    })
    socket.on('get-history', (payload) => {
        messageModel.getMessages(payload)
        .then((result) => {
            io.to(payload.sender).emit('historyMessage', result)
        }).catch((err)=> {
            console.log(new Error(err))
        })
    })
    

    socket.on('send-message', (payload) => {
        messageModel.sendMessage(payload)
        .then((result) => {
            const room = payload.receiver
            io.to(room).emit('private-message', {
                sender: payload.sender,
                msg: payload.message,
                receiver: room
            })
        })
        .catch((err) => {
            console.log(err)
        })
    })
    
})
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})