const express = require("express");
const router = express.Router();
const axios = require("axios");
const fabConnectService = require("../kaleido/fabConnectService");
const paginate = require("pagination");

router.get('/courses/create', async(req, res) => {
    try {
        const queryData = {
            "headers": {
                "signer": req.session.user?.username,
                "channel": process.env.KALEIDO_CHANNEL_NAME,
                "chaincode": "title_contract"
            },
            "func": "getAllTitles",
            "args": [],
            "strongread": true
        };

        const response = await fabConnectService.queryChaincode(queryData);
        const titles = response?.result ?? [];
        res.render('courses/create_course', { page_title: 'Create Course' , titles: titles});
    } catch (err) {
        console.error('Error fetching titles:', err.message);
        res.render('courses/create_course', { page_title: 'Create Course', titles: [] });
    }
});

// Create a new course
router.post("/courses", async (req, res) => {
    let transactionData;
    try {
        const { title_id, course_name, course_description, course_start_date, course_end_date } = req.body;
        transactionData = {
            "headers": {
                "type": "SendTransaction",
                "signer": req.session.user.username,
                "channel": process.env.KALEIDO_CHANNEL_NAME,
                "chaincode": "course_contract"
            },
            "func": "createCourse",
            "args": [course_name, course_description, course_start_date, course_end_date, title_id],
            "init": false
        }

        const response = await fabConnectService.submitTransaction(transactionData);

        res.redirect('/courses');
    } catch (err) {
        console.error('Error creating course:', err.message);
        res.redirect('/courses');
    }
});

// Get a specific course
router.get("/courses/:id", async (req, res) => {
    let queryDataCourse;
    try {
        const {id} = req.params;
        queryDataCourse = {
            "headers": {
                "type": "SendTransaction",
                "signer": req.session.user.username,
                "channel": process.env.KALEIDO_CHANNEL_NAME,
                "chaincode": "course_contract"
            },
            "func": "getCourse",
            "args": [
                id
            ],
            "strongread": true
        }

        const responseCourse = await fabConnectService.queryChaincode(queryDataCourse);

        let queryDataActivities;
        queryDataActivities = {
            "headers": {
                "type": "SendTransaction",
                "signer": req.session.user.username,
                "channel": process.env.KALEIDO_CHANNEL_NAME,
                "chaincode": "activity_contract"
            },
            "func": "getActivitiesByCourse",
            "args": [
                id
            ],
            "strongread": true
        }

        const responseActivities = await fabConnectService.queryChaincode(queryDataActivities);

        res.render('courses/course_record', {
            page_title: 'Course',
            course: responseCourse?.result ?? [],
            activities: responseActivities?.result ?? [],
        });
    } catch (err) {
        console.error('Error fetching course:', err.message);
        res.redirect('/courses');
    }
});


// Get all courses with optional filters
router.get("/courses", async (req, res) => {
    try {
        let courses;
        // AJAX check
        const isAjax = req.headers['x-requested-with'] === 'XMLHttpRequest';
        if (isAjax) {
            const { page, title, year } = req.query;
            const queryDataCoursesWithFilters = {
                "headers": {
                    "signer": req.session.user?.username,
                    "channel": process.env.KALEIDO_CHANNEL_NAME,
                    "chaincode": "course_contract"
                },
                "func": "getCoursesByTitleYear",
                "args": [title, year],
                "strongread": true
            };

            const responseCourse = await fabConnectService.queryChaincode(queryDataCoursesWithFilters);
            courses = responseCourse?.result ?? [];

        } else{
            const queryDataCourses = {
                "headers": {
                    "signer": req.session.user?.username,
                    "channel": process.env.KALEIDO_CHANNEL_NAME,
                    "chaincode": "course_contract"
                },
                "func": "getAllCourses",
                "args": [],
                "strongread": true
            };

            const responseCourse = await fabConnectService.queryChaincode(queryDataCourses);
            courses = responseCourse?.result ?? [];
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
        const totalCourses = courses.length;
        const totalPages = Math.ceil(totalCourses / pageSize);

        // Use pagination library
        const paginator = new paginate.SearchPaginator({
            prelink: '/courses',
            current: page,
            rowsPerPage: pageSize,
            totalResult: totalCourses
        });

        const fromIndex = (page - 1) * pageSize;
        const toIndex = Math.min(fromIndex + pageSize, totalCourses);

        const paginatedCourses = courses.slice(fromIndex, toIndex);

        const years = [...new Set(courses.map(course => new Date(course.start_date).getFullYear()))];

        if (isAjax) {
            return res.json({
                courses: paginatedCourses,
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
        res.render('courses/course_list', {
            page_title: 'Course List',
            titles: titles,
            courses: paginatedCourses,
            years: years,
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
        console.error('Error fetching courses:', err.message);
        res.render('courses/course_list', { page_title: 'Course List', courses: [] });
    }
});
// Update a course
router.put("/courses/:id", async (req, res) => {
    let transactionData;
    try {
        const { course_name, course_description, course_start_date, course_end_date } = req.body;
        const { id } = req.params;
        transactionData = {
            "headers": {
                "type": "SendTransaction",
                "signer": req.session.user.username,
                "channel": process.env.KALEIDO_CHANNEL_NAME,
                "chaincode": "course_contract"
            },
            "func": "updateCourse",
            "args": [
                id, course_name, course_description, course_start_date, course_end_date
            ],
            "init": false
        }

        const response = await fabConnectService.submitTransaction(transactionData);
        res.json(response);
    } catch (err) {
        console.error('Error updating course:', err.message);
    }
});

// Delete a course
router.delete("/courses/:id", async (req, res) => {
    let transactionData;
    try {
        const {id} = req.params;
        transactionData = {
            "headers": {
                "type": "SendTransaction",
                "signer": req.session.user.username,
                "channel": process.env.KALEIDO_CHANNEL_NAME,
                "chaincode": "course_contract"
            },
            "func": "deleteCourse",
            "args": [
                id
            ],
            "init": false
        }

        const response = await fabConnectService.submitTransaction(transactionData);
        res.json(response);
    } catch (err) {
        console.error('Error deleting course:', err.message);
    }
});

// Assign a grade to a student in a course
router.post("/courses/:id/grades", async (req, res) => {
    let transactionData;
    try {
        const { course_id } = req.params;
        const { student_id, grade } = req.body;

        transactionData = {
            "headers": {
                "type": "SendTransaction",
                "signer": req.session.user.username,
                "channel": process.env.KALEIDO_CHANNEL_NAME,
                "chaincode": "enrollment_contract"
            },
            "func": "assignGrade",
            "args": [student_id, course_id, grade],
            "init": false
        }

        const response = await fabConnectService.submitTransaction(transactionData);

        res.redirect('/courses/:id');
    } catch (err) {
        console.error('Error creating grade to student in course:', err.message);
        res.redirect('/courses/:id');
    }
});

module.exports = router;
