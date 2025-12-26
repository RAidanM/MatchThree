const board_width = 10;
const piece_colours = ["red", "blue", "green", "yellow", "purple"];
let firstClear = true;
let board = [];

let score = 0;
let swaps = 0;

function createBoard() {
    for (let i = 0; i < board_width * board_width; i++) {
        const colour = piece_colours[Math.floor(Math.random() * piece_colours.length)];
        board.push(colour);
    }
}

const gameBoard = document.getElementById("game-board");
const scoreBoard = document.getElementById("score-board");

function drawBoard() {
    gameBoard.innerHTML = "";
    scoreBoard.innerHTML = `Tiles cleared: ${score}<br>Swaps Used: ${swaps}`;
    console.log(score);

    board.forEach((color, index) => {
        const tile = document.createElement("div");
        tile.classList.add("tile", color);
        tile.dataset.index = index;
        gameBoard.appendChild(tile);
    });
}

function placeScoreboard() {
  const game = document.getElementById("game-board");
  const scoreboard = document.getElementById("score-board");

  const rect = game.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  if (vw > vh) {
    // Wider screen → place scoreboard to the right
    scoreboard.style.left = `${rect.right + 20}px`;
    scoreboard.style.top = `${rect.top}px`;
  } else {
    // Taller screen → place scoreboard below
    scoreboard.style.left = `${rect.left}px`;
    scoreboard.style.top = `${rect.bottom + 20}px`;
  }
}

window.addEventListener('resize', placeScoreboard);
window.addEventListener('load', placeScoreboard);

createBoard();
drawBoard();

let startSwapIndex = null;

gameBoard.addEventListener("pointerdown", (e) => {
    if (!e.target.classList.contains("tile")) return;

    startSwapIndex = +e.target.dataset.index;
    hasSwapped = false;
});

gameBoard.addEventListener("pointermove", (e) => {
    if (startSwapIndex === null || hasSwapped) return;

    const tile = document.elementFromPoint(e.clientX, e.clientY);
    if (!tile || !tile.classList.contains("tile")) return;

    const newIndex = +tile.dataset.index;

    if (isAdjacent(startSwapIndex, newIndex)) {
        swapByIndex(startSwapIndex, newIndex);
        checkBoard();
        hasSwapped = true;
    }

});

gameBoard.addEventListener("pointerup", () => {
    startSwapIndex = null;
});

function swapByIndex(i1, i2) {
    [board[i1], board[i2]] = [board[i2], board[i1]];
    swaps++;
}

function isAdjacent(i1, i2) {
    const x1 = i1 % board_width;
    const y1 = Math.floor(i1 / board_width);
    const x2 = i2 % board_width;
    const y2 = Math.floor(i2 / board_width);

    return Math.abs(x1 - x2) + Math.abs(y1 - y2) === 1;
}

function checkMatches() {
    let match_colour = board[0];
    let match = [0];
    const known_matches = [];

    //horizontals
    for (let i = 1; i < board.length; i++) {
        if (i % board_width === 0 || board[i] !== match_colour) {
            if (match.length > 2) {
                match.forEach(index => known_matches.push(index))
            }
            match = [i];
            match_colour = board[i];
        }
        else {
            match.push(i);
            if (i === board_width * board_width - 1 && match.length > 2) {
                match.forEach(index => known_matches.push(index))
            }
        }

    }

    //verticals
    match_colour = board[0];
    match = [0];

    let i = 0;
    while (i != board_width) {
        let j = 0;
        while (j != board_width) {
            let index = i + j * board_width;

            if (j === 0 || board[index] !== match_colour) {
                if (match.length > 2) {
                    match.forEach(local_index => known_matches.push(local_index))
                }
                match = [index];
                match_colour = board[index];
            }
            else {
                match.push(index);
                if (index === board_width * board_width - 1 && match.length > 2) {
                    match.forEach(index => known_matches.push(index))
                }
            }
            j++;
        }
        i++;
    }

    //removing matches
    known_matches.forEach(index => board[index] = null);

    if (known_matches.length > 0) { 
        score = score + known_matches.length;
        return true;
    }
    return false;

}

function dropTiles() {
    for (let i = board.length - 1; i >= 0; i--) {
        if (board[i] === null && i >= board_width) {
            for (let up = i - board_width; up >= 0; up = up - board_width) {
                if (board[up] !== null) {
                    board[i] = board[up];
                    board[up] = null;
                    break;
                }
            }
        }
    }
}

function refillBoard() {
    for (let i = 0; i < board_width; i++) {
        if (board[i] === null) {
            board[i] = piece_colours[Math.floor(Math.random() * piece_colours.length)];
        }
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkBoard() {
    while ( checkMatches() ){
        drawBoard();
        while ( board.some(element => element === null) ) {
            dropTiles();
            drawBoard();
            await delay(300);
            refillBoard();
            drawBoard();
            await delay(100);
        }
    }
    if (firstClear) {
        score = 0;
        firstClear = false;
    }
    drawBoard();
}



checkBoard();



