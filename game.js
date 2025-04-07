// Contains all the game logic for 2048

let board = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
]


function renderBoard(board){

    const boardContainer = document.querySelector(".board");

    // Resetting the board
    boardContainer.innerHTML = "";

    // Loops through rows
    for (let row = 0; row < board.length; row++){
        // Loops through columns inside the rows
        for (let col = 0; col < board[row].length; col++){
            const tile = document.createElement("div");
            tile.classList.add("tile");

            // Get the value at the current row and column
            const value = board[row][col];

            // If value is not 0, show the tile with the numebr
            if (value !== 0){
                tile.textContent = value;
                tile.setAttribute("data-value", value);
            }

            // Adds tile to container
            boardContainer.appendChild(tile);
        }
        
       
    }

}

function addRandomTile(board) {
    // Find empty cells
    const emptyCells = [];

    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
            if (board[row][col] === 0) {
                emptyCells.push({ row, col }); // Push row and column index
            }
        }
    }
    // Board is full
    if (emptyCells.length === 0) return;

    // Choosing random choice from the empty cells array
    const randCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];

    // 90% chance of being a 2 and 10% chance of being a 4
    const newValue = Math.random() < 0.9 ? 2 : 4;

    // Placing random value on the board
    board[randCell.row][randCell.col] = newValue;
    console.log(emptyCells)
}

//---------------------------------------------------------------------------------------------------/

// Movement and Game logic
document.addEventListener("keydown", handleKeyPress);

function handleKeyPress(e){
    switch (e.key){
        case "ArrowUp":
            move("up");
            break;
        case "ArrowDown":
            move("down");
            break;
        case "ArrowLeft":
            move("left");
            break;
        case "ArrowRight":
            move("right");
            break;
    }
}

let direction = ""

// Movement function
function move(direction){
    switch(direction){
        case "left":
            slideLeft();
            break;
        case "right":
            slideRight();
            break;
        case "up":
            slideUp();
            break;
        case "down":
            slideDown();
            break;
    }
}


addRandomTile(board)
addRandomTile(board)

renderBoard(board);
