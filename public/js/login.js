firebase.auth().onAuthStateChanged(function(user) {
	if (user && user.emailVerified) {
		window.location.replace("/");
	} else {
		$(".container").removeAttr('hidden');
	}
});

function sign_in() {
	var email    = document.getElementById("email").value;
	var password = document.getElementById("password").value;

	firebase.auth().signInWithEmailAndPassword(email, password)
	.then((userCredential) => {
		// Signed in
		var user = userCredential.user;
		console.log("[LOG] Signed in: " + user.displayName);
		window.location.assign("/");
	})
	.catch((error) => {
		var errorCode = error.code;
		var errorMessage = error.message;
		$("#formAlert p").html("<strong>Error!</strong> " + errorMessage);
		$("#formAlert").removeClass('d-none');
		// console.log("[ERROR (" + errorCode + ")] Could not sign in: " + errorMessage);
		// alert("[ERROR (" + errorCode + ")] Could not sign in: " + errorMessage);
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