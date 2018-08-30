var express = require('express');
var app = express();
var http = require('http').Server(app); //why?
var path = require('path');
var io = require('socket.io')(http);

app.get('/1', function(req, res) {
    res.sendFile(path.join(__dirname, 'arena/arena.html'));
});

app.get('/2', function(req, res) {
    res.sendFile(path.join(__dirname, 'arena/arena2.html'));
});

var arena = io.of('/arenaSpace');
var arenaRight = io.of('/arenaSpaceRight');

var displays = [];

arena.on('connection', function(socket) {

    displays.push(socket.id);

    socket.emit('recieve entity', {isLeft: false, y:250, vX:9});

    socket.on('switchScreens', function(data){
        console.log(getNextSreen(socket.id));
        // io.sockets[getNextSreen(socket.id)].emit('recieve entity', {isLeft: data.isLeft, y: data.y, vX: data.vX});
    })
});

function getNextSreen(socketID) {
    for(var i = 0; i < displays.length; i++) {
        if(displays[i] == socketID) {
            if(i = displays.length - 1) {
                return displays[0];
            } else {
                return displays[i + 1];
            }
        }
    }
}

http.listen(3000, '0.0.0.0', function() {
    console.log('listening on *:3000');
});