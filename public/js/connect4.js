const rid  = sessionStorage.getItem("rid");
const pid  = sessionStorage.getItem("pid");
const game = sessionStorage.getItem("game");

console.log("RID: " + rid.toString());
console.log("PID: " + pid.toString());
console.log("Game: " + game.toString());

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
	"rid": rid
});

//var player = 1;
var totalMoves = 0;
var player = 1;
var playerTurn = 'player1';
var rtrnStr;

var AI = false;

// If playing against AI
// if (true)
// {
// 	player = 1;
// 	player_turn = 1;
// 	rtrnStr = "";
// }
// else // else playing against another player
// {
// 	player_turn = 1;
// 	player = 0; // get from firebase?
// }


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
var prev_index = 0;
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

		if (playerTurn == 'player1')
		{
			rows[row_index][col_index].className += " p1";
			rows_tracker[row_index][col_index] = 1;
		}
		else
		{
			rows[row_index][col_index].className += " p2";
			rows_tracker[row_index][col_index] = 2;
		}
		console.log("row: " + row_index + " col: " + col_index);
		socket.emit('moveCoord',{'rid': rid, 'row':row_index,'col':col_index, 'player':playerTurn});

		playerTurn = (pid[pid.length - 1] == "1") ? "player2" : "player1";
		totalMoves += 1;

		// if no victory on board, end players turn
		// if(!checkForVictory())
		// {
		// 	endTurn();
		// }

		// row_index back to 0 since you drop from the top in connect 4
	}

	rows[row_index][col_index].focus();
}

// socket.on('playerTurnDone',(data) =>
// {
// 	playerTurn = data.player;
// });

socket.on('move',(data)=>
{
	if (data.row != -1 || data.col != -1) {
		setTimeout(() => {
			if(pid == 'player1')
			{
				rows[data.row][data.col].className += " p2";
				rows_tracker[data.row][data.col] = 2;
			}
			else
			{
				rows[data.row][data.col].className += " p1";
				rows_tracker[data.row][data.col] = 1;
			}
			if(!checkForVictory())
			{
				row_index = 0;
				playerTurn = pid;
				// endTurn();
			}
		},500);
	}
});

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
		if (checkBox(playerTurn, i, col_index))
		{
			inARow += 1;
		}
		else{inARow = 0;}

		if (inARow >= 4){printWin(playerTurn);return true;}
	}
	inARow = 0;

	// check horizontal win
    for (i = 0; i < 6; i++)
	{
		if (checkBox(playerTurn, row_index, i))
		{
			inARow += 1;
		}
		else{inARow = 0;}

		if (inARow >= 4){printWin(playerTurn);return true;}
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
			if (checkBox(playerTurn, i + j, j))
			{
				inARow += 1;
			}
			else{inARow = 0;}
			if (inARow >= 4){printWin(playerTurn);return true;}
		}
	}
	inARow = 0;

	
	// check diag win horizontal, starting first row, second column
	for (i = 1; i < 4; i++)
	{
		// start with row 1 col 2 where you index both row/col up every time
		//		index col up, index col up
		// row 1 col 2, row 2 col 3, ...
		// row 1 col 3, row 2 col 4, ...
		// ...
		// row 1 col 5, row 2 col 6, ...
		for (j = 0; j < 6; j++)
		{
			if (i + j > 6){continue;} // if you hit the far right edge

			if (checkBox(playerTurn, j, i + j))
			{
				inARow += 1;
			}
			else{inARow = 0;}
			if (inARow >= 4){printWin(playerTurn);return true;}
		}
	}
	inARow = 0;
	

	// check anti-diag win vertical, starting at first row first column
	for (i = 0; i < 3; i++)
	{
		for (j = 0; i + j < 6; j++)
		{
			if (checkBox(playerTurn, i + j, 6 - j))
			{
				inARow += 1;
			}
			else{inARow = 0;}
			if (inARow >= 4){printWin(playerTurn);return true;}
		}
	}
	inARow = 0;

	
	// check anti-diag win horizontal, starting first row, second column
	for (i = 1; i < 4; i++)
	{
		for (j = 0; j < 6; j++)
		{
			if (i + j > 6){continue;} // if you hit the far left edge

			if (checkBox(playerTurn, j, 6 - (i + j)))
			{
				inARow += 1;
			}
			else{inARow = 0;}
			if (inARow >= 4){printWin(player);return true;}
		}
	}
	inARow = 0;

	return false;
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
	//endGame();
}
socket.on('printWinner',(data) =>
{
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
})

function endTurn()
{
	// send array to AI, wait until player turn
	// if (true && player == 1) // If its PvE
	// {
	// 	// string to be sent to AI
	// 	var sendStr = "";

	// 	// For each row, loop through each col
	// 	for (i = 0; i < rows_tracker.length; i++)
	// 	{
	// 		for (j = 0; j < rows_tracker[i].length; j++)
	// 		{
	// 			// save chip to string w/ a ',' in between
	// 			if (rows_tracker[i][j] == 1){sendStr = sendStr.concat("1");}
	// 			else if (rows_tracker[i][j] == 2){sendStr = sendStr.concat("-1");}
	// 			else{sendStr = sendStr.concat("0");}

	// 			if (j < rows_tracker[i].length - 1){sendStr = sendStr.concat(",");}
	// 		}
	// 		// concat a '.' after each row
	// 		if (i < rows_tracker.length - 1){sendStr = sendStr.concat(".");}
	// 	}

	// 	// socket.emit("aiQuery", sendStr);

	// }
    // If its PvP
	socket.emit('playerMove',{'rid': rid, 'player':playerTurn});
}

function endGame()
{
	socket.emit('delete_room',{'rid':rid});

	setTimeout(function()
	{
		sessionStorage.removeItem("rid");
		sessionStorage.removeItem("pid");
		sessionStorage.removeItem("game");
		location.href = '/';
	},3000);
}


socket.on('gesture', function(data){
	console.log(data);
	setNewFocus(data);
});

socket.on('connect4_game',(data)=>
{
	config = {
		'player1': data.player1,
		'player2': data.player2
	};
});

// socket.on('aiReturn', function(data){
// 	rtrnStr = data;
// 	document.getElementById("announcementText").innerHTML = rtrnStr;

// 	// Change player to 2 (AI) set chip, change player back to 1
// 	player = 2;
// 	col_index = parseInt(rtrnStr);
// 	setNewFocus('INPUT');
// 	player = 1;
// });