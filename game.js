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
                emptyCells.push({ row, col }); // Push row and column index - It adds the indexes of the empty cells into the array so [2,3] would mean in row 2 column 3 there is an empty cell
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

    // JSON.stringify used to compare the boards state before and after a move. Arrays cannot be directly compared so you need to stringify the board
    let oldBoard = JSON.stringify(board);

    switch(direction){
        case "left":
            // Loops through each row and applies slideLeft to the row
            for (let i = 0; i < board.length; i++){
                board[i] = slideLeft(board[i]);
            }
            break;
        case "right":
            // Loops through each row and applies slideRight to the row
            for (let i = 0; i < board.length; i++){
                board[i] = slideRight(board[i]);
            }
            break;
        case "up":
            slideUp();
            break;
        case "down":
            slideDown();
            break;
    }
    let newBoard = JSON.stringify(board); // After move, check if board changed

    if (oldBoard !== newBoard) {
        addRandomTile(board);      // Only add tile if something moved
        renderBoard(board);        // Update the HTML
    }
    isGameOver(board);
}

// Slide functions

// Updating score variables
let score = 0;
let scoreDOM = document.getElementById("score");

// Best score variables
let bestScore = localStorage.getItem("bestScore") || 0;

const bestScoreDOM = document.getElementById("best-score");
bestScoreDOM.textContent = bestScore;

function slideLeft(row) {
    // Removing zeros
    let filtered = row.filter(val => val !== 0);

    let merged = [];
    for (let i = 0; i < filtered.length; i++) {
        if (filtered[i] === filtered[i + 1]) {
            merged.push(filtered[i] * 2);
            score += filtered[i] * 2;
            i++;
        } else {
            merged.push(filtered[i]);
        }
    }

    while (merged.length < 4) {
        merged.push(0);
    }

    scoreDOM.textContent = score; // Updating the score on the DOM element

    // If current score is bigger than best score, update best to current and update the best score value
    if (score > bestScore){
        bestScore = score;
        localStorage.setItem("bestScore", bestScore);
        bestScoreDOM.textContent = bestScore; // Updating best score on the DOM element

    }

    return merged;
}
// Grabs column, puts it into a 1d array, applies slide left, returns it into the board as it previously was
function slideUp(){
    // Nested loop in reverse order so each column is grabbed rather than row
    for (let col = 0; col < 4; col++){
        let column = [];
        for (let row = 0; row < 4; row++){
            column.push(board[row][col]);
        }

        // Slide the column to the left like a row
        let newColumn = slideLeft(column);

        // Place the updated column back into the board
        for (let row = 0; row < 4; row++){
            board[row][col] = newColumn[row]
        }
    }
}

function slideRight(row) {
    // Reverse to work left to right - using spread operator to create a shallow copy of the array so its unaffected elsewhere
    let reversed = [...row].reverse();

    // Remove zeros
    let filtered = reversed.filter(val => val !== 0);

    // Merge logic — make sure we skip the next tile after a merge
    let merged = [];
    for (let i = 0; i < filtered.length; i++) {
        if (filtered[i] === filtered[i + 1]) {
            merged.push(filtered[i] * 2);
            score += filtered[i] * 2;
            i++; // Skip next, since it was merged (This was previously done but calling .splice[filtered[i+1]])
        } else {
            merged.push(filtered[i]);
        }
    }

    // Fill with zeros
    while (merged.length < 4) {
        merged.push(0);
    }

    scoreDOM.textContent = score; // Updating score on the DOM element

    // If current score is bigger than best score, update best to current and update the best score value
    if (score > bestScore){
        bestScore = score;
        localStorage.setItem("bestScore", bestScore);
        bestScoreDOM.textContent = bestScore; // Updating best score on the DOM element

    }
    
    // Reverse back to restore slide-right behavior
    return merged.reverse();
}

// Grabs column, reverses column, puts it into a 1d array, applies slide left, returns it into the board as it previously was
function slideDown(){
    // Nested loop in reverse order so each column is grabbed rather than row
    for (let col = 0; col < 4; col++){
        let column = [];
        for (let row = 0; row < 4; row++){
            column.push(board[row][col]);
        }

        column.reverse();

        // Slide the column to the left like a row
        let newColumn = slideLeft(column);

        newColumn.reverse();

        // Place the updated column back into the board
        for (let row = 0; row < 4; row++){
            board[row][col] = newColumn[row]
        }
    }
}

// Checking for game over

function hasEmptyTile(board){
    // Loops through each row in the board and checks for zeros
    return board.some(row => row.includes(0));
}

function hasMergeableTiles(board){
    // i = Rows :  J = Columns : Comparing adjacent tiles to see if they can still be merged
    for (let i = 0; i < 4; i++){
        for (let j = 0; j < 4; j++){
            if (j < 3 && board[i][j] === board[i][j+1]){
                return true;  // Checks right
            }

            if (i < 3 && board[i][j] === board[i+1][j]){
                return true; // Checks down
            }
            
        }
    }
    return false;
}

function isGameOver(board){
    if (!hasEmptyTile(board) && !hasMergeableTiles(board)){
        // Showing game over mesage
        document.getElementById("gameOverMessage").classList.remove("hidden");
        console.log("game over")
    }
}

// Resetting the game upon click
document.getElementById("startAgainBtn").addEventListener("click", function() {
    board = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];

    // Hide the game over message
    document.getElementById("gameOverMessage").classList.add("hidden");

    // Resetting score after restarting game
    score = 0;
    scoreDOM.textContent = 0;

    
    // Add random tiles to start
    addRandomTile(board);
    addRandomTile(board);

    // Re-render the board
    renderBoard(board);
})



// Initial rendering of the board
addRandomTile(board)
addRandomTile(board)

renderBoard(board);


