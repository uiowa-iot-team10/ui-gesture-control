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

function sign_out() {
	firebase.auth().signOut().then(() => {
		window.location.assign("/login");
	}).catch((error) => {
		alert("[ERROR] Could not sign out: " + error.message);
	});
}

var socket = io.connect();

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

function changePage(newPage)
{
    location.href = newPage;
}

function make_visible() {
	$("#content").removeAttr('hidden');
	document.onkeydown = interpKeydown;
}