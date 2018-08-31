var express = require('express');
var app = express();
var http = require('http').Server(app); //why?
var path = require('path');
var io = require('socket.io')(http);

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, 'arena/arena.html'));
});

var arenaSpace = io.of('/arenaSpace');

var displays = [];
var ballSent = false;
arenaSpace.on('connection', function(socket) {
    displays.push({id: socket.id, socket: socket});

    if(!ballSent) {
        socket.emit('recieve entity', {isLeft: false, y:250, vY: 0, vX:-15});
        ballSent = true;
    }

    socket.on('switchScreens', function(data){
        var sendTo = getNextScreen(socket.id, data.isLeft);
        var dataToSend = {
            isLeft: !data.isLeft,
            y: data.y,
            vX: data.vX,
            vY: data.vY
        }

        // arenaSpace.emit('recieve entity', {isLeft: !data.isLeft, y: data.y, vX: data.vX});
        sendTo.emit('recieve entity', dataToSend);
    })
});

function getNextScreen(currentScrID, isLeft) {
    for(var i = 0; i < displays.length; i++) {
        if(displays[i].id == currentScrID) { break; }
    }

    // if the asteroid is coming from the left
    //of one screen to the right of annother
    if(isLeft) {
        if(i == 0) {
            return displays[displays.length - 1].socket;
        } else {
            return displays[i - 1].socket;
        }
    } else {
        if(i == displays.length - 1) {
            return displays[0].socket;
        } else {
            return displays[i + 1].socket;
        }
    }
}

http.listen(3000, '0.0.0.0', function() {
    console.log('listening on *:3000');
});

//IDEA ADD OFFSET? e.g. one screen starts at y = 0 annother at y = 500