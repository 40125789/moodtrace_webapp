const conn = require('./../utils/dbconn');
const bcrypt = require('bcrypt');

exports.requireLogin = (req, res, next) => {
    const { isloggedin } = req.session;

    if (isloggedin) {
        // If the user is logged in, proceed to the next middleware or route handler
        next();
    } else {
        // If the user is not logged in, redirect to the login page
        res.redirect('/login');
    }
};

// POST method to insert a new mood snapshot record
exports.postNewSnapshot = (req, res) => {
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

    const { userid } = req.session; // Assuming user_id is stored in the session
    const insertSnapshotSQL = 'INSERT INTO snapshot (enjoyment_level, sadness_level, anger_level, contempt_level, disgust_level, fear_level, surprise_level, date_time, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const insertSnapshotTriggerSQL = 'INSERT INTO snapshot_trigger (snapshot_id, trigger_id) VALUES (?, ?)';

    const snapshotValues = [enjoymentLevel, sadnessLevel, angerLevel, contemptLevel, disgustLevel, fearLevel, surpriseLevel, datetimePicker, userid];

    let responseSent = false; // Flag to track if a response has been sent

    conn.query(insertSnapshotSQL, snapshotValues, (err, result) => {
        if (err) {
            console.error('Error inserting snapshot:', err);
            sendErrorRedirect('/error');
        } else {
            const snapshotId = result.insertId;

            // Check if selectedContextualTriggers is an array before processing
            if (Array.isArray(selectedContextualTriggers)) {
                // Insert triggers association with the snapshot
                const insertTriggers = (triggers, callback) => {
                    if (triggers.length === 0) {
                        callback();  // Call the callback when all triggers are processed
                    } else {
                        const triggerName = triggers.shift();

                        // Retrieve the trigger id from the contextual_trigger table
                        const getTriggerIdSQL = 'SELECT trigger_id FROM contextual_trigger WHERE trigger_name = ?';

                        conn.query(getTriggerIdSQL, [triggerName], (err, rows) => {
                            if (err) {
                                console.error('Error getting trigger id:', err);
                                sendErrorRedirect('/error');
                                callback();  // Ensure callback is called in case of an error
                            } else {
                                if (rows.length === 0) {
                                    console.error('Trigger not found:', triggerName);
                                    sendErrorRedirect('/error');
                                    callback();  // Ensure callback is called in case of an error
                                } else {
                                    const triggerId = rows[0].trigger_id;
                                    conn.query(insertSnapshotTriggerSQL, [snapshotId, triggerId], (err) => {
                                        if (err) {
                                            console.error('Error inserting snapshot trigger:', err);
                                            sendErrorRedirect('/error');
                                            callback();  // Ensure callback is called in case of an error
                                        } else {
                                            insertTriggers(triggers, callback);  // Continue processing triggers
                                        }
                                    });
                                }
                            }
                        });
                    }
                };

                insertTriggers([...selectedContextualTriggers], () => {
                    sendSuccessRedirect('/success');
                });
            } else {
                console.error('selectedContextualTriggers is not an array');
                sendErrorRedirect('/error');
            }
        }
    });

    // Function to handle errors and redirect
    function sendErrorRedirect(redirectUrl) {
        if (!responseSent) {
            responseSent = true;
            res.redirect(redirectUrl);
        }
    }

    // Function to handle success and redirect
    function sendSuccessRedirect(redirectUrl) {
        if (!responseSent) {
            responseSent = true;
            res.redirect(redirectUrl);
        }
    }
};

