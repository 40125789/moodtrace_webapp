exports.isAuth = (req, res, next) => {
    const { isloggedin } = req.session;

    if (isloggedin) {
        next(); // Continue to the next middleware or route handler
    } else {
        // Store the original route in the session
        req.session.route = req.originalUrl;
        res.redirect('/login'); // Redirect to login if not logged in
    }
};
