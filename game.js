const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Constants
const cols = 10;
const rows = 10;
const tileSize = 75;

// Board variables 
let board = [];
let selectedTile = null;
let opacity = 1;
let eventsPause = false;

class gameBoardRectangle {
    constructor(x,y,value) {
        this.x = x;
        this.y = y;
        this.value = value;
        this.removal = false;
        this.dropIn = false;
    }
}

document.addEventListener('DOMContentLoaded', (event) => {

    // Initialize the board with random tiles
    canvas.width = cols*tileSize;
    canvas.height = rows*tileSize;
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            
            board.push(new gameBoardRectangle(x,y,Math.floor(Math.random() * 5))); // Assuming 5 types of tiles
        }
    }

    drawGame();
});

document.addEventListener('click', (event) => {
    if(!eventsPause)
    {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / tileSize);
        const y = Math.floor((event.clientY - rect.top) / tileSize);
        opacity = 1;
        if (!selectedTile) {
            setSelectedTile(event.clientX,event.clientY)
            drawGame();
        } else {
            if(checkSwapAllowed(x,y))
            {
                eventsPause = true;
                swapTiles(selectedTile.x, selectedTile.y, x, y);
                selectedTile = null;
                drawGame();
                handleClickGameplayLoop();
            }
            else{
                console.log('move not allowed');
            }        
        }
    }
});

function setSelectedTile(x1,y1)
{
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((x1 - rect.left) / tileSize);
    const y = Math.floor((y1 - rect.top) / tileSize);
    if(x < rows && y < cols)
    {
        selectedTile = {x, y};
    }
    else
    {
        console.log('no tile selected')
    }
}

// Function to draw the board
function drawGame() {
    drawBoard()
    drawSelectedTile()
}

function drawBoard(){
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            drawRectangle(x,y);
        }
    }
}

function drawSelectedTile()
{
    if(selectedTile != null)
    {
        let selectedRect = getBoardRectangle(selectedTile.x,selectedTile.y);
        ctx.fillStyle = 'black';
        ctx.lineWidth = 5
        ctx.strokeRect(selectedRect.x * tileSize, selectedRect.y * tileSize, tileSize, tileSize);
    }
}

function drawRectangle(x,y)
{
    const boardRect = getBoardRectangle(x,y);
    ctx.fillStyle = getColor(boardRect.value);
    ctx.lineWidth = 1;
    ctx.globalAlpha = opacity;
    ctx.fillRect(boardRect.x * tileSize, boardRect.y * tileSize, tileSize, tileSize);
    ctx.strokeRect(boardRect.x * tileSize, boardRect.y * tileSize, tileSize, tileSize);
    ctx.fillStyle = 'black';


    //Debug info
    ctx.fillText('x: '+boardRect.x,boardRect.x*tileSize,boardRect.y*tileSize+50);
    ctx.fillText('y: '+boardRect.y,boardRect.x*tileSize,boardRect.y*tileSize+40);
    ctx.fillText('removal: '+boardRect.removal,boardRect.x*tileSize,boardRect.y*tileSize+30);
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

function checkSwapAllowed(x,y)
{
    if(selectedTile != null)
    {
        let xDiff = Math.abs(selectedTile.x - x);
        let yDiff = Math.abs(selectedTile.y - y);

        return (xDiff + yDiff) == 1;
    }

    return false;
}

function swapTiles(x1, y1, x2, y2) {
    const gameRect1 = getBoardRectangle(x1,y1);
    const gameRect2 = getBoardRectangle(x2,y2);
    const gameRect1Value = gameRect1.value;
    const gameRect2Value = gameRect2.value;

    setBoardRectangleValue(x1,y1,gameRect2Value);
    setBoardRectangleValue(x2,y2,gameRect1Value);
}

function labelMatchedJewels(matches) {
    matches.forEach(match => {
        match.removal =true;
    });
}

function animateRemoval(matches) {
    return new Promise((resolve) => {
        function animate() {
            if(opacity > 0)
            {
                opacity -= 0.003;
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

function updateBoardState()
{
    handleRemovedMatchesGameLogic();
    handleFillingUpBoardGameLogic();
    setAllJewelsToNotMatched();
    drawGame();
}

async function handleClickGameplayLoop() {
    let matches = checkForMatches();
    while(matches.length > 0)
    {
        labelMatchedJewels(matches);
        await animateRemoval(matches);

        updateBoardState();
        matches = checkForMatches();
    }
    eventsPause = false;
}

function handleRemovedMatchesGameLogic() {
    for (let y = rows-1; y >= 0; y--) {
        for (let x = cols-1; x >= 0; x--) {
            let cur = getBoardRectangle(x,y);
            if(cur.removal == true)
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
            if(cur.removal == true)
            {
                cur.value = Math.floor(Math.random() * 5);
                cur.dropIn = true;
            }
        }
    }
}

function setAllJewelsToNotMatched()
{
    board.forEach(obj => {
        obj.removal = false;
    })
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
    boardRect.removal = false;
}

function flipValueWithTop(x,y)
{
    if(y != 0)
    {
        let topRect = null;
        let checkY = y;
        while((topRect == null || topRect.value == null || topRect.removal == true))
        {
            checkY -= 1;
            if(checkY < 0)
            {
                topRect = null;
                break;
            }
            topRect = getBoardRectangle(x,checkY);
        }
        if(topRect != null)
        {
            setBoardRectangleValue(x,y,topRect.value);
            topRect.removal = true;
        }
    }
}