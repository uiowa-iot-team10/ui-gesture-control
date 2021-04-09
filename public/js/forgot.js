function reset() {
	var emailAddress = document.getElementById("email").value;

	firebase.auth().sendPasswordResetEmail(emailAddress).then(function() {
		$("#formAlert p").html("<strong>Success!</strong> Please check your e-mail for password reset link. You can close this page.");
		$("#formAlert").removeClass('alert-danger');
		$("#formAlert").addClass('alert-success');
		$("#formAlert").removeClass('d-none');
		$("#formAlert").show();
		$(".form-group button").text("Resend E-mail");
	}).catch(function(error) {
		var errorCode = error.code;
		var errorMessage = error.message;
		$("#formAlert p").html("<strong>Error!</strong> " + errorMessage);
		$("#formAlert").removeClass('d-none');
		$("#formAlert").removeClass('alert-success');
		$("#formAlert").addClass('alert-danger');
		$("#formAlert").show();
		$(".form-group button").text("Send E-mail");
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