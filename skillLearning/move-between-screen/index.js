var express = require('express');
var app = express();
var http = require('http').Server(app); //why?
var path = require('path');
var io = require('socket.io')(http);

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'arena/arena.html'));
});

var displaySpace = io.of('/arenaSpace');
var controlSpace = io.of('/controlSpace');
controlSpace.on('connection', function(socket) {
    socket.on('controlerSayMove', function(data) {
        displaySpace.emit('positionChange', {x:data.x, y:data.y})
    })
});


http.listen(3000, '0.0.0.0', function() {
    console.log('listening on *:3000');
});