const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

// Render home page
router.get("/home", (req, res) => {
    res.render("home");
});

// router.get("/home", isAuthenticated, (req, res) => {
//     res.render("home");
// });

// Chat message processing endpoint
router.post("/chat", async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: "No message provided" });
        }

        // Process message (This can be integrated with a chatbot API like OpenAI)
        const responseMessage = `Received your message: ${message}`;

        res.json({ response: responseMessage });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
