const express = require('express');
const { v4: uuidv4 } = require('uuid'); //generates random unique ids (each room has a different id)
const app = express();
const httpServer = require('http').Server(app);
const io = require('socket.io')(httpServer)


//*WebRTC stands for Web Real-Time Communication and it's a collection of APIs that allows direct connection between browsers in order to exchange any type of data.
//*PeerJS simplifies WebRTC peer-to-peer data, video, and audio calls. 
//*PeerJS wraps the browser's WebRTC implementation to provide a complete, configurable, and easy-to-use peer-to-peer connection API.
const { ExpressPeerServer }  = require('peer')
const peerServer = ExpressPeerServer(httpServer, {
    debug: true
})
app.use('/peerjs', peerServer)

app.use(express.static('public'))

//setting the view engine to ejs files, so that they actually render
app.set('view engine', 'ejs')

app.get('/', (req, res, next) => {
    res.redirect(`/${uuidv4()}`)    //generating a unique id, and redirecting user to /id, if you visit "/"
})

//instead of localhost/ we wanna have localhost/roomid, so that there're unique ids
app.get('/:room', (req, res, next) => {
    res.statusCode = 200
    //passing in a parameter so that it can be used in room.ejs
    res.render('room', { roomId: req.params.room })
})


//*Socket.IO is a JavaScript library for realtime web applications. 
//*It enables realtime, bi-directional communication between web clients and servers

//socket.io gives access to two-way communication between you and the server
//usually in http, you send a request and the server sends a response
//for socket.io the server can directly respond without any requests
io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)
        //when someone joins the room, everyone gets to know (broadcast speaks for itself)
        socket.to(roomId).broadcast.emit('user-connected', userId)

        //socket listening for an input message
        socket.on('message', msg => {
            //emit the message only to the pariticular room
            io.to(roomId).emit('createMessage', msg)
        })
    })
})

httpServer.listen(3030)