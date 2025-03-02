const express = require('express');
const router = express.Router();
const fabConnectService = require('../kaleido/fabConnectService');


// Create a new title
router.post("/titles", async (req, res) => {
    let transactionData;
    try {
        const {id, name, description} = req.body;

        transactionData = {
            "headers": {
                "type": "SendTransaction",
                "signer": req.session.user.username,
                "channel": process.env.KALEIDO_CHANNEL,
                "chaincode": "TitleContract"
            },
            "func": "createTitle",
            "args": [
                id, name, description
            ],
            "init": false
        }

        const response = await fabConnectService.submitTransaction(transactionData);

        res.json(response.data);
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
                "channel": process.env.KALEIDO_CHANNEL,
                "chaincode": "TitleContract"
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
                "channel": process.env.KALEIDO_CHANNEL,
                "chaincode": "TitleContract"
            },
            "func": "getAllTitles",
            "args": [],
            "strongread": true
        }
        const response = await fabConnectService.queryChaincode(queryData)

        res.render('titles/title_list', {title: 'Title List', titles: JSON.parse(response.data.result)});
    } catch (err) {
        res.render('titles/title_list', {title: 'Title List', titles:[]} );
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
                "channel": process.env.KALEIDO_CHANNEL,
                "chaincode": "TitleContract"
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
                "channel": process.env.KALEIDO_CHANNEL,
                "chaincode": "TitleContract"
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

router.get('/titles/create', (req, res, next) => {
    console.log('Create title route hit');
    res.render('titles/create_title', { title: 'Create Title' });
});

module.exports = router;
