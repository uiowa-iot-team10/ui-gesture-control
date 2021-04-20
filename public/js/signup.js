firebase.auth().onAuthStateChanged(function(user) {
	if (user && user.emailVerified) {
		window.location.replace("/");
	} else {
		$(".container").removeAttr("hidden");
	}
});

function sign_up() {
	var name     = document.getElementById("name").value;
	var email    = document.getElementById("email").value;
	var password = document.getElementById("password").value;
	var passrep  = document.getElementById("passrepeat").value;
	// var database = firebase.database();

	firebase.auth().createUserWithEmailAndPassword(email, password)
	.then((userCredential) => {
		var user = userCredential.user;
		user.updateProfile({displayName: name});
		console.log("[LOG] Signed up: " + name);
		var actionCodeSettings = {
			url: "http://raspberrypi.local"
		};
		user.sendEmailVerification().then(function() {
			// console.log(email.replace(/[.#$\[\]]/g,'-'));
			socket.emit("create_user_database", {
				'email': email,
				'name': name
			});
			// TO-DO: Change this with a modal pop-up.
			if (window.confirm("[SUCCESS] Please check your email for your account verification."))
				window.location.assign("/");
		}).catch(function(error) {
			$("#formAlert p").html("<strong>Error!</strong> " + error.message);
			$("#formAlert").removeClass('d-none');
		});
	})
	.catch((error) => {
		var errorCode = error.code;
		var errorMessage = error.message;
		console.log("[ERROR (" + errorCode + ")] Could not sign up: " + errorMessage);
		$("#formAlert p").html("<strong>Error!</strong> " + errorMessage);
		$("#formAlert").removeClass('d-none');
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

var socket = io();