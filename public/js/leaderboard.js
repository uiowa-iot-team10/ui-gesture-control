firebase.auth().onAuthStateChanged(function(user) {
	if (user == null) {
		window.location.replace("/login");
	} else if (user && !user.emailVerified) {
		$('#staticBackdrop').modal('toggle');
	}
	else {
		$("#welcome_message").text(user.displayName);
		make_visible();
	}
});

var game_array = null;
var index = 0;
focus;
var game = new URLSearchParams(window.location.search);
game = game.get('game');

document.getElementById("table-caption").innerHTML = (game == "connect4") ? "Connect4 Leaderboard" : "Tic-Tac-Toe Leaderboard";

var socket = io();


buttons = ['homeButton','navbarDropdownMenuLink','myModal','statsButton','navbarDropdownMenuLink3','navbarDropdownMenuLink2'];
var i = 0;
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

socket.on('gesture', function(data){
    setNewFocus(data);
});

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
		// alert("[ERROR] Could not sign out: " + error.message);
	});
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

function make_visible() {
	$("#content").removeAttr('hidden');
    socket.emit("get_leaderboard", game);
}

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

socket.on('leaderboard', (data) => {
    var users = document.querySelector("#users tbody");
    removeAllChildNodes(users);
    if (data) {
        for (var user_info in data) {
            var newRow = users.insertRow(-1);
            var cell0  = newRow.insertCell(0);
            var cell1  = newRow.insertCell(1);
            var cell2  = newRow.insertCell(2);
            cell0.innerHTML = parseInt(user_info) + 1;
            cell1.innerHTML = data[user_info][1];
            cell2.innerHTML = data[user_info][0];
        }
    }
});

// refreshes list every 3 seconds
// setInterval( () => {
//     socket.emit("get_leaderboard", game);
// },3000);
