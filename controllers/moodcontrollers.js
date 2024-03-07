const bcrypt = require('bcrypt');
const axios = require('axios');
require('dotenv').config();
const apiKey = process.env.API_KEY; 

// Middleware function to check if the user is authenticated
const isAuth = (req, res, next) => {
    if (req.session.isAuth) {
        next(); // User is authenticated, continue to the next middleware or route handler
    } else {
        res.redirect('/login'); // User is not authenticated, redirect to the login page
    }
};

exports.getAPIkey = (req, res) => {
    axios.get('http://localhost:3002/api/apiKey') // Adjust the URL to match your server
        .then(response => {
            const retrievedApiKey = response.data.apiKey;
            // Use the retrieved API key in your server-side code
            console.log('Retrieved API Key:', retrievedApiKey);

            // Create headers object with the API key
            const headers = {
                'x-api-key': retrievedApiKey
            };

            // Send the retrieved API key as JSON response along with headers to the client
            res.json({ apiKey: retrievedApiKey, headers });
        })
        .catch(error => {
            console.error('Error retrieving API key:', error);
            res.status(500).json({ error: 'Failed to retrieve API key' }); // Handle error and send error response
        });
};



// POST method to insert a new mood snapshot record


exports.getContextualTriggers = async (req, res) => {
    try {
        const endpoint = 'http://localhost:3002/getcontextualtriggers'; // Adjust the endpoint URL as needed
        const response = await axios.get(endpoint);

        // Check if the response status indicates success (2xx)
        if (response.status >= 200 && response.status < 300) {
            // Check if the response data is an array
            if (Array.isArray(response.data)) {
                const contextualTriggers = response.data;
                res.json(contextualTriggers);
            } else {
                throw new Error('Unexpected response format: response data is not an array');
            }
        } else {
            throw new Error(`Request failed with status ${response.status}`);
        }
    } catch (error) {
        console.error('Error fetching contextual triggers:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



// Handle insertion of a new snapshot using Axios
exports.postNewSnapshot = async (req, res) => {
    try {
    const {
        enjoymentLevel,
        sadnessLevel,
        angerLevel,
        contemptLevel,
        disgustLevel,
        fearLevel,
        surpriseLevel,
        datetimePicker,
        selectedContextualTriggers
    } = req.body;

    // Initialize selectedContextualTriggers as an empty array if not provided
    const triggers = selectedContextualTriggers || [];

    const { userid } = req.session; // Assuming user_id is stored in the session
    const endpoint = `http://localhost:3002/postSnapshot/${userid}`; // Replace with your actual endpoint URL

    const snapshotValues = {
        enjoymentLevel,
        sadnessLevel,
        angerLevel,
        contemptLevel,
        disgustLevel,
        fearLevel,
        surpriseLevel,
        datetimePicker,
        userid,
        selectedContextualTriggers: triggers // Send selectedContextualTriggers (either provided or empty array) to the server
    };

    console.log('Sending snapshot data to server:', snapshotValues);
    const response =  await axios.post(endpoint, snapshotValues, {
        method: 'POST',
                headers: {
                    'x-api-key': apiKey


        }
    });
   
        console.log('Response from server:', response.data);
        if (response.status === 200 && response.status < 300) {
            console.log('Snapshot data added successfully');
            res.redirect('/history');

            
        } else {
            // Handle unexpected response
            console.error('Unexpected response from server');
            res.status(500).send('Unexpected response from server')
    
        }
    } catch (error)  {
        console.error('Error inserting snapshot:', error);
        res.status(500).json({ error: 'Error inserting snapshot' }); // Send an error response
    }
    
};


// Serve the registration page
exports.getRegister = (req, res) => {
    // Initialize registrationMessage as an empty string
    const registrationMessage = '';
    res.render('register', { registrationMessage });
     // Redirect to the login page upon successful registration

    
};

exports.getDashboard = async (req, res) => {
    try {
        const { userid } = req.session;
        console.log(`User data from session: ${userid}`);

        const getuserURL = `http://localhost:3002/dashboard/${userid}`;

        const response = await axios.get(getuserURL, {
                method: 'GET',
                headers: {
                    'x-api-key': apiKey


        }
    });
        const username = response.data.firstname;

        // Update session data with the retrieved username and isAuth flag
        req.session.firstname = username;
        req.session.isAuth = true;

        res.render('dashboard', { isAuth: true, firstname: username });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
};


exports.getRecord = (req, res) => {
    const { userid } = req.session;
    console.log(`User logged in: ${userid} `);

        const endpoint = `http://localhost:3002/record/${userid}`; 

        axios
        .get(endpoint,  {
            method: 'GET',
            headers: {
        'x-api-key': apiKey
    }
})
            .then(response => {
                const userData = response.data;
                const { firstname, email_address } = userData;

                const session = req.session;
                session.firstname = firstname;
                session.email_address = email_address;

                const userinfo = {firstname, email_address };

                // Assuming your user object has a 'firstname' property
                res.render('record', { firstname: userinfo.firstname });
            })
            .catch(error => {
                console.log('Error making API request: ${error}');
                res.status(500).send('Internal Server Error');
            });
   
    }

    exports.getHistory = (req, res) => {
        const { userid } = req.session;
        console.log(`User data from session: ${userid}`);
    
        const endpoint = `http://localhost:3002/history/${userid}`;
    
        axios.get(endpoint, {
            method: 'GET',
            headers: {
                'x-api-key': apiKey
            }
        })
        .then((response) => {
            const data = response.data.result;
            console.log(data); // Log the response data to inspect its structure
    
            // Check if response data is an array
            if (Array.isArray(data)) {
                // Render the history page with the retrieved moods
                res.render('history', { moods: data, user_id: userid });
            } else {
                // Handle case where response data is not an array
                console.error("Invalid response format. Expected an array.");
                res.redirect('/record');
            }
        })
        .catch((error) => {
            console.error('Error fetching mood records:', error);
            // Redirect to '/record' or another appropriate page in case of an error
            res.redirect('/record');
        });
    };
    


exports.getStatistics = (req, res) => {
    const { userid } = req.session;
    console.log(`User data from session: ${userid}`);
    res.render('statistics', {userid});
};


exports.getIndex = (req, res) => {
    const { isloggedin } = false;
    console.log(`User logged in: ${isloggedin}`);

    res.render('index', {isloggedin});
};

exports.getLogin = (req, res) => {
    const { isloggedin } = false;
    console.log(`User logged in: ${isloggedin}`);

    res.render('login', {isloggedin});

};

exports.postLogin = (req, res) => {
    const { email, password } = req.body;
    const endpoint = 'http://localhost:3002/login';

    axios.post(endpoint, { email, password })
        .then((response) => {
            console.log('Response data:', response.data); // Log the response data

            if (response.data && response.data.success) {
                req.session.isloggedin = true;
                req.session.userid = response.data.userid;
                
                // Redirect the user to the original route or the dashboard
                const orig_route = req.session.route || '/dashboard';
                return res.redirect(`${orig_route}`);
            } else {
                // Handle unsuccessful login
                let errMessage = 'An error occurred while logging in';
                if (response.data && response.data.error) {
                    errMessage = response.data.error;
                }
                return res.render('login', { errMessage });
            }
        })
        .catch((error) => {
            console.error('Error logging in:', error);
            let errMessage = 'Internal Server Error';
            if (error.response && error.response.data && error.response.data.errMessage) {
                errMessage = error.response.data.errMessage;
            }
            return res.render('login', { errMessage });
        });
};



exports.postRegister = async (req, res) => {
    const { firstname, lastname, email, password, confirmpassword } = req.body;

    try {
        // Make a request to the endpoint that handles registration using Axios
        const response = await axios.post('http://localhost:3002/register', { firstname, lastname, email, password, confirmpassword });

        // Handle the response from the API route
        const registrationMessage = response.data.registrationMessage;
        console.log(registrationMessage)

        // Check if the response status is 201 (Created)
        if (response.status === 201) {
            // Log the registration message to the console
            console.log('Registration successful:', registrationMessage);

            // Render the registration message
            res.render('register', { registrationMessage }, () => {
                // Redirect to the success page after rendering the message
                setTimeout(() => {
                    res.redirect('/registersuccess');
                }, 2000); // Delay of 2000 milliseconds (2 seconds)
            });
            
            return; // Exit the function to avoid sending multiple responses
            
        }

       
    } catch (error) {
        // Handle specific errors from the server
        console.error('Error during registration:', error.response.data);
        const registrationMessage = error.response.data.registrationMessage || 'registration error';
        res.render('register', { registrationMessage });
        return;
    }
    
};


async function fetchSelectedMood(moodId, trigger) {
    try {
        const endpoint = `http://localhost:3002/selectedMood/${moodId}/${trigger}`;
        console.log('Fetching data from:', endpoint);
        const response = await axios.get(endpoint, {
            method: 'GET',
            headers: {
                'x-api-key': apiKey
            }
        });
        console.log('Response:', response.data); // Log the response data
        return response.data.selectedCardInfo || null; // Return the response data including contextual triggers
    } catch (error) {
        console.error('Error fetching selected mood information:', error.message);
        throw new Error('Error fetching selected mood information');
    }
}

// Function to fetch contextual triggers
async function fetchContextualTriggers() {
    try {
        const endpoint = 'http://localhost:3002/getcontextualtriggers'; // Adjust the endpoint URL as needed
        const response = await axios.get(endpoint);
        return response.data; // Return contextual triggers
    } catch (error) {
        console.error('Error fetching contextual triggers:', error.message);
        throw new Error('Error fetching contextual triggers');
    }
}

// Usage of the function in your route handler
exports.getSelectedMood = async (req, res) => {
    
    try {
        const moodId = req.query.moodId || ''; // Extract moodId from query string
        const trigger = req.query.trigger || ''; // Extract trigger from query string

        // Call the functions to fetch selected mood information and contextual triggers concurrently
        const [selectedCardInfo, contextualTriggers] = await Promise.all([
            fetchSelectedMood(moodId, trigger),
            fetchContextualTriggers()
        ]);

        // Ensure selectedCardInfo is not empty or undefined
        if (!selectedCardInfo) {
            console.error('No selected card information found');
            return res.status(404).json({ error: 'Selected card information not found' });
        }

        // Render the view with the obtained data
        res.render('editdeletetrigger', { selectedCardInfo, contextualTriggers, trigger, moodId });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



exports.updateMood = async (req, res) => {
    try {
        // Extract moodId from query parameters
        const moodId = req.query.moodId;

        // Extract updatedContextualTriggers from request body
        const { updatedContextualTriggers } = req.body;

        // Ensure moodId and updatedContextualTriggers are properly received
        console.log('Received moodId:', moodId);
        console.log('Received updatedContextualTriggers:', updatedContextualTriggers);

        // Construct endpoint with moodId
        const endpoint = `http://localhost:3002/updateTriggers/${moodId}`;

        // Ensure Axios is properly configured and imported
        console.log('Sending request to endpoint:', endpoint);

        // Send triggers data to the single endpoint for updating
        const response = await axios.put(endpoint, {
            updatedContextualTriggers
        });

        // Ensure response is received
        console.log('Received response:', response.data.result);

        // Check if the request was successful (status code 2xx)
        if (response.status >= 200 && response.status < 300) {
            // Redirect to history page upon success
            res.redirect('/history');
        } else {
            // If the request was not successful, handle the error
            console.error('Error updating triggers. Server responded with status:', response.status);
            res.redirect('/error');
        }
    } catch (error) {
        // If there was an error in making the request, handle it
        console.error('Error updating triggers:', error);
        res.redirect('/error');
    }
};


// Define a function to rollback the transaction and send an error response
function rollbackAndSendError(res, conn, errorMessage, error) {
    console.error(errorMessage, error);
    conn.rollback(() => {
        console.error('Transaction rolled back.');
        res.status(500).json({ error: 'Internal Server Error' });
    });
}


exports.deleteMood = async (req, res) => {
    const moodId = req.params.moodId;
    const endpoint = `http://localhost:3002/deleteSnapshot/${moodId}`;

    try {
        // Make a single request to the backend server to delete mood and associated triggers
        const response = await axios.delete(endpoint, { moodId });

        console.log(`Deleted mood with ID ${moodId} successfully.`);
        res.status(200).json(response.data.result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


exports.getemotionalValues = async (req, res) => {
    try {
        const { userid } = req.session;
        console.log(`User data from session:${userid}`);

        if ( userid) {
            const endpoint = `http://localhost:3002/getemotionalvalues/${userid}`;
            const response = await axios.get(endpoint, {
                method: 'GET',
                    headers: {
                        'x-api-key': apiKey

                     
                    }
                });
           
            const data = response.data;

            if (Array.isArray(data)) {
                // Return emotional values as JSON response
                res.json(data);
            } else {
                console.error("Invalid response format. Expected an array.");
                res.status(500).json({ error: "Invalid response format. Expected an array." });
            }
        } else {
            res.status(401).json({ error: "User not logged in or userid not defined." });
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};



exports.getRegisterSuccess  = (req, res) => {
console.log(`User successfully registered`);

    res.render('registersuccess');

};

exports.getforgetpassword = (req, res) => {
    const message = ""; // You may want to change this to an appropriate initial value
    const sentResetLink = false; // Set the initial value of sentResetLink
    res.render('forgetpassword', { message, sentResetLink }); // Pass both message and sentResetLink to the template
};


exports.passwordreset = (req, res) => {
    let message = ''; // Initialize message variable
    let type = '';
    // Logic to determine the message based on the query parameters or other conditions
    const token = req.query.token;
   
    // Assuming you have a 'resetpassword' template for rendering the password reset page
    res.render('resetpassword', { message, type, token }); // Pass the message and token to the template
};


exports.postForgetPassword = async (req, res) => {
    const { email } = req.body;

    try {
        // Make a request to the endpoint that checks if the email exists
        const response = await axios.post('http://localhost:3002/forgetpassword', { email });

        // Extract the message from the response data
        const message = response.data.message;

        // Determine the value of sentResetLink based on the response
        const sentResetLink = message === "Password reset link has been sent to your email";

        // Render the forget password page with the message and sentResetLink
        res.render('forgetpassword', { message: message, sentResetLink: sentResetLink });
    } catch (error) {
        console.error('Error:', error);
        if (error.response && error.response.status === 404) {
            // If the email is not found, render the forget password page with an appropriate message
            res.render('forgetpassword', { message: 'Email not found', sentResetLink: false });
        } else {
            // Handle other errors appropriately
            res.status(500).send('Internal Server Error');
        }
    }
};

exports.postNewPassword = async (req, res) => {
    const { token, newPassword, confirmPassword } = req.body;

    console.log('Token:', token); // Logging the token from the request body

    try {
        // Make a POST request to the server endpoint
        const response = await axios.post('http://localhost:3002/resetpassword', { token, newPassword, confirmPassword });

        // Extract the message and type from the response data
        const { message, type } = response.data;

        // Handle success response
        console.log('Response:', message);
        // Redirect or show a success message to the user
        res.render('resetpassword', { message, token, type });
    } catch (error) {
        // Handle error
        if (error.response) {
            // The request was made and the server responded with a status code
            console.error('Server Error:', error.response.data);
            // Send error message as JSON response
            res.render('resetpassword', { message: error.response.data.message, token, type: 'error' });
        } else if (error.request) {
            // The request was made but no response was received
            console.error('Request Error:', error.request);
            // Send error message as JSON response
            res.status(500).json({ message: 'Request Error', type: 'error' });
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error:', error.message);
            // Send error message as JSON response
            res.status(500).json({ message: 'Internal Error', type: 'error' });
        }
    }
};






exports.getLogout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Internal Server Error');
        }

        
        res.redirect('/login'); 
    });
};
