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

var socket = io();

buttons = ['homeButton','navbarDropdownMenuLink','myModal','statsButton','navbarDropdownMenuLink3','navbarDropdownMenuLink2'];
var i = 0; // menu selection index
var gameSelection = false;
var gameSelectionIndex = 0;

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
    if(gameSelection)
    {
        $('#activeRoomButtons button')[gameSelectionIndex].focus();
    }
});

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
    var rn = document.querySelector("#room-name");
    var rg = document.querySelector("#room-game");
    var config = {
        'username': firebase.auth().currentUser.email,
        'displayName': firebase.auth().currentUser.displayName,
        'rname': rn.value,
        'time': today_unix,
        'date': today,
        'game': rg.options[rg.selectedIndex].text
    };
    socket.emit("create_room", config);
    socket.emit("user_data_update", {
        'user': firebase.auth().currentUser.email,
        'activity': {
            'create_room': {
                'time': today,
                'time_unix': today_unix,
                'game': rg.options[rg.selectedIndex].text
            }
        }
    });
}

socket.on('connection', function(data){
    var rooms = document.querySelector("#rooms tbody");
    removeAllChildNodes(rooms);
    socket.emit("get_active_rooms", null);
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

buttons = ['homeButton','navbarDropdownMenuLink','myModal','statsButton','navbarDropdownMenuLink3','navbarDropdownMenuLink2'];
var i = 0; // menu selection index
var gameSelection = false;
var gameSelectionIndex = 0;

function setNewFocus(direction){
    var currentLocation = $('#'+buttons[i]).attr('class');
    
    // single player selection
    if(buttons[i] == 'navbarDropdownMenuLink' && currentLocation == 'nav-link dropdown-toggle active clicked'){
        if(direction == 'RIGHT'){
            $('#singleTTT').attr('class','dropdown-item');
            $('#singleC4').attr('class','dropdown-item active');
        }
        if(direction == 'LEFT'){
            $('#singleTTT').attr('class','dropdown-item active');
            $('#singleC4').attr('class','dropdown-item');
        }
        if(direction == 'INPUT'){
            if($('#singleTTT').attr('class') == 'dropdown-item active'){
                $('#singleTTT')[0].click();
            } 
            else{
                $('#singleC4')[0].click();
            }
        }
        if(direction == 'UP'){
            $('#'+buttons[i]).attr('class','nav-link dropdown-toggle active'); 
            $('#singleTTT').attr('class','dropdown-item');
            $('#singleC4').attr('class','dropdown-item');
            $('#'+buttons[i]).blur();
            document.getElementById('singlePlayerDropdown').classList.remove('show');  
        }
    }
     // leaderboard selection
    else if(buttons[i] == 'navbarDropdownMenuLink3' && currentLocation == 'nav-link dropdown-toggle active clicked'){
        if(direction == 'RIGHT'){
            $('#leaderTTT').attr('class','dropdown-item');
            $('#leaderC4').attr('class','dropdown-item active');
        }
        if(direction == 'LEFT'){
            $('#leaderTTT').attr('class','dropdown-item active');
            $('#leaderC4').attr('class','dropdown-item');
        }
        if(direction == 'INPUT'){
            if($('#leaderTTT').attr('class') == 'dropdown-item active'){
                $('#leaderTTT')[0].click();
            } 
            else{
                $('#leaderC4')[0].click();
            }
        }
        if(direction == 'UP'){
            $('#'+buttons[i]).attr('class','nav-link dropdown-toggle active'); 
            $('#leaderTTT').attr('class','dropdown-item');
            $('#leaderC4').attr('class','dropdown-item');
            $('#'+buttons[i]).blur();
            document.getElementById('leaderboardDropdown').classList.remove('show');  
        }
    }
    // settings selection
    else if(buttons[i] == 'navbarDropdownMenuLink2' && currentLocation == 'nav-link dropdown-toggle active clicked') {
        if(direction == 'RIGHT'){
            $('#bluetoothSetting').attr('class','dropdown-item');
            $('#signOutSetting').attr('class','dropdown-item active');
        }
        if(direction == 'LEFT'){
            $('#bluetoothSetting').attr('class','dropdown-item active');
            $('#signOutSetting').attr('class','dropdown-item');
        }
        if(direction == 'INPUT'){
            if($('#bluetoothSetting').attr('class') == 'dropdown-item active'){
                $('#bluetoothSetting')[0].click();
            } 
            else{
                $('#signOutSetting')[0].click();
            }
        }
        if(direction == 'UP'){
            $('#'+buttons[i]).attr('class','nav-link dropdown-toggle active'); 
            $('#bluetoothSetting').attr('class','dropdown-item');
            $('#signOutSetting').attr('class','dropdown-item');
            $('#'+buttons[i]).blur();
            document.getElementById('settingsDropdown').classList.remove('show');  
        }
    }
    else if(gameSelection && $('#activeRoomButtons button').length != 0 )
    {
        if(direction == 'DOWN')
        {
            gameSelectionIndex += 1;
            if(gameSelectionIndex == $('#activeRoomButtons button').length)
            {
                gameSelectionIndex -= 1;
                console.log(gameSelectionIndex);
                $('#activeRoomButtons button')[gameSelectionIndex].focus();
            }
            else
            {
                console.log(gameSelectionIndex);
                $('#activeRoomButtons button')[gameSelectionIndex-1].blur();
                $('#activeRoomButtons button')[gameSelectionIndex].focus();
            }
        }
        if(direction == 'UP')
        {
            gameSelectionIndex -= 1;
            if(gameSelectionIndex == -1)
            {
                console.log(gameSelectionIndex);
                gameSelectionIndex = 0;
                i = 0;
                gameSelection = false;
                $('#activeRoomButtons button')[0].blur();
                $('#'+buttons[0]).attr('class','nav-link active');
            }
            else
            {
                console.log(gameSelectionIndex);
                $('#activeRoomButtons button')[gameSelectionIndex+1].blur();
                $('#activeRoomButtons button')[gameSelectionIndex].focus();   
            }
        }
        if(direction = 'INPUT')
        {
            $('#activeRoomButtons button')[gameSelectionIndex].click();  
        }

    }
    else{
        if (direction == 'RIGHT'){
            i += 1;
            if(i == 6){
                i -= 1;
                $('#'+buttons[i]).attr('class','nav-link dropdown-toggle active');
            }
            else{
                // single player button
                if(buttons[i] == 'navbarDropdownMenuLink') {
                    $('#'+buttons[i-1]).attr('class','nav-link');
                    $('#'+buttons[i]).attr('class','nav-link dropdown-toggle active');
                }
                // create room button
                else if(buttons[i] == 'myModal') {
                    $('#'+buttons[i-1]).attr('class','nav-link dropdown-toggle');
                    $('#'+buttons[i]).attr('class','nav-link active');
                }
                else if(buttons[i] == 'statsButton'){
                    $('#'+buttons[i-1]).attr('class','nav-link');
                    $('#'+buttons[i]).attr('class','nav-link active');
                }
                // leaderboard button
                else if(buttons[i] == 'navbarDropdownMenuLink3') {
                    $('#'+buttons[i-1]).attr('class','nav-link');
                    $('#'+buttons[i]).attr('class','nav-link dropdown-toggle active');
                }
                // settings button
                else if(buttons[i] == 'navbarDropdownMenuLink2') {
                    $('#'+buttons[i-1]).attr('class','nav-link');
                    $('#'+buttons[i]).attr('class','nav-link dropdown-toggle active');
                }
            } 
        }
        if (direction == 'LEFT'){
            i -= 1;
            if(i == -1){
                i += 1;
                $('#'+buttons[i]).attr('class','nav-link active');
            }
            else{
                if(buttons[i] == 'navbarDropdownMenuLink'){
                    $('#'+buttons[i+1]).attr('class','nav-link');
                    $('#'+buttons[i]).attr('class','nav-link dropdown-toggle active');
                }
                else if(buttons[i] == 'myModal'){
                    $('#'+buttons[i+1]).attr('class','nav-link');
                    $('#'+buttons[i]).attr('class','nav-link active');
                }
                else if(buttons[i] == 'statsButton'){
                    $('#'+buttons[i+1]).attr('class','nav-link dropdown-toggle');
                    $('#'+buttons[i]).attr('class','nav-link active');
                }
                else if(buttons[i] == 'homeButton'){
                    $('#'+buttons[i+1]).attr('class','nav-link dropdown-toggle');
                    $('#'+buttons[i]).attr('class','nav-link active');
                }
                else if(buttons[i] == 'navbarDropdownMenuLink3'){
                    $('#'+buttons[i+1]).attr('class','nav-link dropdown-toggle');
                    $('#'+buttons[i]).attr('class','nav-link active');
                }
            }
        }
        if(direction == 'DOWN')
        {
            if(buttons[i] == 'navbarDropdownMenuLink'){
                $('#'+buttons[i]).attr('class','nav-link dropdown-toggle');
            }
            else if(buttons[i] == 'myModal'){
                $('#'+buttons[i]).attr('class','nav-link');
            }
            else if(buttons[i] == 'statsButton'){
                $('#'+buttons[i]).attr('class','nav-link');
            }
            else if(buttons[i] == 'homeButton'){
                $('#'+buttons[i]).attr('class','nav-link');
            }
            else if(buttons[i] == 'navbarDropdownMenuLink3'){
                $('#'+buttons[i]).attr('class','nav-link');
            }
            else if(buttons[i] == 'navbarDropdownMenuLink2'){
                $('#'+buttons[i]).attr('class','nav-link');
            }
            try
            {
                $('#activeRoomButtons button')[gameSelectionIndex].focus();
            }
            catch(err){ $('#'+buttons[0]).attr('class','nav-link active');}
            gameSelection = true;
        }
        if(direction == 'INPUT'){
            $('#'+buttons[i])[0].click();
            if(buttons[i] == 'navbarDropdownMenuLink'){
                $('#'+buttons[i]).attr('class','nav-link dropdown-toggle active clicked');
            }
            if(buttons[i] == 'navbarDropdownMenuLink2'){
                $('#'+buttons[i]).attr('class','nav-link dropdown-toggle active clicked');
            }
            if(buttons[i] == 'navbarDropdownMenuLink3'){
                $('#'+buttons[i]).attr('class','nav-link dropdown-toggle active clicked');
            }
        }
    }
}

//refreshes active room list every 3 seconds
setInterval( () => 
{
    socket.emit("get_active_rooms", null);
},3000);
