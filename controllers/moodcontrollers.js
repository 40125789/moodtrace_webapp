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

            // Convert to an array if not already
            const triggersToInsert = Array.isArray(selectedContextualTriggers) ? selectedContextualTriggers : [selectedContextualTriggers];

            // Insert triggers association with the snapshot
            const insertTriggers = (triggers, callback) => {
                if (triggers.length === 0) {
                    callback(); // Call the callback when all triggers are processed
                } else {
                    const triggerName = triggers.shift();

                    // Retrieve the trigger id from the contextual_trigger table
                    const getTriggerIdSQL = 'SELECT trigger_id FROM contextual_trigger WHERE trigger_name = ?';

                    conn.query(getTriggerIdSQL, [triggerName], (err, rows) => {
                        if (err) {
                            console.error('Error getting trigger id:', err);
                            sendErrorRedirect('/error');
                            callback(); // Ensure callback is called in case of an error
                        } else {
                            if (rows.length === 0) {
                                console.error('Trigger not found:', triggerName);
                                // Continue without failing the insertion
                                insertTriggers(triggers, callback);
                            } else {
                                const triggerId = rows[0].trigger_id;
                                conn.query(insertSnapshotTriggerSQL, [snapshotId, triggerId], (err) => {
                                    if (err) {
                                        console.error('Error inserting snapshot trigger:', err);
                                        sendErrorRedirect('/error');
                                        callback(); // Ensure callback is called in case of an error
                                    } else {
                                        insertTriggers(triggers, callback); // Continue processing triggers
                                    }
                                });
                            }
                        }
                    });
                }
            };

            insertTriggers(triggersToInsert, () => {
                // No need to wait for triggers processing completion to redirect
                sendSuccessRedirect();
            });
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
    function sendSuccessRedirect(redirectUrl = '/history') {
        if (!responseSent) {
            responseSent = true;
            res.redirect(redirectUrl);
        }
    }
};



    
// Serve the registration page
exports.getRegister = (req, res) => {
    // Initialize registrationMessage as an empty string
    const registrationMessage = '';
    res.render('register', { registrationMessage });
     // Redirect to the login page upon successful registration

    
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
    const { isloggedin, userid } = req.session;
    console.log(`User data from session: ${isloggedin}, ${userid}`);
    res.render('statistics', { isloggedin});
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
    const moodId = req.query.moodId || ''; // Corrected from 'snapshotId' to 'moodId'
    const trigger = req.query.trigger || '';

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
        snapshot.snapshot_id = ?
    GROUP BY 
        snapshot.snapshot_id, user.user_id;`;


    fetchContextualTriggers((err, contextualTriggers) => {
        if (err) {
            console.error('Error fetching contextual triggers:', err);
            res.redirect('/history');
            return;
        }

        conn.query(selectSQL, [moodId, trigger], (queryErr, rows) => {
            if (queryErr) {
                console.error('Error fetching selected card information:', queryErr);
                res.redirect('/history');
                return;
            }

            const selectedCardInfo = rows[0] || {};
            console.log('moodId:', moodId);
            console.log('trigger:', trigger);
            console.log('Selected Card Info:', selectedCardInfo);

            

            res.render('editdeletetrigger', { moodId, trigger, selectedCardInfo, contextualTriggers });
        });
    });
};

// Function to fetch contextual triggers from the database
function fetchContextualTriggers(callback) {
   const query = 'SELECT trigger_name, trigger_id FROM contextual_trigger';

   conn.query(query, (err, rows) => {
       if (err) {
            callback(err, null);
            return;
      }

      const triggersArray = rows.map(row => row.trigger_name);
      callback(null, triggersArray);
   });
};




exports.updateMood = (req, res) => {
    const { updatedContextualTriggers, moodId } = req.body;// Assuming moodId is now in the request body

    // Convert updatedContextualTriggers to an array if it's a single value
    const triggersArray = Array.isArray(updatedContextualTriggers)
        ? updatedContextualTriggers
        : [updatedContextualTriggers];

    // Update triggers associated with the given snapshotID
    const updateTriggerSQL = `
    INSERT IGNORE INTO snapshot_trigger (snapshot_id, trigger_id)
    SELECT '${moodId}', trigger_id
    FROM contextual_trigger
    WHERE trigger_name IN (?) AND trigger_id NOT IN (
        SELECT trigger_id
        FROM snapshot_trigger
        WHERE snapshot_id = '${moodId}'
    );
`;

 

// delete triggers from the if the checkbox is deselected by the user
const deleteTriggersSQL = `
            DELETE FROM snapshot_trigger
            WHERE snapshot_id = '${moodId}' AND trigger_id NOT IN (
                SELECT trigger_id FROM contextual_trigger WHERE trigger_name IN (?)
            );
        `;

        conn.query(deleteTriggersSQL, [triggersArray], (deleteErr) => {
            if (deleteErr) {
                console.error('Error deleting triggers:', deleteErr);
                conn.rollback(() => {
                    res.redirect('/error');
                });
                return;
            }
        });

    // Execute each update statement for each trigger in parallel using Promise.all
    const updatePromises = triggersArray.map((newTrigger) => {
        return new Promise((resolve, reject) => {
            // Use transaction for atomicity
            conn.beginTransaction((beginTransactionErr) => {
                if (beginTransactionErr) {
                    reject(beginTransactionErr);
                    return;
                }

                // Execute the update statement
                conn.query(updateTriggerSQL, [newTrigger, moodId, newTrigger], (updateErr, updateResult) => {
                    if (updateErr) {
                        // Rollback the transaction if there's an error
                        conn.rollback(() => {
                            console.error('Error updating snapshot_trigger:', updateErr);
                            reject(updateErr);
                        });
                    } else {
                        // Commit the transaction if the update is successful
                        conn.commit((commitErr) => {
                            if (commitErr) {
                                console.error('Error committing transaction:', commitErr);
                                reject(commitErr);
                            } else {
                                resolve(updateResult);
                                console.log('newTrigger:', newTrigger);
                                console.log('moodId:', moodId);
                            }
                        });
                    }
                });
            });
        });
    });

    // Wait for all updates to complete
    Promise.all(updatePromises)
        .then(() => {
            res.redirect('/history'); // Redirect to the mood history page after successful update
        })
        .catch((error) => {
            console.error('Error updating triggers:', error);
            res.redirect('/error'); // Redirect to the error page in case of an error
        

        });
};

exports.deleteMood = (req, res) => {
    const moodId = req.params.moodId;
    const selectTriggersSQL = 'SELECT trigger_id FROM snapshot_trigger WHERE snapshot_id = ?';
    const deleteTriggerSQL = 'DELETE FROM snapshot_trigger WHERE trigger_id IN (?)';
    const deleteSnapshotSQL = 'DELETE FROM snapshot WHERE snapshot_id = ?';
    
    // Begin a transaction
    conn.beginTransaction((err) => {
        if (err) {
            console.error('Error beginning transaction:', err);
            return res.status(500).send('Internal Server Error');
        }
    
        // Retrieve all associated trigger IDs
        conn.query(selectTriggersSQL, [moodId], (errSelect, triggerRows) => {
            if (errSelect) {
                return rollbackAndSendError(res, conn, 'Error retrieving associated triggers:', errSelect);
            }
    
            const triggerIds = triggerRows.map(row => row.trigger_id);
    
            // If there are associated triggers, delete them first
            if (triggerIds.length > 0) {
                conn.query(deleteTriggerSQL, [triggerIds], (errDelete, resultDelete) => {
                    if (errDelete) {
                        return rollbackAndSendError(res, conn, 'Error deleting associated triggers:', errDelete);
                    }
    
                    // Then delete the snapshot
                    conn.query(deleteSnapshotSQL, [moodId], (errSnapshot, resultSnapshot) => {
                        if (errSnapshot) {
                            return rollbackAndSendError(res, conn, 'Error deleting snapshot:', errSnapshot);
                        }
    
                        // Commit the transaction if all delete queries are successful
                        conn.commit((errCommit) => {
                            if (errCommit) {
                                return rollbackAndSendError(res, conn, 'Error committing transaction:', errCommit);
                            }
    
                            console.log(`Deleted mood with ID ${moodId} successfully.`);
                            res.redirect('/history'); // Redirect to the mood history page after deletion
                        });
                    });
                });
            } else {
                // If there are no associated triggers, directly delete the snapshot
                conn.query(deleteSnapshotSQL, [moodId], (errSnapshot, resultSnapshot) => {
                    if (errSnapshot) {
                        return rollbackAndSendError(res, conn, 'Error deleting snapshot:', errSnapshot);
                    }
    
                    // Commit the transaction if the delete query is successful
                    conn.commit((errCommit) => {
                        if (errCommit) {
                            return rollbackAndSendError(res, conn, 'Error committing transaction:', errCommit);
                        }
    
                        console.log(`Deleted mood with ID ${moodId} successfully.`);
                        res.redirect('/history'); // Redirect to the mood history page after deletion
                    });
                });
            }
        });
    });
};

function rollbackAndSendError(res, conn, message, err) {
    console.error(message, err);
    conn.rollback((rollbackErr) => {
        if (rollbackErr) {
            console.error('Error rolling back transaction:', rollbackErr);
        }
        res.status(500).send('Internal Server Error');
    });
}



//Getting emotional values for emotions chart
exports.getemotionalValues = (req, res) => {
    const { isloggedin, userid } = req.session;
    console.log(`User data from session: ${isloggedin}, ${userid}`);

    if (!isloggedin) {
        // Redirect to '/login' or another appropriate page if the user is not logged in
        return res.status(403).json({ error: 'User not logged in' });
    }

    
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
            console.error('Error fetching emotional values:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        const data = rows.map(row => {
            const emotions = ['enjoyment', 'sadness', 'anger', 'contempt', 'disgust', 'fear', 'surprise'];
        
            const emotionData = emotions.reduce((acc, emotion) => {
                acc[emotion] = row[`${emotion}_level`];
                return acc;
            }, {});
        
            return {
                date_time: row.date_time, // Include the date_time property
                ...emotionData,
                contextual_triggers: row.contextual_triggers || null,
            };
        });
        
        
        res.json(data);
    }); 
};


exports.getLogout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login'); 
    });
};