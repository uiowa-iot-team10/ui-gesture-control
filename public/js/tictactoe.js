var player = 1;
var totalMoves = 0;

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
	}

	// TODO: REMOVE THIS, THIS IS ONLY TO TEST CHANGIN PLAYERS
	else if (e.keyCode == '49') // else if enter key, press down
	{
		player = 1;
	}
	else if (e.keyCode == '50') // else if enter key, press down
	{
		player = 2;
	}
}

function setNewFocus(direction)
{
	if (direction == 'RIGHT')
	{
		if (col_index < rows[row_index].length - 1)
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
		if (row_index < rows.length - 1)
		{
			row_index += 1;
		}
	}
	else if (direction == 'INPUT')
	{
		if (rows_tracker[row_index][col_index] != 0)
		{
			document.getElementById("debug1").innerHTML = "Put Neither";
			return; // if there is already an X or O there don't let a new one get put down
		}
		else if (player == 1)
		{
			rows[row_index][col_index].className += " ex";
			document.getElementById("debug1").innerHTML = "Put X";
			rows_tracker[row_index][col_index] = 1;
		}
		else
		{
			rows[row_index][col_index].className += " oh";
			document.getElementById("debug1").innerHTML = "Put O";
			rows_tracker[row_index][col_index] = 2;
		}

		totalMoves += 1;

		// check for victory on board
		checkForVictory();
		
		// end players turn
		// endTurn();
	}

	rows[row_index][col_index].focus();
}

function checkForVictory()
{
	var inARow = 0;

	document.getElementById("debug2").innerHTML = totalMoves;

	if (totalMoves > 8)
	{
		document.getElementById("announcementText").innerHTML = "It's a DRAW!";
	}

	// check vertical win
	for (i = 0; i < 3; i++)
	{
		if (checkBox(player, i, col_index))
		{
			inARow += 1;
		}
	}
	if (inARow == 3){printWin(player);}
	else {inARow = 0;}

	// check horizontal win
    for (i = 0; i < 3; i++)
	{
		if (checkBox(player, row_index, i))
		{
			inARow += 1;
		}
	}
	if (inARow == 3){printWin(player);}
	else {inARow = 0;}
	
	// check diag win
	for (i = 0; i < 3; i++)
	{
		if (checkBox(player, i, i))
		{
			inARow += 1;
		}
	}
	if (inARow == 3){printWin(player);}
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
	if (inARow == 3){printWin(player);}
	else {inARow = 0;}
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
	document.getElementById("announcementText").innerHTML = "Player " + playerNum + " WINS!";
	endGame();
}

function endTurn()
{
	// send array to AI or Firebase and wait until it's your turn again
}

function endGame()
{
	// send player back to homepage?
}

var socket = io.connect();
// socket.on('connection', function(data){
//     var status = document.getElementById("status");
//     status.setAttribute("class", "connected");
//     status.innerHTML = "Server: Connected!";
// });

// socket.on('disconnect', function(data){
//     var status = document.getElementById("status");
//     status.setAttribute("class", "notconnected");
//     status.innerHTML = "Server: Not Connected!";
// });

socket.on('gesture', function(data){
	console.log(data);
	setNewFocus(data);
});