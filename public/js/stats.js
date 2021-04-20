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
        $("#welcome_message").text(user.displayName);
		make_visible();
	}
});

var socket = io();

socket.on("room_ready", (data) => {
    sessionStorage.setItem("rid", data.rid);
    sessionStorage.setItem("pid", data.pid);
    sessionStorage.setItem("game", data.game);
    window.location.replace("/waiting_room");
});

function sign_out() {
	firebase.auth().signOut().then(() => {
		window.location.assign("/login");
	}).catch((error) => {
		alert("[ERROR] Could not sign out: " + error.message);
	});
}

function make_visible() {
	$("#content").removeAttr('hidden');
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
    console.log(config);
    socket.emit("create_room", config);
}