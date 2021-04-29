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
}