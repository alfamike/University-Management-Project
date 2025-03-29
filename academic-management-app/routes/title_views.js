const express = require('express');
const router = express.Router();
const fabConnectService = require('../kaleido/fabConnectService');
const paginate = require('pagination');

/**
 * Render the create title page.
 * @route GET /titles/create
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.get('/titles/create', (req, res) => {
    res.render('titles/create_title', {page_title: 'Create Title'});
});

/**
 * Create a new title.
 * @route POST /titles
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.post("/titles", async (req, res) => {
    try {
        const {title_name, title_description} = req.body;
        const transactionData = {
            headers: {
                type: "SendTransaction",
                signer: req.session.user.username,
                channel: process.env.KALEIDO_CHANNEL_NAME,
                chaincode: "title_contract"
            },
            func: "createTitle",
            args: [title_name, title_description],
            init: false
        };
        await fabConnectService.submitTransaction(transactionData);
        res.redirect('/titles');
    } catch (err) {
        console.error('Error creating title:', err.message);
        res.status(500).send('Error creating title');
    }
});

/**
 * Get a single title.
 * @route GET /titles/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.get("/titles/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const queryDataTitle = {
            headers: {
                signer: req.session.user.username,
                channel: process.env.KALEIDO_CHANNEL_NAME,
                chaincode: "title_contract"
            },
            func: "getTitle",
            args: [id],
            strongread: true
        };
        const responseTitle = await fabConnectService.queryChaincode(queryDataTitle);

        const queryDataCourses = {
            headers: {
                signer: req.session.user.username,
                channel: process.env.KALEIDO_CHANNEL_NAME,
                chaincode: "course_contract"
            },
            func: "getCoursesByTitleYear",
            args: [id, ""],
            strongread: true
        };
        const responseCourses = await fabConnectService.queryChaincode(queryDataCourses);

        res.render('titles/title_record', {
            page_title: 'Title',
            title: responseTitle?.result ?? [],
            courses: responseCourses?.result ?? []
        });
    } catch (err) {
        console.error('Error fetching title:', err.message);
        res.status(500).send('Error fetching title');
    }
});

/**
 * Update a title.
 * @route PUT /titles/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.put("/titles/:id", async (req, res) => {
    try {
        const {title_name, title_description} = req.body;
        const {id} = req.params;
        const transactionData = {
            headers: {
                type: "SendTransaction",
                signer: req.session.user.username,
                channel: process.env.KALEIDO_CHANNEL_NAME,
                chaincode: "title_contract"
            },
            func: "updateTitle",
            args: [id, title_name, title_description],
            init: false
        };
        const response = await fabConnectService.submitTransaction(transactionData);
        res.json(response);
    } catch (err) {
        console.error('Error updating title:', err.message);
        res.status(500).send('Error updating title');
    }
});

/**
 * Delete a title and associated data.
 * @route DELETE /titles/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.delete("/titles/:id", async (req, res) => {
    try {
        const {id} = req.params;

        // Delete associated courses
        const queryDataCourses = {
            headers: {
                signer: req.session.user.username,
                channel: process.env.KALEIDO_CHANNEL_NAME,
                chaincode: "course_contract"
            },
            func: "getCoursesByTitleYear",
            args: [id, ""],
            strongread: true
        };
        const responseCourses = await fabConnectService.queryChaincode(queryDataCourses);
        const courses = responseCourses?.result ?? [];

        for (const course of courses) {
            const courseId = course.id;

            // Delete associated activities
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
                args: [courseId],
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
                args: [courseId],
                init: false
            };
            await fabConnectService.submitTransaction(transactionDataCourse);
        }

        // Delete title
        const transactionDataTitle = {
            headers: {
                type: "SendTransaction",
                signer: req.session.user.username,
                channel: process.env.KALEIDO_CHANNEL_NAME,
                chaincode: "title_contract"
            },
            func: "deleteTitle",
            args: [id],
            init: false
        };
        await fabConnectService.submitTransaction(transactionDataTitle);

        res.json({sent: true, message: 'Title and associated data deleted successfully'});
    } catch (err) {
        console.error('Error deleting title and associated data:', err.message);
        res.status(500).send('Error deleting title and associated data');
    }
});

/**
 * Get all titles with pagination.
 * @route GET /titles
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
router.get("/titles", async (req, res) => {
    try {
        let page = parseInt(req.query.page, 10) || 1;
        const {onlyFilter} = req.query;
        const isFilter = onlyFilter === 'true';

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

        // Pagination setup
        const pageSize = 10;
        const totalTitles = titles.length;
        const totalPages = Math.ceil(totalTitles / pageSize);

        page = Math.max(1, Math.min(page, totalPages));

        // Use pagination library
        const paginator = new paginate.SearchPaginator({
            prelink: '/titles',
            current: page,
            rowsPerPage: pageSize,
            totalResult: totalTitles
        });

        const fromIndex = (page - 1) * pageSize;
        const toIndex = Math.min(fromIndex + pageSize, totalTitles);
        const paginatedTitles = titles.slice(fromIndex, toIndex);

        // AJAX check
        const isAjax = req.headers['x-requested-with'] === 'XMLHttpRequest';

        if (isAjax) {
            if (isFilter) {
                return res.json({titles: titles});
            } else {
                return res.json({
                    titles: paginatedTitles,
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
        res.render('titles/title_list', {
            page_title: 'Title List',
            titles: paginatedTitles,
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
        console.error('Error fetching titles:', err.message);
        res.status(500).send('Error fetching titles');
    }
});

module.exports = router;