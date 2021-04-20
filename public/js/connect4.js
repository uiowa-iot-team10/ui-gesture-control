const rid  = sessionStorage.getItem("rid");
const pid  = sessionStorage.getItem("pid");
const game = sessionStorage.getItem("game");

var player = 1;
var totalMoves = 0;

document.onkeydown = interpKeydown;

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
	}

	// TODO: REMOVE THIS, THIS IS ONLY TO TEST CHANGING PLAYERS
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
	else if (direction == 'INPUT')
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

		// check for victory on board
		checkForVictory();
		
		// end players turn
		// endTurn();

		// row_index back to 0 since you drop from the top in connect 4
		row_index = 0;
	}

	rows[row_index][col_index].focus();
}

function checkForVictory()
{
	var inARow = 0;

	if (totalMoves > 41)
	{
		document.getElementById("announcementText").innerHTML = "It's a DRAW!";
	}

	// check vertical win
	for (i = 0; i < 6; i++)
	{
		if (checkBox(player, i, col_index))
		{
			inARow += 1;
		}
		else{inARow = 0;}

		if (inARow >= 4){printWin(player);}
	}
	inARow = 0;

	// check horizontal win
    for (i = 0; i < 8; i++)
	{
		if (checkBox(player, row_index, i))
		{
			inARow += 1;
		}
		else{inARow = 0;}

		if (inARow >= 4){printWin(player);}
	}
	inARow = 0;
	
	// check diag win vertical, starting at first row first column
	for (i = 0; i < 3; i++)
	{
		// start with row 3 col 1 where you index both row/col up every time
		//		index row down, index row down
		// row 3 col 1, row 4 col 2, row 5 col 3, ...
		// row 2 col 1, row 3 col 2, row 4 col 3, ...
		// row 1 col 1, row 2 col 2, row 3 col 3, ...
		for (j = 0; i + j < 6; j++)
		{
			if (checkBox(player, i + j, j))
			{
				inARow += 1;
			}
			else{inARow = 0;}
			if (inARow >= 4){printWin(player);}
		}
	}
	inARow = 0;

	
	// check diag win horizontal, starting first row, second column
	for (i = 1; i < 5; i++)
	{
		// start with row 1 col 2 where you index both row/col up every time
		//		index col up, index col up
		// row 1 col 2, row 2 col 3, ...
		// row 1 col 3, row 2 col 4, ...
		// ...
		// row 1 col 5, row 2 col 6, ...
		for (j = 0; j < 6; j++)
		{
			if (i + j > 7){continue;} // if you hit the far right edge

			if (checkBox(player, j, i + j))
			{
				inARow += 1;
			}
			else{inARow = 0;}
			if (inARow >= 4){printWin(player);}
		}
	}
	inARow = 0;
	

	// check anti-diag win vertical, starting at first row first column
	for (i = 0; i < 3; i++)
	{
		for (j = 0; i + j < 6; j++)
		{
			if (checkBox(player, i + j, 7 - j))
			{
				inARow += 1;
			}
			else{inARow = 0;}
			if (inARow >= 4){printWin(player);}
		}
	}
	inARow = 0;

	
	// check anti-diag win horizontal, starting first row, second column
	for (i = 1; i < 5; i++)
	{
		for (j = 0; j < 6; j++)
		{
			if (i + j > 7){continue;} // if you hit the far left edge

			if (checkBox(player, j, 7 - (i + j)))
			{
				inARow += 1;
			}
			else{inARow = 0;}
			if (inARow >= 4){printWin(player);}
		}
	}
	inARow = 0;
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