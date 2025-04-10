const express = require('express');
const router = express.Router();
const fabConnectService = require("../kaleido/fabConnectService");
const paginate = require("pagination");

/**
 * Render the create student page.
 * @route GET /students/create
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.get('/students/create', (req, res) => {
    res.render('students/create_student', {page_title: 'Create Student'});
});

/**
 * Create a new student.
 * @route POST /students
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.post("/students", async (req, res) => {
    let transactionData;
    try {
        const {student_first_name, student_last_name, student_email} = req.body;
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
        res.status(500).send('Error creating student');
    }
});

/**
 * Get a specific student.
 * @route GET /students/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
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

        const courses = await Promise.all(responseCoursesGrades.result.map(async (enrollment) => {
            const queryDataCourse = {
                headers: {
                    signer: req.session.user.username,
                    channel: process.env.KALEIDO_CHANNEL_NAME,
                    chaincode: "course_contract"
                },
                func: "getCourse",
                args: [enrollment.course],
                strongread: true
            };
            const responseCourse = await fabConnectService.queryChaincode(queryDataCourse);

            return {...responseCourse.result, grade: enrollment.grade, enrollment: enrollment.id};
        }));

        res.render('students/student_record', {
            page_title: 'Student',
            student: responseStudent?.result ?? [],
            courses: courses ?? [],
        });
    } catch (err) {
        console.error('Error fetching student:', err.message);
        res.status(500).send('Error fetching student');
    }
});

/**
 * Get all students with optional filters.
 * @route GET /students
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.get("/students", async (req, res) => {
    try {
        let page = parseInt(req.query.page, 10) || 1;
        const {course} = req.query;
        const isAjax = req.headers['x-requested-with'] === 'XMLHttpRequest';
        let responseStudents;
        let students = [];

        if (course) {
            const queryEnrollments = {
                headers: {
                    signer: req.session.user?.username,
                    channel: process.env.KALEIDO_CHANNEL_NAME,
                    chaincode: "enrollment_contract"
                },
                func: "getEnrollmentsByCourse",
                args: [course],
                strongread: true
            };

            const responseEnrollments = await fabConnectService.queryChaincode(queryEnrollments);

            for (const enrollment of responseEnrollments?.result) {
                const queryStudent = {
                    headers: {
                        signer: req.session.user?.username,
                        channel: process.env.KALEIDO_CHANNEL_NAME,
                        chaincode: "student_contract"
                    },
                    func: "getStudent",
                    args: [enrollment.student],
                    strongread: true
                };
                const responseStudent = await fabConnectService.queryChaincode(queryStudent);
                students.push(responseStudent?.result);
            }

        } else {
            const queryDataStudents = {
                headers: {
                    signer: req.session.user?.username,
                    channel: process.env.KALEIDO_CHANNEL_NAME,
                    chaincode: "student_contract"
                },
                func: "getAllStudents",
                args: [],
                strongread: true
            };
            responseStudents = await fabConnectService.queryChaincode(queryDataStudents);

            students = responseStudents?.result ?? [];
        }

        const queryDataTitles = {
            headers: {
                signer: req.session.user?.username,
                channel: process.env.KALEIDO_CHANNEL_NAME,
                chaincode: "title_contract"
            },
            func: "getAllTitles",
            args: [],
            strongread: true
        };
        const responseTitle = await fabConnectService.queryChaincode(queryDataTitles);
        const titles = responseTitle?.result ?? [];

        const pageSize = 10;
        const totalStudents = students.length;
        const totalPages = Math.ceil(totalStudents / pageSize);
        page = Math.max(1, Math.min(page, totalPages));

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
        res.status(500).send('Error fetching students');
    }
});

/**
 * Update student details.
 * @route PUT /students/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.put("/students/:id", async (req, res) => {
    let transactionData;
    try {
        const {first_name, last_name, email} = req.body;
        const {id} = req.params;
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
        res.status(500).send('Error updating student');
    }
});

/**
 * Delete a student and associated data.
 * @route DELETE /students/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.delete("/students/:id", async (req, res) => {
    try {
        const {id} = req.params;

        // Delete associated enrollments
        const queryDataEnrollments = {
            headers: {
                signer: req.session.user.username,
                channel: process.env.KALEIDO_CHANNEL_NAME,
                chaincode: "enrollment_contract"
            },
            func: "getEnrollmentsByStudent",
            args: [id],
            strongread: true
        };
        const responseEnrollments = await fabConnectService.queryChaincode(queryDataEnrollments);
        const enrollments = responseEnrollments?.result ?? [];

        for (const enrollment of enrollments) {
            const courseId = enrollment.course;

            // Delete associated activity grades
            const queryDataActivities = {
                headers: {
                    signer: req.session.user.username,
                    channel: process.env.KALEIDO_CHANNEL_NAME,
                    chaincode: "activity_contract"
                },
                func: "getActivitiesByCourse",
                args: [courseId],
                strongread: true
            };
            const responseActivities = await fabConnectService.queryChaincode(queryDataActivities);
            const activities = responseActivities?.result ?? [];

            for (const activity of activities) {
                const activityId = activity.id;

                const transactionDataGrade = {
                    headers: {
                        type: "SendTransaction",
                        signer: req.session.user.username,
                        channel: process.env.KALEIDO_CHANNEL_NAME,
                        chaincode: "activitygrade_contract"
                    },
                    func: "deleteActivityGradesByActivityStudent",
                    args: [activityId, id],
                    init: false
                };
                await fabConnectService.submitTransaction(transactionDataGrade);
            }

            // Delete enrollment
            const transactionDataEnrollment = {
                headers: {
                    type: "SendTransaction",
                    signer: req.session.user.username,
                    channel: process.env.KALEIDO_CHANNEL_NAME,
                    chaincode: "enrollment_contract"
                },
                func: "deleteEnrollment",
                args: [enrollment.id],
                init: false
            };
            await fabConnectService.submitTransaction(transactionDataEnrollment);
        }

        // Delete student
        const transactionDataStudent = {
            headers: {
                type: "SendTransaction",
                signer: req.session.user.username,
                channel: process.env.KALEIDO_CHANNEL_NAME,
                chaincode: "student_contract"
            },
            func: "deleteStudent",
            args: [id],
            init: false
        };
        await fabConnectService.submitTransaction(transactionDataStudent);

        res.json({sent: true, message: 'Student and associated data deleted successfully'});
    } catch (err) {
        console.error('Error deleting student and associated data:', err.message);
        res.status(500).send('Error deleting student and associated data');
    }
});

/**
 * Enroll student in course.
 * @route POST /students/:id/enroll
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.post("/students/:id/enroll", async (req, res) => {
    try {
        const {id} = req.params;
        const {course_id} = req.body;

        const transactionData = {
            headers: {
                type: "SendTransaction",
                signer: req.session.user.username,
                channel: process.env.KALEIDO_CHANNEL_NAME,
                chaincode: "enrollment_contract"
            },
            func: "createEnrollment",
            args: [id, course_id],
            init: false
        };
        await fabConnectService.submitTransaction(transactionData);

        const queryDataActivities = {
            headers: {
                signer: req.session.user.username,
                channel: process.env.KALEIDO_CHANNEL_NAME,
                chaincode: "activity_contract"
            },
            func: "getActivitiesByCourse",
            args: [course_id],
            strongread: true
        };
        const responseActivities = await fabConnectService.queryChaincode(queryDataActivities);

        for (const activity of responseActivities.result) {
            const transactionDataGrade = {
                headers: {
                    type: "SendTransaction",
                    signer: req.session.user.username,
                    channel: process.env.KALEIDO_CHANNEL_NAME,
                    chaincode: "activitygrade_contract"
                },
                func: "createActivityGrade",
                args: [activity.id, id],
                init: false
            };
            await fabConnectService.submitTransaction(transactionDataGrade);
        }
        res.json({sent: true, message: 'Student enrolled successfully'});
    } catch (err) {
        console.error('Error enrolling student:', err.message);
        res.status(500).send('Error enrolling student');
    }
});

/**
 * De-enroll student from course.
 * @route POST /students/:id/deenroll
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.post("/students/:id/deenroll", async (req, res) => {
    try {
        const {id} = req.params;
        const {course_id, enrollment_id} = req.body;

        const transactionData = {
            headers: {
                type: "SendTransaction",
                signer: req.session.user.username,
                channel: process.env.KALEIDO_CHANNEL_NAME,
                chaincode: "enrollment_contract"
            },
            func: "deleteEnrollment",
            args: [enrollment_id],
            init: false
        };
        await fabConnectService.submitTransaction(transactionData);

        const queryDataActivities = {
            headers: {
                signer: req.session.user.username,
                channel: process.env.KALEIDO_CHANNEL_NAME,
                chaincode: "activity_contract"
            },
            func: "getActivitiesByCourse",
            args: [course_id],
            strongread: true
        };
        const responseActivities = await fabConnectService.queryChaincode(queryDataActivities);

        for (const activity of responseActivities.result) {
            const transactionDataGrade = {
                headers: {
                    type: "SendTransaction",
                    signer: req.session.user.username,
                    channel: process.env.KALEIDO_CHANNEL_NAME,
                    chaincode: "activitygrade_contract"
                },
                func: "deleteActivityGradesByActivityStudent",
                args: [activity.id, id],
                init: false
            };
            await fabConnectService.submitTransaction(transactionDataGrade);
        }
        res.json({sent: true, message: 'Student de-enrolled successfully'});
    } catch (err) {
        console.error('Error de-enrolling student:', err.message);
        res.status(500).send('Error de-enrolling student');
    }
});

/**
 * Update student grade.
 * @route PUT /students/:id/grade
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.put('/students/:id/grade', async (req, res) => {
    try {
        const {id} = req.params;
        const {course_id, grade} = req.body;

        const queryDataEnrollment = {
            headers: {
                signer: req.session.user.username,
                channel: process.env.KALEIDO_CHANNEL_NAME,
                chaincode: "enrollment_contract"
            },
            func: "getEnrollmentByStudentCourse",
            args: [id, course_id],
            strongread: true
        };
        const responseEnrollment = await fabConnectService.queryChaincode(queryDataEnrollment);

        const transactionData = {
            headers: {
                type: "SendTransaction",
                signer: req.session.user.username,
                channel: process.env.KALEIDO_CHANNEL_NAME,
                chaincode: "enrollment_contract"
            },
            func: "updateEnrollment",
            args: [responseEnrollment.result.id, id, course_id, grade],
            init: false
        };
        const response = await fabConnectService.submitTransaction(transactionData);
        res.json({sent: true, message: 'Grade updated successfully'});
    } catch (err) {
        console.error('Error updating grade:', err.message);
        res.status(500).send('Error updating grade');
    }
});

module.exports = router;