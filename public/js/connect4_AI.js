firebase.auth().onAuthStateChanged(function(user) {
	if (user == null) {
		window.location.replace("/login");
	} else if (user && !user.emailVerified) {
		$('#staticBackdrop').modal('toggle');
	}
	else {
		$("#welcome_message").text(user.displayName);
	}
});

var player = 1;
var totalMoves = 0;
var player = 0;
var player_turn = 0;
var rtrnStr;
var timercount = 10;

var difficulty;

// If playing against AI
if (true)
{
	player = 1;
	player_turn = 1;
	rtrnStr = "";
}

document.onkeydown = interpKeydown;
var socket = io.connect();

// Internal array keeping track of where X's and O's were put
var rows_tracker = []

// Array of actual page elements to add X's and O's
var row_groups = document.getElementById("c4Box").children;
var rows = [];
for (i = 0; i < row_groups.length; i++)
{
	rows[i] = row_groups[i].children;
	rows_tracker[i] = [];
	for (j = 0; j < rows[i].length; j++)
	{
		rows[i][j].setAttribute('tabindex', '0');
		rows_tracker[i][j] = 0; // fill the tracker with 0's to represent empty squares
	}
}

// Keeps track of where on the board the user is at
var row_index = 0;
var col_index = 0;

rows[row_index][col_index].focus();

function interpKeydown(e)
{
	if (e.keyCode == '39') // if right arrow, index + 1
	{
		setNewFocus('RIGHT');
	}
	else if (e.keyCode == '37') // else if left arrow, index - 1
	{
		setNewFocus('LEFT');
	}
	else if (e.keyCode == '13') // else if enter key, press down
	{
		setNewFocus('INPUT');
		document.getElementById("turn-message").innerHTML = "AI's Turn.";
	}
}

function setNewFocus(direction)
{
	if (direction == 'RIGHT' && player == player_turn)
	{
		if (col_index < rows[row_index].length - 1)
		{
			col_index += 1;
		}
	}
	else if (direction == 'LEFT' && player == player_turn)
	{
		if (col_index > 0)
		{
			col_index -= 1;
		}
	}
	else if (direction == 'INPUT' && player == player_turn)
	{
		if (rows_tracker[row_index][col_index] != 0)
		{
			return; // if there is already a chip there put neither and let user continue turn
		}

		// Find which row/col to put circle in
		for (i = 0; i < rows_tracker.length; i++)
		{
			if (i == (rows_tracker.length - 1))
			{
				row_index = i;
				break;
			}
			else if (rows_tracker[i+1][col_index] != 0)
			{
				row_index = i;
				break;
			}
		}

		if (player == 1)
		{
			rows[row_index][col_index].className += " p1";
			rows_tracker[row_index][col_index] = 1;
		}
		else
		{
			rows[row_index][col_index].className += " p2";
			rows_tracker[row_index][col_index] = 2;
		}

		totalMoves += 1;

		// if no victory on board, end players turn
		if(!checkForVictory(row_index, col_index))
		{
			endTurn();
		}

		if (player_turn == 1) { player_turn = 2; }
		else if (player_turn == 2) { player_turn = 1; }

		// row_index back to 0 since you drop from the top in connect 4
		row_index = 0;
	}

	rows[row_index][col_index].focus();
}

function checkForVictory(current_row, current_col)
{
	var inARow = 0;

	// check horizontal win
	for (i = 0; i < 7; i++)
	{
		if (checkBox(player_turn, current_row, i)) { inARow += 1; }
		else { inARow = 0; }
		if (inARow >= 4) { printWin(player);return true; }
	}
	inARow = 0;

	// check vertical win
	for (i = 0; i < 6; i++)
	{
		if (checkBox(player_turn, i, current_col)) { inARow += 1; }
		else { inARow = 0; }
		if (inARow >= 4) { printWin(player);return true; }
	}
	inARow = 0;

	// check diagonal win
	var row_start = 0;
	var col_start = 0;
	if (current_row >= current_col){ row_start = current_row - current_col; }
	else { col_start = current_col - current_row; }
	for (i = 0; i < 6; i++)
	{
		if (checkBox(player_turn, row_start + i, col_start + i)) { inARow += 1; }
		else { inARow = 0; }
		if (inARow >= 4) { printWin(player);return true; }
		if (row_start + i >= 5 || col_start + i >= 6) { break; }
	}
	inARow = 0;

	// check anti-diagonal win
	var row_start = 0;
	var col_start = 6;
	if (current_row + current_col == 6){ row_start = 0; } // on far right
	else if (current_row + current_col > 6) { row_start = current_row + current_col - 6; }
	else { col_start = current_col + current_row; } // on top
	for (i = 0; i < 6; i++)
	{
		if (checkBox(player_turn, row_start + i, col_start - i)) { inARow += 1; }
		else { inARow = 0; }
		if (inARow >= 4) { printWin(player);return true; }
		if (row_start + i >= 5 || col_start - i <= 0) { break; }
	}
	inARow = 0;

	if (totalMoves > 41)
	{
		printWin(-1);
		return true;
	}

	return false;
}

function checkBox(playerNum, row, col)
{
	if (playerNum == 1)
	{
		return rows_tracker[row][col] == 1;
	}
	else if (playerNum == 2)
	{
		return rows_tracker[row][col] == 2;
	}
	return false;
}

function printWin(playerNum)
{
	$('#staticBackdrop').modal('toggle');
	if (playerNum == 1)
		document.getElementById("announcementText").innerHTML = "You WON!";
	else if (playerNum == 2)
		document.getElementById("announcementText").innerHTML = "You LOST!";
	else 
		document.getElementById("announcementText").innerHTML = "It is a DRAW!";
	setInterval(function () {
		timercount--;
		if (timercount >= 0) document.getElementById("modal-result-message").innerHTML = "You will be redirected to main page in " + timercount + " seconds.";
	}, 1000);
	endGame();
}

function endTurn()
{
	// send array to AI, wait until player turn
	if (player == 1) // If its PvE
	{
		// string to be sent to AI
		var sendStr = "";

		// For each row, loop through each col
		for (i = 0; i < rows_tracker.length; i++)
		{
			for (j = 0; j < rows_tracker[i].length; j++)
			{
				// save chip to string w/ a ',' in between
				if (rows_tracker[i][j] == 1){sendStr = sendStr.concat("1");}
				else if (rows_tracker[i][j] == 2){sendStr = sendStr.concat("-1");}
				else{sendStr = sendStr.concat("0");}

				if (j < rows_tracker[i].length - 1){sendStr = sendStr.concat(",");}
			}
			// concat a '.' after each row
			if (i < rows_tracker.length - 1){sendStr = sendStr.concat(".");}
		}

		socket.emit("aiQuery", sendStr);
	}

}

function endGame()
{
	player_turn = 0; // stops any input
	setTimeout(function() { window.location.href = "../"; }, 10000); // send user back to homepage
}

socket.on('gesture', function(data){
	console.log(data);
	setNewFocus(data);
});

socket.on('aiReturn', function(data){
	rtrnStr = data;
	// Change player to 2 (AI) set chip, change player back to 1
	player = 2;
	col_index = parseInt(rtrnStr);
	setNewFocus('INPUT');
	document.getElementById("turn-message").innerHTML = "Your Turn.";
	player = 1;
});


document.getElementById("c4Box").style.display = "none";

function diffSelected(diff)
{
	difficulty = diff;
	socket.emit("setDifficulty", difficulty);
	document.getElementById("diffChoices").style.display = "none";
	document.getElementById("c4Box").style.display = "initial";
	document.getElementById("turn-message").innerHTML = "Your Turn.";
}
