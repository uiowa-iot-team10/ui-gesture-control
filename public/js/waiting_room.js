const rid  = sessionStorage.getItem("rid");
const pid  = sessionStorage.getItem("pid");
const game = sessionStorage.getItem("game");

var socket = io();

firebase.auth().onAuthStateChanged(function(user) {
	if (user == null) {
		window.location.replace("/login");
	} else if (user && !user.emailVerified) {
		$('#staticBackdrop').modal('toggle');
	}
	else {
        if (pid == "player2") {
            redirect_player2(user.email, user.displayName);
        } else {
            make_visible();
        }
	}
});

socket.on("game_ready", (data) => {
    console.log("get game ready");
    location.href = "/" + data.game;
});

function redirect_player2(email, displayName) {
    socket.emit("increment_active_players", {
        "rid": rid,
        "pid": pid,
        "game": game,
        "email": email,
        "displayName": displayName
    });
}

function make_visible() {
	$("#content").removeAttr('hidden');
    var opts = {
    lines: 13, // The number of lines to draw
    length: 20, // The length of each line
    width: 10, // The line thickness
    radius: 30, // The radius of the inner circle
    scale: 0.5, // Scales overall size of the spinner
    corners: 1, // Corner roundness (0..1)
    speed: 1, // Rounds per second
    rotate: 0, // The rotation offset
    animation: 'spinner-line-fade-quick', // The CSS animation name for the lines
    direction: 1, // 1: clockwise, -1: counterclockwise
    color: '#ffffff', // CSS color or array of colors
    fadeColor: 'transparent', // CSS color or array of colors
    // top: '50%', // Top position relative to parent
    // left: '50%', // Left position relative to parent
    shadow: '0 0 1px transparent', // Box-shadow for the lines
    zIndex: 2000000000, // The z-index (defaults to 2e9)
    className: 'spinner', // The CSS class to assign to the spinner
    // position: 'absolute', // Element positioning
    };

    var target = document.getElementById('spinner');
    var spinner = new Spin.Spinner(opts).spin(target);

    socket.emit("host_waiting", {
        "rid": rid,
        "game": game
    });
}

function close_room(){
    socket.emit("delete_room", {
        "rid": rid
    });
    sessionStorage.removeItem("rid");
    sessionStorage.removeItem("pid");
    sessionStorage.removeItem("game");
    location.href = "/";
}