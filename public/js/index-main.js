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

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function create_room() {
    var d = new Date();
    var rn = document.querySelector("#room-name");
    var rg = document.querySelector("#room-game");
    var config = {
        'username': firebase.auth().currentUser.email,
        'displayName': firebase.auth().currentUser.displayName,
        'rname': rn.value,
        'time': d.getTime(),
        'game': rg.options[rg.selectedIndex].text
    };
    socket.emit("create_room", config);
}

var socket = io();

socket.on('connection', function(data){
    // var status = document.getElementById("status");
    // status.setAttribute("class", "connected");
    // status.innerHTML = "Server: Connected!";
    var rooms = document.querySelector("#rooms tbody");
    removeAllChildNodes(rooms);
    socket.emit("get_active_rooms", null);
});

socket.on('disconnect', function(data){
    // var status = document.getElementById("status");
    // status.setAttribute("class", "notconnected");
    // status.innerHTML = "Server: Not Connected!";
});

socket.on('gesture', function(data){
    console.log(data);
    setNewFocus(data);
});

socket.on("room_ready", (data) => {
    sessionStorage.setItem("rid", data.rid);
    sessionStorage.setItem("pid", data.pid);
    sessionStorage.setItem("game", data.game);
    window.location.replace("/waiting_room");
});

socket.on('active_rooms', (data) => {
    var rooms = document.querySelector("#rooms tbody");
    removeAllChildNodes(rooms);
    if (data) {
        for (var key in data) {
            if (data.hasOwnProperty(key)){
                var room_info = data[key];
                var newRow = rooms.insertRow(0);
                var cell1  = newRow.insertCell(0);
                var cell2  = newRow.insertCell(1);
                var cell3  = newRow.insertCell(2);
                var cell4  = newRow.insertCell(3);
                var cell5  = newRow.insertCell(4);
                var joinButton = document.createElement('button');
                joinButton.type  = "button";
                joinButton.style = "width: 100px;";
                joinButton.rid   = room_info.rid;
                joinButton.game  = room_info.game;
                joinButton.onclick = function (){
                    sessionStorage.setItem("rid", this.rid);
                    sessionStorage.setItem("pid", "player2");
                    sessionStorage.setItem("game", this.game);
                    location.href = "/waiting_room";
                };
                joinButton.setAttribute("class", "btn btn-primary btn-block");
                joinButton.textContent = "Join";
                cell1.innerHTML = room_info.rname;
                cell2.innerHTML = room_info.host;
                cell3.innerHTML = room_info.game;
                cell4.innerHTML = room_info.active_players + "/2";
                cell5.appendChild(joinButton);
            }
        }
    }
});