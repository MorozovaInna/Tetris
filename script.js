const PLAYFIELD_COLUMNS = 10;
const PLAYFIELD_ROWS = 20;
const INITIAL_INTERVAL = 1000;
const TETROMINO_NAMES = [
    'O',
    'J',
    'I',
    'T',
    'Z',
    'L',
    'S'
]
const TETROMINOES = {
    'O': [
        [1,1],
        [1,1]
    ],
    'J': [
        [1,0,0],
        [1,1,1],
        [0,0,0]
    ],
    'I': [
        [0,0,0,0],
        [1,1,1,1],
        [0,0,0,0],
        [0,0,0,0]
    ],
    'T': [
        [1,1,1],
        [0,1,0],
        [0,0,0]
    ],
    'Z': [
        [1,1,0],
        [0,1,1],
        [0,0,0]
    ],
    'L': [
        [0,0,1],
        [1,1,1],
        [0,0,0]
    ],
    'S': [
        [0,1,1],
        [1,1,0],
        [0,0,0]
    ]
}
const mySound = new Audio('tetris.mp3');


let playfield;
let tetromino;
let score = 0; 
let level = 1;
let gameOver = false;


function convertPositionToIndex(row, column) {
    return row * PLAYFIELD_COLUMNS + column;
}

function generatePlayField() {
    for (let i = 0; i < PLAYFIELD_ROWS * PLAYFIELD_COLUMNS; i++) {
        const div = document.createElement('div');
        document.querySelector('.grid').append(div);
    }

    playfield = new Array(PLAYFIELD_ROWS).fill()
        .map( ()=> new Array(PLAYFIELD_COLUMNS).fill(0) )
        
}

function generateTetromino() {
    const name = TETROMINO_NAMES[Math.floor(Math.random() * TETROMINO_NAMES.length)]; 
    const matrix = TETROMINOES[name];
    const col = Math.floor((playfield[0].length - matrix[0].length) / 2);
    const rowTetro = -2;

    tetromino = {
        name,
        matrix,
        row: rowTetro,
        column: col
    }
}

document.getElementById('level').innerHTML = 'Level:' + level;
document.getElementById('score').innerHTML = 'Score:' + score;
document.addEventListener('keydown', onKeyDown);
generatePlayField();
generateTetromino();
const cells = document.querySelectorAll('.grid div');

function placeTetromino() {
    const matrixSize = tetromino.matrix.length;
    for (let row = 0; row < matrixSize; row++) {
        for (let column = 0; column < matrixSize; column++) {
            if (tetromino.matrix[row][column] && (tetromino.row + row >= 0)) {
                playfield[tetromino.row + row][tetromino.column + column] = tetromino.name;
            }
        }
    }

    if (checkGameOver()) {
        gameOver = true;
        displayPopUp();
    }

    generateTetromino();
} 

function drawPlayField() {
    for (let row = 0; row < PLAYFIELD_ROWS; row++) {
        for (let column = 0; column < PLAYFIELD_COLUMNS; column++){
            
            if (playfield[row][column] == 0) continue;
           
            const name = playfield[row][column];
            const cellIndex = convertPositionToIndex(row, column);
            cells[cellIndex].classList.add(name);
       }
    }
}

function drawTetromino() {
    const name = tetromino.name;
    const tetrominoMatrixSize = tetromino.matrix.length;
    for (let row = 0; row < tetrominoMatrixSize; row++) {
        for (let column = 0; column < tetrominoMatrixSize; column++) {
            if (!tetromino.matrix[row][column]) continue;
            if ((tetromino.row + row) < 0) continue;
            const cellIndex = convertPositionToIndex(
                tetromino.row + row,
                tetromino.column + column);
            
            cells[cellIndex].classList.add(name);
        }
    }
}

function calculateLevel() {
    const newLevel = Math.floor(score / 1000) + 1;
    if (level != newLevel) { 
        level = newLevel;
        document.getElementById('level').innerHTML = 'Level:' + level;
        clearInterval(intervalID);
        intervalID = setInterval(() => { moveTetrominoDown(); draw(); }, INITIAL_INTERVAL - (level - 1) * 30);
        mySound.playbackRate += 0.05;
    }
}

function clearRow() {
    for (let row = PLAYFIELD_ROWS - 1; row >= 0;) {
        if (playfield[row].every(cell => cell !== 0)) {
            score += 100;
            document.getElementById('score').innerHTML = 'Score:' + score;
            calculateLevel();
            for (let r = row; r >= 1; r--) {
                for (let c = 0; c < PLAYFIELD_COLUMNS; c++) {
                    playfield[r][c] = playfield[r - 1][c];
                }
            }
        }
        else {
            row--;
        }
    }
}

