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
		$("#content h2").text("Welcome, " + user.displayName);
		make_visible();
	}
});

var game_array = null;
var index = 0;
focus;
function sign_out() {
	firebase.auth().signOut().then(() => {
		window.location.assign("/login");
	}).catch((error) => {
		alert("[ERROR] Could not sign out: " + error.message);
	});
}

function make_visible() {
	$("#content").removeAttr('hidden');
	document.onkeydown = interpKeydown;
	game_array = document.getElementById("game-nav").children;
	for (i = 0; i < game_array.length; i++)
	{
	  game_array[i].setAttribute('tabindex', '0');
	}
	var index = 0;
	focus;
	game_array[index].focus();
}