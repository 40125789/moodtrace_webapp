exports.isAuth = (req, res, next) => {
    const { isloggedin } = req.session;

    if (isloggedin) {
        next(); // Continue to the next middleware or route handler
    } else {
        res.redirect('/login'); // Redirect to login if not logged in
    }
};