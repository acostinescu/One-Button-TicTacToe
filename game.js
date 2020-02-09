/**
 * Board Elements
 */
const ROW_LIST = $(".gameboard_row");
const SQUARE_LIST = $(".gameboard_square");
const LEFT_RIGHT_DIAG = SQUARE_LIST.eq(0).add(SQUARE_LIST.eq(4)).add(SQUARE_LIST.eq(8));
const RIGHT_LEFT_DIAG = SQUARE_LIST.eq(2).add(SQUARE_LIST.eq(4)).add(SQUARE_LIST.eq(6));
const TURN_BOX = $("#turn_box");
const TURN_BOX_ICON = $("#turn_box_icon");
const TURN_BOX_TEXT = $("#turn_box_text");


/**
 * Character for the keyboard key that is being used as the game key
 */
const KEYBOARD_BUTTON = " ";


/**
 * Selection modes
 * selectionMode - Current selection mode
 * prevSelectionMode - Used for alerts, used to return to previous mode when alert is closed
 * SMODE_ROW - Row selection mode
 * SMODE_COL - Column selection mode
 * SMODE_ALERT - Alert interaction mode
 */
var selectionMode = 0;
var prevSelectionMode;
const SMODE_ROW = 0;
const SMODE_COL = 1;
const SMODE_ALERT = 2;


/**
 * Key hold
 * keyDownFlag - Tracks if the game key is currently being held down
 * keyHoldTimeout - Timeout for tracking the keyhold event
 * HOLD_TIME - Time in ms that the game key needs to be held down to trigger the keyhold event
 */
var keyDownFlag = false;
var keyHoldTimeout;
const HOLD_TIME = 700;


/**
 * Key double-tap
 * keyRepeatFlag - Tracks if we are waiting for a second press to trigger the double-tap event
 * keyRepeatFlagRemove - Tracks if we need to stop waiting for a second press
 * keyRepeatTimeout - Timeout for tracking the double-tap event
 * DOUBLE_PRESS_TIME - Max time in ms between taps to trigger a double-tap event
 */
var keyRepeatFlag = false;
var keyRepeatFlagRemove = false;
var keyRepeatTimeout;
const DOUBLE_PRESS_TIME = 175;


/**
 * Tracks whether to block certain keyup events
 */
var blockKeyupFlag = false;


/**
 * Players
 * currentPlayer - The player whose turn it currently is
 * PLAYER_ONE - The first player (x)
 * PLAYER_TWO - The second player (o)
 * TIE_GAME - Used when checking for a win state if no one has won and there are no empty squares left
 */
var currentPlayer = 0;
const PLAYER_ONE = 0;
const PLAYER_TWO = 1;
const TIE_GAME = -1;


/**
 * Keypress (keydown) function
 */
$(document).keypress(function(e){
    if(e.key == KEYBOARD_BUTTON && !keyDownFlag){
        
        // Row selection mode
        if(selectionMode == SMODE_ROW)
        {
            // Check for holding key
            keyHoldTimeout = setTimeout(function(){
                blockKeyupFlag = true;
                selectRow();
                highlightNextCol();
            }, HOLD_TIME)
        }

        // Column selection mode (row is selected)
        else if (selectionMode == SMODE_COL){

            keyHoldTimeout = setTimeout(function(){
                markCol();
            }, HOLD_TIME);

            // Check for double pressing key
            if(!keyRepeatFlag){
                keyRepeatFlag = true;
                keyRepeatTimeout = setTimeout(function(){
                    keyRepeatFlag = false;
                    keyRepeatFlagRemove = true;
                }, DOUBLE_PRESS_TIME);
            }
            else {
                // Handle double press
                clearSelectedRow();
                clearHighlightedCol();
                blockKeyupFlag = true;
            }
        }

        // Alert selection mode (alert is visible)
        else if (selectionMode == SMODE_ALERT){
            $(".alert_btn").click();
            blockKeyupFlag = true;
        }
    }
    keyDownFlag = true;
});


/**
 * Keyup function
 */
$(document).on("keyup", function(e){
    if(e.key == KEYBOARD_BUTTON){
        
        // When the key is lifted, clear the timeout function that handles the key hold event
        clearTimeout(keyHoldTimeout);
        
        if(selectionMode == SMODE_ROW) {
            if(!blockKeyupFlag) highlightNextRow();
            else blockKeyupFlag = false;
        }
        else if (selectionMode == SMODE_COL){
            if(!blockKeyupFlag) highlightNextCol();
            else blockKeyupFlag = false;
        }
    }
    keyDownFlag = false;
});


