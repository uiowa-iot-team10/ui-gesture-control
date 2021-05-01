firebase.auth().onAuthStateChanged(function(user) {
	if (user && user.emailVerified) {
		window.location.replace("/");
	} else {
		$(".container").removeAttr("hidden");
	}
});

var socket = io();

function sign_up() {
	var name     = document.getElementById("name").value;
	var email    = document.getElementById("email").value;
	var password = document.getElementById("password").value;
	var passrep  = document.getElementById("passrepeat").value;

	firebase.auth().createUserWithEmailAndPassword(email, password)
	.then((userCredential) => {
		var user = userCredential.user;
		user.updateProfile({displayName: name});
		console.log("[LOG] Signed up: " + name);
		var actionCodeSettings = {
			url: "http://raspberrypi.local"
		};
		user.sendEmailVerification().then(function() {
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
			socket.emit("create_user_database", {
				'email': email,
				'name': name,
				'TotalGamesPlayed': 0,
				'TotalGamesWon': 0,
				'TotalGamesLost': 0,
				'Connect4Wins': 0,
				'Connect4Losses': 0,
				'TicTacToeWins': 0,
				'TicTacToeLosses': 0,
				'created': today,
				'created_unix': today_unix,
				'c4Rating': 500,
				'tttRating': 500,
				'activity': [{
					'account_created': {
						'time': today,
						'time_unix': today_unix
					}
				}],
				'progress': {
					'Connect4': [500],
					'TicTacToe': [500]
				}
			});
			$('#staticBackdrop').modal('toggle');
		}).catch(function(error) {
			$("#formAlert p").html("<strong>Error!</strong> " + error.message);
			$("#formAlert").removeClass('d-none');
		});
	})
	.catch((error) => {
		var errorCode = error.code;
		var errorMessage = error.message;
		$("#formAlert p").html("<strong>Error!</strong> " + errorMessage);
		$("#formAlert").removeClass('d-none');
	});
}

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

function ValidateEmail(email) 
{
	const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	if (re.test(email))
		return "";
	return "E-mail format is not correct";
}

function validate_inputs() {
	var email      = document.getElementById("email");
	var password   = document.getElementById("password");
	var passrepeat = document.getElementById("passrepeat");
	password.setCustomValidity(password.value != passrepeat.value ? "Passwords do not match." : "");
	passrepeat.setCustomValidity(password.value.length < 6 ? "Passwords should be longer than 6 characters." : "");
	email.setCustomValidity(ValidateEmail(email.value));
}