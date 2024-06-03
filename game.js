import { drawGame, drawRectangle, getBoardRectangle, setBoardRectangleValue } from "./gameDrawScript.js";
import { board, tileSize, cols, rows } from "./boardValues.js";

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Board variables 
let selectedTile = null;
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

    drawGame(ctx, selectedTile);
});

document.addEventListener('click', (event) => {
    if(!eventsPause)
    {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / tileSize);
        const y = Math.floor((event.clientY - rect.top) / tileSize);

        if (!selectedTile) {
            setSelectedTile(event.clientX,event.clientY)
            drawGame(ctx, selectedTile);
        } else {
            if(checkSwapAllowed(x,y))
            {
                eventsPause = true;
                swapTiles(selectedTile.x, selectedTile.y, x, y);
                selectedTile = null;
                drawGame(ctx, selectedTile);
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

function animatedRemoval(matches) {
    return new Promise((resolve) => {
        let opacity = 1;
        function animate() {
            if(opacity > 0)
            {
                opacity -= 0.003;
                matches.forEach(match => {
                    ctx.clearRect(match.x * tileSize, match.y * tileSize, tileSize, tileSize);
                    drawRectangle(match.x,match.y,opacity);
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

function animatedDropping(droppingJewel, droppingCoord) {
    return new Promise((resolve) => {
        let x = droppingJewel.x*tileSize;
        let y = droppingJewel.y*tileSize;
        function animate() {
            if(y < droppingCoord.y * tileSize)
            {
                y += 1;
                ctx.clearRect(x * tileSize, y * tileSize, tileSize, tileSize);
            }
            else{
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
    drawGame(ctx, selectedTile);
}

async function handleClickGameplayLoop() {
    let matches = checkForMatches();
    while(matches.length > 0)
    {
        labelMatchedJewels(matches);
        await animatedRemoval(matches);

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
            //await animatedDropping(topRect,{x,y})
            setBoardRectangleValue(x,y,topRect.value);
            topRect.removal = true;
        }
    }
}