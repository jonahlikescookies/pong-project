const screen = document.getElementById("screen");
const ctx = screen.getContext("2d");

var y = 50;
var cpuY = 50;
var ballX = screen.width/2;
var ballY = screen.height/2;
var playerPoints = 0;
var cpuPoints = 0;
var ballVelocityX = 0;
var ballVelocityY = 0;
var wKeyState = false, sKeyState = false;
var playing = false;
var velocityMultiplier = 6;
var layout = "g";

var fps, fpsInterval, startTime, now, then, elapsed;

function startAnimating(fps) {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    mainLoop();
}

window.addEventListener("keydown", (e) => {
    switch (e.key) {
        case "w":
            wKeyState = true;
            break;
        case "s":
            sKeyState = true;
            break;
    }
}, false);
window.addEventListener("keyup", (e) => {
    switch (e.key) {
        case "w":
            wKeyState = false;
            break;
        case "s":
            sKeyState = false;
            break;
    }
})

screen.addEventListener("click", ()=>{
    switch(layout) {
        case "g":
            if (!playing) {
                setBallDirection();
                playing = true;
            }
            break;
        case "p":
        case "c":
            y = 50;
            cpuY = 50;
            ballX = screen.width/2;
            ballY = screen.height/2;
            playerPoints = 0;
            cpuPoints = 0;
            ballVelocityX = 0;
            ballVelocityY = 0;
            wKeyState = false, sKeyState = false;
            playing = false;
            velocityMultiplier = 6;
            layout = "g";
            break;
    }
}, false);

function CPUcalculateBallVelocity() {
    let angle = Math.floor((Math.random() * 61) + 15);
    ballVelocityX = -velocityMultiplier*Math.cos(angle*(Math.PI/180));
    ballVelocityY = -velocityMultiplier*Math.sin(angle*(Math.PI/180));
    velocityMultiplier*=1.015;
}

function playerCalculateBallVelocity() {
    let angle = Math.floor((Math.random() * 61) + 15);
    ballVelocityX = velocityMultiplier*Math.cos(angle*(Math.PI/180));
    ballVelocityY = velocityMultiplier*Math.sin(angle*(Math.PI/180));
    velocityMultiplier*=1.015;
}

function checkBallCollisions() {
    if (ballX >= screen.width+10) {
        playerPoints++;
        playing = false;
        ballVelocityX = 0;
        ballVelocityY = 0;
        ballX = screen.width/2;
        ballY = screen.height/2;
        velocityMultiplier = 6;
    }
    if (ballX >= screen.width-30 && ballY >= cpuY && ballY <= cpuY+150) CPUcalculateBallVelocity();
    if (ballX <= 0) {
        cpuPoints++;
        playing = false;
        ballVelocityX = 0;
        ballVelocityY = 0;
        ballX = screen.width/2;
        ballY = screen.height/2;
        velocityMultiplier = 6;
    }
    if (ballX <= 30 && ballY >= y && ballY <= y+150) playerCalculateBallVelocity();
}
function draw() {
    // Fill background
    ctx.beginPath();
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, screen.width, screen.height);
    // Draw paddles
    ctx.fillStyle = "white";
    ctx.fillRect(5, y, 20, 150);
    ctx.strokeStyle = "white";
    ctx.fillRect(screen.width-25, cpuY, 20, 150);
    // Draw center line  
    ctx.setLineDash([20, 5]);
    ctx.moveTo(screen.width/2, 0);
    ctx.lineTo(screen.width/2, screen.height);
    ctx.stroke(); 
    ctx.font = "50px Orbitron";
    ctx.textAlign = "center";
    ctx.fillText(playerPoints, screen.width/2 - 75, 50);
    ctx.fillText(cpuPoints, screen.width/2 + 75, 50);
    // Draw ball
    ctx.moveTo(ballX, ballY);
    ctx.arc(ballX, ballY, 10, 0, 2*Math.PI);
    ctx.fill();
    ctx.closePath();
}

function setBallDirection() {
    ballVelocityX = (Math.floor((Math.random() * 2)+1) == 2) ? 5 : -5; 
}

function mainLoop() {
    requestAnimationFrame(()=>mainLoop());
    
    now = Date.now();
    elapsed = now - then;

    if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval);
        switch (layout) {
            case "g":
                if (wKeyState && y > 0) {
                    y -= 3.5;
                }
                if (sKeyState && y < screen.height-150) {
                    y += 3.5;
                }
                if (ballY <= 0) {
                    if (ballVelocityX > 0) {
                        playerCalculateBallVelocity();
                    } else if (ballVelocityX < 0) {
                        CPUcalculateBallVelocity();
                    }
                    if (ballVelocityY < 0) ballVelocityY *= -1;
                } else if (ballY >= screen.height-10) {
                    if (ballVelocityX > 0) {
                        playerCalculateBallVelocity();
                    } else if (ballVelocityX < 0) {
                        CPUcalculateBallVelocity();
                    }
                    if (ballVelocityY > 0) ballVelocityY *= -1;
                }
                ballX += ballVelocityX;
                ballY += ballVelocityY;
                if (cpuY+75 != ballY && ballX > screen.width/4 && ballVelocityX > 0) cpuY += (ballY < cpuY+50) ? -3.5 : 3.5;
                checkBallCollisions();
                draw();
                if (cpuPoints >= 11 && cpuPoints-2 >= playerPoints) layout = "c";
                if (playerPoints >= 11 && playerPoints-2 >= cpuPoints) layout = "p";
                break;
            case "p":
                ctx.beginPath();
                ctx.fillStyle = "black";
                ctx.fillRect(0, 0, screen.width, screen.height);
                ctx.fillStyle = "white";
                ctx.font = "75px Orbitron";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("Player Wins!", screen.width/2, screen.height/2);
                ctx.closePath();
                break;
            case "c":
                ctx.beginPath();
                ctx.fillStyle = "black";
                ctx.fillRect(0, 0, screen.width, screen.height);
                ctx.fillStyle = "white";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.font = "75px Orbitron";
                ctx.fillText("CPU Wins!", screen.width/2, screen.height/2);
                ctx.closePath();
                break;
        }
    }
}
startAnimating(60);
