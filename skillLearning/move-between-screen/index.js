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

    // socket.emit('recieve entity', {isLeft: false, y:250, vX:9});

    socket.on('ooh pick me!', function(data) {
        socket.emit('recieve entity', {isLeft: true, y: 250, vX: 12});
    })

    socket.on('switchScreens', function(data){
        var sendTo = getNextScreen(socket.id, data.isLeft);
        console.log(sendTo);
        var data2Send = {
            'isLeft': data.isLeft,
            'vX': data.vX,
            'vY': data.vY,
            'y': data.y
        }
        arena.emit('recieve entity', {isLeft: data.isLeft, y: data.y, vX: data.vX});
    })
});

function getNextScreen(currentScrID, isLeft) {
    for(var i = 0; i < displays.length; i++) {
        if(displays[i] == currentScrID) { break; }
    }

    // if the asteroid is coming from the left
    //of one screen to the right of annother
    if(isLeft) {
        if(i == 0) {
            return displays[displays.length - 1];
        } else {
            return displays[i - 1];
        }
    } else {
        if(i == displays.length - 1) {
            return displays[0];
        } else {
            return displays[i + 1];
        }
    }
}

http.listen(3000, '0.0.0.0', function() {
    console.log('listening on *:3000');
});