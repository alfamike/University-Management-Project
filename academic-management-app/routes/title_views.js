const express = require('express');
const router = express.Router();
const fabConnectService = require('../kaleido/fabConnectService');
const paginate = require('pagination');

router.get('/titles/create', (req, res) => {
    res.render('titles/create_title', { page_title: 'Create Title' });
});

// Create a new title
router.post("/titles", async (req, res) => {
    let transactionData;
    try {
        const { title_name, title_description } = req.body;
        transactionData = {
            "headers": {
                "type": "SendTransaction",
                "signer": req.session.user.username,
                "channel": process.env.KALEIDO_CHANNEL_NAME,
                "chaincode": "title_contract"
            },
            "func": "createTitle",
            "args": [
                title_name, title_description
            ],
            "init": false
        }

        const response = await fabConnectService.submitTransaction(transactionData);

        res.redirect(`/titles/${response.result.id}`);
    } catch (err) {
        console.error('Error creating title:', err.message);
        res.redirect('/titles');
    }
});

// Get a single title
router.get("/titles/:id", async (req, res) => {
    let queryDataTitle;
    try {
        const {id} = req.params;
        queryDataTitle = {
            "headers": {
                "signer": req.session.user.username,
                "channel": process.env.KALEIDO_CHANNEL_NAME,
                "chaincode": "title_contract"
            },
            "func": "getTitle",
            "args": [
                id
            ],
            "strongread": true
        }

        const responseTitle = await fabConnectService.queryChaincode(queryDataTitle);

        let queryDataCourses;
        queryDataCourses = {
            "headers": {
                "type": "SendTransaction",
                "signer": req.session.user.username,
                "channel": process.env.KALEIDO_CHANNEL_NAME,
                "chaincode": "course_contract"
            },
            "func": "getCoursesByTitleYear",
            "args": [
                id, ""
            ],
            "strongread": true
        }
        const responseCourses = await fabConnectService.queryChaincode(queryDataCourses);

        res.render('titles/title_record', {
            page_title: 'Title',
            title: responseTitle?.result ?? [],
            courses: responseCourses?.result ?? []
        });
    } catch (err) {
        console.error('Error fetching title:', err.message);
        res.redirect('/titles');
    }
});

// Update a title
router.put("/titles/:id", async (req, res) => {
    let transactionData;
    try {
        const { title_name, title_description } = req.body;
        const { id } = req.params;
        transactionData = {
            "headers": {
                "type": "SendTransaction",
                "signer": req.session.user.username,
                "channel": process.env.KALEIDO_CHANNEL_NAME,
                "chaincode": "title_contract"
            },
            "func": "updateTitle",
            "args": [
                id, title_name, title_description
            ],
            "init": false
        }

        const response = await fabConnectService.submitTransaction(transactionData);
        res.json(response);
    } catch (err) {
        console.error('Error updating title:', err.message);
    }
});

// Delete a title
router.delete("/titles/:id", async (req, res) => {
    let transactionData;
    try {
        const {id} = req.params;
        transactionData = {
            "headers": {
                "type": "SendTransaction",
                "signer": req.session.user.username,
                "channel": process.env.KALEIDO_CHANNEL_NAME,
                "chaincode": "title_contract"
            },
            "func": "deleteTitle",
            "args": [
                id
            ],
            "init": false
        }

        const response = await fabConnectService.submitTransaction(transactionData);
        res.json(response);
    } catch (err) {
        console.error('Error deleting title:', err.message);
    }
});

// Get all titles
router.get("/titles", async (req, res) => {
    let isFilter = false;
    try {
        const { onlyFilter } = req.query;
        if (onlyFilter === 'true') {
            isFilter = true;
        }
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

        // Pagination setup
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const pageSize = 10;
        const totalTitles = titles.length;
        const totalPages = Math.ceil(totalTitles / pageSize);

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
                return res.json({ titles: titles });
            } else{
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
        res.render('titles/title_list', { page_title: 'Title List', titles: [] });
    }
});

module.exports = router;
