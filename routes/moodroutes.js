const express = require('express');
const controller = require('./../controllers/moodcontrollers');
const router = express.Router();
const { isAuth} = require('./../middleware/auth');


// Routes for each page
router.get('/dashboard',isAuth, controller.getDashboard);
router.get('/record',isAuth, controller.getRecord);
router.get('/history', isAuth,controller.getHistory);
router.get('/statistics/', isAuth,controller.getStatistics);
router.get('/index', controller.getIndex);
router.get('/login', controller.getLogin);
router.get('/views/editdeletetrigger', isAuth,controller.getSelectedMood);
router.get('/logout',controller.getLogout);
router.get('/api/contextual-triggers', controller.getContextualTriggers);
router.get('/Register', controller.getRegister);
router.get('/getemotionalvalues', isAuth, controller.getemotionalValues )
router.get('/registersuccess',controller.getRegisterSuccess);
router.get('/Forgetpassword', controller.getforgetpassword);
router.get('/api/apiKey', controller.getAPIkey);

// DELETE method to delete a snapshot record
router.delete('/views/deletemood/:moodId',isAuth,controller.deleteMood);
//POST method to update snapshot contextual triggers
router.post('/views/editdeletetrigger',isAuth,controller.updateMood);
// POST method to insert a new mood snapshot record
router.post('/record', isAuth,controller.postNewSnapshot);
// Handle registration form submission
router.post('/register', controller.postRegister);
// Handle login form submission
router.post('/login', controller.postLogin);
// Handle password reset form submission
router.post('/forgetpassword', controller.postForgetPassword);

module.exports = router;
