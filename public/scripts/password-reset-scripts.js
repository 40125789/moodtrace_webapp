function validateForm() {
    var email = document.getElementById('email').value;
    var message = document.getElementById('message');

    // Clear previous error messages
    message.innerHTML = '';

    // Check if the email is empty
    if (!email) {
        message.innerHTML = '<p>Email address is required.</p>';
        message.style.display = 'block';
        return false;
    }

    // Check if the email is valid
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        message.innerHTML = '<p>Please enter a valid email address.</p>';
        message.style.display = 'block';
        return false;
    }

    return true;
}
