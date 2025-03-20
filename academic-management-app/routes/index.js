const express = require('express');
const router = express.Router();

/**
 * Render the home page.
 * @route GET /
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
router.get('/', function (req, res, next) {
    res.render('registration/login', {page_title: 'University Management', error: null});
});

module.exports = router;