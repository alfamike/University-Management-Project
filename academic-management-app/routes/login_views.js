const express = require('express');
const { auth } = require('../kaleido/auth-helper');
const router = express.Router();

/**
 * Handle user login.
 * @route POST /login
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.post('/login', async (req, res) => {
    const username = req.body.username;

    try {
        const identity = await auth(username);

        if (identity == null) {
            res.redirect('/');
            res.render('registration/login', { error: 'Invalid username. Please try again.' });
        } else {
            // Save user session
            req.session.user = {
                username: username,
            };

            // Redirect to home
            res.redirect('/home');
        }
    } catch (error) {
        console.log(error);
        res.render('registration/login', { error: 'Invalid username. Please try again.' });
    }
});

/**
 * Handle user logout.
 * @route POST /logout
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
            return res.redirect('/home'); // Redirect to home if there's an error
        }

        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

module.exports = router;