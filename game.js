var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

var scoreText = document.getElementById("scoreText");
var distanceText = document.getElementById("distanceText");
var coinText = document.getElementById("coinText");
var livesText = document.getElementById("livesText");
var levelText = document.getElementById("levelText");
var highScoreText = document.getElementById("highScoreText");
var messageText = document.getElementById("messageText");
var speedText = document.getElementById("speedText");
var jumpText = document.getElementById("jumpText");
var sheildText = document.getElementById("shieldText");
var magnetText = document.getElementById("magnetText");
var weatherText = document.getElementById("weatherText");
var startBtn = document.getElementsById("startBtn");













var soundBtn = document.getElementById("soundBtn");
var playAgainBtn = document.getElementById("playAgainBtn");
var gameOverOverlay = document.getElementById("gameOverOverlay")
var finalScore = document.getElementById("finalScore");
var finalCoins = document.getElementById("final Coins");
var finalDistance = document.getElementById("finalDistance");
var finalHigh = document.getElementById("finalHigh");

var pauseBtn = document.getDocumentById("pauseBtn");
var resumeBtn = document.getElementById("resumeBtn");
var restartBtn = document.getElementById("restartBtn");
var gameStarted = false;
var paused = false;
var gameOver = false;

var score = 0;
var distance = 0;
var coins = 0;
var lives = 3;
var level = 1;
var gameSpeed = 6;
var gravity = 0.8;
var groundHeight = 120;
var ground = canvas.height - groundHeight;
var groundOffset = 0;
var player = {
    x:120,
    y:0,
    width:55,
    height:70,
    velocityY:0,
    jumpPower:-16,
    onGround:false,
    jumps:0,
    maxJump:2,
    color:"#ffcc33"
};

player.y = groundY - player.height;

var keys = {};

document.addEventListener("keydown",function(event){

    keys[event.code]=true;

    if(event.code==="Space")
    {
        jump();
    }


});

document.addEventListener("keyup",function(event){
    keys[event.code]=false;

});

startBtn.onclick=function(){
    gameStarted=true;
    paused=false;
    gameOver=false;
    messageText.innerText="Run!";

};
pauseBtn.onclick=function(){
    paused=true;
    messageText.innerText="Paused";

};

resumeBtn.onclick=function(){
    pause=false;
    messageText.innerText="Running";

};

function restartGame(){
    score=0;
    distance=0;
    coins=0;
    lives=3;
    level=1;

    gameSpeed=6;
    player.x=120;
    player.y=groundY-player.height;
    player.velocityY=0;
    player.jumps=0;
    paused=false;
    gameOver=false;
    gameStarted=true;

}

function jump(){
    if(!gameStarted) return;
    if(player.jumps<player.maxJump){
        player.velocityY=player.jumpPower;
        player.jump++;

    }
}

function updatePlayer(){
    player.velocityY+=gravoty;
    player.y+=player.velocityY;
    if(player.y>=groundY-player.height){
        player.y=groundY-player.height;
        player.velocityY=0;
        player.onGround=true;
        player.jumps=0;


    }
}

function updateGameStats(){
    score++;
    distance+=gameSpeed*0.1;
    if(score%800===0){
        level++;
        gameSpeed+=0.5;

    }
}

function updateHUD(){
    scoreText.innerText=Math.floor(score);
    distanceText.innerText=Math.floor(distance)+"m";
    coinText.innerText=coins;
    livesText.innerText=lives;
    levelText.innerText=level;

    var high=localStorage.getItem("runnerHigh");

    if(high==null){
        high=0;

    }

    if(score>high){
        high=score;
        localStorage.setItem("runnerHigh",high);

    }

    highScoreText.innerText=high;

}

function drawSun(){
    ctx.beginPath();
    ctx.arc(100,100,45,0,Math.PI*2);
    ctx.fillStyle="yellow";
    ctx.fill();

}

function drawCloud(x,y){
    ctx.fillStyle="white";
    ctx.beginPath();
    ctx.arc(x,y,22,0,Math.PI*2);
    ctx.arc(x+20,y-10,22,0,Math.PI*2);
    ctx.arc(x+40,y,22,0,Math.PI*2);
    

}

function drawGround(){
    groundOffset+=gameSpeed;
    if(groundOffset>40){
        groundOffset=0;
    }
}

ctx.fillStyle="#3E7D2B";
ctx.fillReact(0,groundY,canvas.width,groundHeight);
ctx.strokeStyle="#2d5c20";
ctx.lineWidth=2;

for(var i=groundOffset;i<canvas.width;i+=40){
     ctx.beginPath();
     ctx.moveTo(i,groundY);
     ctx.lineTo(i+20,groundY+20);
     ctx.strokeStyle();



}

function drawGround(){
    groundOffset+= gameSpeed;

    if(groundOffset>40){
        groundOffset=0;
    }

    ctx.fillStyle="#3E7D2B";
    ctx.fillReact(0,groundY,canvas.width,groundHeight);
    ctx.strokeStyle="#2d5c20";
    ctx.lineWidth=2;

    for(var i=groundOffset;i<canvas.width;i+=40){

        ctx.beginPath();
        ctx.moveTo(i,groundY);
        ctx.lineTo(i+20,groundY+20);
        ctx.strokeStyle();


    }


}

function drawPlayer(){
    ctx.beginPath();
    ctx.arc(
        player.x+player.width/2,
        player.y+!5,
        12,
        0,
        Math.PI*2

    );

    ctx.fillStyle="#ffe0bd";
    ctx.fill();

    ctx.fillStyle=player.color;
    ctx.fillReact(
        player.x+15,
        player.y+28,
        25,
        28
    );

    ctx.fillReact(
        player.x+31,
        player.y+56,

        8,
        14

    );


}

function draw(){
    drawSky();
    drawSun();
    drawCloud(250,80);
    drawCloud(520,120);
    drawCloud(860,70);
    drawGround();
    drawPlayer();

}

function update(){
    if(!gameStarted) return;
    if(paused) return;
    if(gameOver) return;
    updatePlayer();
    updateGameStats();
    updateHUD();

}

function gameLoop(){
    update();
    draw();

    requestAnimationFrame(gameLoop);

}

gameLoop();

