// Contains all the game logic for 2048

let board = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
]

// POWERUPS LOGIC
let isSwapping = false;
let firstSwapTile = null;
let swapsLeft = 0;

let canUndo = true;


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

            // Assign a position to each tile so they can be swapped correctly
            tile.dataset.row = row;
            tile.dataset.col = col;

            // Get the value at the current row and column
            const value = board[row][col];

            // If value is not 0, show the tile with the numebr
            if (value !== 0){
                tile.textContent = value;
                tile.setAttribute("data-value", value);
            }

            // FUNCTION FOR SWAPPING POWERUP//
            //--------------------------------------------------------------------------------------------//
            // Makes all tiles clickable and allows user to swap 2 tiles of their choice
            tile.addEventListener("click", () => {
                if (!isSwapping){
                    if(!isBombing){
                        return;
                    }
                    else{
                        // Loops through rows
                        for (let row = 0; row < board.length; row++){
                            // Loops through columns inside the rows
                            for (let col = 0; col < board[row].length; col++){
                                if (board[row][col] == tile.dataset.value){
                                    board[row][col] = 0;
                                }
                            }
                        }
                        hideBombMessage();
                        isBombing = false;
                        bombsLeft--;
                        updateBars("bomb");
                        document.body.classList.remove("swap-mode");
                        document.querySelector(".swap-button").disabled = false;
                        document.querySelector(".undo-button").disabled = false;
                        renderBoard(board);
                        return;
                    }
                }
                else{
                    if (!firstSwapTile) {
                        firstSwapTile = tile;
                        tile.classList.add('selected')
                    }
                    else {
                        const secondTile = tile;

                        // Grabbing the actual position of the first tile and the second tile using the assigned values from the renderBoard function
                        const firstPos = {
                            row: parseInt(firstSwapTile.dataset.row),
                            col: parseInt(firstSwapTile.dataset.col)
                        };
                        const secondPos = {
                            row: parseInt(secondTile.dataset.row),
                            col: parseInt(secondTile.dataset.col)
                        };
                    
                        // Swap the actual values in the board array
                        const temp = board[firstPos.row][firstPos.col];
                        board[firstPos.row][firstPos.col] = board[secondPos.row][secondPos.col];
                        board[secondPos.row][secondPos.col] = temp;                       
                    
                        // Swap values
                        const tempValue = firstSwapTile.dataset.value // dataset is used since divs don't have values. the div is instantiated with data-value in the renderBoard function
                        firstSwapTile.dataset.value = secondTile.dataset.value;
                        secondTile.dataset.value = tempValue;
                    
                        // Update tile text
                        const tempText = firstSwapTile.textContent;
                        firstSwapTile.textContent = secondTile.textContent;
                        secondTile.textContent = tempText;

                        // Updating Visuals
                        firstSwapTile.classList.remove("selected");
                        isSwapping = false;
                        swapsLeft--;
                        updateBars("swap");
                        document.querySelector(".bomb-button").disabled = false;
                        document.querySelector(".undo-button").disabled = false;
                        document.body.classList.remove("swap-mode");
                        hideSwapMessage();
                    }
                }
            })
            //-----------------------------------------------------------------------------------------------------//

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
    if (isSwapping) return; // Don't move when swapping
    if (isBombing) return; //Don't move when bombing
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

// Touch screen  movement logic
document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("gameContainer");
  
    let touchStartX = 0;
    let touchStartY = 0;
  
    container.addEventListener("touchstart", function (e) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: false });
  
    container.addEventListener("touchend", function (e) {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
  
      const dx = touchEndX - touchStartX;
      const dy = touchEndY - touchStartY;
  
      // Threshold to ignore accidental tiny swipes
      if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
  
      if (Math.abs(dx) > Math.abs(dy)) {
        dx > 0 ? move("right") : move("left");
      } else {
        dy > 0 ? move("down") : move("up");
      }
  
      e.preventDefault(); // Block scrolling
    }, { passive: false });
  });

let direction = ""

// Previous board state variable declared globally for undo function
let oldboard = null;

// List of previous boards (will only ever be 1)
let previousBoards = [];

// Movement function
function move(direction){

    // JSON.stringify used to compare the boards state before and after a move. Arrays cannot be directly compared so you need to stringify the board
    oldboard = JSON.stringify(board);

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

    if (oldboard !== newBoard) {
        addRandomTile(board);      // Only add tile if something moved
        renderBoard(board);       // Update the HTML
        checkForPowerUps(board);
        checkWin(board);
        previousBoards[0] = oldboard;
        console.log(previousBoards);

    }
    canUndo = true; // Allows the user to click undo again after a move has been made
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

        // Disable powerup buttons
        document.querySelector(".undo-button").disabled = true;
        document.querySelector(".swap-button").disabled = true;
        document.querySelector(".bomb-button").disabled = true;
    }

}

