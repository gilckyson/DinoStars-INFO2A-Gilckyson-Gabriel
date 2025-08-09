// --- Elementos do DOM ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('scoreDisplay');
const cooldownDisplay = document.getElementById('cooldownDisplay');
const gameOverMessage = document.getElementById('gameOverMessage');
const finalScoreSpan = document.getElementById('finalScore');
const startButton = document.getElementById('startButton');
const mainMenu = document.getElementById('mainMenu');
const gameScreen = document.getElementById('gameScreen');

// --- Carregar Imagens ---
const dinoImage = new Image();
dinoImage.src = 'scott.gif';

const obstacleSmallImage = new Image();
obstacleSmallImage.src = 'obstaculo.png';

const obstacleLargeImage = new Image();
obstacleLargeImage.src = 'cano.png';

// --- Constantes do Jogo ---
const GAME = {
    GRAVITY: 0.5,
    JUMP_POWER: -12,
    OBSTACLE_SPEED: 5,
    SHOOT_COOLDOWN_TIME: 180,
    GROUND_HEIGHT: 50,
};

// --- Variáveis de Estado do Jogo ---
let dino, obstacles, bullets, score, shootCooldown, isGameOver;

// --- Funções de Lógica do Jogo ---

function createDino() {
    // Dimensões ajustadas para a imagem scott.gif
    return {
        x: 50, y: 200, width: 40, height: 60,
        velocityY: 0, isOnGround: false
    };
}

function createObstacle() {
    const isSmall = Math.random() > 0.5;
    // Dimensões ajustadas para as imagens obstaculo.png e cano.png
    const width = isSmall ? 30 : 60;
    const height = isSmall ? 50 : 70;
    return {
        width: width, height: height, x: canvas.width,
        y: canvas.height - GAME.GROUND_HEIGHT - height
    };
}

function createBullet() {
    return {
        x: dino.x + dino.width / 2, y: dino.y + dino.height / 2,
        width: 10, height: 5, speed: 10
    };
}

function resetGame() {
    dino = createDino();
    obstacles = [];
    bullets = [];
    score = 0;
    shootCooldown = 0;
    isGameOver = false;
    
    scoreDisplay.innerText = `Pontos: 0`;
    cooldownDisplay.innerText = "Tiro Pronto!";
    cooldownDisplay.style.color = 'green';
    gameOverMessage.classList.add('hidden');
}

function handleCollisions() {
    obstacles.forEach(o => {
        if (checkCollision(dino, o)) {
            isGameOver = true;
        }
    });

    bullets = bullets.filter(bullet => {
        let hit = false;
        obstacles = obstacles.filter(obstacle => {
            if (checkCollision(bullet, obstacle)) {
                hit = true;
                score += 50;
                return false;
            }
            return true;
        });
        return !hit;
    });
}

function checkCollision(obj1, obj2) {
    return (
        obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y
    );
}

function updateGame() {
    if (isGameOver) return;

    dino.velocityY += GAME.GRAVITY;
    dino.y += dino.velocityY;
    if (dino.y + dino.height > canvas.height - GAME.GROUND_HEIGHT) {
        dino.y = canvas.height - GAME.GROUND_HEIGHT - dino.height;
        dino.velocityY = 0;
        dino.isOnGround = true;
    }

    if (Math.random() < 0.015) {
        obstacles.push(createObstacle());
    }
    obstacles.forEach(o => o.x -= GAME.OBSTACLE_SPEED);
    obstacles = obstacles.filter(o => o.x + o.width > 0);

    bullets.forEach(b => b.x += b.speed);
    bullets = bullets.filter(b => b.x < canvas.width);
    
    if (shootCooldown > 0) {
        shootCooldown--;
        cooldownDisplay.innerText = `Recarregando... (${Math.ceil(shootCooldown / 60)}s)`;
        cooldownDisplay.style.color = 'red';
    } else {
        cooldownDisplay.innerText = "Tiro Pronto!";
        cooldownDisplay.style.color = 'green';
    }

    handleCollisions();
    
    score++;
    scoreDisplay.innerText = `Pontos: ${score}`;
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#535353';
    ctx.fillRect(0, canvas.height - GAME.GROUND_HEIGHT, canvas.width, GAME.GROUND_HEIGHT);
    
    // Desenha o dinossauro como imagem
    ctx.drawImage(dinoImage, dino.x, dino.y, dino.width, dino.height);
    
    // Desenha os obstáculos como imagens
    obstacles.forEach(o => {
        if (o.width <= 35) {
            ctx.drawImage(obstacleSmallImage, o.x, o.y, o.width, o.height);
        } else {
            ctx.drawImage(obstacleLargeImage, o.x, o.y, o.width, o.height);
        }
    });
    
    ctx.fillStyle = 'orange';
    bullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));

    if (isGameOver) {
        finalScoreSpan.innerText = score;
        gameOverMessage.classList.remove('hidden');
    }
}

function gameLoop() {
    updateGame();
    drawGame();
    if (!isGameOver) requestAnimationFrame(gameLoop);
}

// --- Event Listeners e Lógica de Menu ---
startButton.addEventListener('click', () => {
    mainMenu.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    resetGame();
    gameLoop();
});

window.addEventListener('keydown', e => {
    if (mainMenu.classList.contains('hidden') === false) return;
    
    switch (e.key.toLowerCase()) {
        case ' ':
            if (dino.isOnGround) {
                dino.velocityY = GAME.JUMP_POWER;
                dino.isOnGround = false;
            }
            break;
        case 'a':
            if (shootCooldown <= 0) {
                bullets.push(createBullet());
                shootCooldown = GAME.SHOOT_COOLDOWN_TIME;
            }
            break;
        case 'r':
            if (isGameOver) {
                resetGame();
                gameLoop();
            }
            break;
    }
});