function draw() {
    cells.forEach(cell => cell.removeAttribute('class'));
    drawTetromino();
    drawPlayField(); 
    clearRow();
}

function rotateMatrix(matrixTetromino) {
    const N = matrixTetromino.length;
    const rotateMatrix = [];
    for (let i = 0; i < N; i++) {
        rotateMatrix[i] = [];
        for (let j = 0; j < N; j++){
            rotateMatrix[i][j] = matrixTetromino[N - j - 1][i];
        }
    }
    return rotateMatrix;
}

function rotateTetromino() {
    const oldMatrix = tetromino.matrix;
    const rotatedMatrix = rotateMatrix(tetromino.matrix);
    tetromino.matrix = rotatedMatrix;
    if (!isValid()) {
        tetromino.matrix = oldMatrix;
    }
}

function rotate() {
    rotateTetromino();
    draw();
}

function isOutsideOfGameboard(row, column){
    return tetromino.matrix[row][column] && 
    (
        tetromino.column + column < 0 
        || tetromino.column + column >= PLAYFIELD_COLUMNS
        || tetromino.row + row >= PLAYFIELD_ROWS
    );
}

function isValid() {
    const matrixSize = tetromino.matrix.length;
    for (let row = 0; row < matrixSize; row++) {
        for (let column = 0; column < matrixSize; column++) {
            if (isOutsideOfGameboard(row, column)) { return false; }
            if (hasCollisions(row, column)) { return false; } 
        }
    }
    return true;
}

function hasCollisions(row, column){
    return tetromino.matrix[row][column] &&
        ((tetromino.row + row) >= 0) && ((tetromino.row + row) < PLAYFIELD_ROWS) &&
        ((tetromino.column + column) >= 0) && ((tetromino.column + column) < PLAYFIELD_COLUMNS) &&
        playfield[tetromino.row + row][tetromino.column + column];
}

draw();
mySound.loop = true;
mySound.play();
let intervalID = setInterval(() => { moveTetrominoDown(); draw(); }, INITIAL_INTERVAL);

function onKeyDown(e) {
    switch (e.key) {
        case 'ArrowUp':
            rotate();
            break;
        case 'ArrowDown':
            moveTetrominoDown();
            break;
        case 'ArrowLeft':
            moveTetrominoLeft();
            break;
        case 'ArrowRight':
            moveTetrominoRight();
            break;
        case ' ':
            pauseGame();
            break;
    }
    draw();
}

function moveTetrominoDown() {
    tetromino.row += 1;
    if (!isValid()) {
        tetromino.row -= 1;
        placeTetromino();
    }
}

function moveTetrominoLeft() {
    tetromino.column -= 1;
    if (!isValid()) {
        tetromino.column += 1;
    }
}

function moveTetrominoRight() {
    tetromino.column += 1;
    if (!isValid()) {
        tetromino.column -= 1;
    }
}

function checkGameOver() {
    if ((tetromino.row > 0) || ((tetromino.row + tetromino.matrix.length) < 1)) {
        return false;
    }
    const firstVisibleTetrominoRow = 0 - tetromino.row;
    if (firstVisibleTetrominoRow < 0) { return false; }

    for (let column = 0; column < tetromino.matrix.length; column++) {
        if (tetromino.matrix[firstVisibleTetrominoRow][column] == 0) { continue; }
        clearInterval(intervalID);
        mySound.pause();
        return true;
    }
    return false;
}

let closePopup = document.getElementById("popupclose");
let overlay = document.getElementById("overlay");
let popup = document.getElementById("popup");
 
closePopup.onclick = function () {
    overlay.style.display = 'none';
    popup.style.display = 'none';
    document.location.reload();
}

function displayPopUp() {
    overlay.style.display = 'block';
    popup.style.display = 'block';
}

let pauseClosePopup = document.getElementById("pause-popupclose");
let pauseOverlay = document.getElementById("pause-overlay");
let pausePopup = document.getElementById("pause-popup");

function displayPausePopUp() {
    pauseOverlay.style.display = 'block';
    pausePopup.style.display = 'block';
}

function pauseGame() {
    if (intervalID) {
        if (gameOver) { 
            return;
        }
        clearInterval(intervalID);
        intervalID = null;
        mySound.pause();
        displayPausePopUp();
    } else {
        pauseOverlay.style.display = 'none';
        pausePopup.style.display = 'none';
        intervalID = setInterval(() => { moveTetrominoDown(); draw(); }, INITIAL_INTERVAL - (level - 1) * 30);
        mySound.play();
    }
}