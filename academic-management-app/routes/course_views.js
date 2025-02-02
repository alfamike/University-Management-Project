const express = require("express");
const router = express.Router();
const axios = require("axios");

const KALEIDO_API_URL = process.env.KALEIDO_API_URL;
const KALEIDO_AUTH = { auth: { username: process.env.KALEIDO_USERNAME, password: process.env.KALEIDO_PASSWORD } };

// Create a course
router.post("/courses", async (req, res) => {
    try {
        const { title, name, description = '', startdate, enddate } = req.body;
        const response = await axios.post(`${KALEIDO_API_URL}/invoke`, {
            chaincode: "courseContract",
            method: "createCourse",
            args: [title, name, description, startdate, enddate]
        }, KALEIDO_AUTH);

        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all courses with optional filters
router.get("/courses", async (req, res) => {
    try {
        const { title, year } = req.query;

        const response = await axios.post(`${KALEIDO_API_URL}/query`, {
            chaincode: "courseContract",
            method: "getAllCourses",
            args: []
        }, KALEIDO_AUTH);

        let courses = JSON.parse(response.data.result);

        // Apply filters if provided
        if (title) {
            courses = courses.filter(course => course.title === title);
        }
        if (year) {
            courses = courses.filter(course => new Date(course.start_date).getFullYear() === year);
        }

        res.json(courses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a specific course
router.get("/courses/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.post(`${KALEIDO_API_URL}/query`, {
            chaincode: "courseContract",
            method: "getCourse",
            args: [id]
        }, KALEIDO_AUTH);

        res.json(JSON.parse(response.data.result));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a course
router.put("/courses/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, start_date, end_date } = req.body;

        const response = await axios.post(`${KALEIDO_API_URL}/invoke`, {
            chaincode: "courseContract",
            method: "updateCourse",
            args: [id, name, description, start_date, end_date]
        }, KALEIDO_AUTH);

        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a course
router.delete("/courses/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.post(`${KALEIDO_API_URL}/invoke`, {
            chaincode: "courseContract",
            method: "deleteCourse",
            args: [id]
        }, KALEIDO_AUTH);

        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Assign a grade to a student in a course
router.post("/courses/:course_id/grades", async (req, res) => {
    try {
        const { course_id } = req.params;
        const { student_id, grade } = req.body;

        const response = await axios.post(`${KALEIDO_API_URL}/invoke`, {
            chaincode: "studentCourseContract",
            method: "assignGrade",
            args: [student_id, course_id, grade]
        }, KALEIDO_AUTH);

        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
