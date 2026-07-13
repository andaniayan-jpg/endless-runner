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
var shieldText = document.getElementById("shieldText");
var magnetText = document.getElementById("magnetText");
var weatherText = document.getElementById("weatherText");

var startBtn = document.getElementById("startBtn");
var pauseBtn = document.getElementById("pauseBtn");
var resumeBtn = document.getElementById("resumeBtn");
var restartBtn = document.getElementById("restartBtn");
var soundBtn = document.getElementById("soundBtn");
var playAgainBtn = document.getElementById("playAgainBtn");
var gameOverOverlay = document.getElementById("gameOverOverlay");
var finalScore = document.getElementById("finalScore");
var finalCoins = document.getElementById("finalCoins");
var finalDistance = document.getElementById("finalDistance");
var finalHigh = document.getElementById("finalHigh");

var easyBtn = document.getElementById("easyBtn");
var normalBtn = document.getElementById("normalBtn");
var hardBtn = document.getElementById("hardBtn");
var touchJump = document.getElementById("touchJump");
var touchSlide = document.getElementById("touchSlide");

var gameStarted = false;
var paused = false;
var gameOver = false;
var soundOn = true;

var score = 0;
var distance = 0;
var coinCount = 0;
var lives = 3;
var level = 1;

var baseSpeed = 6;
var gameSpeed = baseSpeed;
var gravity = 0.85;

var groundHeight = 120;
var groundY = canvas.height - groundHeight;
var groundOffset = 0;

