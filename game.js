const rowList = $(".gameboard_row");
const holdTime = 700;
const doublePressTime = 175;
const KEYBOARD_BUTTON = " ";

var selectionMode = 0;
const SMODE_ROW = 0;
const SMODE_COL = 1;
const SMODE_ALERT = 2;

var keyDownFlag = false;
var keyHoldFunc;
var keyRepeatFunc;
var keyRepeatFlag = false;
var keyRepeatFlagRemove = false;

var blockKeyupFlag = false;

var currentPlayer = 0;
const PLAYER_ONE = 0;
const PLAYER_TWO = 1;
const TIE_GAME = -1;

$(document).keypress(function(e){
    if(e.key == KEYBOARD_BUTTON && !keyDownFlag){
        
        // Row selection mode
        if(selectionMode == SMODE_ROW) 
        {
            // Check for holding key
            keyHoldFunc = setTimeout(function(){
                blockKeyupFlag = true;
                selectRow();
                highlightNextCol();
            }, holdTime)
        }

        // Column selection mode (row is selected)
        else if (selectionMode == SMODE_COL){

            keyHoldFunc = setTimeout(function(){
                markCol();
            }, holdTime);

            // Check for double pressing key
            if(!keyRepeatFlag){
                keyRepeatFlag = true;
                keyRepeatFunc = setTimeout(function(){
                    keyRepeatFlag = false;
                    keyRepeatFlagRemove = true;
                }, doublePressTime);
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

$(document).on("keyup", function(e){
    if(e.key == KEYBOARD_BUTTON){
        
        // When the key is lifted, clear the timeout function that handles the key hold event
        clearTimeout(keyHoldFunc);
        
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



function highlightNextRow(){
    var currentRow = rowList.filter(".highlighted");
    rowList.removeClass("highlighted");

    var nextRow;
    if(!currentRow.length || currentRow.is(":last-child")) nextRow = rowList.eq(0);
    else nextRow = currentRow.next();
    nextRow.addClass("highlighted");
}
function clearHighlightedRow(){
    rowList.removeClass("highlighted");
}
function selectRow(){
    var currentRow = rowList.filter(".highlighted");
    if(currentRow.length) {
        currentRow.addClass("selected");
        selectionMode = SMODE_COL;
    }
    else {
        console.error("Error: No row was highlighted when attempting to make a selection!");
    }
}
function clearSelectedRow(){
    rowList.removeClass("selected");
    selectionMode = SMODE_ROW;
} 

function highlightNextCol(){
    var currentRow = rowList.filter(".selected");
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
function clearHighlightedCol(){
    var colList = $(".gameboard_square");
    colList.removeClass("highlighted");
}
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

const turnBox = $("#turn_box");
const turnBoxIcon = $("#turn_box_icon");
const turnBoxText = $("#turn_box_text");
function advanceTurn(setTurn){
    if(setTurn == null) {
        if(currentPlayer == PLAYER_ONE) currentPlayer = PLAYER_TWO;
        else currentPlayer = PLAYER_ONE;
    }
    else currentPlayer = setTurn;

    if(currentPlayer == PLAYER_ONE) {
        turnBox.removeClass("p2").addClass("p1");
        turnBoxIcon.attr("src", "x_sq.svg");
        turnBoxText.html("Player <strong>One's</strong> Turn");
    }
    else {
        turnBox.removeClass("p1").addClass("p2");
        turnBoxIcon.attr("src", "o.svg");
        turnBoxText.html("Player <strong>Two's</strong> Turn");
    }
}

const squareList = $(".gameboard_square");
const leftRightDiag = squareList.eq(0).add(squareList.eq(4)).add(squareList.eq(8));
const rightLeftDiag = squareList.eq(2).add(squareList.eq(4)).add(squareList.eq(6));
const restartMessage = "<strong>Tap the spacebar or click 'Okay' to play again!</strong>";
function checkState(){
    var winner;

    // Row Winner
    for(var row = 0; row <= 6; row += 3){
        var currRow = squareList.slice(row, row + 3);
        if(currRow.filter(".square_x").length == 3) winner = PLAYER_ONE;
        else if (currRow.filter(".square_o").length == 3) winner = PLAYER_TWO;
    }

    // Column Winner
    for(var col = 0; col < 3; col++){
        var currCol = squareList.eq(col).add(squareList.eq(col + 3)).add(squareList.eq(col + 6));
        if(currCol.filter(".square_x").length == 3) winner = PLAYER_ONE;
        else if (currCol.filter(".square_o").length == 3) winner = PLAYER_TWO;
    }

    // Left to Right Diagonal Winner
    if(leftRightDiag.filter(".square_x").length == 3) winner = PLAYER_ONE;
    else if (leftRightDiag.filter(".square_o").length == 3) winner = PLAYER_TWO;

    // Right to Left Diagonal Winner
    if (rightLeftDiag.filter(".square_x").length == 3) winner = PLAYER_ONE;
    else if (rightLeftDiag.filter(".square_o").length == 3) winner = PLAYER_TWO;

    // Board is full and no previous winner - tied game
    if (squareList.filter(".marked").length == 9 && winner == null) winner = TIE_GAME;

    // If we have a game ending state, show the winner or tie alert then clear the board
    if (winner == PLAYER_ONE){
        createAlert ("Player One Wins!", restartMessage, function(){clearBoard()});
    }
    else if (winner == PLAYER_TWO){
        createAlert("Player Two Wins!", restartMessage, function(){clearBoard()});
    }
    else if(winner == TIE_GAME){
        createAlert("Tied Game!", restartMessage, function(){clearBoard()});
    }

    return winner;
}

// Clear the board, reset the board to player one, and set the selection more to row mode
function clearBoard(){
    squareList.removeClass("marked").removeClass("square_x").removeClass("square_o");   
    advanceTurn(0);
    selectionMode = SMODE_ROW;
}

var prevSelectionMode; // Track whatever mode we were in before the alert was made

// Create an alert with title, text, and an optional callback
function createAlert(title, text, callback){
    prevSelectionMode = selectionMode;
    selectionMode = SMODE_ALERT;
    var background = $("<div class='alert_bg'></div>");
    var alertBox = $("<div class='alert_box'></div>").appendTo(background);
    var alertTitle = $("<h2 class='alert_title'></h2>").html(title).appendTo(alertBox);
    var alertText = $("<p class='alert_text'></p>").html(text).appendTo(alertBox);
    var alertButtonBox = $("<div class='alert_btnbox'></div>").appendTo(alertBox);
    var alertButton = $("<button class='alert_btn'>Okay!</button>").on("click", function(){
        closeAlert(callback);
    }).appendTo(alertButtonBox);
    background.appendTo($("body"));
}
// Close any existing alert, revert the selection mode, and call the optional callback function
function closeAlert(callback){
    selectionMode = prevSelectionMode;
    $(".alert_bg").remove();
    if(callback) callback();
}

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

$(document).ready(function(){
    // Only show the help dialog the first time the page is loaded
    if(document.cookie != "helpshown=true")
    {
        document.cookie = "helpshown=true"
        createHelpAlert();
    }
});

$("#aRestart").click(function(){
    clearBoard();
    clearHighlightedCol();
    clearHighlightedRow();
    clearSelectedRow();
})
$("#aHelp").click(function(){
    createHelpAlert();
});