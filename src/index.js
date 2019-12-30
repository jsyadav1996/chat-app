const path = require('path');
const express = require('express');
const app = express();
const socketio = require('socket.io');
const http = require('http');
const {generateMessage, generateLocationMessage} = require('./utils/messages');
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users');

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));
const server = http.createServer(app);
const io = socketio(server);

app.get('/', function (req, res) {
    res.send('hello world')
})

io.on('connection', (socket) => {
    // socket.emit('message', 'welcome');
    socket.on('join', ({username, room}, callback) => {
        const {error, user} = addUser({id: socket.id, username, room});
        if(error){
            return callback(error);
        }
        socket.join(user.room);
        socket.emit('message', generateMessage('Admin', `Welcome!`));
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });
        callback();
    });
    socket.on('message', (message) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('message', generateMessage(user.username, message));
    });
    socket.on('sendlocation', (position, callback) => {
        const user = getUser(socket.id);
        // console.log(generateLocationMessage(`https://google.com/maps?q=${position.latitude},${position.longitude}`));
        io.to(user.room).emit('sendlocation', generateLocationMessage(user.username, `https://google.com/maps?q=${position.latitude},${position.longitude}`));
        callback();
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if(user){
            io.to(user.room).emit('message', generateMessage(`${user.username} has left!`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            });
        }
    });
    // console.log('socket connected');
})

server.listen(port, () => {
    console.log(`Server running on port ${port}!`);
})

