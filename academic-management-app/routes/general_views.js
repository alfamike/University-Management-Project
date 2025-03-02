const express = require("express");
const router = express.Router();
const axios = require("axios");
const {isAuthenticated} = require("./auth");

// Render home page
router.get("/home", isAuthenticated, (req, res, next) => {
    res.render("home", { title: 'Home' });
});

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
