const express = require('express');
const router = express.Router();
const axios = require("axios");
const fabConnectService = require("../kaleido/fabConnectService");
const paginate = require("pagination");

router.get('/students/create', (req, res) => {
    res.render('students/create_student', { page_title: 'Create Student' });
});

// Create a student
router.post("/students", async (req, res) => {
    let transactionData;
    try {
        const { student_first_name, student_last_name, student_email } = req.body;
        transactionData = {
            "headers": {
                "type": "SendTransaction",
                "signer": req.session.user.username,
                "channel": process.env.KALEIDO_CHANNEL_NAME,
                "chaincode": "student_contract"
            },
            "func": "createStudent",
            "args": [student_first_name, student_last_name, student_email],
            "init": false
        }
        const response = await fabConnectService.submitTransaction(transactionData);

        res.redirect('/students');
    } catch (err) {
        console.error('Error creating student:', err.message);
        res.redirect('/students');
    }
});

// Get a specific student
router.get("/students/:id", async (req, res) => {
    let queryDataStudent;
    try {
        const {id} = req.params;
        queryDataStudent = {
            "headers": {
                "signer": req.session.user.username,
                "channel": process.env.KALEIDO_CHANNEL_NAME,
                "chaincode": "student_contract"
            },
            "func": "getStudent",
            "args": [
                id
            ],
            "strongread": true
        }

        const responseStudent = await fabConnectService.queryChaincode(queryDataStudent);

        let queryDataCoursesGrades;
        queryDataCoursesGrades = {
            "headers": {
                "signer": req.session.user.username,
                "channel": process.env.KALEIDO_CHANNEL_NAME,
                "chaincode": "enrollment_contract"
            },
            "func": "getEnrollmentsByStudent",
            "args": [id],
            "strongread": true
        }

        const responseCoursesGrades = await fabConnectService.queryChaincode(queryDataCoursesGrades);

        let courses = [];
        for (let course of responseCoursesGrades.result) {
            let queryDataCourse;
            queryDataCourse = {
                "headers": {
                    "signer": req.session.user.username,
                    "channel": process.env.KALEIDO_CHANNEL_NAME,
                    "chaincode": "course_contract"
                },
                "func": "getCourse",
                "args": [course.course],
                "strongread": true
            }

            const responseCourse = await fabConnectService.queryChaincode(queryDataCourse);
            courses.push(responseCourse.result);
        }

        res.render('students/student_record', {
            page_title: 'Student',
            student: responseStudent?.result ?? [],
            courses: courses ?? [],
            courses_grades: responseCoursesGrades?.result ?? [],
        });
    } catch (err) {
        console.error('Error fetching course:', err.message);
        res.redirect('/courses');
    }
});

