"use strict";

const { Contract } = require("fabric-contract-api");
const ActivityGrade = require("./activity_grade");

class ActivityGradeContract extends Contract {
    async createActivityGrade(ctx, activity, student) {
        // Create a new ActivityGrade instance
        const activityGrade = new ActivityGrade(activity, student);

        // Check if the generated ID already exists (edge case)
        const exists = await this.activityGradeExists(ctx, activityGrade.id);
        if (exists) {
            throw new Error(`A collision occurred: ActivityGrade with ID ${activityGrade.id} already exists`);
        }

        // Save the activityGrade to the ledger
        await ctx.stub.putState(activityGrade.id, Buffer.from(JSON.stringify(activityGrade)));
        return JSON.stringify({ success: true, id: activityGrade.id, message: "ActivityGrade created successfully" });
    }

    async getActivityGrade(ctx, id) {
        const activityGradeData = await ctx.stub.getState(id);
        if (!activityGradeData || activityGradeData.length === 0) {
            throw new Error(`ActivityGrade with ID ${id} not found`);
        }

        // Parse the stored JSON data into an ActivityGrade object
        return activityGradeData.toString();
    }

    async getAllActivityGrades(ctx) {
        const query = { selector: { docType: "activity_grade", is_deleted: false } };
        const iterator = await ctx.stub.getQueryResult(JSON.stringify(query));

        const results = [];
        let result = await iterator.next();
        while (!result.done) {
            const jsonRes = JSON.parse(result.value.value.toString());
            results.push(jsonRes); // Push each result as an ActivityGrade object
            result = await iterator.next();
        }

        return JSON.stringify(results);
    }

    async updateActivityGrade(ctx, id, activity, student, grade) {
        const exists = await this.activityGradeExists(ctx, id);
        if (!exists) {
            throw new Error(`ActivityGrade with ID ${id} does not exist`);
        }

        // Generate an updated activityGrade instance
        const activityGradeData = await ctx.stub.getState(id);
        const activityGrade = JSON.parse(activityGradeData.toString());
        const updatedActivityGrade = new ActivityGrade(activity, student, grade, id, false);

        // Update the ledger with the new activityGrade
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(updatedActivityGrade)));
        return JSON.stringify({ success: true, message: "ActivityGrade updated successfully" });
    }

    async deleteActivityGrade(ctx, id) {
        const exists = await this.activityGradeExists(ctx, id);
        if (!exists) {
            throw new Error(`ActivityGrade with ID ${id} does not exist`);
        }

        // Generate an updated activityGrade instance
        const activityGradeData = await ctx.stub.getState(id);
        const activityGrade = JSON.parse(activityGradeData.toString());
        const updatedActivityGrade = new ActivityGrade(activityGrade.activity, activityGrade.student, activityGrade.grade, activityGrade.id, true);

        // Update the ledger with the new activityGrade
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(updatedActivityGrade)));
        return JSON.stringify({ success: true, message: "ActivityGrade deleted successfully" });
    }

    async activityGradeExists(ctx, id) {
        const activityGradeData = await ctx.stub.getState(id);
        return activityGradeData && activityGradeData.length > 0;
    }

    async getActivityGradesByActivityStudent(ctx, activity_id, student_id){
        const query = { selector: { docType: "activity_grade", activity: activity_id, student: student_id, is_deleted: false } };
        const iterator = await ctx.stub.getQueryResult(JSON.stringify(query));

        const results = [];
        let result = await iterator.next();
        while (!result.done) {
            const jsonRes = JSON.parse(result.value.value.toString());
            results.push(jsonRes); // Push each result as an ActivityGrade object
            result = await iterator.next();
        }

        return JSON.stringify(results);
    }

    async getActivityGradesByStudent(ctx, student_id){
        const query = { selector: { docType: "activity_grade", student: student_id, is_deleted: false } };
        const iterator = await ctx.stub.getQueryResult(JSON.stringify(query));

        const results = [];
        let result = await iterator.next();
        while (!result.done) {
            const jsonRes = JSON.parse(result.value.value.toString());
            results.push(jsonRes); // Push each result as an ActivityGrade object
            result = await iterator.next();
        }

        return JSON.stringify(results);
    }

    async deleteActivityGradesByActivity(ctx, activity_id){
        const query = { selector: { docType: "activity_grade", activity: activity_id, is_deleted: false } };
        const iterator = await ctx.stub.getQueryResult(JSON.stringify(query));

        let result = await iterator.next();
        while (!result.done) {
            const jsonRes = JSON.parse(result.value.value.toString());
            const updatedActivityGrade = new ActivityGrade(jsonRes.activity, jsonRes.student, jsonRes.grade, jsonRes.id, true);
            await ctx.stub.putState(jsonRes.id, Buffer.from(JSON.stringify(updatedActivityGrade)));
            result = await iterator.next();
        }

        return JSON.stringify({ success: true, message: "ActivityGrades deleted successfully" });
    }

    async deleteActivityGradesByActivityStudent(ctx, activity_id, student_id){
        const query = { selector: { docType: "activity_grade", activity: activity_id, student: student_id, is_deleted: false } };
        const iterator = await ctx.stub.getQueryResult(JSON.stringify(query));

        let result = await iterator.next();
        while (!result.done) {
            const jsonRes = JSON.parse(result.value.value.toString());
            const updatedActivityGrade = new ActivityGrade(jsonRes.activity, jsonRes.student, jsonRes.grade, jsonRes.id, true);
            await ctx.stub.putState(jsonRes.id, Buffer.from(JSON.stringify(updatedActivityGrade)));
            result = await iterator.next();
        }

        return JSON.stringify({ success: true, message: "ActivityGrades deleted successfully" });
    }
}

module.exports = ActivityGradeContract;