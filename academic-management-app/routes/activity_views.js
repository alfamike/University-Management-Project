const express = require("express");
const router = express.Router();
const fabConnectService = require("../kaleido/fabConnectService");

// Create an activity
router.post("/activities", async (req, res) => {
    try {
        const { course_id, activity_name, activity_description, activity_due_date } = req.body;
        const transactionData = {
            headers: {
                type: "SendTransaction",
                signer: req.session.user.username,
                channel: process.env.KALEIDO_CHANNEL_NAME,
                chaincode: "activity_contract"
            },
            func: "createActivity",
            args: [course_id, activity_name, activity_description, activity_due_date],
            init: false
        };

        const response = await fabConnectService.submitTransaction(transactionData);

        const transactionDataStudentsByCourse = {
            headers: {
                signer: req.session.user.username,
                channel: process.env.KALEIDO_CHANNEL_NAME,
                chaincode: "enrollment_contract"
            },
            func: "getEnrollmentsByCourse",
            args: [course_id],
            init: false
        };

        const responseStudents = await fabConnectService.queryChaincode(transactionDataStudentsByCourse);

        for (const enrollment of responseStudents.result) {
            const transactionDataGrade = {
                headers: {
                    type: "SendTransaction",
                    signer: req.session.user.username,
                    channel: process.env.KALEIDO_CHANNEL_NAME,
                    chaincode: "activitygrade_contract"
                },
                func: "createActivityGrade",
                args: [response.id, enrollment.student],
                init: false
            };

            await fabConnectService.submitTransaction(transactionDataGrade);
        }

        res.json(response);
    } catch (err) {
        console.error('Error creating activity:', err.message);
        res.status(500).send('Error creating activity');
    }
});

// Remove activity and associated data
router.delete("/activities/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Delete associated activity grades
        const transactionDataGrades = {
            headers: {
                type: "SendTransaction",
                signer: req.session.user.username,
                channel: process.env.KALEIDO_CHANNEL_NAME,
                chaincode: "activitygrade_contract"
            },
            func: "deleteActivityGradesByActivity",
            args: [id],
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
            args: [id],
            init: false
        };
        await fabConnectService.submitTransaction(transactionDataActivity);

        res.json({ sent: true, message: 'Activity and associated data deleted successfully' });
    } catch (err) {
        console.error('Error deleting activity and associated data:', err.message);
        res.status(500).send('Error deleting activity and associated data');
    }
});

// Modify an activity
router.put("/activities/:id", async (req, res) => {
    try {
        const { courseId, activityName, activityDescription, activityDueDate } = req.body;
        const { id } = req.params;
        const transactionData = {
            headers: {
                type: "SendTransaction",
                signer: req.session.user.username,
                channel: process.env.KALEIDO_CHANNEL_NAME,
                chaincode: "activity_contract"
            },
            func: "updateActivity",
            args: [id, courseId, activityName, activityDescription, activityDueDate],
            init: false
        };

        const response = await fabConnectService.submitTransaction(transactionData);
        res.json(response);
    } catch (err) {
        console.error('Error updating activity:', err.message);
        res.status(500).send('Error updating activity');
    }
});

// Get activities by course and student
router.get("/activities/byCourseStudent", async (req, res) => {
    try {
        const { courseId, studentId } = req.query;
        const transactionActivityData = {
            headers: {
                signer: req.session.user.username,
                channel: process.env.KALEIDO_CHANNEL_NAME,
                chaincode: "activity_contract"
            },
            func: "getActivitiesByCourse",
            args: [courseId],
            init: false
        };

        const responseActivities = await fabConnectService.queryChaincode(transactionActivityData);

        const activities = await Promise.all(responseActivities.result.map(async (activity) => {
            const transactionActivityGradeData = {
                headers: {
                    signer: req.session.user.username,
                    channel: process.env.KALEIDO_CHANNEL_NAME,
                    chaincode: "activitygrade_contract"
                },
                func: "getActivityGradesByActivityStudent",
                args: [activity.id, studentId],
                init: false
            };

            const responseActivityGrade = await fabConnectService.queryChaincode(transactionActivityGradeData);
            return { ...activity, grade: responseActivityGrade?.result.grade };
        }));

        if (activities.length > 0) {
            res.json({ sent: true, activities });
        } else {
            res.json({ sent: false, message: "No activities found" });
        }
    } catch (err) {
        console.error('Error getting activities by course:', err.message);
        res.status(500).send('Error getting activities by course');
    }
});

// Update activity grade
router.put('/activities/:id/grade', async (req, res) => {
    try {
        const { id } = req.params;
        const { student_id, grade } = req.body;

        const transactionGetData = {
            headers: {
                type: "SendTransaction",
                signer: req.session.user.username,
                channel: process.env.KALEIDO_CHANNEL_NAME,
                chaincode: "activitygrade_contract"
            },
            func: "getActivityGradesByActivityStudent",
            args: [id, student_id],
            init: false
        };

        const responseGet = await fabConnectService.queryChaincode(transactionGetData);

        const transactionData = {
            headers: {
                type: "SendTransaction",
                signer: req.session.user.username,
                channel: process.env.KALEIDO_CHANNEL_NAME,
                chaincode: "activitygrade_contract"
            },
            func: "updateActivityGrade",
            args: [responseGet.result.id, id, student_id, grade],
            init: false
        };

        const response = await fabConnectService.submitTransaction(transactionData);
        res.json(response);
    } catch (err) {
        console.error('Error updating grade:', err.message);
        res.status(500).send('Error updating grade');
    }
});

module.exports = router;