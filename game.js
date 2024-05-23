const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Constants
const cols = 8;
const rows = 8;
const tileSize = 75;

// Board variables 
let board = [];
let selectedTile = null;
let opacity = 1;

class gameBoardRectangle {
    constructor(x,y,value) {
        this.x = x;
        this.y = y;
        this.value = value;
        this.matched = false;
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
    opacity = 1;
    if (!selectedTile) {
        selectedTile = {x, y};
    } else {
        swapTiles(selectedTile.x, selectedTile.y, x, y);
        handleMatchesGameLogicAndAnimation();

        selectedTile = null;
    }
});

// Function to draw the board
function drawBoard() {
    canvas.innerHTML = '';
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            drawRectangle(x,y);
        }
    }
}

function drawRectangle(x,y)
{
    const boardRect = getBoardRectangle(x,y);
    ctx.fillStyle = getColor(boardRect.value);
    ctx.globalAlpha = opacity;
    ctx.fillRect(boardRect.x * tileSize, boardRect.y * tileSize, tileSize, tileSize);
    ctx.strokeRect(boardRect.x * tileSize, boardRect.y * tileSize, tileSize, tileSize);
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
        match.matched =true;
    });
}

function animateRemoval(matches) {
    return new Promise((resolve) => {
        console.log('test');
        function animate() {
            if(opacity > 0)
            {
                opacity -= 0.01;
                matches.forEach(match => {
                    ctx.clearRect(match.x * tileSize, match.y * tileSize, tileSize, tileSize);
                    drawRectangle(match.x,match.y);
                });
        
                requestAnimationFrame(animate);
            }
            else{
                opacity = 1;
                resolve();
            }
        }
        requestAnimationFrame(animate);
    })
}

function checkBoardState()
{
    handleRemovedMatchesGameLogic();
    handleFillingUpBoardGameLogic();
    drawBoard();
}

async function handleMatchesGameLogicAndAnimation() {
    let matches = checkForMatches();
    if (matches.length > 0) {
        removeMatches(matches);
        await animateRemoval(matches);
    }
    checkBoardState();
}

function handleRemovedMatchesGameLogic() {
    for (let y = rows-1; y >= 0; y--) {
        for (let x = cols-1; x >= 0; x--) {
            let cur = getBoardRectangle(x,y);
            if(cur.matched == true)
            {
                flipValueWithTop(x,y);
            }
        }
    }
}

function handleFillingUpBoardGameLogic()
{
    for (let y = rows-1; y >= 0; y--) {
        for (let x = cols-1; x >= 0; x--) {
            let cur = getBoardRectangle(x,y);
            if(cur.matched == true)
            {
                cur.value = Math.floor(Math.random() * 5);
            }
        }
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

function flipValueWithTop(x,y)
{
    if(y != 0)
    {
        let topRect = null;
        let checkY = y;
        while((topRect == null || topRect.value == null || topRect.matched == true) && checkY > 0)
        {
            checkY -= 1;
            topRect = getBoardRectangle(x,checkY);
        }

        setBoardRectangleValue(x,y,topRect.value)
    }
}