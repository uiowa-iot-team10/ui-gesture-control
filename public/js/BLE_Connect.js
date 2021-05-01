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

var socket = io.connect();

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

function testFunction()
{
    socket.emit('BLE',true);
    var success = document.getElementById("device_connection_section");
    success.innerHTML = "Searching for the controller...";
}

socket.on('GestureSense',function(data)
{
    var success = document.getElementById("device_connection_section");
    success.innerHTML = data;
});

socket.on("room_ready", (data) => {
    sessionStorage.setItem("rid", data.rid);
    sessionStorage.setItem("pid", data.pid);
    sessionStorage.setItem("game", data.game);
    window.location.replace("/waiting_room");
});

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

function changePage(newPage)
{
    location.href = newPage;
}

function make_visible() {
	$("#content").removeAttr('hidden');
	document.onkeydown = interpKeydown;
}