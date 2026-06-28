/**
 * Rubik's Cube 3D Application - main.js
 * Version 1.0
 */

// Global variables
let scene, camera, renderer, controls;
let container;
let cubeGroup;
const cubies = [];

// Animation & State
let isRotating = false;
let moveQueue = [];
let currentMove = null;
let rotationProgress = 0;
const ROTATION_SPEED = 0.15; // Radians per frame
let pivot = new THREE.Object3D();
let moveCount = 0;
let isScrambling = false;

// Cube Constants
const COLORS = {
    white: 0xffffff, // U
    yellow: 0xffff00, // D
    red: 0xff0000,    // R
    orange: 0xffa500, // L
    blue: 0x0000ff,   // B
    green: 0x00ff00,  // F
    internal: 0x222222 // Inside faces
};

function createCubie(x, y, z) {
    const geometry = new THREE.BoxGeometry(0.95, 0.95, 0.95);

    // Each face of the cubie can have a different color (sticker)
    // Three.js BoxGeometry materials index:
    // 0: +x (Right), 1: -x (Left), 2: +y (Top), 3: -y (Bottom), 4: +z (Front), 5: -z (Back)
    const materials = [
        new THREE.MeshLambertMaterial({ color: x === 1 ? COLORS.red : COLORS.internal }),    // Right
        new THREE.MeshLambertMaterial({ color: x === -1 ? COLORS.orange : COLORS.internal }), // Left
        new THREE.MeshLambertMaterial({ color: y === 1 ? COLORS.white : COLORS.internal }),  // Top
        new THREE.MeshLambertMaterial({ color: y === -1 ? COLORS.yellow : COLORS.internal }), // Bottom
        new THREE.MeshLambertMaterial({ color: z === 1 ? COLORS.green : COLORS.internal }),  // Front
        new THREE.MeshLambertMaterial({ color: z === -1 ? COLORS.blue : COLORS.internal })   // Back
    ];

    const cubie = new THREE.Mesh(geometry, materials);
    cubie.position.set(x, y, z);

    // Store initial data for solved state detection
    cubie.userData = {
        initialPosition: new THREE.Vector3(x, y, z),
        initialMaterials: materials.map(m => m.color.getHex())
    };

    return cubie;
}

function createCube() {
    cubeGroup = new THREE.Group();

    for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
            for (let z = -1; z <= 1; z++) {
                // We don't really need the center cubie, but it simplifies logic
                const cubie = createCubie(x, y, z);
                cubies.push(cubie);
                cubeGroup.add(cubie);
            }
        }
    }

    scene.add(cubeGroup);
    scene.add(pivot);
}

// Rotation Logic
function getLayer(move) {
    const layer = [];
    const axis = move[0]; // R, L, U, D, F, B

    cubies.forEach(cubie => {
        // Round positions to avoid floating point issues
        const x = Math.round(cubie.position.x);
        const y = Math.round(cubie.position.y);
        const z = Math.round(cubie.position.z);

        if (axis === 'R' && x === 1) layer.push(cubie);
        if (axis === 'L' && x === -1) layer.push(cubie);
        if (axis === 'U' && y === 1) layer.push(cubie);
        if (axis === 'D' && y === -1) layer.push(cubie);
        if (axis === 'F' && z === 1) layer.push(cubie);
        if (axis === 'B' && z === -1) layer.push(cubie);
    });

    return layer;
}

function startNextMove() {
    if (moveQueue.length === 0) {
        isRotating = false;
        currentMove = null;
        checkSolved();
        return;
    }

    isRotating = true;
    currentMove = moveQueue.shift();
    const layer = getLayer(currentMove);

    // Reset pivot
    pivot.rotation.set(0, 0, 0);
    pivot.updateMatrixWorld();

    // Add cubies to pivot
    layer.forEach(cubie => {
        pivot.attach(cubie);
    });

    rotationProgress = 0;
}

function updateRotation() {
    if (!isRotating || !currentMove) return;

    const moveType = currentMove[0];
    const isInverse = currentMove.includes("'");
    const angle = (Math.PI / 2) * (isInverse ? 1 : -1);

    let step = ROTATION_SPEED;
    rotationProgress += step;

    if (rotationProgress >= Math.abs(angle)) {
        // Finish rotation
        pivot.rotation[getAxis(moveType)] = angle;
        pivot.updateMatrixWorld();

        // Return cubies to cubeGroup
        pivot.children.slice().forEach(cubie => {
            cubeGroup.attach(cubie);
        });

        startNextMove();
    } else {
        // Continue rotation
        const currentAngle = (isInverse ? 1 : -1) * rotationProgress;
        pivot.rotation[getAxis(moveType)] = currentAngle;
    }
}

