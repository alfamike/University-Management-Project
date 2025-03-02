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
    let queryData;
    try {
        queryData = {
            "headers": {
                "signer": req.session.user.username,
                "channel": process.env.KALEIDO_CHANNEL_NAME,
                "chaincode": "title_contract"
            },
            "func": "getAllTitles",
            "args": [],
            "strongread": true
        }
        const response = await fabConnectService.queryChaincode(queryData);
        console.log('Full response:', JSON.stringify(response, null, 2));
        const titles = response?.result ?? [];

        res.render('titles/title_list', { page_title: 'Title List', titles: titles });
    } catch (err) {
        res.render('titles/title_list', { page_title: 'Title List', titles: [] });
        console.error(err.message);
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
