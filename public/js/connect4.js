var player = 1;
var totalMoves = 0;

document.onkeydown = interpKeydown;

var row_groups = document.getElementById("c4Box").children;
var rows = [];
for (i = 0; i < row_groups.length; i++)
{
	rows[i] = row_groups[i].children;
	for (j = 0; j < rows[i].length; j++)
	{
		rows[i][j].setAttribute('tabindex', '0');
	}
}

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
	else if (direction == 'INPUT')
	{
		if (rows[row_index][col_index].className.match(/(?:^|\s)p1(?!\S)/) || rows[row_index][col_index].className.match(/(?:^|\s)p2(?!\S)/))
		{
			document.getElementById("debug1").innerHTML = "Put Neither";
			return; // if there is already an X or O there don't let a new one get put down
		}

		// Find which col to put circle in
		for (i = 0; i < rows.length; i++)
		{
			if (rows[i+1][col_index].className.match(/(?:^|\s)p1(?!\S)/) || rows[i+1][col_index].className.match(/(?:^|\s)p2(?!\S)/))
			{
				document.getElementById("debug2").innerHTML = "entered thing I want";
				row_index = i;
			}
			else if (i = rows.length - 1)
			{
				row_index = rows.length - 1;
			}
		}

		if (player == 1)
		{
			rows[row_index][col_index].className += " p1";
			var debugStr =  "Put blue @ (" + row_index + "," + col_index + ")";
			document.getElementById("debug1").innerHTML = debugStr;
		}
		else
		{
			rows[row_index][col_index].className += " p2";
			var debugStr =  "Put red @ (" + row_index + "," + col_index + ")";
			document.getElementById("debug1").innerHTML = debugStr;
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
    for (i = 0; i < 7; i++)
	{
		if (checkBox(player, row_index, i))
		{
			inARow += 1;
		}
		else{inARow = 0;}

		if (inARow >= 4){printWin(player);}
	}
	inARow = 0;
	
	// check diag win
	for (i = 0; i < 3; i++)
	{
		//
	}
	if (inARow == 3){printWin(player);}
	else {inARow = 0;}

	// check opposite diag win
	for (i = 0; i < 3; i++)
	{
		//
	}
	if (inARow == 3){printWin(player);}
	else {inARow = 0;}
}

function checkBox(playerNum, row, col)
{
	if (playerNum == 1)
	{
		return rows[row][col].className.match(/(?:^|\s)p1(?!\S)/);
	}
	else if (playerNum == 2)
	{
		return rows[row][col].className.match(/(?:^|\s)p2(?!\S)/);
	}
	return false;
}

function printWin(playerNum)
{
	document.getElementById("announcementText").innerHTML = "Player " + player + " WINS!";
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