/**
 * Highlight the next row, cycles back to the first row if the last row is selected
 */
function highlightNextRow(){
    var currentRow = ROW_LIST.filter(".highlighted");
    ROW_LIST.removeClass("highlighted");

    var nextRow;
    if(!currentRow.length || currentRow.is(":last-child")) nextRow = ROW_LIST.eq(0);
    else nextRow = currentRow.next();
    nextRow.addClass("highlighted");
}


/**
 * Clear the highlighted row
 */
function clearHighlightedRow(){
    ROW_LIST.removeClass("highlighted");
}


/**
 * Select the currently highlighted row
 */
function selectRow(){
    var currentRow = ROW_LIST.filter(".highlighted");
    if(currentRow.length) {
        currentRow.addClass("selected");
        selectionMode = SMODE_COL;
    }
    else {
        console.error("Error: No row was highlighted when attempting to make a selection!");
    }
}


/**
 * Clear the selected row
 */
function clearSelectedRow(){
    ROW_LIST.removeClass("selected");
    selectionMode = SMODE_ROW;
} 


/**
 * Highlight the next column, cycles back to the first column if the last on if currently selected
 */
function highlightNextCol(){
    var currentRow = ROW_LIST.filter(".selected");
    if(currentRow.length){
        var colList = currentRow.children(".gameboard_square");
        var currentCol = colList.filter(".highlighted");
        colList.removeClass("highlighted");

        var nextCol;
        if(!currentCol.length || currentCol.is(":last-child")) nextCol = colList.eq(0);
        else nextCol = currentCol.next();
        nextCol.addClass("highlighted");
    }
    else{
        console.error("Error: No row was selected when attempting to highlight a column!");
    }
}


/**
 * Clear the highlighted column
 */
function clearHighlightedCol(){
    var colList = $(".gameboard_square");
    colList.removeClass("highlighted");
}


/**
 * Mark a column (box) with an x or o
 */
function markCol(){
    var currentCol = $(".gameboard_square.highlighted");
    if(currentCol.length){
        if(!currentCol.hasClass("marked")){
            // Mark the column with 'x' or 'o' depending on whose turn it is
            if(currentPlayer == PLAYER_ONE) currentCol.addClass("marked square_x");
            else currentCol.addClass("marked square_o");

            // Block the keyup function once
            blockKeyupFlag = true;

            // Clear all selections and advance the turn
            clearHighlightedCol();
            clearSelectedRow();
            clearHighlightedRow();
            advanceTurn();

            // Only check state once everything else has completed
            setTimeout(function(){
                checkState();
            }, 0);
        }
        else{
            // An already marked square cannot be overwritten
            console.error("Error: That square has already been marked!");

             // Block the keyup function once
            blockKeyupFlag = true;
        }
    }
    else{
        console.error("Error: No square was highlighted when attempting to mark a square!");
    }
}


/**
 * Advance the turn to the next player (or the designated player)
 * @param {Number} setTurn the player to set the turn to (optional)
 */
function advanceTurn(setTurn){
    if(setTurn == null) {
        if(currentPlayer == PLAYER_ONE) currentPlayer = PLAYER_TWO;
        else currentPlayer = PLAYER_ONE;
    }
    else currentPlayer = setTurn;

    if(currentPlayer == PLAYER_ONE) {
        TURN_BOX.removeClass("p2").addClass("p1");
        TURN_BOX_ICON.attr("src", "images/x_sq.svg");
        TURN_BOX_TEXT.html("Player <strong>One's</strong> Turn");
    }
    else {
        TURN_BOX.removeClass("p1").addClass("p2");
        TURN_BOX_ICON.attr("src", "images/o.svg");
        TURN_BOX_TEXT.html("Player <strong>Two's</strong> Turn");
    }
}


/**
 * Check the current state of the board to see if there is a winner
 */
