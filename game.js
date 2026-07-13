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
var easyBtn = document.getElementById("easyBtn");
var normalBtn = document.getElementById("normalBtn");
var hardBtn=document.getElementById("hardBtn");
var touchJump = document.getElementById("touchJump");
var touchSlide = document.getElementById("touchSlide"):











var pauseBtn = document.getDocumentById("pauseBtn");
var resumeBtn = document.getElementById("resumeBtn");
var restartBtn = document.getElementById("restartBtn");
var gameStarted = false;
var paused = false;
var gameOver = false;




















var soundOn = true;1


var score = 0;
var distance = 0;
var coinCount = 0;
var lives = 3;
var level = 1;
var baseSpeed = 6;
var gameSpeed = baseSpeed;
var gravity = 0.85;
var groundHeight = 120;
var ground = canvas.height - groundHeight;
var groundOffset = 0;









var difficulty = "normal";
var difficultySettings = {
    easy:   { speedMult: 0.8, spawnMult: 1.4, livesStart: 5 },
    normal: { speedMult: 1.0, spawnMult: 1.0, livesStart: 3 },
    hard:   { speedMult: 1.35, spawnMult: 0.65, livesStart: 2  } 
};

var biomes = ["Forest", "Desert", "City", "Snow", "Sunset"];
var biomeColors = {
    Forest: { sky1: "#7fc8ff", sky2: "#d8f2ff", ground: "#3E7D2B", groundLine: "#2d5c20" },
    Desert: { sky1: "#ffd97a", sky2: "#fff3d6", ground: "#d2b46c", groundLine: "#a9854a" },
    City:   { sky1: "#7a8ba8", sky2: "#c9d4e3", ground: "#555b66", groundLine: "#33373d" },
    Snow:   { sky1: "#b8d8ff", sky2: "#eef7ff", ground: "#e8f1fb", groundLine: "#b9cbe0" },
    Sunset: { sky1: "#ff9a6b", sky2: "#ffd3a1", ground: "#7a4a2b", groundLine: "#54331d" }

};
var currentBiome = "Forest";
var biomeTimer = 0;



var player = {
    x:120,
    y:0,
    width:55,
    height:70,
    slideHeight: 40,
    velocityY:0,
    jumpPower:-16,
    onGround: true,
    jumps:0,
    maxJump:2,
    sliding: false,
    slideTimer: 0,
    animTimer: 0,
    legPhase: 0,
    hitFlash: 0,
    shieldTime: 0,
    magnetTime: 0


    
};

player.y = groundY - player.height;

var keys = {};

var obstacles = [];
var coins = [];
var powerups = [];
var clouds = [];
var buildings = [];
var trees = [];
var spawnTimer = 0;
var coinSpawnTimer = 0;
var powerupTimer = 0;

var audioCtx = null;
function ensureAudio() {
    if (!audioCtx) {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            audioCtx = null;
        }
    }

}

function beep(freq, duration, type) {
    if (!soundOn) return;
    ensureAudio();
    if (!audioCtx) return;
    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    osc.type = type || "sine";
    osc.frequency.value = freq;
    gain.gain.value = 0.08;
    osc.connect(gain);
    gain.gain.exponentialRampToValueAtyTime(0.001, audioCtx.currentTime + duration);
    osc.stop(audioCtx.currentTime + duration);

}

function sfxJump() { beep(520, 0.15, "sqaure"); }
function sfxCoin() { beep(880, 0.1, "triangle"); }
function sfxHit() { beep(140, 0.3, "sawtooth"); }
function sfxPower() { beep(660, 0.2, "sine"); }
function sfxGameOver() { beep(110, 0.6, "sawtooth"); }

function initBackground() {
    clouds = [];
    for (var i = 0; i < 5; i++) {
        clouds.push({ x: Math.random() * canvas.width, y: 40 + Math.random() * 120, speed: 0.4 + Math.random() * 0.5, scale: 0.7 + Math.random() * 0.8 });


    }

    buildings = [];
    for (var b = 0; b < 8; b++) {
        buildings.push({ x: b * 180, w: 90 + Math.random() * 60, h: 80 + Math.random() * 140 }); 


    }

    trees = [];
    for (var t = 0; t < 10; t++) {

        trees.push({ x: t * 140, scale: 0.7 + Math.random() * 0.6 });


    }
}
initBackground();




