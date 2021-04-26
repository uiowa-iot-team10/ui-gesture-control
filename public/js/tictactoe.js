const rid  = sessionStorage.getItem("rid");
const pid  = sessionStorage.getItem("pid");
const game = sessionStorage.getItem("game");

var socket = io.connect();

firebase.auth().onAuthStateChanged(function(user) {
	if (user == null) {
		window.location.replace("/login");
	} else if (user && !user.emailVerified) {
		// TO-DO: Put an alert to inform user to verify their account
		window.confirm("VERIFY YOUR EMAIL!!!!");
		sign_out();
		window.location.replace("/login");
	}
	else {
		socket.emit('getPlayerList',{'rid': rid, 'game': game});
	}
});

socket.emit(pid + "_ready2play", {
	'rid': rid
})

var playerTurn = 'player1';
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
	if(pid == playerTurn)
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
		if (playerTurn == 'player1')
		{
			rows[row_index][col_index].className += " ex";
			//document.getElementById("debug1").innerHTML = "Put X";
			rows_tracker[row_index][col_index] = 1;
		}
		else
		{
			rows[row_index][col_index].className += " oh";
			//document.getElementById("debug1").innerHTML = "Put O";
			rows_tracker[row_index][col_index] = 2;
		}
		console.log('row:' + row_index + " col: " + col_index);
		socket.emit('moveCoord',{'rid': rid, 'row':row_index,'col':col_index,'player':playerTurn});

		playerTurn = (pid[pid.length -1] == '1') ? 'player2' : 'player1';
		totalMoves += 1;
	}

	rows[row_index][col_index].focus();
}

socket.on('move',(data)=>
{
	if (data.row != -1 || data.col != -1) {
		setTimeout(() => {
			if(pid == 'player1')
			{
				rows[data.row][data.col].className += " oh";
				rows_tracker[data.row][data.col] = 2;
			}
			else
			{
				rows[data.row][data.col].className += " ex";
				rows_tracker[data.row][data.col] = 1;
			}
			row_index = data.row;
			col_index = data.col;
			if(!checkForVictory())
			{
				row_index = 0;
				col_index = 0;
				playerTurn = pid;
			}
		},500);
	}
});

function checkForVictory()
{
	var inARow = 0;

	//document.getElementById("debug2").innerHTML = totalMoves;

	if (totalMoves > 8)
	{
		document.getElementById("announcementText").innerHTML = "It's a DRAW!";
	}

	// check vertical win
	for (i = 0; i < 3; i++)
	{
		if (checkBox(playerTurn, i, col_index))
		{
			inARow += 1;
		}
	}
	if (inARow == 3){printWin(playerTurn); return true;}
	else {inARow = 0;}

	// check horizontal win
    for (i = 0; i < 3; i++)
	{
		if (checkBox(playerTurn, row_index, i))
		{
			inARow += 1;
		}
	}
	if (inARow == 3){printWin(playerTurn); return true;}
	else {inARow = 0;}
	
	// check diag win
	for (i = 0; i < 3; i++)
	{
		if (checkBox(playerTurn, i, i))
		{
			inARow += 1;
		}
	}
	if (inARow == 3){printWin(playerTurn); return true;}
	else {inARow = 0;}

	// check opposite diag win
	var j = 2;
	for (i = 0; i < 3; i++)
	{
		if (checkBox(playerTurn, j, i))
		{
			inARow += 1;
		}
		j--;
	}
	if (inARow == 3){printWin(playerTurn); return true;}
	else {inARow = 0;}
}

function checkBox(playerNum, row, col)
{
	if (playerNum == 'player1')
	{
		return rows_tracker[row][col] == 1;
	}
	else if (playerNum == 'player2')
	{
		return rows_tracker[row][col] == 2;
	}
	return false;
}

function printWin(playerNum)
{
	document.getElementById("announcementText").innerHTML = playerNum + " WINS!";
	if(playerNum == 'player1')
	{
		var winner = {
			'winner': config.player1,
			'loser': config.player2,
			'game': game,
			'name': 'player1',
			'rid': rid
		};
		socket.emit('playerWin',winner);
	}
	else
	{
		var winner = {
			'winner': config.player2,
			'loser': config.player1,
			'game': game,
			'name': 'player2',
			'rid': rid
		};
		socket.emit('playerWin',winner);
	}
}

socket.on('printWinner',(data) => {
	if(data.name == pid)
	{
		document.getElementById("announcementText").innerHTML = "You WON!";
		endGame();
	}
	else
	{
		document.getElementById("announcementText").innerHTML = "You LOST!";
		endGame();
	}

});

function endGame()
{
	socket.emit('delete_room',{'rid':rid});

	setTimeout(function()
	{
		sessionStorage.removeItem("rid");
		sessionStorage.removeItem("pid");
		sessionStorage.removeItem("game");
		location.href = '/';
	},10000);
}


socket.on('gesture', function(data){
	console.log(data);
	setNewFocus(data);
});

socket.on('tictactoe_game',(data)=>
{
	config = {
		'player1': data.player1,
		'player2': data.player2
	};
});