var difficulty = "normal";
var difficultySettings = {
    easy:   { speedMult: 0.8, spawnMult: 1.4, livesStart: 5 },
    normal: { speedMult: 1.0, spawnMult: 1.0, livesStart: 3 },
    hard:   { speedMult: 1.35, spawnMult: 0.65, livesStart: 2 }
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
    x: 120,
    y: 0,
    width: 46,
    height: 70,
    slideHeight: 40,
    velocityY: 0,
    jumpPower: -16,
    onGround: true,
    jumps: 0,
    maxJumps: 2,
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
var particles = [];
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
    gain.connect(audioCtx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.stop(audioCtx.currentTime + duration);
}
function sfxJump() { beep(520, 0.15, "square"); }
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

document.addEventListener("keydown", function (event) {
    if (keys[event.code]) return;
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

document.addEventListener("keyup", function (event) {
    keys[event.code] = false;
    if (event.code === "ArrowDown") {
        endSlide();
    }
});

touchJump.addEventListener("click", function () { jump(); });
touchSlide.addEventListener("mousedown", function () { startSlide(); });
touchSlide.addEventListener("touchstart", function (e) { e.preventDefault(); startSlide(); });
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

startBtn.onclick = function () {
    if (!gameStarted || gameOver) {
        restartGame();
    }
    gameStarted = true;
    paused = false;
    messageText.innerText = "Run!";
};

pauseBtn.onclick = function () { togglePause(); };
resumeBtn.onclick = function () { if (paused) togglePause(); };
restartBtn.onclick = function () { restartGame(); };
playAgainBtn.onclick = function () { restartGame(); };

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

function restartGame() {
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

function spawnObstacle() {
    var type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    var w = 40, h = 40;
    if (type === "rock") { w = 44; h = 44; }
    if (type === "spike") { w = 34; h = 34; }
    if (type === "crate") { w = 46; h = 46; }
    if (type === "log") { w = 70; h = 30; }

    obstacles.push({
        x: canvas.width + 20,
        y: groundY - h,
        width: w,
        height: h,
        type: type
    });
}

function spawnCoinRow() {
    var count = 3 + Math.floor(Math.random() * 5);
    var startX = canvas.width + 40;
    var arcHeight = Math.random() < 0.5 ? 0 : 80;
    var baseY = groundY - 60 - Math.random() * 60;
    for (var i = 0; i < count; i++) {
        var t = i / (count - 1 || 1);
        var yOff = arcHeight ? Math.sin(t * Math.PI) * arcHeight : 0;
        coins.push({
            x: startX + i * 34,
            y: baseY - yOff,
            radius: 10,
            angle: Math.random() * Math.PI * 2,
            collected: false
        });
    }
}

var powerTypes = ["shield", "magnet", "slow"];
function spawnPowerup() {
    var type = powerTypes[Math.floor(Math.random() * powerTypes.length)];
    powerups.push({
        x: canvas.width + 20,
        y: groundY - 130 - Math.random() * 40,
        radius: 16,
        type: type
    });
}

function spawnDustBurst(x, y, count) {
    for (var i = 0; i < count; i++) {
        particles.push({
            x: x, y: y,
            vx: (Math.random() - 0.5) * 3,
            vy: -Math.random() * 3,
            life: 25 + Math.random() * 10,
            color: "rgba(200,200,200,0.7)",
            size: 3 + Math.random() * 3
        });
    }
}

function spawnCoinSparkle(x, y) {
    for (var i = 0; i < 8; i++) {
        particles.push({
            x: x, y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 20,
            color: "rgba(255,215,0,0.9)",
            size: 2 + Math.random() * 2
        });
    }
}

function rectsCollide(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

function getPlayerHitbox() {
    if (player.sliding) {
        return { x: player.x, y: groundY - player.slideHeight, width: player.width, height: player.slideHeight };
    }
    return { x: player.x, y: player.y, width: player.width, height: player.height };
}

function updatePlayer() {
    player.velocityY += gravity;
    player.y += player.velocityY;

    if (player.y >= groundY - player.height) {
        var wasFalling = player.velocityY > 4;
        player.y = groundY - player.height;
        player.velocityY = 0;
        if (!player.onGround && wasFalling) {
            spawnDustBurst(player.x + player.width / 2, groundY, 8);
        }
        player.onGround = true;
        player.jumps = 0;
    } else {
        player.onGround = false;
    }

    if (player.sliding) {
        player.slideTimer--;
        if (player.slideTimer <= 0) player.sliding = false;
    }

    if (player.onGround && !player.sliding) {
        player.legPhase += 0.35 + gameSpeed * 0.02;
    }

    if (player.hitFlash > 0) player.hitFlash--;
    if (player.shieldTime > 0) player.shieldTime--;
    if (player.magnetTime > 0) player.magnetTime--;
}

function updateObstacles() {
    for (var i = obstacles.length - 1; i >= 0; i--) {
        var o = obstacles[i];
        o.x -= gameSpeed;
        if (o.x + o.width < -10) {
            obstacles.splice(i, 1);
            continue;
        }
        if (rectsCollide(getPlayerHitbox(), o)) {
            handleHit();
            obstacles.splice(i, 1);
        }
    }
}

function updateCoins() {
    for (var i = coins.length - 1; i >= 0; i--) {
        var c = coins[i];
        c.x -= gameSpeed;
        c.angle += 0.15;

        if (player.magnetTime > 0) {
            var pcx = player.x + player.width / 2;
            var pcy = player.y + player.height / 2;
            var dx = pcx - c.x, dy = pcy - c.y;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 220) {
                c.x += dx * 0.18;
                c.y += dy * 0.18;
            }
        }

        if (c.x < -20) { coins.splice(i, 1); continue; }

        var box = getPlayerHitbox();
        var dx2 = (box.x + box.width / 2) - c.x;
        var dy2 = (box.y + box.height / 2) - c.y;
        if (Math.sqrt(dx2 * dx2 + dy2 * dy2) < 26) {
            coinCount++;
            score += 25;
            sfxCoin();
            spawnCoinSparkle(c.x, c.y);
            coins.splice(i, 1);
            checkAchievements();
        }
    }
}

function updatePowerups() {
    for (var i = powerups.length - 1; i >= 0; i--) {
        var p = powerups[i];
        p.x -= gameSpeed;
        if (p.x < -20) { powerups.splice(i, 1); continue; }

        var box = getPlayerHitbox();
        var dx = (box.x + box.width / 2) - p.x;
        var dy = (box.y + box.height / 2) - p.y;
        if (Math.sqrt(dx * dx + dy * dy) < 30) {
            applyPowerup(p.type);
            powerups.splice(i, 1);
        }
    }
}

function applyPowerup(type) {
    sfxPower();
    if (type === "shield") { player.shieldTime = 420; shieldText.innerText = "ON"; }
    if (type === "magnet") { player.magnetTime = 420; magnetText.innerText = "ON"; }
    if (type === "slow") {
        var oldSpeed = gameSpeed;
        gameSpeed = Math.max(3, gameSpeed * 0.55);
        setTimeout(function () { gameSpeed = oldSpeed; }, 4000);
    }
}

function handleHit() {
    if (player.shieldTime > 0) {
        player.shieldTime = 0;
        spawnDustBurst(player.x + player.width / 2, player.y + player.height / 2, 14);
        return;
    }
    lives--;
    player.hitFlash = 30;
    sfxHit();
    spawnDustBurst(player.x + player.width / 2, player.y + player.height / 2, 12);
    if (lives <= 0) {
        endGame();
    }
}

function updateParticles() {
    for (var i = particles.length - 1; i >= 0; i--) {
        var p = particles[i];
        p.x += p.vx - gameSpeed * 0.3;
        p.y += p.vy;
        p.vy += 0.1;
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

function updateSpawning() {
    var settings = difficultySettings[difficulty];
    spawnTimer--;
    if (spawnTimer <= 0) {
        spawnObstacle();
        var base = 70 - level * 2;
        base = Math.max(30, base);
        spawnTimer = (base + Math.random() * 40) * settings.spawnMult;
    }

    coinSpawnTimer--;
    if (coinSpawnTimer <= 0) {
        spawnCoinRow();
        coinSpawnTimer = 90 + Math.random() * 80;
    }

    powerupTimer--;
    if (powerupTimer <= 0) {
        spawnPowerup();
        powerupTimer = 600 + Math.random() * 400;
    }
}

function updateBackground() {
    groundOffset += gameSpeed;
    if (groundOffset > 40) groundOffset -= 40;

    clouds.forEach(function (c) {
        c.x -= c.speed;
        if (c.x < -80) c.x = canvas.width + 80;
    });

    buildings.forEach(function (b) {
        b.x -= gameSpeed * 0.3;
        if (b.x < -100) b.x += 8 * 180;
    });

    trees.forEach(function (t) {
        t.x -= gameSpeed * 0.6;
        if (t.x < -60) t.x += 10 * 140;
    });

    biomeTimer++;
    if (biomeTimer > 1400) {
        biomeTimer = 0;
        var next;
        do { next = biomes[Math.floor(Math.random() * biomes.length)]; } while (next === currentBiome);
        currentBiome = next;
        weatherText.innerText = currentBiome;
    }
}

function updateGameStats() {
    score += 1;
    distance += gameSpeed * 0.1;

    var newLevel = 1 + Math.floor(score / 1500);
    if (newLevel !== level) {
        level = newLevel;
        gameSpeed = baseSpeed + (level - 1) * 0.6;
    }
    checkAchievements();
}

function updateHUD() {
    scoreText.innerText = Math.floor(score);
    distanceText.innerText = Math.floor(distance) + " m";
    coinText.innerText = coinCount;
    livesText.innerText = lives;
    levelText.innerText = level;
    speedText.innerText = gameSpeed.toFixed(1);
    jumpText.innerText = Math.abs(player.jumpPower);
    shieldText.innerText = player.shieldTime > 0 ? "ON" : "OFF";
    magnetText.innerText = player.magnetTime > 0 ? "ON" : "OFF";

    var high = parseInt(localStorage.getItem("runnerHigh")) || 0;
    if (score > high) {
        high = Math.floor(score);
        localStorage.setItem("runnerHigh", high);
    }
    highScoreText.innerText = high;
}

var achieved = { jump: false, coins100: false, level10: false, dist5000: false };
function checkAchievements() {
    if (player.jumps > 0 && !achieved.jump) {
        achieved.jump = true;
        document.getElementById("achievement1").classList.add("achieved");
    }
    if (coinCount >= 100 && !achieved.coins100) {
        achieved.coins100 = true;
        document.getElementById("achievement2").classList.add("achieved");
    }
    if (level >= 10 && !achieved.level10) {
        achieved.level10 = true;
        document.getElementById("achievement3").classList.add("achieved");
    }
    if (distance >= 5000 && !achieved.dist5000) {
        achieved.dist5000 = true;
        document.getElementById("achievement4").classList.add("achieved");
    }
}

function endGame() {
    gameOver = true;
    gameStarted = false;
    sfxGameOver();
    messageText.innerText = "Game Over — press Restart or Play Again";

    var high = parseInt(localStorage.getItem("runnerHigh")) || 0;
    finalScore.innerText = Math.floor(score);
    finalCoins.innerText = coinCount;
    finalDistance.innerText = Math.floor(distance) + " m";
    finalHigh.innerText = high;
    gameOverOverlay.classList.remove("hidden");
}

function drawSky() {
    var colors = biomeColors[currentBiome];
    var grad = ctx.createLinearGradient(0, 0, 0, groundY);
    grad.addColorStop(0, colors.sky1);
    grad.addColorStop(1, colors.sky2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSun() {
    ctx.beginPath();
    ctx.arc(1080, 90, 45, 0, Math.PI * 2);
    ctx.fillStyle = currentBiome === "Sunset" ? "#ff8c42" : "#ffe066";
    ctx.fill();
}

function drawCloud(c) {
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(c.x, c.y, 22 * c.scale, 0, Math.PI * 2);
    ctx.arc(c.x + 20 * c.scale, c.y - 10 * c.scale, 22 * c.scale, 0, Math.PI * 2);
    ctx.arc(c.x + 40 * c.scale, c.y, 22 * c.scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function drawBuildings() {
    if (currentBiome !== "City") return;
    ctx.fillStyle = "rgba(40,45,60,0.6)";
    buildings.forEach(function (b) {
        ctx.fillRect(b.x, groundY - b.h, b.w, b.h);
    });
}

function drawTrees() {
    if (currentBiome === "City" || currentBiome === "Desert") return;
    trees.forEach(function (t) {
        var x = t.x, s = t.scale;
        ctx.fillStyle = "#6b4226";
        ctx.fillRect(x, groundY - 40 * s, 10 * s, 40 * s);
        ctx.fillStyle = currentBiome === "Snow" ? "#e8f3ff" : "#2f6b2f";
        ctx.beginPath();
        ctx.arc(x + 5 * s, groundY - 55 * s, 26 * s, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawGround() {
    var colors = biomeColors[currentBiome];
    ctx.fillStyle = colors.ground;
    ctx.fillRect(0, groundY, canvas.width, groundHeight);
    ctx.strokeStyle = colors.groundLine;
    ctx.lineWidth = 2;
    for (var i = -40 + groundOffset; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, groundY);
        ctx.lineTo(i + 20, groundY + 20);
        ctx.stroke();
    }
}

function drawPlayer() {
    var px = player.x;
    var py = player.y;
    var w = player.width;
    var h = player.sliding ? player.slideHeight : player.height;
    var by = player.sliding ? groundY - player.slideHeight : py;

    ctx.save();
    if (player.hitFlash > 0 && Math.floor(player.hitFlash / 4) % 2 === 0) {
        ctx.globalAlpha = 0.4;
    }

    if (player.shieldTime > 0) {
        ctx.beginPath();
        ctx.arc(px + w / 2, by + h / 2, Math.max(w, h) * 0.75, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(80,180,255,0.8)";
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    var legSwing = player.onGround && !player.sliding ? Math.sin(player.legPhase) * 10 : 0;
    ctx.strokeStyle = "#3a2c1a";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(px + w * 0.35, by + h);
    ctx.lineTo(px + w * 0.35 + legSwing, by + h + 16);
    ctx.moveTo(px + w * 0.65, by + h);
    ctx.lineTo(px + w * 0.65 - legSwing, by + h + 16);
    ctx.stroke();

    ctx.fillStyle = "#2f7ef7";
    ctx.fillRect(px, by + h * 0.25, w, h * 0.6);

    ctx.beginPath();
    ctx.arc(px + w / 2, by + h * 0.15, w * 0.32, 0, Math.PI * 2);
    ctx.fillStyle = "#ffe0bd";
    ctx.fill();

    ctx.strokeStyle = "#ffe0bd";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(px + w * 0.15, by + h * 0.35);
    ctx.lineTo(px + w * 0.15 - legSwing * 0.6, by + h * 0.55);
    ctx.moveTo(px + w * 0.85, by + h * 0.35);
    ctx.lineTo(px + w * 0.85 + legSwing * 0.6, by + h * 0.55);
    ctx.stroke();

    ctx.restore();
}

function drawObstacles() {
    obstacles.forEach(function (o) {
        if (o.type === "rock") {
            ctx.fillStyle = "#7a7a7a";
            ctx.beginPath();
            ctx.arc(o.x + o.width / 2, o.y + o.height / 2, o.width / 2, 0, Math.PI * 2);
            ctx.fill();
        } else if (o.type === "spike") {
            ctx.fillStyle = "#d64545";
            ctx.beginPath();
            ctx.moveTo(o.x, o.y + o.height);
            ctx.lineTo(o.x + o.width / 2, o.y);
            ctx.lineTo(o.x + o.width, o.y + o.height);
            ctx.closePath();
            ctx.fill();
        } else if (o.type === "crate") {
            ctx.fillStyle = "#a5682f";
            ctx.fillRect(o.x, o.y, o.width, o.height);
            ctx.strokeStyle = "#6e431a";
            ctx.lineWidth = 3;
            ctx.strokeRect(o.x, o.y, o.width, o.height);
        } else if (o.type === "log") {
            ctx.fillStyle = "#6b4226";
            ctx.fillRect(o.x, o.y, o.width, o.height);
            ctx.strokeStyle = "#4a2c17";
            for (var i = 0; i < o.width; i += 14) {
                ctx.beginPath();
                ctx.arc(o.x + i, o.y + o.height / 2, o.height / 2 - 2, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
    });
}

function drawCoins() {
    coins.forEach(function (c) {
        var scale = Math.abs(Math.cos(c.angle));
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.scale(scale, 1);
        ctx.beginPath();
        ctx.arc(0, 0, c.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#ffd700";
        ctx.fill();
        ctx.strokeStyle = "#c9a400";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    });
}

function drawPowerups() {
    var iconColors = { shield: "#4aa3ff", magnet: "#ff4a9d", slow: "#7dffb0" };
    powerups.forEach(function (p) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = iconColors[p.type] || "#ffffff";
        ctx.fill();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = "white";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        var letter = p.type === "shield" ? "S" : p.type === "magnet" ? "M" : "T";
        ctx.fillText(letter, p.x, p.y + 4);
    });
}

function drawParticles() {
    particles.forEach(function (p) {
        ctx.globalAlpha = Math.max(0, p.life / 30);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    });
}

function drawPauseOverlay() {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "bold 40px Arial";
    ctx.textAlign = "center";
    ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
}

function draw() {
    drawSky();
    drawSun();
    clouds.forEach(drawCloud);
    drawBuildings();
    drawTrees();
    drawGround();
    drawObstacles();
    drawCoins();
    drawPowerups();
    drawParticles();
    drawPlayer();

    if (paused) drawPauseOverlay();

    if (!gameStarted && !gameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "bold 34px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Press START to Play", canvas.width / 2, canvas.height / 2);
    }
}

function update() {
    if (!gameStarted || paused || gameOver) return;
    updatePlayer();
    updateObstacles();
    updateCoins();
    updatePowerups();
    updateParticles();
    updateSpawning();
    updateBackground();
    updateGameStats();
    updateHUD();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

(function initHigh() {
    var high = parseInt(localStorage.getItem("runnerHigh")) || 0;
    highScoreText.innerText = high;
})();

gameLoop();
