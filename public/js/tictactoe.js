var player = 2;

document.onkeydown = interpKeydown;

var row_groups = document.getElementById("ticTacToeBox").children;
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
	else if (e.keyCode == '38') // else if left arrow, index - 1
	{
		setNewFocus('UP');
	}
	else if (e.keyCode == '40') // else if left arrow, index - 1
	{
		setNewFocus('DOWN');
	}
	else if (e.keyCode == '13') // else if left arrow, index - 1
	{
		if (player == 1)
		{
			rows[row_index][col_index].style.backgroundImage="url(https://iconsplace.com/wp-content/uploads/_icons/ff0000/256/png/letter-o-icon-14-256.png)";
		}
		else
		{
			rows[row_index][col_index].style.backgroundImage="url(https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Red_X.svg/768px-Red_X.svg.png)";
		}

		if (checkForVictory())
		{
		//
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
		if (row_index < rows.length - 1)
		{
			row_index += 1;
		}
	}

	else if (direction == 'INPUT')
	{
		if (player == 1)
		{
			rows[row_index][col_index].style.backgroundImage="url(https://iconsplace.com/wp-content/uploads/_icons/ff0000/256/png/letter-o-icon-14-256.png)";
		}
		else
		{
			rows[row_index][col_index].style.backgroundImage="url(https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Red_X.svg/768px-Red_X.svg.png)";
		}
		if (checkForVictory())
		{
			//
		}
	}

	rows[row_index][col_index].focus();
}

function checkForVictory()
{
//
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