const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("./auth");

/**
 * Render the home page.
 * @route GET /home
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
router.get("/home", isAuthenticated, (req, res, next) => {
    res.render("home", { page_title: 'Home' });
});

/**
 * Chat message processing endpoint.
 * @route POST /chat
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.post("/chat", async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: "No message provided" });
        }

        // Process message
        const responseMessage = `Received your message: ${message}`;

        res.json({ response: responseMessage });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;