function getAxis(moveType) {
    if (moveType === 'R' || moveType === 'L') return 'x';
    if (moveType === 'U' || moveType === 'D') return 'y';
    if (moveType === 'F' || moveType === 'B') return 'z';
}

// Adjust direction based on face
function applyMove(move) {
    // Standardize move notation: R, R', L, L', etc.
    let moveToSend = move;

    // Adjust signs for L, D, B because they are on the negative axes
    const face = move[0];
    const isInverse = move.includes("'");

    if (face === 'L' || face === 'D' || face === 'B') {
        moveToSend = isInverse ? face : face + "'";
    }

    moveQueue.push(moveToSend);
    if (!isRotating) {
        if (!isScrambling) incrementMoveCount();
        startNextMove();
    }
}

function checkSolved() {
    if (isScrambling || moveQueue.length > 0) return;

    let solved = true;
    cubies.forEach(cubie => {
        // Check position
        const currentPos = new THREE.Vector3().copy(cubie.position);
        const initialPos = cubie.userData.initialPosition;

        if (Math.abs(currentPos.x - initialPos.x) > 0.1 ||
            Math.abs(currentPos.y - initialPos.y) > 0.1 ||
            Math.abs(currentPos.z - initialPos.z) > 0.1) {
            solved = false;
        }

        // Check orientation (rotation)
        // A simpler way: since we only rotate in 90deg steps, check if the world normals of faces match
        const currentQuaternion = cubie.quaternion;
        if (Math.abs(currentQuaternion.x) > 0.05 ||
            Math.abs(currentQuaternion.y) > 0.05 ||
            Math.abs(currentQuaternion.z) > 0.05 ||
            Math.abs(currentQuaternion.w - 1) > 0.05) {
            // Note: This only works if initial rotation is (0,0,0,1)
            // For a cube, there are multiple equivalent rotations that look "solved" (if stickers match)
            // But with our implementation, position + 0 rotation is the only true solved state.
            // Wait, actually a cubie can be in the right position but rotated.
            solved = false;
        }
    });

    if (solved && moveCount > 0) {
        document.getElementById('solved-message').classList.remove('hidden');
    } else {
        document.getElementById('solved-message').classList.add('hidden');
    }
}

function incrementMoveCount() {
    moveCount++;
    document.getElementById('move-count').innerText = moveCount;
}

function scramble() {
    isScrambling = true;
    const moves = ['R', 'L', 'U', 'D', 'F', 'B'];
    for (let i = 0; i < 20; i++) {
        const randomMove = moves[Math.floor(Math.random() * moves.length)];
        const isInverse = Math.random() > 0.5;
        applyMove(isInverse ? randomMove + "'" : randomMove);
    }
    // After queuing all moves, we need to know when scrambling finishes to resume count
    const checkScrambleEnd = setInterval(() => {
        if (moveQueue.length === 0 && !isRotating) {
            isScrambling = false;
            moveCount = 0;
            document.getElementById('move-count').innerText = moveCount;
            clearInterval(checkScrambleEnd);
        }
    }, 100);
}

function resetCube() {
    moveQueue = [];
    isRotating = false;
    currentMove = null;
    isScrambling = false;
    moveCount = 0;
    document.getElementById('move-count').innerText = moveCount;
    document.getElementById('solved-message').classList.add('hidden');

    cubies.forEach(cubie => {
        cubie.position.copy(cubie.userData.initialPosition);
        cubie.rotation.set(0, 0, 0);
        cubeGroup.attach(cubie);
    });
}

function init() {
    container = document.getElementById('canvas-container');

    // 1. Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x121212);

    // 2. Camera
    camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.set(5, 5, 8);

    // 3. Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // 4. Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 20;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.3);
    pointLight.position.set(-5, -10, -7);
    scene.add(pointLight);

    // 6. Create Rubik's Cube
    createCube();

    // 7. Event Listeners
    setupEventListeners();

    // Handle Window Resize
    window.addEventListener('resize', onWindowResize);

    // Start Animation Loop
    animate();
}

function setupEventListeners() {
    // Move Buttons
    document.querySelectorAll('.move-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            applyMove(btn.dataset.move);
        });
    });

    // Scramble & Reset
    document.getElementById('scramble-btn').addEventListener('click', scramble);
    document.getElementById('reset-btn').addEventListener('click', resetCube);

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
        const key = e.key.toUpperCase();
        const isInverse = e.shiftKey;
        const moves = ['R', 'L', 'U', 'D', 'F', 'B'];

        if (moves.includes(key)) {
            applyMove(isInverse ? key + "'" : key);
        }
    });
}

function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function animate() {
    requestAnimationFrame(animate);
    updateRotation();
    controls.update();
    renderer.render(scene, camera);
}

// Initialize when the DOM is loaded
window.addEventListener('DOMContentLoaded', init);
