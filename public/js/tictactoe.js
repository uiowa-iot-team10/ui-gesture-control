const rid  = sessionStorage.getItem("rid");
const pid  = sessionStorage.getItem("pid");
const game = sessionStorage.getItem("game");

var config = {};
var timercount = 10;

var socket = io.connect();

firebase.auth().onAuthStateChanged(function(user) {
	if (user == null) {
		window.location.replace("/login");
	} else if (user && !user.emailVerified) {
		$('#staticBackdrop').modal('toggle');
	}
	else {
		$("#welcome_message").text(user.displayName);
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
			return; // if there is already an X or O there don't let a new one get put down
		}
		if (playerTurn == 'player1')
		{
			rows[row_index][col_index].className += " ex";
			rows_tracker[row_index][col_index] = 1;
		}
		else
		{
			rows[row_index][col_index].className += " oh";
			rows_tracker[row_index][col_index] = 2;
		}
		console.log('row:' + row_index + " col: " + col_index);
		socket.emit('moveCoord',{'rid': rid, 'row':row_index,'col':col_index,'player':playerTurn});

		playerTurn = (pid[pid.length -1] == '1') ? 'player2' : 'player1';
		totalMoves += 1;

		document.getElementById("turn-message").innerHTML = "Opponent's turn.";
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
				totalMoves += 1;
			}
			else
			{
				rows[data.row][data.col].className += " ex";
				rows_tracker[data.row][data.col] = 1;
				totalMoves += 1;
			}
			row_index = data.row;
			col_index = data.col;
			if(!checkForVictory())
			{
				row_index = 0;
				col_index = 0;
				playerTurn = pid;
				document.getElementById("turn-message").innerHTML = "Your turn.";
			}
		},500);
	}
});

function checkForVictory()
{
	var inARow = 0;

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

	if (totalMoves > 8)
	{
		printWin("DRAW");
		return true;
	}

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
	if(playerNum == 'player1')
	{
		var winner = {
			'winner': config.player1,
			'loser': config.player2,
			'winnerName': config.player1Name,
			'loserName': config.player2Name,
			'game': game,
			'name': 'player1',
			'rid': rid,
			'draw': false
		};
		socket.emit('playerWin',winner);
	}
	else if(playerNum == 'player2')
	{
		var winner = {
			'winner': config.player2,
			'loser': config.player1,
			'winnerName': config.player2Name,
			'loserName': config.player1Name,
			'game': game,
			'name': 'player2',
			'rid': rid,
			'draw': false
		};
		socket.emit('playerWin',winner);
	}
	else
	{
		var draw = {
			'player1':config.player1,
			'player2':config.player2,
			'winnerName': config.player2Name,
			'loserName': config.player1Name,
			'game':game,
			'name':'draw',
			'rid':rid,
			'draw':true
		};
		socket.emit('playerWin',draw);
	}
}

socket.on('printWinner',(data) => {
	if(data.name == pid)
	{
		document.getElementById("announcementText").innerHTML = "You WON!";
		endGame();
	}
	else if(data.name == 'draw')
	{
		document.getElementById("announcementText").innerHTML = "It's a DRAW!"
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
	$('#staticBackdrop').modal('toggle');
	socket.emit('delete_room',{'rid':rid});
	setTimeout(function()
	{
		sessionStorage.removeItem("rid");
		sessionStorage.removeItem("pid");
		sessionStorage.removeItem("game");
		location.href = '/';
	},10000);
	setInterval(function () {
		timercount--;
		if (timercount >= 0) document.getElementById("modal-result-message").innerHTML = "You will be redirected to main page in " + timercount + " seconds.";
	}, 1000);
}

function leave_game() {
	var user_info = {};
	var today = new Date();
	var dd = String(today.getUTCDate()).padStart(2, '0');
	var mm = String(today.getUTCMonth() + 1).padStart(2, '0'); //January is 0!
	var yyyy = today.getUTCFullYear();
	var h  = String(today.getUTCHours()).padStart(2, '0');
	var m  = String(today.getUTCMinutes()).padStart(2, '0');
	var s  = String(today.getUTCSeconds()).padStart(2, '0');
	var today_unix = Date.UTC(today.getUTCFullYear(),today.getUTCMonth(), today.getUTCDate(), 
	today.getUTCHours(), today.getUTCMinutes(), today.getUTCSeconds(), today.getUTCMilliseconds());
	today = mm + '/' + dd + '/' + yyyy + ' ' + h + ':' + m + ':' + s;

	if(pid == 'player1')
	{
		var winner = {
			'winner':config.player2,
			'loser':config.player1,
			'winnerName': config.player2Name,
			'loserName': config.player1Name,
			'game':game,
			'name':'player2',
			'rid':rid
		};
		user_info = {
			'user': config.player1,
			'activity': {
				'left_game': {
					'time': today,
                    'time_unix': today_unix
				}
			}
		};
	}
	else
	{
		var winner = {
			'winner':config.player1,
			'loser':config.player2,
			'winnerName': config.player1Name,
			'loserName': config.player2Name,
			'game':game,
			'name':'player1',
			'rid':rid
		};
		user_info = {
			'user': config.player2,
			'activity': {
				'left_game': {
					'time': today,
                    'time_unix': today_unix
				}
			}
		};
	}
	socket.emit('leaveGame',winner);
	socket.emit("user_data_update", user_info);
	sessionStorage.removeItem("rid");
	sessionStorage.removeItem("pid");
	sessionStorage.removeItem("game");
	location.href = '/';
}

function sign_out() {
	var user = firebase.auth().currentUser;
    firebase.auth().signOut().then(() => {
        if (user) {
            var today = new Date();
            var dd = String(today.getUTCDate()).padStart(2, '0');
            var mm = String(today.getUTCMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = today.getUTCFullYear();
            var h  = String(today.getUTCHours()).padStart(2, '0');
            var m  = String(today.getUTCMinutes()).padStart(2, '0');
            var s  = String(today.getUTCSeconds()).padStart(2, '0');
            var today_unix = Date.UTC(today.getUTCFullYear(),today.getUTCMonth(), today.getUTCDate(), 
            today.getUTCHours(), today.getUTCMinutes(), today.getUTCSeconds(), today.getUTCMilliseconds());
            today = mm + '/' + dd + '/' + yyyy + ' ' + h + ':' + m + ':' + s;
            socket.emit("user_data_update", {
                'user': user.email,
                'activity': {
                    'signout': {
                        'time': today,
                        'time_unix': today_unix
                    }
                }
            });
        }
		window.location.assign("/login");
	}).catch((error) => {
		alert("[ERROR] Could not sign out: " + error.message);
	});
}


socket.on('gesture', function(data){
	setNewFocus(data);
});

socket.on('tictactoe_game',(data)=>
{
	config = {
		'player1': data.player1,
		'player2': data.player2,
		'player1Name': data.player1Name,
		'player2Name': data.player2Name
	};
	if (pid == "player1") document.getElementById("turn-message").innerHTML = "Your turn.";
	else if (pid == "player2") document.getElementById("turn-message").innerHTML = "Opponent's turn.";
});