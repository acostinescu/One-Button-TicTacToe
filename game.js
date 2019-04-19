const rowList = $(".gameboard_row");
const holdTime = 700;
const doublePressTime = 175;

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

$(document).keypress(function(e){
    if(e.key == "a" && !keyDownFlag){
        
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
    if(e.key == "a"){
        
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
const restartMessage = "Press 'a' or click 'Okay' to play again.";
function checkState(){

    var winner;

    // Row Winner
    for(var row = 0; row <= 6; row += 3){
        var currRow = squareList.slice(row, row + 3);

        if(currRow.filter(".square_x").length == 3) winner = 0;
        else if (currRow.filter(".square_o").length == 3) winner = 1;
    }

    // Column Winner
    for(var col = 0; col < 3; col++){
        var currCol = squareList.eq(col).add(squareList.eq(col + 3)).add(squareList.eq(col + 6));

        if(currCol.filter(".square_x").length == 3) winner = 0;
        else if (currCol.filter(".square_o").length == 3) winner = 1;
    }

    // Left to Right Diagonal Winner
    if(leftRightDiag.filter(".square_x").length == 3) winner = 0;
    else if (leftRightDiag.filter(".square_o").length == 3) winner = 1;

    // Right to Left Diagonal Winner
    if (rightLeftDiag.filter(".square_x").length == 3) winner = 0;
    else if (rightLeftDiag.filter(".square_o").length == 3) winner = 1;

    // Board is full - tied game
    if (squareList.filter(".marked").length == 9) winner = -1;

    if (winner == 0){
        createAlert ("Player One Wins!", restartMessage, function(){clearBoard()});
    }
    else if (winner == 1){
        createAlert("Player Two Wins!", restartMessage, function(){clearBoard()});
    }
    else if(winner == -1){
        createAlert("Tied Game!", restartMessage, function(){clearBoard()});
    }

    return winner;
}

function clearBoard(){
    squareList.removeClass("marked").removeClass("square_x").removeClass("square_o");   
    advanceTurn(0);
    selectionMode = SMODE_ROW;
}

// ALERTS
var prevSelectionMode; // Track whatever mode we were in before the alert was made
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
function closeAlert(callback){
    selectionMode = prevSelectionMode;
    $(".alert_bg").remove();
    if(callback) callback();
}

function createHelpAlert(){
    createAlert("Welcome to One-Button TicTacToe!", "This game is played exclusively using the 'a' key. Tap 'a' to cycle through rows then press and hold to select a row. Once a row is selected and the outline turns green, tap to cycle through the boxes in the row and press and hold to mark a box with an X or an O. Double tap to deselect the row and return to row selection. <br /><br /><strong>Press 'a' or click 'Okay' to get started!</strong>");
}

$(document).ready(function(){
    createHelpAlert();
});
// END ALERTS 