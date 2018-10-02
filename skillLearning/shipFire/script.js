var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var scrWidth = canvas.width = window.innerWidth - 10;
var scrHeight = canvas.height = window.innerHeight - 10;

var bolts = [];

var player = new player(Math.random() * scrWidth, Math.random() * scrHeight, 'rgb(0,255,0)', 40, 0);

// bolts.push(new bolt(Math.random() * scrWidth, Math.random() * scrHeight, Math.random() * 100 - 50, Math.random() * 100 - 50, 'rgb(255,0,0)'));
// bolts.push(new bolt(Math.random() * scrWidth, Math.random() * scrHeight, Math.random() * 100 - 50, Math.random() * 100 - 50, 'rgb(255,150,0)'));
// bolts.push(new bolt(Math.random() * scrWidth, Math.random() * scrHeight, Math.random() * 100 - 50, Math.random() * 100 - 50, 'rgb(255,255,0)'));
// bolts.push(new bolt(Math.random() * scrWidth, Math.random() * scrHeight, Math.random() * 100 - 50, Math.random() * 100 - 50, 'rgb(0,255,0)'));
// bolts.push(new bolt(Math.random() * scrWidth, Math.random() * scrHeight, Math.random() * 100 - 50, Math.random() * 100 - 50, 'rgb(0,150,255)'));
// bolts.push(new bolt(Math.random() * scrWidth, Math.random() * scrHeight, Math.random() * 100 - 50, Math.random() * 100 - 50, 'rgb(0,0,255)'));
// bolts.push(new bolt(Math.random() * scrWidth, Math.random() * scrHeight, Math.random() * 100 - 50, Math.random() * 100 - 50, 'rgb(150,0,255)'));



function gameLoop() {
    keyManager();
    update();
    render();

    requestAnimationFrame(gameLoop);
}

function update() {
    player.update();

    for(var i = 0; i < bolts.length; i++) {
        bolts[i].update();
        if(bolts[i].delete) { bolts.splice(i,1); }
    }
}

function render() {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0,0,scrWidth,scrHeight);

    player.render();

    for(var i = 0; i < bolts.length; i++) {
        bolts[i].render();
    }
}



//ENTITIES

function bolt(x,y,vX,vY,color,timeLeft) {
    this.x = x;
    this.y = y;
    this.vX = vX;
    this.vY = vY;
    this.color = color;

    this.timeLeft = timeLeft
    this.delete = false;

    this.render = function() {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = "3";

        ctx.beginPath();
            ctx.moveTo(this.x - this.vX, this.y - this.vY);
            ctx.lineTo(this.x,this.y);
            ctx.stroke();
        ctx.closePath();
    }

    this.update = function() {
        this.timeLeft --;
        if(this.timeLeft <= 0) {
            this.delete = true;
        }

        this.x += this.vX;
        this.y += this.vY;

        if(this.x > scrWidth) { this.x = 0; }
        else if(this.x < 0) { this.x = scrWidth; }

        if(this.y > scrHeight) { this.y = 0; }
        if(this.y < 0) { this.y = scrHeight; }
    }
}

function player(x,y,color,r,theta) {
    this.x = x;
    this.y = y;
    this.vX = 0;
    this.vY = 0;
    this.color = color;
    this.r = r;
    this.theta = theta;
    this.t2Fire = 0;
    
    var nose;

    this.render = function() {
        nose = getPoint(this.r, this.theta);
        nose = {x: this.x + nose.Δx, y: this.y + nose.Δy}

        var rightTail = getPoint(this.r, this.theta + 120);
            rightTail = {x: this.x + rightTail.Δx, y: this.y + rightTail.Δy}

        var leftTail = getPoint(this.r, this.theta + 240);
            leftTail = {x: this.x + leftTail.Δx, y: this.y + leftTail.Δy}
        \
        ctx.fillStyle = this.color;
        ctx.lineWidth = "2"
        
        ctx.beginPath();
            ctx.moveTo(nose.x, nose.y);
            ctx.lineTo(rightTail.x, rightTail.y);
            ctx.lineTo(this.x, this.y);
            ctx.lineTo(leftTail.x, leftTail.y);
            ctx.lineTo(nose.x, nose.y);
        ctx.closePath();
        ctx.fill();
    }

    this.update = function() {

        if(this.t2Fire > 0) {
            this.t2Fire--;
        }

        this.x += this.vX;
        this.y += this.vY;

        if(this.x > scrWidth) { this.x = 0; }
        else if(this.x < 0) { this.x = scrWidth; }

        if(this.y > scrHeight) { this.y = 0; }
        if(this.y < 0) { this.y = scrHeight; }
    }

    this.fire = function() {
        if(this.t2Fire <= 0) { 
            this.t2Fire = 10;
            var vVect = getPoint(15, this.theta);
            bolts.push(new bolt(nose.x, nose.y, vVect.Δx, vVect.Δy, this.color, 100));
        }
    }
}

function getPoint(r,theta) {
    
    Δx = Math.cos(theta / 180 * Math.PI) * r;
    Δy = Math.sin(theta / 180 * Math.PI) * r;

    return {Δx: Δx, Δy: Δy}
}

window.addEventListener("keydown", keyPressed, false);
window.addEventListener("keyup", keyReleased, false);

var keys = [];
function keyPressed(e) {
    keys[e.keyCode] = true;
}

function keyReleased(e) {
    keys[e.keyCode] = false;
}

function keyManager() {
    if(keys[38]) {
        var vect = getPoint(1, player.theta);

        if(getMagnitude(player.vX, player.vY) < 10) {
            player.vX += vect.Δx;
            player.vY += vect.Δy;
        } else {
            player.vX *= 0.99;
            player.vY *= 0.99;
        }

    }
    if(keys[40]) {
        var vect = getPoint(0.5, player.theta);

        if(getMagnitude(player.vX, player.vY) < 10) {
            player.vX -= vect.Δx;
            player.vY -= vect.Δy;
        } else {
            player.vX *= 0.99;
            player.vY *= 0.99;
        }
    }
    if(keys[37]) {
        player.theta -= 3;
    }
    if(keys[39]) {
        player.theta += 3;
    }
    if(keys[32]) {
        player.fire();
    }
}

function getMagnitude(x,y) {
    return Math.sqrt((x*x) + (y*y));
}


gameLoop();