exports.getContextualTriggers = (req, res) => {
    const selectTriggersSQL = 'SELECT trigger_name FROM contextual_trigger';

    conn.query(selectTriggersSQL, (err, rows) => {
        if (err) {
            console.error('Error fetching triggers:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            const contextualTriggers = rows.map(row => row.trigger_name);
            res.json(contextualTriggers);
        }
    });
};




    
// Serve the registration page
exports.getRegister = (req, res) => {
    // Initialize registrationMessage as an empty string
    const registrationMessage = '';
    res.render('register', { registrationMessage });
};
  
// Handle registration form submission
exports.postRegister = (req, res) => {
    const { firstname, lastname, email, password, confirmpassword } = req.body;

    let registrationMessage = '';

    // Validate form data (you should perform more thorough validation)
    if (!firstname || !lastname || !email || !password || !confirmpassword) {
        registrationMessage = 'Invalid form data. Please check your input.';
        return res.status(400).render('register', { registrationMessage });
    }

    // Check if the password meets length requirement
    if (password.length < 8) {
        registrationMessage = 'Password must be at least 8 characters long.';
        return res.status(400).render('register', { registrationMessage });
    }

    // Check if the email has already been registered
    const emailCheckQuery = 'SELECT * FROM user WHERE email_address = ?';
    conn.query(emailCheckQuery, [email], (err, emailResults) => {
        if (err) {
            console.error('Error checking email in MySQL: ' + err.stack);
            registrationMessage = '';
            return res.status(500).render('register', { registrationMessage });
        }

        if (emailResults.length > 0) {
            registrationMessage = 'Email address is already registered. Please choose another email.';
            return res.status(400).render('register', { registrationMessage });
        }

        // Hash the password using bcrypt
        bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
            if (hashErr) {
                console.error('Error hashing password: ' + hashErr);
                registrationMessage = '';
                return res.status(500).render('register', { registrationMessage });
            }

            // Insert user data into MySQL with hashed password
            const insertQuery = 'INSERT INTO user (firstname, surname, email_address, password) VALUES (?, ?, ?, ?)';
            conn.query(insertQuery, [firstname, lastname, email, hashedPassword], (insertErr, result) => {
                if (insertErr) {
                    console.error('Error inserting into MySQL: ' + insertErr.stack);
                    registrationMessage = '';
                    return res.status(500).render('register', { registrationMessage });
                }

                console.log('User registered with ID: ' + result.insertId);

                // Send a registration success message
                registrationMessage = 'Registration successful. Welcome, ' + firstname + '!';

                // Pass registrationMessage to the template
                res.render('register', { registrationMessage });
            });
        });
    });
};


  
// Routes for each page
exports.getDashboard = (req, res) => {
    var userinfo = {};
    const { isloggedin, userid } = req.session;
    console.log(`User data from session: ${isloggedin}, ${userid}`);

    if (isloggedin) {
        const getuserSQL = `SELECT user.firstname FROM user WHERE user.user_id = '${userid}'`;

        conn.query(getuserSQL, (err, rows) => {
            if (err) {
                throw err;
            } else {
                console.log(rows);
                const username = rows[0].firstname;

                const session = req.session;
                session.firstname = username;


                userinfo = { firstname: username };

                // Assuming your user object has a 'firstname' property
                res.render('dashboard', { isloggedin, firstname: userinfo.firstname });
            }
        });
    } else {
        res.redirect('/login'); // Redirect to login if the user is not logged in
    }
};



exports.getRecord = (req, res) => {
    var userinfo = {};
    const { isloggedin, userid } = req.session;
    console.log(`User logged in: ${isloggedin},${userid} `);

    if (isloggedin) {
        const getuserSQL = `SELECT user.firstname FROM user WHERE user.user_id = '${userid}'`;

        conn.query(getuserSQL, (err, rows) => {
            if (err) {
                throw err;
            } else {
                console.log(rows);
                const username = rows[0].firstname;
                const email = rows[0].email_address;

                const session = req.session;
                session.firstname = username;
                session.email_address = email;

                userinfo = { loggedin: isloggedin, firstname: username, email_address: email };

                // Assuming your user object has a 'firstname' property
                res.render('record', { isloggedin, firstname: userinfo.firstname });
            }
        });
    } else {
        res.redirect('/login'); // Redirect to login if the user is not logged in
    }
};

exports.getHistory = (req, res) => {
    const { isloggedin, userid } = req.session;
    console.log(`User data from session: ${isloggedin}, ${userid}`);

    if (isloggedin) {
        const selectSQL = `
            SELECT 
                snapshot.*, 
                user.*, 
                GROUP_CONCAT(contextual_trigger.trigger_name) AS contextual_triggers
            FROM 
                snapshot 
            INNER JOIN 
                user ON snapshot.user_id = user.user_id
            LEFT JOIN 
                snapshot_trigger ON snapshot.snapshot_id = snapshot_trigger.snapshot_id
            LEFT JOIN 
                contextual_trigger ON snapshot_trigger.trigger_id = contextual_trigger.trigger_id
            WHERE 
                snapshot.user_id = ?
            GROUP BY 
                snapshot.snapshot_id
            ORDER BY 
                snapshot.date_time DESC`;

        conn.query(selectSQL, [userid], (err, rows) => {
            if (err) {
                console.error('Error fetching mood records:', err);
                // Redirect to '/record' or another appropriate page in case of an error
                return res.redirect('/record');
            }

            // Render the history page with the retrieved moods
            res.render('history', { moods: rows, isloggedin, user_id: userid });
        });
    } else {
        // Redirect to '/login' or another appropriate page if the user is not logged in
        res.redirect('/login');
    }
};


