var express = require('express');
var app = express();
var http = require('http').Server(app); //why?
var path = require('path');
var io = require('socket.io')(http);
var multer = require('multer');
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));

app.get('/d', function(req, res) {
    res.sendFile(path.join(__dirname, 'arena.html'));
});
app.get('/c', function(req, res) {
    res.sendFile(path.join(__dirname, 'controllerHome.html'));
});

app.post('/cSet', function(req, res) {
    res.sendFile(path.join(__dirname, 'controller.html'));
    console.log(req.body)
});

var arenaSpace = io.of('/arenaSpace');

var displays = [];
var currentDisplay;
var ballSent = false;
arenaSpace.on('connection', function(socket) {
    displays.push({id: socket.id, socket: socket});
    console.log(displays.length + " displays connected\n");
    

    socket.on('disconnect', function() {
        console.log(socket.id + " disconnected :C");
        removeDisplay(socket.id);
    })

    if(!ballSent) {
        socket.emit('recieve entity', {isLeft: true, y:400, vY: 0, vX:2});
        currentDisplay = socket;

        socket.emit('recieve entity', {isLeft: true, y:100, vY: 0, vX:0});
        currentDisplay = socket;

        ballSent = true;
    }

    socket.on('switchScreens', function(data){
        var sendTo = getNextScreen(socket.id, data.isLeft);
        currentDisplay = sendTo;
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

function removeDisplay(displayID) {
    for(var i = 0; i < displays.length; i++) {
        if(displays[i].id == currentScrID) { break; }
    }

    displays.splice(i, 1);
}

var controlSpace = io.of('/controlSpace');

controlSpace.on('connection', function(socket) {
    console.log("controller connected");    
    socket.on('controlerSayMove', function(data) {
        if(currentDisplay) {
            currentDisplay.emit('accelerationCmd', {ax:data.ax, ay:data.ay})
        }
    })
});

http.listen(3000, '0.0.0.0', function() {
    console.log('listening on *:3000');
});

//IDEA ADD OFFSET? e.g. one screen starts at y = 0 annother at y = 500