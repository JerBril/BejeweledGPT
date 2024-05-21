const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Constants
const cols = 8;
const rows = 8;
const tileSize = 75;

// Board variables 
let board = [];
let selectedTile = null;

class gameBoardRectangle {
    constructor(x,y,value) {
        this.x = x;
        this.y = y;
        this.value = value;
    }
}

document.addEventListener('DOMContentLoaded', (event) => {

    // Initialize the board with random tiles
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            board.push(new gameBoardRectangle(x,y,Math.floor(Math.random() * 5))); // Assuming 5 types of tiles
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
        swapTiles(selectedTile.x, selectedTile.y, x, y);
        handleMatchesGameLogic();
        drawBoard();

        selectedTile = null;
    }
});

// Function to draw the board
function drawBoard() {
    canvas.innerHTML = '';
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            const boardRect = getBoardRectangle(x,y);
            createJewel(boardRect);
        }
    }
}

function createJewel(boardRect)
{
    console.log(boardRect.x * tileSize);
    const jewel = document.createElement('div');

     jewel.style.backgroundColor = getColor(boardRect.value);
     jewel.style.left = boardRect.x * tileSize+'px';
     jewel.style.top = boardRect.y * tileSize+'px';
     jewel.style.width = tileSize+'px';
     jewel.style.height = tileSize+'px';
     jewel.style.borderStyle = "solid";
     jewel.style.borderColor = "red";
     jewel.style.borderWidth = "1px";
     jewel.style.position = 'absolute';
     jewel.style.zIndex = "100000";
     ctx.appendChild(jewel);
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
    const gameRect1 = getBoardRectangle(x1,y1);
    const gameRect2 = getBoardRectangle(x2,y2);
    const gameRect1Value = gameRect1.value;
    const gameRect2Value = gameRect2.value;

    setBoardRectangleValue(x1,y1,gameRect2Value);
    setBoardRectangleValue(x2,y2,gameRect1Value);
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

function handleMatchesGameLogic() {
    let matches = checkForMatches();
    if (matches.length > 0) {
        removeMatches(matches);
        animateRemoval(matches);
    }
}

function checkForMatches() {
    let matches = [];

    // Check for horizontal matches
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols - 2; x++) {
            let first = getBoardRectangle(x,y);
            let second = getBoardRectangle(x+1,y);
            let third = getBoardRectangle(x+2,y);
            if (first.value === second.value && first.value === third.value) {
                matches.push(first);
                matches.push(second);
                matches.push(third);
            }
        }
    }

    // Check for vertical matches
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows - 2; y++) {
            let first = getBoardRectangle(x,y);
            let second = getBoardRectangle(x,y+1);
            let third = getBoardRectangle(x,y+2);
            if (first.value === second.value && first.value === third.value) {
                matches.push(first);
                matches.push(second);
                matches.push(third);
            }
        }
    }
    console.log(matches);
    return matches;
}

function getBoardRectangle(x,y)
{
    return board.find(rectangle => rectangle.x === x && rectangle.y === y);
}

function setBoardRectangleValue(x,y,value)
{
    const boardRect = getBoardRectangle(x,y);
    boardRect.value = value;
}