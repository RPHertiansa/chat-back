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

    socket.on('join-room', (payload) => {
        socket.join(payload)
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
    // socket.on('get-all-pekerja', (payload) => {
    //     hireModel.cariPekerja(payload.idperekrut)
    //     .then((result) => {
    //         if(result.length === 0) {
    //             console.log('pekerja not found')
    //         } else {
    //             io.emit('listPekerja', result)
    //         }
    //     })
    //     .catch((err) => {
    //         console.log(err)
    //     })
    // })
    // socket.on('get-all-perekrut', (payload) => {
    //     hireModel.cariPerekrut(payload.idpekerja)
    //     .then((result) => {
    //         if(result.length === 0) {
    //             console.log('perekrut not found')
    //         } else {
    //             io.emit('listPerekrut', result)
    //         }
    //     })
    //     .catch((err) => {
    //         console.log(err)
    //     })
    // })

    socket.on('get-history', (payload) => {
        console.log(payload)
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
            console.log(`${payload.sender} ${payload.receiver} ${payload.message}`)
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