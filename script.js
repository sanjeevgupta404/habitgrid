/**
 * Baingan Snake Game
 * A complete Snake game built with pure JavaScript and Canvas.
 */

// Game Constants
const CANVAS_SIZE = 400; // Total canvas width/height
const GRID_SIZE = 20; // Number of cells (20x20)
const CELL_SIZE = CANVAS_SIZE / GRID_SIZE; // Pixels per cell
const INITIAL_FPS = 10;
const SPEED_INCREMENT = 0.2;

// DOM Elements
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const currentScoreEl = document.getElementById('current-score');
const bestScoreEl = document.getElementById('best-score');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreEl = document.getElementById('final-score');
const startBtn = document.getElementById('start-button');
const restartBtn = document.getElementById('restart-button');

// Game State
let snake = [];
let baingan = { x: 0, y: 0 };
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let bestScore = localStorage.getItem('bainganSnakeBestScore') || 0;
let gameLoop;
let fps = INITIAL_FPS;
let isGameRunning = false;

// Initialize best score display
bestScoreEl.textContent = bestScore;

/**
 * Starts the game, resets state and UI.
 */
function startGame() {
    // Reset state
    snake = [{ x: 10, y: 10 }]; // Start in middle
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    fps = INITIAL_FPS;
    isGameRunning = true;

    // Update UI
    currentScoreEl.textContent = score;
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');

    spawnBaingan();

    // Clear any existing loop and start new one
    if (gameLoop) clearTimeout(gameLoop);
    runGame();
}

/**
 * Main game loop.
 */
function runGame() {
    if (!isGameRunning) return;

    direction = nextDirection;
    moveSnake();

    if (checkCollision()) {
        gameOver();
        return;
    }

    // Check if baingan is eaten
    const head = snake[0];
    if (head.x === baingan.x && head.y === baingan.y) {
        score++;
        drawScore();
        fps += SPEED_INCREMENT;
        spawnBaingan();
        // Don't pop tail to increase length
    } else {
        snake.pop(); // Remove tail if no food eaten
    }

    draw();

    gameLoop = setTimeout(runGame, 1000 / fps);
}

/**
 * Handles drawing all game elements.
 */
function draw() {
    // Clear canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    drawBaingan();
    drawSnake();
}

/**
 * Draws the snake on the canvas.
 */
function drawSnake() {
    ctx.fillStyle = '#00ff00'; // Bright green
    snake.forEach((segment, index) => {
        // Draw segment
        ctx.fillRect(
            segment.x * CELL_SIZE + 1,
            segment.y * CELL_SIZE + 1,
            CELL_SIZE - 2,
            CELL_SIZE - 2
        );

        // Optional: add eyes to head
        if (index === 0) {
            ctx.fillStyle = 'black';
            const eyeSize = 2;
            let eye1, eye2;

            if (direction === 'right') {
                eye1 = { x: 14, y: 5 };
                eye2 = { x: 14, y: 13 };
            } else if (direction === 'left') {
                eye1 = { x: 4, y: 5 };
                eye2 = { x: 4, y: 13 };
            } else if (direction === 'up') {
                eye1 = { x: 5, y: 4 };
                eye2 = { x: 13, y: 4 };
            } else if (direction === 'down') {
                eye1 = { x: 5, y: 14 };
                eye2 = { x: 13, y: 14 };
            }

            ctx.fillRect(segment.x * CELL_SIZE + eye1.x, segment.y * CELL_SIZE + eye1.y, eyeSize, eyeSize);
            ctx.fillRect(segment.x * CELL_SIZE + eye2.x, segment.y * CELL_SIZE + eye2.y, eyeSize, eyeSize);

            ctx.fillStyle = '#00ff00';
        }
    });
}

/**
 * Updates the score display in the UI.
 */
function drawScore() {
    currentScoreEl.textContent = score;
    bestScoreEl.textContent = bestScore;
}

/**
 * Draws the baingan (eggplant) using canvas shapes.
 */
function drawBaingan() {
    const centerX = baingan.x * CELL_SIZE + CELL_SIZE / 2;
    const centerY = baingan.y * CELL_SIZE + CELL_SIZE / 2 + 2;
    const radiusX = CELL_SIZE / 2 - 4;
    const radiusY = CELL_SIZE / 2 - 2;

    // Draw purple body (oval)
    ctx.fillStyle = '#800080'; // Purple
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    ctx.fill();

    // Draw green stem
    ctx.fillStyle = '#228B22'; // Forest Green
    ctx.beginPath();
    ctx.moveTo(centerX - 4, centerY - radiusY);
    ctx.lineTo(centerX + 4, centerY - radiusY);
    ctx.lineTo(centerX, centerY - radiusY - 6);
    ctx.closePath();
    ctx.fill();

    // Small stem top
    ctx.fillRect(centerX - 1, centerY - radiusY - 8, 2, 4);
}

/**
 * Spawns a new baingan at a random empty cell.
 */
function spawnBaingan() {
    let newPos;
    let isCollision = true;

    while (isCollision) {
        newPos = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };

        // Check if new position is on the snake
        isCollision = snake.some(segment => segment.x === newPos.x && segment.y === newPos.y);
    }

    baingan = newPos;
}

/**
 * Moves the snake based on current direction.
 */
function moveSnake() {
    const head = { ...snake[0] };

    switch (direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }

    snake.unshift(head); // Add new head
}

/**
 * Checks for wall or self collision.
 */
function checkCollision() {
    const head = snake[0];

    // Wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        return true;
    }

    // Self collision
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }

    return false;
}

/**
 * Handles game over state.
 */
function gameOver() {
    isGameRunning = false;
    if (gameLoop) clearTimeout(gameLoop);

    // Update best score
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('bainganSnakeBestScore', bestScore);
        bestScoreEl.textContent = bestScore;
    }

    // Show game over screen
    finalScoreEl.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

/**
 * Input handling for keyboard.
 */
function handleInput(key) {
    if (!isGameRunning) return;

    switch (key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (direction !== 'down') nextDirection = 'up';
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (direction !== 'up') nextDirection = 'down';
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (direction !== 'right') nextDirection = 'left';
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (direction !== 'left') nextDirection = 'right';
            break;
    }
}

// Event Listeners
window.addEventListener('keydown', (e) => handleInput(e.key));

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// Mobile controls
document.getElementById('up-btn').addEventListener('touchstart', (e) => { e.preventDefault(); handleInput('ArrowUp'); });
document.getElementById('down-btn').addEventListener('touchstart', (e) => { e.preventDefault(); handleInput('ArrowDown'); });
document.getElementById('left-btn').addEventListener('touchstart', (e) => { e.preventDefault(); handleInput('ArrowLeft'); });
document.getElementById('right-btn').addEventListener('touchstart', (e) => { e.preventDefault(); handleInput('ArrowRight'); });

// Click fallback for mobile buttons in desktop/non-touch mode testing
document.getElementById('up-btn').addEventListener('click', () => handleInput('ArrowUp'));
document.getElementById('down-btn').addEventListener('click', () => handleInput('ArrowDown'));
document.getElementById('left-btn').addEventListener('click', () => handleInput('ArrowLeft'));
document.getElementById('right-btn').addEventListener('click', () => handleInput('ArrowRight'));

// Initial draw for start screen
ctx.fillStyle = 'black';
ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
