/**
 * Baingan Snake Game
 * A classic snake game implementation using HTML5 Canvas.
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const bestScoreElement = document.getElementById('best-score');
const finalScoreElement = document.getElementById('final-score');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');

// Mobile Buttons
const upBtn = document.getElementById('up-button');
const downBtn = document.getElementById('down-button');
const leftBtn = document.getElementById('left-button');
const rightBtn = document.getElementById('right-button');

// Game constants
const gridSize = 20; // 20x20 cells
const cellSize = 20; // Size of each cell in pixels
canvas.width = gridSize * cellSize;
canvas.height = gridSize * cellSize;

// Game state
let snake = [];
let baingan = { x: 0, y: 0 };
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let bestScore = localStorage.getItem('bainganSnakeBestScore') || 0;
let gameLoop;
let fps = 10;
let isGameRunning = false;

// Initialize best score display
bestScoreElement.textContent = bestScore;

/**
 * Starts the game.
 */
function startGame() {
    snake = [{ x: 10, y: 10 }]; // Start at center
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    fps = 10;
    drawScore();

    spawnBaingan();

    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    isGameRunning = true;

    if (gameLoop) clearTimeout(gameLoop);
    runGame();
}

/**
 * Main game loop.
 */
function runGame() {
    if (!isGameRunning) return;

    moveSnake();
    if (checkCollision()) {
        gameOver();
        return;
    }

    // Clear canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawBaingan();
    drawSnake();

    gameLoop = setTimeout(runGame, 1000 / fps);
}

/**
 * Spawns a new baingan at a random empty cell.
 */
function spawnBaingan() {
    let newPos;
    let isOnSnake = true;

    while (isOnSnake) {
        newPos = {
            x: Math.floor(Math.random() * gridSize),
            y: Math.floor(Math.random() * gridSize)
        };

        // Check if the new position is on the snake's body
        isOnSnake = snake.some(segment => segment.x === newPos.x && segment.y === newPos.y);
    }

    baingan = newPos;
}

/**
 * Draws the baingan (eggplant) using Canvas shapes.
 */
function drawBaingan() {
    const x = baingan.x * cellSize + cellSize / 2;
    const y = baingan.y * cellSize + cellSize / 2;
    const radiusX = cellSize * 0.35;
    const radiusY = cellSize * 0.45;

    ctx.save();
    ctx.translate(x, y);

    // Draw purple oval body
    ctx.fillStyle = '#8A2BE2'; // BlueViolet (Purple)
    ctx.beginPath();
    ctx.ellipse(0, cellSize * 0.1, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw small green stem
    ctx.fillStyle = '#228B22'; // ForestGreen
    ctx.beginPath();
    ctx.moveTo(-cellSize * 0.1, -cellSize * 0.2);
    ctx.quadraticCurveTo(0, -cellSize * 0.4, cellSize * 0.1, -cellSize * 0.2);
    ctx.lineTo(cellSize * 0.15, -cellSize * 0.1);
    ctx.lineTo(-cellSize * 0.15, -cellSize * 0.1);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

/**
 * Draws the snake.
 */
function drawSnake() {
    ctx.fillStyle = '#0f0'; // Bright green
    snake.forEach((segment, index) => {
        // Draw head slightly different if needed, but here all bright green
        ctx.fillRect(segment.x * cellSize + 1, segment.y * cellSize + 1, cellSize - 2, cellSize - 2);
    });
}

/**
 * Updates the score display.
 */
function drawScore() {
    scoreElement.textContent = score;
}

/**
 * Moves the snake and handles eating baingan.
 */
function moveSnake() {
    direction = nextDirection;
    const head = { ...snake[0] };

    if (direction === 'up') head.y -= 1;
    if (direction === 'down') head.y += 1;
    if (direction === 'left') head.x -= 1;
    if (direction === 'right') head.x += 1;

    // Add new head
    snake.unshift(head);

    // Check if snake ate baingan
    if (head.x === baingan.x && head.y === baingan.y) {
        score++;
        drawScore();
        fps += 0.2; // Slightly increase speed
        spawnBaingan();
    } else {
        // Remove tail
        snake.pop();
    }
}

/**
 * Checks for collisions with walls or itself.
 */
function checkCollision() {
    const head = snake[0];

    // Wall collisions
    if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
        return true;
    }

    // Self collisions
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }

    return false;
}

/**
 * Handles Game Over state.
 */
function gameOver() {
    isGameRunning = false;
    clearTimeout(gameLoop);

    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('bainganSnakeBestScore', bestScore);
        bestScoreElement.textContent = bestScore;
    }

    finalScoreElement.textContent = score;
    gameOverScreen.style.display = 'flex';
}

/**
 * Input handling with reversal prevention.
 */
function handleInput(key) {
    const k = key.toLowerCase();

    if ((k === 'arrowup' || k === 'w') && direction !== 'down') {
        nextDirection = 'up';
    } else if ((k === 'arrowdown' || k === 's') && direction !== 'up') {
        nextDirection = 'down';
    } else if ((k === 'arrowleft' || k === 'a') && direction !== 'right') {
        nextDirection = 'left';
    } else if ((k === 'arrowright' || k === 'd') && direction !== 'left') {
        nextDirection = 'right';
    }
}

// Event Listeners
window.addEventListener('keydown', (e) => handleInput(e.key));

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);

// Mobile Button Listeners
upBtn.addEventListener('click', () => handleInput('arrowup'));
downBtn.addEventListener('click', () => handleInput('arrowdown'));
leftBtn.addEventListener('click', () => handleInput('arrowleft'));
rightBtn.addEventListener('click', () => handleInput('arrowright'));

// Prevention of scrolling/zooming on mobile
document.addEventListener('touchmove', (e) => {
    if (e.target.tagName !== 'BUTTON') {
        e.preventDefault();
    }
}, { passive: false });
