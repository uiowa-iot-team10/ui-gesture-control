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
var timercount = 10;

var socket = io.connect();
document.onkeydown = interpKeydown;

// Internal array keeping track of where X's and O's were put
var rows_tracker = []

// Array of actual page elements to add X's and O's
var row_groups = document.getElementById("ticTacToeBox").children;
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
	else if (e.keyCode == '38') // else if left arrow, index - 1
	{
		setNewFocus('UP');
	}
	else if (e.keyCode == '40') // else if left arrow, index - 1
	{
		setNewFocus('DOWN');
	}
	else if (e.keyCode == '13') // else if enter key, press down
	{
		setNewFocus('INPUT');
		document.getElementById("turn-message").innerHTML = "AI's Turn.";
	}
}

function checkForVictory(current_row, current_col)
{
	var inARow = 0;

	// check vertical win
	for (i = 0; i < 3; i++)
	{
		if (checkBox(player, i, current_col))
		{
			inARow += 1;
		}
	}
	if (inARow == 3){printWin(player);return true;}
	else {inARow = 0;}

	// check horizontal win
    for (i = 0; i < 3; i++)
	{
		if (checkBox(player, current_row, i))
		{
			inARow += 1;
		}
	}
	if (inARow == 3){printWin(player);return true;}
	else {inARow = 0;}
	
	// check diag win
	for (i = 0; i < 3; i++)
	{
		if (checkBox(player, i, i))
		{
			inARow += 1;
		}
	}
	if (inARow == 3){printWin(player);return true;}
	else {inARow = 0;}

	// check opposite diag win
	var j = 2;
	for (i = 0; i < 3; i++)
	{
		if (checkBox(player, j, i))
		{
			inARow += 1;
		}
		j--;
	}
	if (inARow == 3){printWin(player);return true;}
	else {inARow = 0;}

	if (totalMoves > 8)
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
	if (player == 1)
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
			// concat a ',' after each row
			if (i < rows_tracker.length - 1){sendStr = sendStr.concat(",");}
		}

		socket.emit("aiQuery_ttt", sendStr);
	}
}

function endGame()
{
	player = 0; // set player to 0 to prevent further moves
	setTimeout(function() { window.location.href = "../"; }, 10000); // send user back to homepage
}

socket.on('gesture', function(data){
	console.log(data);
	setNewFocus(data);
});

socket.on('aiReturn_ttt', function(data){
	rtrnStr = data.toString();
	// Change player to 2 (AI) set chip, change player back to 1
	player = 2;
	row_index = Math.trunc(parseInt(rtrnStr)/3);
	col_index = parseInt(rtrnStr)%3;
	setNewFocus('INPUT');
	player = 1;
	document.getElementById("turn-message").innerHTML = "Your Turn.";
});

document.getElementById("ticTacToeBox").style.display = "none";

var selNum = 0; // current focus for difficulty
var selecting = true;
$('#diffChoices button')[selNum].focus();

function setNewFocus(direction)
{
	if(selecting)
	{
		if(direction == 'UP')
		{
			selNum -= 1;
			if(selNum == -1)
			{
				$('#diffChoices button')[0].blur();
				$('#leaveGameButton').addClass('btn-outline-primary');
			}
			else
			{
				$('#diffChoices button')[selNum+1].blur();
				$('#diffChoices button')[selNum].focus();
			}
		}
		if(direction == 'DOWN')
		{
			if(selNum == -1)
			{
				$('#leaveGameButton').removeClass('btn-outline-primary')
			}
			selNum += 1;
			if(selNum == 5)
			{
				selNum -= 1;
				$('#diffChoices button')[selNum].focus();
			}
			else
			{
				if(selNum != 0)
				{
					$('#diffChoices button')[selNum-1].blur();
					$('#diffChoices button')[selNum].focus();
				}
				else
				{
					$('#diffChoices button')[selNum].focus();
				}
				
			}
		}
		if(direction == 'INPUT')
		{
			if(selNum == -1)
			{
				$('#leaveGameButton').click();
			}
			else
			{
				$('#diffChoices button')[selNum].click();
			}
		}
		
	}
	else
	{
		if (direction == 'RIGHT')
		{
			if (col_index < rows_tracker[row_index].length - 1)
			{
				col_index += 1;
			}
		}
		else if (direction == 'LEFT')
		{	
			if (col_index > 0)
			{
				col_index -= 1;
			}
		}
		else if (direction == 'UP')
		{
			if (row_index > 0)
			{
				row_index -= 1;
			}
		}
		else if (direction == 'DOWN')
		{
			if (row_index < rows_tracker.length - 1)
			{
				row_index += 1;
			}
		}
		else if (direction == 'INPUT')
		{
			if (rows_tracker[row_index][col_index] != 0)
			{
				return; // if there is already an X or O there don't let a new one get put down
			}
			else if (player == 1)
			{
				rows[row_index][col_index].className += " ex";
				rows_tracker[row_index][col_index] = 1;
			}
			else
			{
				rows[row_index][col_index].className += " oh";
				rows_tracker[row_index][col_index] = 2;
			}

			totalMoves += 1;

			// check for victory on board
			if (!checkForVictory(row_index, col_index))
			{
				// end players turn
				endTurn();
			}
			else{ endGame(); }	
		}

		rows[row_index][col_index].focus();
	}
}

function diffSelected(diff)
{
	difficulty = diff;
	socket.emit("setDifficulty_ttt", difficulty);
	document.getElementById("diffChoices").style.display = "none";
	document.getElementById("ticTacToeBox").style.display = "initial";
	document.getElementById("turn-message").innerHTML = "Your Turn.";
	selecting = false;
}