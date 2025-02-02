const express = require('express');
const router = express.Router();
const axios = require("axios");

const KALEIDO_API_URL = process.env.KALEIDO_API_URL;
const KALEIDO_AUTH = { auth: { username: process.env.KALEIDO_USERNAME, password: process.env.KALEIDO_PASSWORD } };

// Create a new title
router.post("/titles", async (req, res) => {
    try {
        const { id, name, description } = req.body;
        const response = await axios.post(`${KALEIDO_API_URL}/invoke`, {
            chaincode: "titleContract",
            method: "createTitle",
            args: [id, name, description]
        }, KALEIDO_AUTH);

        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a single title
router.get("/titles/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.post(`${KALEIDO_API_URL}/query`, {
            chaincode: "titleContract",
            method: "getTitle",
            args: [id]
        }, KALEIDO_AUTH);

        res.json(JSON.parse(response.data.result));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all titles
router.get("/titles", async (req, res) => {
    try {
        const response = await axios.post(`${KALEIDO_API_URL}/query`, {
            chaincode: "titleContract",
            method: "getAllTitles",
            args: []
        }, KALEIDO_AUTH);

        res.json(JSON.parse(response.data.result));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a title
router.put("/titles/:id", async (req, res) => {
    try {
        const { name, description } = req.body;
        const { id } = req.params;

        const response = await axios.post(`${KALEIDO_API_URL}/invoke`, {
            chaincode: "titleContract",
            method: "updateTitle",
            args: [id, name, description]
        }, KALEIDO_AUTH);

        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a title
router.delete("/titles/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.post(`${KALEIDO_API_URL}/invoke`, {
            chaincode: "titleContract",
            method: "deleteTitle",
            args: [id]
        }, KALEIDO_AUTH);

        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;
