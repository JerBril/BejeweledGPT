const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Constants
const cols = 8;
const rows = 8;
const tileSize = 75;

// Board variables 
let board = [];
let selectedTile = null;

document.addEventListener('DOMContentLoaded', (event) => {

    // Initialize the board with random tiles
    for (let x = 0; x < cols; x++) {
        board[x] = [];
        for (let y = 0; y < rows; y++) {
            board[x][y] = Math.floor(Math.random() * 5); // Assuming 5 types of tiles
        }
    }

    drawBoard();
});

document.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / tileSize);
    const y = Math.floor((event.clientY - rect.top) / tileSize);

    if (!selectedTile) {
        selectedTile = {x, y};
    } else {
        checkMatchesGameLogic();
        swapTiles(selectedTile.x, selectedTile.y, x, y);
        drawBoard();

        selectedTile = null;
    }
});

// Function to draw the board
function drawBoard() {
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            ctx.fillStyle = getColor(board[x][y]);
            ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
    }
    console.log(board.toString());
}

// Function to get color based on tile type
function getColor(tile) {
    switch (tile) {
        case 0: return 'red';
        case 1: return 'blue';
        case 2: return 'green';
        case 3: return 'yellow';
        case 4: return 'purple';
        default: return 'black';
    }
}

function swapTiles(x1, y1, x2, y2) {
    const temp = board[x1][y1];
    board[x1][y1] = board[x2][y2];
    board[x2][y2] = temp;
}

function removeMatches(matches) {
    matches.forEach(match => {
        const { x, y } = match;
        board[x][y] = null;
    });
}

function animateRemoval(matches) {
    matches.forEach(match => {
        const { x, y } = match;
        ctx.clearRect(x * tileSize, y * tileSize, tileSize, tileSize);
    });
}

function checkMatchesGameLogic() {
    let matches = checkForMatches();
    if (matches.length > 0) {
        removeMatches(matches);
        animateRemoval(matches);
        setTimeout(() => {
            drawBoard();
            // Additional logic to drop tiles and refill the board
        }, 500); // match the transition duration
    }
}

function checkForMatches() {
    let matches = [];

    // Check for horizontal matches
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols - 2; x++) {
            if (board[x][y] === board[x + 1][y] && board[x][y] === board[x + 2][y]) {
                matches.push({x: x, y: y});
                matches.push({x: x + 1, y: y});
                matches.push({x: x + 2, y: y});
            }
        }
    }

    // Check for vertical matches
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows - 2; y++) {
            if (board[x][y] === board[x][y + 1] && board[x][y] === board[x][y + 2]) {
                matches.push({x: x, y: y});
                matches.push({x: x, y: y + 1});
                matches.push({x: x, y: y + 2});
            }
        }
    }

    return matches;
}