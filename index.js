const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const http  = require('http')
const socketio = require('socket.io')
const { PORT } = require('./src/helpers/env')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const usersRouter = require('./src/routes/users')

app.use(bodyParser.urlencoded({ extended: false}))
app.use(bodyParser.json())

app.use(cors())

app.use('/api/v1/users', usersRouter)

io.on('connection', (socket) => {
    console.log('user connected')

    socket.on('sendMessage', (payload) => {
        io.emit('receiveMessage', `${payload.username} : ${payload.message}`)
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