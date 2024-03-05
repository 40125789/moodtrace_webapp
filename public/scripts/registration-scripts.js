function validateForm() {
    var firstName = document.forms["registrationForm"]["firstname"].value;
    var lastName = document.forms["registrationForm"]["lastname"].value;
    var email = document.forms["registrationForm"]["email"].value;
    var password = document.forms["registrationForm"]["password"].value;
    var confirmPassword = document.forms["registrationForm"]["confirmpassword"].value;
    var errorMessages = document.getElementById('errorMessages');

    // Clear previous error messages
    errorMessages.innerHTML = '';

    // Check for empty fields
    if (firstName === "" || lastName === "" || email === "" || password === "" || confirmPassword === "") {
        errorMessages.innerHTML += "<p>All fields are required</p>";
        errorMessages.style.display = 'block';
        return false;
    }

    // Password length validation
    if (password.length < 8) {
        errorMessages.innerHTML += "<p>Password must be at least 8 characters long</p>";
        errorMessages.style.display = 'block';
        return false;
    }

    // Password special characters validation
    var specialCharacters = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    if (!specialCharacters.test(password)) {
        errorMessages.innerHTML += "<p>Password must contain special characters</p>";
        errorMessages.style.display = 'block';
        return false;
    }

    // Check if password and confirm password match
    if (password !== confirmPassword) {
        errorMessages.innerHTML += "<p>Password and confirm password do not match</p>";
        errorMessages.style.display = 'block';
        return false;
    }

    // If all validation passes, allow the form to submit
    // Registration successful, redirect to success page
    return true;
}
