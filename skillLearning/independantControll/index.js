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

//comes with submit of form
//SUPER SLOPPY
//could do it with IP, session, a ticket sort of like in a shoe shop
var tempData = new Object();
app.post('/cSet', function(req, res) {
    res.sendFile(path.join(__dirname, 'controller.html'));
    // console.log(req.body)
    tempData.color = req.body.color;
});

var arenaSpace = io.of('/arenaSpace');

var displays = [];

arenaSpace.on('connection', function(socket) {
    //players should mirror the entites list in arena.html
    displays.push({id: socket.id, socket: socket, players: []});
    console.log(displays.length + " displays connected\n");
    

    //doesn't work!!!
    socket.on('disconnect', function() {
        console.log(socket.id + " disconnected :C");
        removeDisplay(socket.id);
    })

    socket.on('switchScreens', function(data){

        var sendFromIndex = getCurrentScreenIndex(data.scrID)
        var sendToIndex = getNextScreen(data.scrID, data.isLeft);
        var sendToSocket = displays[sendToIndex].socket;

        displays[sendToIndex].players.push(data.UID);
        removePlayerFromDisplay(sendFromIndex, data.UID);

        var dataToSend = {
            isLeft: !data.isLeft,
            y: data.y,
            vX: data.vX,
            vY: data.vY,
            UID: data.UID,
            scrID: sendToSocket.id,
            color: data.color
        }

        // arenaSpace.emit('recieve entity', {isLeft: !data.isLeft, y: data.y, vX: data.vX});
        sendToSocket.emit('recieve entity', dataToSend);
    })
});

function getCurrentScreenIndex(currentScrID) {
    for(var i = 0; i < displays.length; i++) {
        if(displays[i].id == currentScrID) { return i; }
    }
}

function removePlayerFromDisplay(sendFromIndex, UID) {
    for(var i = 0; i < displays[sendFromIndex].players.length; i++) {
        if(displays[sendFromIndex].players[i] == UID) {
            displays[sendFromIndex].players.splice(i,1);
        }
    }
}

function getNextScreen(currentScrID, isLeft) {
    for(var i = 0; i < displays.length; i++) {
        if(displays[i].id == currentScrID) { break; }
    }

    // if the asteroid is coming from the left
    //of one screen to the right of annother
    if(isLeft) {
        if(i == 0) {
            return displays.length - 1
        } else {
            return i-1
        }
    } else {
        if(i == displays.length - 1) {
            return 0
        } else {
            return i+1
        }
    }
}

function removeDisplay(displayID) {
    for(var i = 0; i < displays.length; i++) {
        if(displays[i].id == currentScrID) { break; }
    }

    displays.splice(i, 1);
}


function addNewPlayer(UID) {
    displays[0].socket.emit('recieve entity', {isLeft: true, y:Math.random() * 600, vY: 0, vX:0, UID: UID, scrID: displays[0].id, color: tempData.color});
    displays[0].players.push(UID);
}

function getPlayerScreen(UID) {
    for(var scr = 0; scr < displays.length; scr++) {
        for(var player = 0; player < displays[scr].players.length; player++) {
            if(displays[scr].players[player] == UID) { return displays[scr].socket; }
        }
    }
}

var controlSpace = io.of('/controlSpace');


//INNEFICIENT AF
controlSpace.on('connection', function(socket) {
    console.log("controller connected");   
    addNewPlayer(socket.id); 
    socket.on('controlerSayMove', function(data) {
        var currentDisplay = getPlayerScreen(socket.id);
        currentDisplay.emit('accelerationCmd', {UID:socket.id, ax:data.ax, ay:data.ay});
    });
});

http.listen(3000, '0.0.0.0', function() {
    console.log('listening on *:3000');
});


//IDEA ADD OFFSET? e.g. one screen starts at y = 0 annother at y = 500