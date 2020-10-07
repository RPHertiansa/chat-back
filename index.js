const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const ejs = require('ejs')
const path = require('path')
const http  = require('http')
const socketio = require('socket.io')
const { PORT } = require('./src/helpers/env')
const userController = require('./src/controllers/users')
const userModel = require('./src/models/users')

const app = express()
app.set('views', path.join(__dirname,'src/views'))
app.set('view engine', 'ejs')

const server = http.createServer(app)
const io = socketio(server)

const usersRouter = require('./src/routes/users')

app.use(bodyParser.urlencoded({ extended: false}))
app.use(bodyParser.json())

app.use(express.static('src/uploads'))

app.use(cors())

app.use('/api/v1/users', usersRouter)

io.on('connection', (socket) => {
    console.log('user connected')

    socket.on('sendMessage', (payload) => {
        const message = `${payload.sender} : ${payload.message}`
        io.to(payload.receiver).emit('chatList', message)
    })

    socket.on('join-room', (payload) => {
        socket.join(payload.user)
    })

    socket.on('get-all-users',()=> {
        userModel.getAll()
        .then((result) => {
            io.emit('userList',result)
        })
        .catch((err) => {
            console.log(err)
        })
    })

    socket.on('notification', (username) => {
        socket.broadcast.emit(('get-notified'), `${username} has joined the conversation`)
    })
    socket.on('disconnect', () => {
        console.log('user disconnected')
    })
})


server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})