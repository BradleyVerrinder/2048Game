// Contains all the game logic for 2048

const board = [
    0, 0, 2, 0,
    0, 0, 0, 0,
    0, 0, 0, 2,
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

renderBoard(board);