document.addEventListener("keydown",function(event){

    if (keys[event.code]) return; // ignore repeats for action keys
    keys[event.code] = true;

    if (event.code === "Space") {
        event.preventDefault();
        jump();
    }
    if (event.code === "ArrowDown") {
        startSlide();
    }
    if (event.code === "KeyP") {
        togglePause();
    }
    if (event.code === "KeyR") {
        restartGame();
    }
    if (event.code === "KeyM") {
        toggleSound();
    }



});



document.addEventListener("keyup",function(event){
    keys[event.code]=false;
    if (event.code === "ArrowDown") {
        endSlide();

    }

});

touchJump.addEventListener("click", function () { jump(); });
touchSlide.addEventListener("mousedown", function () { startSlide(); });
touchSlide.addEventListener("touchstart", function (E) { E.preventDefault(); startSide(); });
touchSlide.addEventListener("mouseup", function () { endSlide(); });
touchSlide.addEventListener("touchend", function (e) { e.preventDefault(); endSlide(); });

var touchStartY = null;
canvas.addEventListener("touchstart", function (e) {
    touchStartY = e.touches[0].clientY;
});
canvas.addEventListener("touchend", function (e) {
    if (touchStartY === null) return;
    var dy = e.changedTouches[0].clientY - touchStartY;
    if (dy < -30) jump();
    else if (dy > 30) { startSlide(); setTimeout(endSlide, 400); }
    touchStartY = null;
});



pauseBtn.onclick = function () { togglePause(); };
resumeBtn.onclick = function () { if (paused) togglePause(); };
restartBtn.onclick = function () { restartGame(); };
playAgainBtn.onclick = function () { restartGame(); gameOverOverlay.classList.add("hidden"); };

soundBtn.onclick = function () { toggleSound(); };

function toggleSound() {
    soundOn = !soundOn;
    soundBtn.innerText = soundOn ? "Sound ON" : "Sound OFF";
}

function togglePause() {
    if (!gameStarted || gameOver) return;
    paused = !paused;
    messageText.innerText = paused ? "Paused" : "Running";
}

function setDifficulty(name) {
    difficulty = name;
    [easyBtn, normalBtn, hardBtn].forEach(function (b) { b.classList.remove("active"); });
    if (name === "easy") easyBtn.classList.add("active");
    if (name === "normal") normalBtn.classList.add("active");
    if (name === "hard") hardBtn.classList.add("active");
}
easyBtn.onclick = function () { setDifficulty("easy"); };
normalBtn.onclick = function () { setDifficulty("normal"); };
hardBtn.onclick = function () { setDifficulty("hard"); };

// ---------------- Game actions ----------------
function jump() {
    if (!gameStarted || paused || gameOver) return;
    if (player.sliding) endSlide();
    if (player.jumps < player.maxJumps) {
        player.velocityY = player.jumpPower * (player.jumps === 0 ? 1 : 0.85);
        player.jumps++;
        player.onGround = false;
        sfxJump();
        spawnDustBurst(player.x + player.width / 2, groundY, 6);
    }
}

function startSlide() {
    if (!gameStarted || paused || gameOver) return;
    if (!player.onGround) return;
    player.sliding = true;
    player.slideTimer = 35;
}

function endSlide() {
    player.sliding = false;

}

function restartGame(){
    var settings = difficultySettings[difficulty];
    score = 0;
    distance = 0;
    coinCount = 0;
    lives = settings.livesStart;
    level = 1;
    baseSpeed = 6 * settings.speedMult;
    gameSpeed = baseSpeed;

    player.x = 120;
    player.y = groundY - player.height;
    player.velocityY = 0;
    player.jumps = 0;
    player.sliding = false;
    player.hitFlash = 0;
    player.shieldTime = 0;
    player.magnetTime = 0;

    obstacles = [];
    coins = [];
    powerups = [];
    particles = [];
    spawnTimer = 0;
    coinSpawnTimer = 0;
    powerupTimer = 0;
    biomeTimer = 0;
    currentBiome = "Forest";

    paused = false;
    gameOver = false;
    gameStarted = true;

    gameOverOverlay.classList.add("hidden");
    messageText.innerText = "Run!";
    updateHUD();
}

var obstacleTypes = ["rock", "spike", "crate", "log"];


