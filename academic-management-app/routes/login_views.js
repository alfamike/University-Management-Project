const express = require('express');
const { auth } = require('../kaleido/auth-helper');
const router = express.Router();


router.post('/login', async (req, res) => {
    const username = req.body.username;

    try {
        const identity = await auth(username);

        if (identity == null) {
            return res.render('registration/login', { error: 'Invalid username. Please try again.' });
        } else{
            // Save user session
            req.session.user = {
                username: username,
            }

            // Redirect to home
            res.redirect('/home');
        }
    } catch (error) {
        console.log(error);
        return res.render('registration/login', { error: 'Invalid username. Please try again.' });
    }

});

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
