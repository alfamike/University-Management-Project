const express = require('express');
const router = express.Router();
const fabConnectService = require('../kaleido/fabConnectService');

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

        res.redirect('/titles');
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

// Get a single title
router.get("/titles/:id", async (req, res) => {
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
            "func": "getTitle",
            "args": [
                id
            ],
            "init": false
        }

        const response = await fabConnectService.submitTransaction(transactionData);

        res.json(response.data);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

// Get all titles
router.get("/titles", async (req, res) => {
    try {
        // Query Kaleido for all titles
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
        const page = parseInt(req.query.page) || 1; // Default to page 1
        const pageSize = 10; // Titles per page
        const totalTitles = titles.length;
        const totalPages = Math.ceil(totalTitles / pageSize);

        // Slice titles for current page
        const paginatedTitles = titles.slice((page - 1) * pageSize, page * pageSize);

        // AJAX check (for partial updates, if needed)
        const isAjax = req.headers['x-requested-with'] === 'XMLHttpRequest';

        if (isAjax) {
            return res.json({
                titles: paginatedTitles,
                has_next: page < totalPages,
                next_page: page < totalPages ? page + 1 : null,
                has_previous: page > 1,
                previous_page: page > 1 ? page - 1 : null,
                current_page: page,
                total_pages: totalPages,
            });
        }

        // Render full page if not AJAX
        res.render('titles/title_list', {
            page_title: 'Title List',
            titles: paginatedTitles,
            current_page: page,
            total_pages: totalPages,
            has_next: page < totalPages,
            has_previous: page > 1,
        });

    } catch (err) {
        console.error('Error fetching titles:', err.message);
        res.render('titles/title_list', { page_title: 'Title List', titles: [] });
    }
});


// Update a title
router.put("/titles/:id", async (req, res) => {
    let transactionData;
    try {
        const { name, description } = req.body;
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
                id, name, description
            ],
            "init": false
        }

        const response = await fabConnectService.submitTransaction(transactionData);

        res.json(response.data);
    } catch (err) {
        res.status(500).json({ error: err.message });
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

        res.json(response.data);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

module.exports = router;
