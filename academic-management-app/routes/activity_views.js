const express = require("express");
const router = express.Router();
const axios = require("axios");

const KALEIDO_API_URL = process.env.KALEIDO_API_URL;
const KALEIDO_AUTH = { auth: { username: process.env.KALEIDO_USERNAME, password: process.env.KALEIDO_PASSWORD } };

// Create an activity
router.post("/activities", async (req, res) => {
    try {
        const { name, description, due_date, course_id } = req.body;

        const response = await axios.post(`${KALEIDO_API_URL}/invoke`, {
            chaincode: "activityContract",
            method: "createActivity",
            args: [name, description, due_date, course_id]
        }, KALEIDO_AUTH);

        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Remove activities
router.post("/activities/remove", async (req, res) => {
    try {
        const { activity_ids } = req.body;

        for (const id of activity_ids) {
            await axios.post(`${KALEIDO_API_URL}/invoke`, {
                chaincode: "activityContract",
                method: "deleteActivity",
                args: [id]
            }, KALEIDO_AUTH);
        }

        res.json({ status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Modify an activity
router.put("/activities/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, due_date } = req.body;

        const response = await axios.post(`${KALEIDO_API_URL}/invoke`, {
            chaincode: "activityContract",
            method: "updateActivity",
            args: [id, name, description, due_date]
        }, KALEIDO_AUTH);

        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Manage grade for an activity
router.post("/activities/:id/grades", async (req, res) => {
    try {
        const { student_id, grade } = req.body;
        const { id: activity_id } = req.params;

        const response = await axios.post(`${KALEIDO_API_URL}/invoke`, {
            chaincode: "gradeContract",
            method: "assignGradeToActivity",
            args: [student_id, activity_id, grade]
        }, KALEIDO_AUTH);

        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
