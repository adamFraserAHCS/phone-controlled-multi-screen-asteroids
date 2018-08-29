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

var arenaLeft = io.of('/arenaSpaceLeft');
var arenaRight = io.of('/arenaSpaceRight');

arenaLeft.on('connection', function(socket) {
    socket.emit('recieve entity', {isLeft: false, y:250, vX:9});

    socket.on('switchScreens', function(data){
        arenaRight.emit('recieve entity', {isLeft: data.isLeft, y: data.y, vX: data.vX});
    })
});

http.listen(3000, '0.0.0.0', function() {
    console.log('listening on *:3000');
});