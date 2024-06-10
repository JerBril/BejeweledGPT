import { board, tileSize, cols, rows } from './boardValues.js';

let context = null;

// Function to draw the board
export function drawGame(ctx, selectedTile) {
    context = ctx;
    drawBoard()
    drawSelectedTile(selectedTile)
}

function drawBoard(){
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            drawRectangle(x,y,1);
        }
    }
}

function drawSelectedTile(selectedTile)
{
    if(selectedTile != null)
    {
        let selectedRect = getBoardRectangle(selectedTile.x,selectedTile.y);
        context.fillStyle = 'black';
        context.lineWidth = 5
        context.strokeRect(selectedRect.x * tileSize, selectedRect.y * tileSize, tileSize, tileSize);
    }
}

export function drawRectangle(x,y,opacity)
{
    const boardRect = getBoardRectangle(x,y);
    context.fillStyle = getColor(boardRect.value);
    context.lineWidth = 1;
    context.globalAlpha = opacity;
    context.fillRect(boardRect.x * tileSize, boardRect.y * tileSize, tileSize, tileSize);
    context.strokeRect(boardRect.x * tileSize, boardRect.y * tileSize, tileSize, tileSize);
    context.fillStyle = 'black';

    //Debug info
    context.fillText('x: '+boardRect.x,boardRect.x*tileSize,boardRect.y*tileSize+50);
    context.fillText('y: '+boardRect.y,boardRect.x*tileSize,boardRect.y*tileSize+40);
    context.fillText('removal: '+boardRect.removal,boardRect.x*tileSize,boardRect.y*tileSize+30);
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

export function getBoardRectangle(x,y)
{
    return board.find(rectangle => rectangle.x === x && rectangle.y === y);
}

export function setBoardRectangleValue(x,y,value)
{
    const boardRect = getBoardRectangle(x,y);
    boardRect.value = value;
    boardRect.newValue = value;
    boardRect.removal = false;
}