let hasWon = false;
function checkWin(board) {
    const flat = board.flat();
    if (flat.includes(2048) && !hasWon) {
      hasWon = true;
      document.getElementById("winMessage").classList.remove("hidden");
  
      // Confetti animation
      confetti({
        particleCount: 200,
        spread: 90,
        origin: { y: 0.6 }
      });
    }
  }


  document.getElementById("continueBtn").addEventListener("click", () => {
    document.getElementById("winMessage").classList.add("hidden");
  });
  
  document.getElementById("restartBtn").addEventListener("click", () => {
    document.getElementById("winMessage").classList.add("hidden");
    document.getElementById("gameOverMessage").classList.add("hidden");
    startNewGame(); // You probably already have this function for resets
  });

function startNewGame(){
    board = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];

    hasWon = false;

    // Resetting score after restarting game
    score = 0;
    scoreDOM.textContent = 0;

    //Resetting powerups
    undosLeft = 0;
    swapsLeft = 0;
    bombsLeft = 0;

    // Reset UI bars
    updateBars("undo");
    updateBars("swap");
    updateBars("bomb");

    //Resetting powerups awarded
    awardedPowerUps = {
        undo: [],
        swap: [],
        bomb: []
    };
    
    
    // Add random tiles to start
    addRandomTile(board);
    addRandomTile(board);

    // Re-render the board
    renderBoard(board);
};


// Resetting the game upon click
document.getElementById("startAgainBtn").addEventListener("click", function() {

    startNewGame();

    // Hide the game over message
    document.getElementById("gameOverMessage").classList.add("hidden");
})

let bars;

// Updating visuals for the powerup swap bars
function updateBars(powerup) {
    let bars, count;

    switch(powerup){
        case "undo":
            // Grabs all the swap bars via the css class on the div containing the bars
            bars = document.querySelectorAll(".undo-bars .bar");
            count = undosLeft;
            break;
        case "swap":
            // Grabs all the swap bars via the css class on the div containing the bars
            bars = document.querySelectorAll(".swap-bars .bar");
            count = swapsLeft;
            break;
        case "bomb":
            // Grabs all the swap bars via the css class on the div containing the bars
            bars = document.querySelectorAll(".bomb-bars .bar");
            count = bombsLeft;
    }

    bars.forEach((bar, index) => {
        if (index < count) {
            bar.classList.add('filled');
        } else {
            bar.classList.remove('filled');
        }
    });
}

let awardedPowerUps = {
    undo: [],
    swap: [],
    bomb: []
};

// This function prevents the user from getting unlimited powerups and only receives them after reaching certain values on the board
function checkForPowerUps(board) {
    // Check for Undo Power-ups (64 and 256)
    if (hasTile(board, 64) && !awardedPowerUps.undo.includes(64)) {
        undosLeft = 1; // First undo power-up
        awardedPowerUps.undo.push(64); // Mark 64 as used for undo
        updateBars("undo"); // Update the UI for undo power-up
    } else if (hasTile(board, 256) && !awardedPowerUps.undo.includes(256)) {
        if(undosLeft === 1){
            undosLeft = 2; // Second undo power-up
            awardedPowerUps.undo.push(256); // Mark 256 as used for undo
            updateBars("undo");
        }
        else if (undosLeft === 0){
            undosLeft = 1;
            awardedPowerUps.undo.push(256); // Mark 256 as used for undo
            updateBars("undo");
        }
    }

    // Check for Swap Power-ups (128 and 512)
    if (hasTile(board, 128) && !awardedPowerUps.swap.includes(128)) {
        swapsLeft = 1; // First swap power-up
        awardedPowerUps.swap.push(128); // Mark 128 as used for swap
        updateBars("swap");
    } else if (hasTile(board, 512) && !awardedPowerUps.swap.includes(512)) {
        if(swapsLeft === 1){
            swapsLeft = 2; // Second swap power-up
            awardedPowerUps.swap.push(512); // Mark 512 as used for swap
            updateBars("swap");
        }
        else if (swapsLeft === 0){
            swapsLeft = 1; // Second swap power-up
            awardedPowerUps.swap.push(512); // Mark 512 as used for swap
            updateBars("swap");
        }

    }

    // Check for Bomb Power-ups (256 and 1024)
    if (hasTile(board, 256) && !awardedPowerUps.bomb.includes(256)) {
        bombsLeft = 1; // First bomb power-up
        awardedPowerUps.bomb.push(256); // Mark 256 as used for bomb
        updateBars("bomb");
    } else if (hasTile(board, 1024) && !awardedPowerUps.bomb.includes(1024)) {
        if(bombsLeft === 1){
            bombsLeft = 2; // Second bomb power-up
            awardedPowerUps.bomb.push(1024); // Mark 1024 as used for bomb
            updateBars("bomb");
        }
        else if (bombsLeft === 0){
            bombsLeft = 1;
            awardedPowerUps.bomb.push(1024); // Mark 1024 as used for bomb
            updateBars("bomb");
        }

    }
}

