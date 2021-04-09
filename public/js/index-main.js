function interpKeydown(e)
{
    if (e.keyCode == '39') // if right arrow, index + 1
    {
        setNewFocus('RIGHT');
    }
    if (e.keyCode == '37') // else if left arrow, index - 1
    {
        setNewFocus('LEFT');
    }
}

function setNewFocus(direction)
{
    if (direction == 'RIGHT')
    {
        if (index < game_array.length) {
            index = index + 1;
            game_array[index].focus();
        }
    }
    else if (direction == 'LEFT')
    {
        if (index > 0) {
            index = index - 1;
            game_array[index].focus();
        }
    }
    else if(direction == 0)
    {
        var status = document.getElementById(game_array[index]);
        status.style.backgroundColor = 'yellow';
    }
}

function changePage(newPage)
{
    location.href = newPage;
}

var socket = io();

socket.on('connection', function(data){
    var status = document.getElementById("status");
    status.setAttribute("class", "connected");
    status.innerHTML = "Server: Connected!";
});

socket.on('disconnect', function(data){
    var status = document.getElementById("status");
    status.setAttribute("class", "notconnected");
    status.innerHTML = "Server: Not Connected!";
});

socket.on('gesture', function(data){
    console.log(data);
    setNewFocus(data);
});