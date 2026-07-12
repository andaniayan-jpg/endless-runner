var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

var scoreText = document.getElementById("scoreText");
var distanceText = document.getElementById("distanceText");
var coinText = document.getElementById("coinText");
var livesText = document.getElementById("livesText");
var levelText = document.getElementById("levelText");
var highScoreText = document.getElementById("highScoreText");
var messageText = document.getElementById("messageText");
var startBtn = document.getElementsById("startBtn");
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
    
}