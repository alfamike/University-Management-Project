const express = require("express");
const router = express.Router();
const axios = require("axios");
const fabConnectService = require("../kaleido/fabConnectService");

// Create an activity
router.post("/activities", async (req, res) => {
    let transactionData;
    try {
        const { course_id, activity_name, activity_description, activity_due_date  } = req.body;
        transactionData = {
            "headers": {
                "type": "SendTransaction",
                "signer": req.session.user.username,
                "channel": process.env.KALEIDO_CHANNEL_NAME,
                "chaincode": "activity_contract"
            },
            "func": "createActivity",
            "args": [ course_id, activity_name, activity_description, activity_due_date ],
            "init": false
        }

        const response = await fabConnectService.submitTransaction(transactionData);
        res.json(response);
    } catch (err) {
        console.error('Error creating course:', err.message);
    }
});

// Remove activity
router.delete("/activities/:id", async (req, res) => {
    let transactionData;
    try {
        const {id} = req.params;
        transactionData = {
            "headers": {
                "type": "SendTransaction",
                "signer": req.session.user.username,
                "channel": process.env.KALEIDO_CHANNEL_NAME,
                "chaincode": "activity_contract"
            },
            "func": "deleteActivity",
            "args": [
                id
            ],
            "init": false
        }

        const response = await fabConnectService.submitTransaction(transactionData);
        res.json(response);
    } catch (err) {
        console.error('Error deleting activity:', err.message);
    }
});

// Modify an activity
router.put("/activities/:id", async (req, res) => {
    let transactionData;
    try {
        const { courseId, activityName, activityDescription, activityDueDate } = req.body;
        const { id } = req.params;
        transactionData = {
            "headers": {
                "type": "SendTransaction",
                "signer": req.session.user.username,
                "channel": process.env.KALEIDO_CHANNEL_NAME,
                "chaincode": "activity_contract"
            },
            "func": "updateActivity",
            "args": [
                id, courseId, activityName, activityDescription, activityDueDate
            ],
            "init": false
        }

        const response = await fabConnectService.submitTransaction(transactionData);
        res.json(response);
    } catch (err) {
        console.error('Error updating activity:', err.message);
    }
});

router.get("/activities/byCourse", async (req, res) => {
    let transactionData;
    try {
        const { courseId } = req.query;
        transactionData = {
            "headers": {
                "signer": req.session.user.username,
                "channel": process.env.KALEIDO_CHANNEL_NAME,
                "chaincode": "activity_contract"
            },
            "func": "getActivitiesByCourse",
            "args": [
                courseId
            ],
            "init": false
        }

        const response = await fabConnectService.queryChaincode(transactionData);
        res.json(response);
    } catch (err) {
        console.error('Error getting activities by course:', err.message);
    }
});

module.exports = router;
