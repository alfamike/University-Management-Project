const express = require('express');
const router = express.Router();
const axios = require("axios");
const fabConnectService = require("../kaleido/fabConnectService");

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
    let queryData;
    try {
        queryData = {
            "headers": {
                "signer": req.session.user.username,
                "channel": process.env.KALEIDO_CHANNEL,
                "chaincode": "StudentContract"
            },
            "func": "getAllStudents",
            "args": [],
            "strongread": true
        }
        const response = await fabConnectService.queryChaincode(queryData);

        let students;
        try {
            students = JSON.parse(response.data.result);
        } catch (parseError) {
            console.error('Error parsing response data:', parseError.message);
            students = [];
        }

        res.render('students/student_list', { page_title: 'Students List', students: students });
    } catch (err) {
        res.render('students/student_list', { page_title: 'Students List', students: [] });
        console.error(err.message);
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