const RESTART_MESSAGE = "<strong>Tap the spacebar or click 'Okay' to play again!</strong>";
function checkState(){
    var winner;

    // Row Winner
    for(var row = 0; row <= 6; row += 3){
        var currRow = SQUARE_LIST.slice(row, row + 3);
        if(currRow.filter(".square_x").length == 3) winner = PLAYER_ONE;
        else if (currRow.filter(".square_o").length == 3) winner = PLAYER_TWO;
    }

    // Column Winner
    for(var col = 0; col < 3; col++){
        var currCol = SQUARE_LIST.eq(col).add(SQUARE_LIST.eq(col + 3)).add(SQUARE_LIST.eq(col + 6));
        if(currCol.filter(".square_x").length == 3) winner = PLAYER_ONE;
        else if (currCol.filter(".square_o").length == 3) winner = PLAYER_TWO;
    }

    // Left to Right Diagonal Winner
    if(LEFT_RIGHT_DIAG.filter(".square_x").length == 3) winner = PLAYER_ONE;
    else if (LEFT_RIGHT_DIAG.filter(".square_o").length == 3) winner = PLAYER_TWO;

    // Right to Left Diagonal Winner
    if (RIGHT_LEFT_DIAG.filter(".square_x").length == 3) winner = PLAYER_ONE;
    else if (RIGHT_LEFT_DIAG.filter(".square_o").length == 3) winner = PLAYER_TWO;

    // Board is full and no previous winner - tied game
    if (SQUARE_LIST.filter(".marked").length == 9 && winner == null) winner = TIE_GAME;

    // If we have a game ending state, show the winner or tie alert then clear the board
    if (winner == PLAYER_ONE){
        createAlert ("Player One Wins!", RESTART_MESSAGE, function(){clearBoard()});
    }
    else if (winner == PLAYER_TWO){
        createAlert("Player Two Wins!", RESTART_MESSAGE, function(){clearBoard()});
    }
    else if(winner == TIE_GAME){
        createAlert("Tied Game!", RESTART_MESSAGE, function(){clearBoard()});
    }

    return winner;
}


/**
 * Clear the board, reset the board to player one, and set the selection more to row mode
 */
function clearBoard(){
    SQUARE_LIST.removeClass("marked").removeClass("square_x").removeClass("square_o");   
    advanceTurn(0);
    selectionMode = SMODE_ROW;
}


/**  
 * Create an alert with title, text, and an optional callback function
 */
function createAlert(title, text, callback){

    // Save previous selection mode and switch to SMODE_ALERT
    prevSelectionMode = selectionMode;
    selectionMode = SMODE_ALERT;

    // Alert background
    var background = $("<div class='alert_bg'></div>");

    // Alert content
    var alertBox = $("<div class='alert_box'></div>").appendTo(background);
    $("<h2 class='alert_title'></h2>").html(title).appendTo(alertBox);
    $("<p class='alert_text'></p>").html(text).appendTo(alertBox);

    // Alert 'Okay' button
    var alertButtonBox = $("<div class='alert_btnbox'></div>").appendTo(alertBox);
    $("<button class='alert_btn'>Okay!</button>").on("click", function(){
        closeAlert(callback);
    }).appendTo(alertButtonBox);

    background.appendTo($("body"));
}


/**
 *  Close any existing alert, revert the selection mode, and call the optional callback function
 */ 
function closeAlert(callback){
    selectionMode = prevSelectionMode;
    $(".alert_bg").remove();
    if(callback) callback();
}


/**
 * Create a help alert which explains how to play the game
 */
function createHelpAlert(){
    var helpTitle = "Welcome to One-Button TicTacToe!";
    var helpText = "<strong>This game is played using the spacebar:</strong>";
    helpText    += "<ul>";
    helpText    += "<li><u>Tap</u> to highlight rows and boxes</li>";
    helpText    += "<li><u>Press and hold</u> to select a row or mark a box</li>";
    helpText    += "<li><u>Double-tap</u> to leave a selected row.</li>";
    helpText    += "</ul><br />";
    helpText    += "<strong>That's all folks! Tap the spacebar or press 'Okay' to get started!</strong>";
    createAlert(helpTitle, helpText);
}


/**
 * Automatically show the help alert the first time someone opens the page
 */
$(document).ready(function(){
    if(document.cookie != "helpshown=true"){
        document.cookie = "helpshown=true"
        createHelpAlert();
    }
});


/**
 * Clear the game and restart when the restart button is pressed
 */
$("#aRestart").click(function(){
    clearBoard();
    clearHighlightedCol();
    clearHighlightedRow();
    clearSelectedRow();
})


/**
 * Create the help alert when the help button is pressed
 */
$("#aHelp").click(function(){
    createHelpAlert();
});