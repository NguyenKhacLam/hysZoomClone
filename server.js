const express = require('express');
const app = express();
const path = require('path');
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuidv4 } = require('uuid');
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
})

app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))
app.use('/peerjs', peerServer);

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/join',(req, res)=>{
    res.redirect(`/room/${uuidv4()}`)
})


app.get('/room/:roomId', (req,res)=>{
    res.render('room', { roomId: req.params.roomId })
})

io.on('connection', socket =>{
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)
        socket.to(roomId).broadcast.emit('user-connected', userId);
        
        socket.on('disconnect', () => {
            socket.to(roomId).broadcast.emit('user-disconnected', userId)
        })
    })
})

server.listen(5000);