exports.getStatistics = (req, res) => {
    res.render('statistics');
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
    const checkuserSQL = 'SELECT user_id, password FROM user WHERE email_address = ?';
    const vals = [email];

    conn.query(checkuserSQL, vals, (err, rows) => {
        if (err) {
            console.error('Error checking user:', err);
            res.redirect('/login');
        } else {
            const numrows = rows.length;

            if (numrows > 0) {
                const hashedPassword = String(rows[0].password);

                // Convert the entered password to string if not already
                const enteredPasswordString = String(password);

                // Compare the entered password with the hashed password
                bcrypt.compare(enteredPasswordString, hashedPassword, (compareErr, result) => {
                    if (compareErr) {
                        console.error('Error comparing passwords:', compareErr);
                        res.redirect('/login');
                    } else if (result) {
                        // Passwords match, set session and redirect to dashboard
                        const session = req.session;
                        session.isloggedin = true;
                        session.userid = rows[0].user_id;
                        res.redirect('dashboard');
                    } else {
                        // Set an error message and render the login page again
                        res.render('login', { error: 'Invalid email or password' });
                    }
                });
            } else {
                // Set an error message and render the login page again
                res.render('login', { error: 'Invalid email or password' });
            }
        }
    });
};




// Assuming you have a route similar to this in your Express application
exports.getSelectedMood = (req, res) => {
    // Assuming you have variables named 'moodId' and 'trigger' in your EJS file
    const snapshotID = req.query.snapshotID || '';
    const trigger = req.query.trigger || '';

    // Fetch the selected card information based on the mood_id and/or trigger value
    const selectSQL = `
        SELECT * 
        FROM snapshot 
        INNER JOIN snapshot_trigger ON snapshot.snapshot_id = snapshot_trigger.snapshot_id
        WHERE snapshot.snapshot_id = ? OR snapshot_trigger.trigger_id = ?`;

    conn.query(selectSQL, [snapshotID, trigger], (err, rows) => {
        if (err) {
            console.error('Error fetching selected card information:', err);
            res.redirect('/history'); // Redirect to the mood history page without making updates
        } else {
            const selectedCardInfo = rows[0] || {}; // Assuming only one row is expected
            res.render('editdeletetrigger', { snapshotID, trigger, selectedCardInfo });
        }
    });
};



// Update route
exports.updateMood = (req, res) => {
    const trigger = req.query.trigger || '';
    const { updatedContextualTrigger } = req.body;

    // Fetch the mood_id for the relevant card
    const selectMoodIdSQL = 'SELECT snapshot_id FROM snapshot WHERE contextual_trigger = ?';
    conn.query(selectMoodIdSQL, [trigger], (err, rows) => {
        if (err) {
            console.error('Error fetching snapshot_id:', err);
            res.redirect('/history'); // Redirect to the mood history page without making updates
        } else {
            // Check if rows array is not empty before accessing moodId
            const moodId = rows.length > 0 ? rows[0].snapshot_id : 'default';

            // Update only the relevant card
            const updateSQL = 'UPDATE snapshot SET contextual_trigger = IFNULL(?, NULL) WHERE snapshot_id = ?';
            conn.query(updateSQL, [updatedContextualTrigger.trim() || null, moodId], (err, rows) => {
                if (err) {
                    console.error('Error updating contextual trigger:', err);
                    res.redirect('/history'); // Redirect to the mood history page without making updates
                } else {
                    res.redirect('/history'); // Redirect to the mood history page after update
                }
            });
        }
    });
}; 


// Delete route
exports.deleteMood = (req, res) => {
    const moodId = req.params.moodId;

    // Directly delete the emotional snapshot based on mood_id
    const deleteSQL = 'DELETE FROM snapshot WHERE snapshot_id = ?';
    conn.query(deleteSQL, [moodId], (err, rows) => {
        if (err) {
            console.error('Error deleting mood record:', err);
            res.status(500).send('Internal Server Error'); // Send an error response
        } else {
            res.redirect('/history'); // Redirect to the mood history page after deletion
        }
    });
};

exports.getLogout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login'); 
    });
};