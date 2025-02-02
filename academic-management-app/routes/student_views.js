const express = require('express');
const router = express.Router();
const axios = require("axios");

const KALEIDO_API_URL = process.env.KALEIDO_API_URL;
const KALEIDO_AUTH = { auth: { username: process.env.KALEIDO_USERNAME, password: process.env.KALEIDO_PASSWORD } };

// Create a student
router.post("/students", async (req, res) => {
    try {
        const { first_name, last_name, email } = req.body;
        const response = await axios.post(`${KALEIDO_API_URL}/invoke`, {
            chaincode: "studentContract",
            method: "createStudent",
            args: [first_name, last_name, email]
        }, KALEIDO_AUTH);

        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all students
router.get("/students", async (req, res) => {
    try {
        const response = await axios.post(`${KALEIDO_API_URL}/query`, {
            chaincode: "studentContract",
            method: "getAllStudents",
            args: []
        }, KALEIDO_AUTH);

        res.json(JSON.parse(response.data.result));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a specific student
router.get("/students/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.post(`${KALEIDO_API_URL}/query`, {
            chaincode: "studentContract",
            method: "getStudent",
            args: [id]
        }, KALEIDO_AUTH);

        res.json(JSON.parse(response.data.result));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update student details
router.put("/students/:id", async (req, res) => {
    try {
        const { first_name, last_name, email } = req.body;
        const { id } = req.params;

        const response = await axios.post(`${KALEIDO_API_URL}/invoke`, {
            chaincode: "studentContract",
            method: "updateStudent",
            args: [id, first_name, last_name, email]
        }, KALEIDO_AUTH);

        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a student
router.delete("/students/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.post(`${KALEIDO_API_URL}/invoke`, {
            chaincode: "studentContract",
            method: "deleteStudent",
            args: [id]
        }, KALEIDO_AUTH);

        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Enroll student in courses
router.post("/students/:id/enroll", async (req, res) => {
    try {
        const { id } = req.params;
        const { course_ids } = req.body;

        const response = await axios.post(`${KALEIDO_API_URL}/invoke`, {
            chaincode: "studentContract",
            method: "enrollCourses",
            args: [id, ...course_ids]
        }, KALEIDO_AUTH);

        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// De-enroll student from courses
router.post("/students/:id/deenroll", async (req, res) => {
    try {
        const { id } = req.params;
        const { course_ids } = req.body;

        const response = await axios.post(`${KALEIDO_API_URL}/invoke`, {
            chaincode: "studentContract",
            method: "deEnrollCourses",
            args: [id, ...course_ids]
        }, KALEIDO_AUTH);

        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
