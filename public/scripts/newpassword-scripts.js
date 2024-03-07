document.getElementById('resetPasswordForm').addEventListener('submit', function(event) {
    // Prevent the default form submission
    event.preventDefault();
    
    // Get the values of the password fields
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-new-password').value;

    // Get the current URL
    const currentUrl = window.location.href;

    // Parse the URL to extract the query parameters
    const urlParams = new URLSearchParams(currentUrl);

    // Get the value of the 'token' parameter
    const token = urlParams.get('token');

    // Set the value of the hidden input field
    document.getElementById('resetToken').value = token;


    // Submit the form
    this.submit();
});

