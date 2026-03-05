// ============================
// CANVAS SETUP
// ============================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 60; // subtract top bar height
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ============================
// UI ELEMENTS
// ============================

const welcomeScreen = document.getElementById("welcomeScreen");
const creditsScreen = document.getElementById("creditsScreen");
const pauseMenu = document.getElementById("pauseMenu");
const topBar = document.getElementById("topBar");

const playBtn = document.getElementById("playBtn");
const creditsBtn = document.getElementById("creditsBtn");
const backBtn = document.getElementById("backBtn");

const pauseBtn = document.getElementById("pauseBtn");
const exitBtn = document.getElementById("exitBtn");

const resumeBtn = document.getElementById("resumeBtn");
const pauseExitBtn = document.getElementById("pauseExitBtn");

const scoreDisplay = document.getElementById("scoreDisplay");
const heartDisplay = document.getElementById("heartDisplay");

// ============================
// GAME STATE
// ============================

let score = 0;
let hearts = 10;
let misses = 0;
let wave = 1;

let mosquitoes = [];
let gameRunning = false;
let gamePaused = false;

// ============================
// MOSQUITO CLASS
// ============================

class Mosquito {
    constructor(type = "normal") {
        this.type = type;
        this.size = 50;

        this.x = Math.random() * (canvas.width - this.size);
        this.y = Math.random() * (canvas.height - this.size);

        this.speedX = (Math.random() - 0.5) * 4;
        this.speedY = (Math.random() - 0.5) * 4;

        this.lifeTime = 2000 + Math.random() * 2000;
        this.spawnTime = Date.now();
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x + this.size > canvas.width)
            this.speedX *= -1;

        if (this.y < 0 || this.y + this.size > canvas.height)
            this.speedY *= -1;
    }

    draw() {
        ctx.fillStyle = this.type === "special" ? "red" : "black";
        ctx.beginPath();
        ctx.arc(this.x + 25, this.y + 25, 20, 0, Math.PI * 2);
        ctx.fill();
    }

    isExpired() {
        return Date.now() - this.spawnTime > this.lifeTime;
    }
}

// ============================
// GAME FUNCTIONS
// ============================

function startGame() {
    score = 0;
    hearts = 10;
    misses = 0;
    wave = 1;
    mosquitoes = [];

    updateUI();

    gameRunning = true;
    gamePaused = false;

    spawnMosquito();
    gameLoop();
}

function spawnMosquito() {
    if (!gameRunning) return;

    let type = "normal";

    if (wave >= 4 && Math.random() < 0.2) {
        type = "special"; // gives 10 points
    }

    mosquitoes.push(new Mosquito(type));

    setTimeout(spawnMosquito, 1000 - wave * 50);
}

function updateUI() {
    scoreDisplay.textContent = "🦟 " + score;
    heartDisplay.textContent = "❤️ " + hearts;
}

function gameOver() {
    alert("Game Over!\nScore: " + score);
    location.reload();
}

// ============================
// CLICK HANDLING
// ============================

canvas.addEventListener("click", (e) => {
    if (!gameRunning || gamePaused) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    let hit = false;

    mosquitoes = mosquitoes.filter(m => {
        const distance = Math.hypot(
            clickX - (m.x + 25),
            clickY - (m.y + 25)
        );

        if (distance < 25) {
            hit = true;
            score += m.type === "special" ? 10 : 1;
            return false;
        }
        return true;
    });

    if (!hit && wave >= 4) {
        misses++;

        if (misses % 2 === 0) {
            hearts--;
            updateUI();

            if (hearts <= 0) {
                gameOver();
            }
        }
    }

    updateUI();
});

// ============================
// MAIN LOOP
// ============================

function gameLoop() {
    if (!gameRunning) return;

    if (!gamePaused) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        mosquitoes.forEach(m => {
            m.update();
            m.draw();
        });

        mosquitoes = mosquitoes.filter(m => {
            if (m.isExpired()) {
                if (wave >= 4) {
                    misses++;
                    if (misses % 2 === 0) {
                        hearts--;
                        updateUI();
                        if (hearts <= 0) gameOver();
                    }
                }
                return false;
            }
            return true;
        });

        if (score > 10) wave = 2;
        if (score > 25) wave = 3;
        if (score > 50) wave = 4;
    }

    requestAnimationFrame(gameLoop);
}

// ============================
// MENU CONTROLS
// ============================

playBtn.addEventListener("click", () => {
    welcomeScreen.style.display = "none";
    topBar.style.display = "flex";
    startGame();
});

creditsBtn.addEventListener("click", () => {
    welcomeScreen.style.display = "none";
    creditsScreen.style.display = "flex";
});

backBtn.addEventListener("click", () => {
    creditsScreen.style.display = "none";
    welcomeScreen.style.display = "flex";
});

pauseBtn.addEventListener("click", () => {
    gamePaused = true;
    pauseMenu.style.display = "flex";
});

resumeBtn.addEventListener("click", () => {
    gamePaused = false;
    pauseMenu.style.display = "none";
});

pauseExitBtn.addEventListener("click", () => {
    location.reload();
});

exitBtn.addEventListener("click", () => {
    location.reload();
});
