const tetris = document.getElementsByClassName("tetris")[0];
let tetrisBlockElements;
const scoreInfo = document.getElementsByClassName("score-info")[0];
const otherInfo = document.getElementsByClassName("other-info")[0];
const otherOtherInfo = document.getElementsByClassName("other-other-info")[0];

/* ------------------------------ */

// Global game states and helper functions

const ROWS = 20;
const COLS = 10;
const PIECES = [ // Pieces are arrays of [x, y]s, relative positions of its blocks
    [[0, 0], [1, 0], [2, 0], [3, 0]],
    [[1, 0], [0, 1], [1, 1], [2, 1]],
    [[0, 0], [0, 1], [1, 1], [2, 1]],
    [[2, 0], [0, 1], [1, 1], [2, 1]],
    [[0, 0], [1, 0], [1, 1], [2, 1]],
    [[1, 0], [2, 0], [0, 1], [1, 1]],
    [[0, 0], [0, 1], [1, 0], [1, 1]]
];
const SPAWN_X = 3;
const SPAWN_Y = 0;
const COLORS = ["darkred", "darkorange", "darkgoldenrod", "darkgreen", "darkblue", "darkviolet", "darksalmon"];

let over = false;
let gameIntervalID;
let grid = []; // a grid is made up of blocks which are color value strings, it holds all placed Tetris pieces (other than current piece).
let score = 0;

let shouldSpawnNewPiece = true;
let currentPiece = [];
let currentPieceColor = "";
let currentPieceOriginX = 0;
let currentPieceOriginY = 0;

/** (Return the block element from position) */
function getBlock(x, y) {
    return tetrisBlockElements[y * COLS + x];
}

/** (Check availability of an array of [x, y]s (e.g. a piece)) */
function checkBlocks(blocks) {
    for (const block of blocks) {
        if (block[0] < 0 || block[0] >= COLS || block[1] >= ROWS || grid[block[1]][block[0]] !== "") {
            return false;
        }
    }
    return true;
}

/** (Add array of blocks to DOM) */
function drawBlocks(blocks, color) {
    for (const block of blocks) {
        getBlock(block[0], block[1]).style.backgroundColor = color;
    }
}
/** (Remove array of blocks from DOM) */
function clearBlocks(blocks) {
    for (const block of blocks) {
        getBlock(block[0], block[1]).style.backgroundColor = "";
    }
}

/* ------------------------------ */

// Core logic

/** Reset the game, including drawing things on the DOM */
function initializeGame() {
    // reset stats
    score = 0;
    shouldSpawnNewPiece = true;
    currentPiece = [];
    currentPieceColor = "";
    currentPieceOriginX = 0;
    currentPieceOriginY = 0;
    otherInfo.innerHTML = "Use WASD to control";
    otherOtherInfo.innerHTML = "Space to confirm";

    // rebuild logical grid
    grid = [];
    for (let r = 0; r < ROWS; r++) {
        let row = [];
        for (let c = 0; c < COLS; c++) {
            row.push("");
        }
        grid.push(row);
    }

    // recreate tetris dom based on maze
    tetris.innerHTML = "";
    tetris.style.gridTemplateColumns = `repeat(${grid[0].length}, 1fr)`;
    for (let i = 0; i < ROWS * COLS; i++){
        const tetrisBlock = document.createElement("div");
        tetrisBlock.classList.add("tetris-block");
        tetris.append(tetrisBlock);
    }
    tetrisBlockElements = document.getElementsByClassName("tetris-block");

    // start the game loop
    over = false;
    gameIntervalID = setInterval(gameLoop, 1000);
}

/** Spawn pieces, move pieces, place pieces, and game over detection */
function gameLoop() {
    if (shouldSpawnNewPiece === true) {
        // set new current piece when spawning new one
        currentPiece = PIECES[Math.floor(Math.random() * PIECES.length)];
        currentPieceColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        currentPieceOriginX = SPAWN_X;
        currentPieceOriginY = SPAWN_Y;

        // spawn new piece or detect game over
        const newPiece = currentPiece.map(block => { // New piece is a piece (array of [x, y]s) with absolute positioning
            return [block[0] + currentPieceOriginX, block[1] + currentPieceOriginY];
        });
        if (checkBlocks(newPiece) === true) {
            drawBlocks(newPiece, currentPieceColor);
        } else {
            over = true;
            clearInterval(gameIntervalID);
            otherInfo.innerHTML = "Game Over!";
            otherOtherInfo.innerHTML = "Space to restart";
        }

        // indicate done spawning
        shouldSpawnNewPiece = false;
    } else {
        if (moveDown() === false) {
            // save to grid when failing to move down
            for (const block of currentPiece) {
                grid[block[1] + currentPieceOriginY][block[0] + currentPieceOriginX] = currentPieceColor;
            }

            // detect full rows and score
            detectFullRows();            

            // indicate spawning next round
            shouldSpawnNewPiece = true;
        }
    }
}

/** Detect full rows, clear, redraw, and add to score */
function detectFullRows() {
    // detect full rows
    let rowsToClear = [];
    rowLoop: for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (grid[r][c] === "") continue rowLoop;
        }
        rowsToClear.push(r);
    }

    if (rowsToClear.length === 0) return;

    // start from top, unshift rows down to take the row
    for (const rowToClear of rowsToClear) {
        grid.splice(rowToClear, 1);
        let newRow = [];
        for (let c = 0; c < COLS; c++) {
            newRow.push("");
        }
        grid.unshift(newRow);
    }

    // redraw
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            getBlock(c, r).style.backgroundColor = grid[r][c];
        }
    }

    // add to score
    switch (rowsToClear.length) {
        case 1:
            score += 40;
            break;
        case 2:
            score += 100;
            break;
        case 3:
            score += 300;
            break;
        case 4:
            score += 1200;
            break;
    }
    scoreInfo.innerHTML = `Score: ${score}`;
}