// Get all students with optional filters
router.get("/students", async (req, res) => {
    try {
        let students;
        // AJAX check
        const isAjax = req.headers['x-requested-with'] === 'XMLHttpRequest';
        if (isAjax) {
            const { page, title, course } = req.query;
            const queryDataStudentsWithFilters = {
                "headers": {
                    "signer": req.session.user?.username,
                    "channel": process.env.KALEIDO_CHANNEL_NAME,
                    "chaincode": "student_contract"
                },
                "func": "getStudentsByTitle",
                "args": [title],
                "strongread": true
            };

            const responseStudents = await fabConnectService.queryChaincode(queryDataStudentsWithFilters);
            students = responseStudents?.result ?? [];

        } else{
            const queryDataStudents = {
                "headers": {
                    "signer": req.session.user?.username,
                    "channel": process.env.KALEIDO_CHANNEL_NAME,
                    "chaincode": "student_contract"
                },
                "func": "getAllStudents",
                "args": [],
                "strongread": true
            };

            const responseStudents = await fabConnectService.queryChaincode(queryDataStudents);
            students = responseStudents?.result ?? [];
        }

        const queryDataTitles = {
            "headers": {
                "signer": req.session.user?.username,
                "channel": process.env.KALEIDO_CHANNEL_NAME,
                "chaincode": "title_contract"
            },
            "func": "getAllTitles",
            "args": [],
            "strongread": true
        };

        const responseTitle = await fabConnectService.queryChaincode(queryDataTitles);
        const titles = responseTitle?.result ?? [];

        // Pagination setup
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const pageSize = 10;
        const totalStudents = students.length;
        const totalPages = Math.ceil(totalStudents / pageSize);

        // Use pagination library
        const paginator = new paginate.SearchPaginator({
            prelink: '/students',
            current: page,
            rowsPerPage: pageSize,
            totalResult: totalStudents
        });

        const fromIndex = (page - 1) * pageSize;
        const toIndex = Math.min(fromIndex + pageSize, totalStudents);

        const paginatedStudents = students.slice(fromIndex, toIndex);


        if (isAjax) {
            return res.json({
                students: paginatedStudents,
                pagination: {
                    current_page: page,
                    total_pages: totalPages,
                    has_next: page < totalPages,
                    next_page: page < totalPages ? page + 1 : null,
                    has_previous: page > 1,
                    previous_page: page > 1 ? page - 1 : null
                }
            });
        }

        // Render page
        res.render('students/student_list', {
            page_title: 'Student List',
            titles: titles,
            students: paginatedStudents,
            pagination: {
                current_page: page,
                total_pages: totalPages,
                has_next: page < totalPages,
                next_page: page < totalPages ? page + 1 : null,
                has_previous: page > 1,
                previous_page: page > 1 ? page - 1 : null
            }
        });

    } catch (err) {
        console.error('Error fetching students:', err.message);
        res.render('students/student_list', { page_title: 'Student List', courses: [] });
    }
});

// Update student details
router.put("/students/:id", async (req, res) => {
    let transactionData;
    try {
        const { first_name, last_name, email } = req.body;
        const { id } = req.params;
        transactionData = {
            "headers": {
                "type": "SendTransaction",
                "signer": req.session.user.username,
                "channel": process.env.KALEIDO_CHANNEL_NAME,
                "chaincode": "student_contract"
            },
            "func": "updateStudent",
            "args": [
                id, first_name, last_name, email
            ],
            "init": false
        }

        const response = await fabConnectService.submitTransaction(transactionData);
        res.json(response);
    } catch (err) {
        console.error('Error updating student:', err.message);
    }
});

// Delete a student
router.delete("/students/:id", async (req, res) => {
    let transactionData;
    try {
        const {id} = req.params;
        transactionData = {
            "headers": {
                "type": "SendTransaction",
                "signer": req.session.user.username,
                "channel": process.env.KALEIDO_CHANNEL_NAME,
                "chaincode": "student_contract"
            },
            "func": "deleteStudent",
            "args": [
                id
            ],
            "init": false
        }

        const response = await fabConnectService.submitTransaction(transactionData);
        res.json(response);
    } catch (err) {
        console.error('Error deleting student:', err.message);
    }
});

// Enroll student in course
router.post("/students/:id/enroll", async (req, res) => {
    let transactionData;
    try {
        const { id } = req.params;
        const { course_id } = req.body;

        transactionData = {
            "headers": {
                "type": "SendTransaction",
                "signer": req.session.user.username,
                "channel": process.env.KALEIDO_CHANNEL_NAME,
                "chaincode": "enrollment_contract"
            },
            "func": "createEnrollment",
            "args": [
                id, course_id
            ],
            "init": false
        }

        const response = await fabConnectService.submitTransaction(transactionData);
        res.json(response);
    } catch (err) {
        console.error('Error enrolling student:', err.message);
    }
});

// De-enroll student from course
router.post("/students/:id/deenroll", async (req, res) => {
    let transactionData;
    try {
        const { id } = req.params;
        const { course_id } = req.body;

        transactionData = {
            "headers": {
                "type": "SendTransaction",
                "signer": req.session.user.username,
                "channel": process.env.KALEIDO_CHANNEL_NAME,
                "chaincode": "enrollment_contract"
            },
            "func": "deleteEnrollmentByStudentCourse",
            "args": [
                id, course_id
            ],
            "init": false
        }

        const response = await fabConnectService.submitTransaction(transactionData);
        res.json(response);
    } catch (err) {
        console.error('Error de-enrolling student:', err.message);
    }
});

module.exports = router;
