// Contains all the game logic for 2048

let board = [
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0
]


function renderBoard(board){

    const boardContainer = document.querySelector(".board");

    // Resetting the board
    boardContainer.innerHTML = "";

    for (let row of board){
        const tile = document.createElement("div");
        tile.classList.add("tile");
        if (row !== 0){
            tile.textContent = row;
            tile.setAttribute("data-value", row);
        }
        boardContainer.appendChild(tile);
    }

}

function addRandomTile(board){
    // Find empty cells
    const emptyIndices = board
    .map((value,index) => value === 0 ? index : -1)
    .filter(index => index!== -1);

    //Board is full
    if (emptyIndices.length === 0) return;

    // Choosing random choice from the empty indices array
    const randIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];

    // 90% chance of being a 2 and 10% chance of being a 4
    const newValue = Math.random() < 0.9 ? 2 : 4

    // Placing random value on the board
    board[randIndex] = newValue
}


addRandomTile(board)
addRandomTile(board)

renderBoard(board);
