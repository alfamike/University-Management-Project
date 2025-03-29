const express = require("express");
const router = express.Router();
const fabConnectService = require("../kaleido/fabConnectService");
const paginate = require("pagination");

/**
 * Render the create course page.
 * @route GET /courses/create
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.get('/courses/create', async (req, res) => {
    try {
        const queryData = {
            headers: {
                signer: req.session.user?.username,
                channel: process.env.KALEIDO_CHANNEL_NAME,
                chaincode: "title_contract"
            },
            func: "getAllTitles",
            args: [],
            strongread: true
        };

        const response = await fabConnectService.queryChaincode(queryData);
        const titles = response?.result ?? [];
        res.render('courses/create_course', {page_title: 'Create Course', titles: titles});
    } catch (err) {
        console.error('Error fetching titles:', err.message);
        res.status(500).send('Error fetching titles');
    }
});

/**
 * Create a new course.
 * @route POST /courses
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.post("/courses", async (req, res) => {
    try {
        const {title_id, course_name, course_description, course_start_date, course_end_date} = req.body;
        const transactionData = {
            headers: {
                type: "SendTransaction",
                signer: req.session.user.username,
                channel: process.env.KALEIDO_CHANNEL_NAME,
                chaincode: "course_contract"
            },
            func: "createCourse",
            args: [course_name, course_description, course_start_date, course_end_date, title_id],
            init: false
        };

        await fabConnectService.submitTransaction(transactionData);
        res.redirect('/courses');
    } catch (err) {
        console.error('Error creating course:', err.message);
        res.status(500).send('Error creating course');
    }
});

/**
 * Get a specific course.
 * @route GET /courses/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.get("/courses/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const queryDataCourse = {
            headers: {
                signer: req.session.user.username,
                channel: process.env.KALEIDO_CHANNEL_NAME,
                chaincode: "course_contract"
            },
            func: "getCourse",
            args: [id],
            strongread: true
        };

        const responseCourse = await fabConnectService.queryChaincode(queryDataCourse);

        const queryDataActivities = {
            headers: {
                signer: req.session.user.username,
                channel: process.env.KALEIDO_CHANNEL_NAME,
                chaincode: "activity_contract"
            },
            func: "getActivitiesByCourse",
            args: [id],
            strongread: true
        };

        const responseActivities = await fabConnectService.queryChaincode(queryDataActivities);

        res.render('courses/course_record', {
            page_title: 'Course',
            course: responseCourse?.result ?? [],
            activities: responseActivities?.result ?? [],
        });
    } catch (err) {
        console.error('Error fetching course:', err.message);
        res.status(500).send('Error fetching course');
    }
});

/**
 * Get all courses with optional filters.
 * @route GET /courses
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.get("/courses", async (req, res) => {
    try {
        let page = parseInt(req.query.page, 10) || 1;
        const {title, year, onlyFilter} = req.query;
        const isAjax = req.headers['x-requested-with'] === 'XMLHttpRequest';
        const isFilter = onlyFilter === 'true';

        const queryDataCourses = {
            headers: {
                signer: req.session.user?.username,
                channel: process.env.KALEIDO_CHANNEL_NAME,
                chaincode: "course_contract"
            },
            func: title || year ? "getCoursesByTitleYear" : "getAllCourses",
            args: title || year ? [title, year] : [],
            strongread: true
        };

        const responseCourse = await fabConnectService.queryChaincode(queryDataCourses);
        const courses = responseCourse?.result ?? [];

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

        // Pagination setup
        const pageSize = 10;
        const totalCourses = courses.length;
        const totalPages = Math.ceil(totalCourses / pageSize);

        page = Math.max(1, Math.min(page, totalPages));

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
            if (isFilter) {
                return res.json({courses: courses});
            } else {
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
        res.status(500).send('Error fetching courses');
    }
});

/**
 * Update a course.
 * @route PUT /courses/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.put("/courses/:id", async (req, res) => {
    try {
        const {course_name, course_description, course_start_date, course_end_date} = req.body;
        const {id} = req.params;
        const transactionData = {
            headers: {
                type: "SendTransaction",
                signer: req.session.user.username,
                channel: process.env.KALEIDO_CHANNEL_NAME,
                chaincode: "course_contract"
            },
            func: "updateCourse",
            args: [id, course_name, course_description, course_start_date, course_end_date],
            init: false
        };

        const response = await fabConnectService.submitTransaction(transactionData);
        res.json(response);
    } catch (err) {
        console.error('Error updating course:', err.message);
        res.status(500).send('Error updating course');
    }
});

/**
 * Delete a course and associated data.
 * @route DELETE /courses/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.delete("/courses/:id", async (req, res) => {
    try {
        const {id} = req.params;

        // Delete associated activities
        const queryDataActivities = {
            headers: {
                signer: req.session.user.username,
                channel: process.env.KALEIDO_CHANNEL_NAME,
                chaincode: "activity_contract"
            },
            func: "getActivitiesByCourse",
            args: [id],
            strongread: true
        };
        const responseActivities = await fabConnectService.queryChaincode(queryDataActivities);
        const activities = responseActivities?.result ?? [];

        for (const activity of activities) {
            const activityId = activity.id;

            // Delete associated activity grades
            const transactionDataGrades = {
                headers: {
                    type: "SendTransaction",
                    signer: req.session.user.username,
                    channel: process.env.KALEIDO_CHANNEL_NAME,
                    chaincode: "activitygrade_contract"
                },
                func: "deleteActivityGradesByActivity",
                args: [activityId],
                init: false
            };
            await fabConnectService.submitTransaction(transactionDataGrades);

            // Delete activity
            const transactionDataActivity = {
                headers: {
                    type: "SendTransaction",
                    signer: req.session.user.username,
                    channel: process.env.KALEIDO_CHANNEL_NAME,
                    chaincode: "activity_contract"
                },
                func: "deleteActivity",
                args: [activityId],
                init: false
            };
            await fabConnectService.submitTransaction(transactionDataActivity);
        }

        // Delete associated enrollments
        const transactionDataEnrollments = {
            headers: {
                type: "SendTransaction",
                signer: req.session.user.username,
                channel: process.env.KALEIDO_CHANNEL_NAME,
                chaincode: "enrollment_contract"
            },
            func: "deleteEnrollmentsByCourse",
            args: [id],
            init: false
        };
        await fabConnectService.submitTransaction(transactionDataEnrollments);

        // Delete course
        const transactionDataCourse = {
            headers: {
                type: "SendTransaction",
                signer: req.session.user.username,
                channel: process.env.KALEIDO_CHANNEL_NAME,
                chaincode: "course_contract"
            },
            func: "deleteCourse",
            args: [id],
            init: false
        };
        await fabConnectService.submitTransaction(transactionDataCourse);

        res.json({sent: true, message: 'Course and associated data deleted successfully'});
    } catch (err) {
        console.error('Error deleting course and associated data:', err.message);
        res.status(500).send('Error deleting course and associated data');
    }
});

module.exports = router;