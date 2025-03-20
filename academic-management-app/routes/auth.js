/**
 * Middleware to check if the user is authenticated.
 * If the user is authenticated, proceed to the next middleware or route handler.
 * If the user is not authenticated, redirect to the login page.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/');
}

module.exports = { isAuthenticated };