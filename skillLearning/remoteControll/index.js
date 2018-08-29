var express = require('express');
var app = express();
var http = require('http').Server(app); //why?
var path = require('path');
var io = require('socket.io')(http);

app.use('/display', express.static(path.join(__dirname, 'display/')));
app.use('/control', express.static(path.join(__dirname, 'control/')));

app.get('/display', function(req, res) {
    res.sendFile(path.join(__dirname, 'display/display.html'));
});

app.get('/control', function(req, res) {
    res.sendFile(path.join(__dirname, 'control/control.html'));
});

var displaySpace = io.of('/displaySpace');
var controlSpace = io.of('/controlSpace');
controlSpace.on('connection', function(socket) {
    socket.on('controlerSayMove', function(data) {
        displaySpace.emit('positionChange', {x:data.x, y:data.y})
    })
});


http.listen(3000, '192.168.0.2', function() {
    console.log('listening on *:3000');
});