// Enables tiles to be clicked and have their values swapped
function swap() {
    if (swapsLeft > 0){
        document.querySelector(".bomb-button").disabled = true;
        document.querySelector(".undo-button").disabled = true;
        isSwapping = true;
        firstSwapTile = null
        document.body.classList.add("swap-mode");
        showSwapMessage();
    }
}

function showSwapMessage() {
    document.querySelector(".score-container").classList.add("hidden");
    document.getElementById("swap-message").classList.remove("hidden");
}

function hideSwapMessage() {
    document.getElementById("swap-message").classList.add("hidden");
    document.querySelector(".score-container").classList.remove("hidden");
}
function cancelSwap() {
    if (firstSwapTile) {
        firstSwapTile.classList.remove("selected");
    }
    isSwapping = false;
    firstSwapTile = null;
    document.body.classList.remove("swap-mode");

    // Other powerups can be used again
    document.querySelector(".bomb-button").disabled = false;
    document.querySelector(".undo-button").disabled = false;

    // Trigger shake animation on swap message
    const swapMessage = document.getElementById("swap-message");
    swapMessage.classList.add("shake");

    // Remove the class after animation finishes, so it can be reused later
    setTimeout(() => {
        swapMessage.classList.remove("shake");
        hideSwapMessage();
    }, 400); // Match the animation duration (0.4s)
}

let undosLeft = 0;
const undoButton = document.getElementsByClassName("undo-button");
undoButton.disabled = (undosLeft === 0);

function undo(){
    if (undosLeft > 0){
        if (canUndo){
            if (previousBoards.length > 0){
                board = JSON.parse(previousBoards[0]);
                renderBoard(board);
                undosLeft--;
                updateBars("undo");
                canUndo = false;
            }
        }
    }
}

let bombsLeft = 0
let isBombing = false;

// Precaution to avoid the user using the bomb too early and allowing the grid to become empty (this will break the game)
function hasTile(board, value) {
    return board.some(row => row.includes(value));
}


function showBombMessage() {
    document.querySelector(".score-container").classList.add("hidden");
    document.getElementById("bomb-message").classList.remove("hidden");
}

function hideBombMessage() {
    document.getElementById("bomb-message").classList.add("hidden");
    document.querySelector(".score-container").classList.remove("hidden");
}
function cancelBomb() {
    isBombing = false;
    document.body.classList.remove("swap-mode");

    // Other powerups can be used again
    document.querySelector(".swap-button").disabled = false;
    document.querySelector(".undo-button").disabled = false;

    // Trigger shake animation on swap message
    const bombMessage = document.getElementById("bomb-message");
    bombMessage.classList.add("shake");

    // Remove the class after animation finishes, so it can be reused later
    setTimeout(() => {
        bombMessage.classList.remove("shake");
        hideBombMessage();
    }, 400); // Match the animation duration (0.4s)
}

function bomb(){
    if (bombsLeft > 0){
        document.querySelector(".swap-button").disabled = true;
        document.querySelector(".undo-button").disabled = true;
        isBombing = true;
        document.body.classList.add('swap-mode');
        showBombMessage();
    }
}

// Start New Game button code
const newGameModal = document.getElementById("newGameModal");
const confirmNewGameBtn = document.getElementById("confirmNewGame");
const cancelNewGameBtn = document.getElementById("cancelNewGame");

function newGame(){
    newGameModal.classList.remove("hidden");
}

function confirmNewGame(){
    newGameModal.classList.add("hidden");
    startNewGame();
}
function cancelNewGame(){
    newGameModal.classList.add("hidden");
}

// Initial rendering of the board
addRandomTile(board)
addRandomTile(board)

renderBoard(board);


