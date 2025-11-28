//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//bird
let birdWidth = 34;
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
};

//pipes
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let velocityX = -2; // kecepatan pipa
let velocityY = 0;
let gravity = 0.4;

let gameOver = false;
let score = 0;
let started = false;
let level = 1;
let maxLevel = 100;

let wingSound = new Audio("./sfx_wing.wav");
let hitSound = new Audio("./sfx_hit.wav");
let swooshingSound = new Audio("./sfx_swooshing.wav");
let dieSound = new Audio("./sfx_die.wav");
let scoreSound = new Audio("./sfx_point.wav");
let bgm = new Audio("./bgm_mario.mp3");
bgm.loop = true;


let restartBtn = {
    x: boardWidth / 2 - 70,
    y: boardHeight / 2 + 40,
    width: 140,
    height: 50
};

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    // load images
    birdImg = new Image();
    birdImg.src = "./brgg.png";
    birdImg.onload = function () {
        context.drawImage(birdImg, bird.x=100, bird.y=100, bird.width=40, bird.height=40);
    };

    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";
    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipee.png";

    // kontrol
    document.addEventListener("keydown", moveBird);
    board.addEventListener("mousedown", jumpBird);
    board.addEventListener("touchstart", jumpBird);
    board.addEventListener("mousedown", clickRestart);
    board.addEventListener("touchstart", clickRestart);

    requestAnimationFrame(update);
};

function update() {
    requestAnimationFrame(update);
    context.clearRect(0, 0, board.width, board.height);


    if (!started) {
        drawSplashScreen();
        return;
    }

    if (gameOver) {
        bgm.pause();
        drawGameOver();
        return;
    }

    // bird
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0);
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) gameOver = true;
         
    // pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5;
            pipe.passed = true;
            scoreSound.play();

            // Naik level setiap skor kelipatan 25
            if (Number.isInteger(score) && score % 10 === 0 && level < maxLevel) {
                level++;
                // ⚡ makin cepat
                velocityX -= 0.50;
                // 🔥 pipa makin sempit
                minOpening = Math.max(minOpening - 5, 90);
            }
        }

        if (detectCollision(bird, pipe)) {
            hitSound.play();
            gameOver = true;
            
    }
}

    // hapus pipa lama
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift();
    }

    // score & level
    context.fillStyle = "white";
    context.font = "40px sans-serif";
    context.fillText("Score: " + Math.floor(score), 10, 45);
    context.font = "25px sans-serif";
    context.fillText("Level: " + level, 10, 80);
    wingSound.play();
}

let minOpening = 10; // awal jarak antara pipa (akan mengecil per level)

function placePipes() {
    if (gameOver) return;

    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    // gunakan minOpening yang berubah sesuai level
    let openingSpace = Math.max(board.height / 4 - (level * 1), minOpening);

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyX") {
            if(bgm.paused) {
                bgm.play();

            }
        scoreSound.play();
        jumpBird();
    }
}

function jumpBird() {
    if (!started) {
        started = true;
        setInterval(placePipes, 1500);
        if(bgm.paused) {
                bgm.play();

            }
    }
    velocityY = -6;
  
    if (gameOver) resetGame();
}

function detectCollision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

function resetGame() {
    bird.y = birdY;
    pipeArray = [];
    score = 0;
    velocityY = 0;
    velocityX = -2;
    gameOver = false;
    level = 1;
    minOpening = 160;
    started = true;
    bgm.play();
    bgm.currentTime = 0;
    bgm.play();
}

function drawSplashScreen() {
    context.fillStyle = "skyblue";
    context.fillRect(0, 0, board.width, board.height);
    context.fillStyle = "white";
    context.font = "32px sans-serif";
    context.fillText("Flappy Bird", 90, 250);
    context.font = "20px sans-serif";
    context.fillText("Tap / Klik / Space untuk Mulai", 40, 320);
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
}

function drawGameOver() {
    context.fillStyle = "rgba(0,0,0,0.6)";
    context.fillRect(0, 0, board.width, board.height);

    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText("GAME OVER", 70, 250);

    context.font = "28px sans-serif";
    context.fillText("Score: " + Math.floor(score), 110, 310);
    context.fillText("Level: " + level, 120, 350);

    context.fillStyle = "orange";
    context.fillRect(restartBtn.x, restartBtn.y, restartBtn.width, restartBtn.height);
    context.fillStyle = "black";
    context.font = "25px sans-serif";
    context.fillText("Restart", restartBtn.x + 25, restartBtn.y + 33);
}

function clickRestart(event) {
    if (!gameOver) return;

    let rect = board.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;

    if (
        x >= restartBtn.x &&
        x <= restartBtn.x + restartBtn.width &&
        y >= restartBtn.y &&
        y <= restartBtn.y + restartBtn.height
    ) {
        resetGame();
    }
}