// Start game, game loop, and keyboard controls
initializeGame();
document.addEventListener("keypress", event => {
    if (event.key === "w") {
        changeDirection();
    } else if (event.key === "a") {
        moveLeft();
    } else if (event.key === "d") {
        moveRight();
    } else if (event.key === "s") {
        moveDown();
    } else if (event.key === "Enter" || event.key === " ") {
        if (over === true) {
            initializeGame();
        } else {
            skipToBottom();
        }
    }
});

/* ------------------------------ */

// Control functions

/** Check and move left */
function moveLeft() {
    const newPiece = currentPiece.map(block => {
        return [block[0] + currentPieceOriginX - 1, block[1] + currentPieceOriginY];
    });
    if (checkBlocks(newPiece) === true) {
        clearBlocks(currentPiece.map(block => {
            return [block[0] + currentPieceOriginX, block[1] + currentPieceOriginY];
        }));
        currentPieceOriginX -= 1;
        drawBlocks(newPiece, currentPieceColor);
        return true;
    } else {
        return false;
    }
}
/** Check and move right */
function moveRight() {
    const newPiece = currentPiece.map(block => {
        return [block[0] + currentPieceOriginX + 1, block[1] + currentPieceOriginY];
    });
    if (checkBlocks(newPiece) === true) {
        clearBlocks(currentPiece.map(block => {
            return [block[0] + currentPieceOriginX, block[1] + currentPieceOriginY];
        }));
        currentPieceOriginX += 1;
        drawBlocks(newPiece, currentPieceColor);
        return true;
    } else {
        return false;
    }
}
/** Check and move down */
function moveDown() {
    const newPiece = currentPiece.map(block => {
        return [block[0] + currentPieceOriginX, block[1] + currentPieceOriginY + 1];
    });
    if (checkBlocks(newPiece) === true) {
        clearBlocks(currentPiece.map(block => {
            return [block[0] + currentPieceOriginX, block[1] + currentPieceOriginY];
        }));
        currentPieceOriginY += 1;
        drawBlocks(newPiece, currentPieceColor);
        return true;
    } else {
        return false;
    }
}

/** Change the direction of the current piece */
function changeDirection() {
    // put current piece inside square temporary grid
    let gridDimension = 0;
    for (const block of currentPiece) {
        gridDimension = Math.max(gridDimension, block[0] + 1, block[1] + 1);
    }
    let tempGrid = []; // Temporary grid is a square with side lengths of the largest dimension of the current piece, used for rotating
    for (let i = 0; i < gridDimension; i++) {
        let row = [];
        for (let ii = 0; ii < gridDimension; ii++) row.push(false);
        tempGrid.push(row);
    }
    // console.log(tempGrid); // TODO: how is this already filled
    for (const block of currentPiece) {
        tempGrid[block[1]][block[0]] = true;
    }
    // rotate, building rotated piece
    const rotatedGrid = tempGrid[0].map((val, index) => tempGrid.map(row => row[index]).reverse()); // i def wrote this
    let rotatedPiece = [];
    for (let y = 0; y < gridDimension; y++) {
        for (let x = 0; x < gridDimension; x++) {
            if (rotatedGrid[y][x] === true) {
                rotatedPiece.push([x, y]);
            }
        }
    }

    // see if can shift left within temporary grid then shift left 1 block
    let canShiftLeft = true;
    for (let i = 0; i < gridDimension; i++) {
        if (rotatedGrid[i][0] !== false) canShiftLeft = false;
    }
    if (canShiftLeft === true) {
        const leftShiftPiece = rotatedPiece.map(block => {
            return [block[0] - 1, block[1]];
        });
        if (checkBlocks(leftShiftPiece.map(block => {
            return [block[0] + currentPieceOriginX, block[1] + currentPieceOriginY];
        }))) {
            clearBlocks(currentPiece.map(block => {
                return [block[0] + currentPieceOriginX, block[1] + currentPieceOriginY];
            }));
            currentPiece = leftShiftPiece;
            drawBlocks(currentPiece.map(block => {
                return [block[0] + currentPieceOriginX, block[1] + currentPieceOriginY];
            }), currentPieceColor);
            return true;
        }
    }

    // check rotated piece if can't do left shift
    if (checkBlocks(rotatedPiece.map(block => {
        return [block[0] + currentPieceOriginX, block[1] + currentPieceOriginY];
    })) === true) {
        clearBlocks(currentPiece.map(block => {
            return [block[0] + currentPieceOriginX, block[1] + currentPieceOriginY];
        }));
        currentPiece = rotatedPiece;
        drawBlocks(currentPiece.map(block => {
            return [block[0] + currentPieceOriginX, block[1] + currentPieceOriginY];
        }), currentPieceColor);
        return true;
    }
    return false;
}

/** Skip to bottom and place the piece (save and indicate new spawn code reused from game loop) */
function skipToBottom() {
    // move to lowest possible
    while (moveDown() === true) {}

    // save, detect full rows and score, and indicate new spawn
    for (const block of currentPiece) {
        grid[block[1] + currentPieceOriginY][block[0] + currentPieceOriginX] = currentPieceColor;
    }
    detectFullRows();
    shouldSpawnNewPiece = true;
}