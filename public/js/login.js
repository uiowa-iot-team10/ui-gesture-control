firebase.auth().onAuthStateChanged(function(user) {
	if (user && user.emailVerified) {
		window.location.replace("/");
	} else if (user && !user.emailVerified) {
		$('#staticBackdrop').modal('toggle');
	} else {
		$(".container").removeAttr('hidden');
	}
});

var socket = io();

function sign_in() {
	var email    = document.getElementById("email").value;
	var password = document.getElementById("password").value;

	firebase.auth().signInWithEmailAndPassword(email, password)
	.then((userCredential) => {
		// Signed in
		var user = userCredential.user;
		// console.log("[LOG] Signed in: " + user.displayName);
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
				'login': {
					'time': today,
					'time_unix': today_unix
				}
			}
		});
		window.location.assign("/");
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
	var email  = document.getElementById("email");
	email.setCustomValidity(ValidateEmail(email.value));
}