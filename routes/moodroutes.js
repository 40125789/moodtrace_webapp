const express = require('express');
const controller = require('./../controllers/moodcontrollers');
const router = express.Router();

// Middleware to check if the user is logged in
const checkLoggedIn = (req, res, next) => {
    const { isloggedin } = req.session;

    if (isloggedin) {
        // User is logged in, proceed to the next middleware or route handler
        next();
    } else {
        // User is not logged in, redirect to the 'login' page
        res.redirect('/login');
    }
};

// Apply the checkLoggedIn middleware to routes that require authentication
router.use(['/Dashboard', '/record', '/history', '/statistics', '/views/editdeletetrigger', '/views/deletemood/:moodId', '/record'], checkLoggedIn);

// Routes for each page
router.get('/Dashboard',controller.requireLogin, controller.getDashboard);
router.get('/record',controller.requireLogin, controller.getRecord);
router.get('/history', controller.requireLogin,controller.getHistory);
router.get('/statistics', controller.requireLogin,controller.getStatistics);
router.get('/index', controller.getIndex);
router.get('/login', controller.getLogin);
router.get('/views/editdeletetrigger', controller.requireLogin,controller.getSelectedMood);
router.get('/logout', controller.getLogout);
router.get('/api/contextual-triggers', controller.getContextualTriggers);
router.get('/Register', controller.getRegister);
router.get('/emotionalValues',controller.requireLogin, controller.getemotionalValues )

// DELETE method to delete a snapshot record
router.delete('/views/deletemood/:moodId',controller.deleteMood);

router.post('/views/editdeletetrigger',controller.updateMood);
// POST method to insert a new mood snapshot record
router.post('/record', controller.postNewSnapshot);
// Handle registration form submission
router.post('/register', controller.postRegister);
// Handle login form submission
router.post('/login', controller.postLogin);

module.exports = router;
