"use strict";

const { Contract } = require("fabric-contract-api");
const ActivityGrade = require("./activity_grade");

class ActivityGradeContract extends Contract {
    /**
     * Create a new ActivityGrade.
     * @param {Context} ctx - The transaction context.
     * @param {string} activity - The activity identifier.
     * @param {string} student - The student identifier.
     * @returns {Promise<string>} A JSON string representing the result of the creation.
     */
    async createActivityGrade(ctx, activity, student) {
        const activityGrade = new ActivityGrade(activity, student);
        const exists = await this.activityGradeExists(ctx, activityGrade.id);
        if (exists) {
            throw new Error(`A collision occurred: ActivityGrade with ID ${activityGrade.id} already exists`);
        }
        await ctx.stub.putState(activityGrade.id, Buffer.from(JSON.stringify(activityGrade)));
        return JSON.stringify({ success: true, id: activityGrade.id, message: "ActivityGrade created successfully" });
    }

    /**
     * Retrieve an ActivityGrade by ID.
     * @param {Context} ctx - The transaction context.
     * @param {string} id - The identifier of the ActivityGrade.
     * @returns {Promise<string>} A JSON string representing the ActivityGrade.
     */
    async getActivityGrade(ctx, id) {
        const activityGradeData = await ctx.stub.getState(id);
        if (!activityGradeData || activityGradeData.length === 0) {
            throw new Error(`ActivityGrade with ID ${id} not found`);
        }
        return activityGradeData.toString();
    }

    /**
     * Retrieve all ActivityGrades.
     * @param {Context} ctx - The transaction context.
     * @returns {Promise<string>} A JSON string representing the list of all ActivityGrades.
     */
    async getAllActivityGrades(ctx) {
        const query = { selector: { docType: "activity_grade", is_deleted: false } };
        const iterator = await ctx.stub.getQueryResult(JSON.stringify(query));
        const results = [];
        let result = await iterator.next();
        while (!result.done) {
            const jsonRes = JSON.parse(result.value.value.toString());
            results.push(jsonRes);
            result = await iterator.next();
        }
        return JSON.stringify(results);
    }

    /**
     * Update an existing ActivityGrade.
     * @param {Context} ctx - The transaction context.
     * @param {string} id - The identifier of the ActivityGrade.
     * @param {string} activity - The activity identifier.
     * @param {string} student - The student identifier.
     * @param {number} grade - The grade for the activity.
     * @returns {Promise<string>} A JSON string representing the result of the update.
     */
    async updateActivityGrade(ctx, id, activity, student, grade) {
        const exists = await this.activityGradeExists(ctx, id);
        if (!exists) {
            throw new Error(`ActivityGrade with ID ${id} does not exist`);
        }
        const activityGradeData = await ctx.stub.getState(id);
        const activityGrade = JSON.parse(activityGradeData.toString());
        const updatedActivityGrade = new ActivityGrade(activity, student, grade, id, false);
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(updatedActivityGrade)));
        return JSON.stringify({ success: true, message: "ActivityGrade updated successfully" });
    }

    /**
     * Delete an ActivityGrade by marking it as deleted.
     * @param {Context} ctx - The transaction context.
     * @param {string} id - The identifier of the ActivityGrade.
     * @returns {Promise<string>} A JSON string representing the result of the deletion.
     */
    async deleteActivityGrade(ctx, id) {
        const exists = await this.activityGradeExists(ctx, id);
        if (!exists) {
            throw new Error(`ActivityGrade with ID ${id} does not exist`);
        }
        const activityGradeData = await ctx.stub.getState(id);
        const activityGrade = JSON.parse(activityGradeData.toString());
        const updatedActivityGrade = new ActivityGrade(activityGrade.activity, activityGrade.student, activityGrade.grade, activityGrade.id, true);
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(updatedActivityGrade)));
        return JSON.stringify({ success: true, message: "ActivityGrade deleted successfully" });
    }

    /**
     * Check if an ActivityGrade exists.
     * @param {Context} ctx - The transaction context.
     * @param {string} id - The identifier of the ActivityGrade.
     * @returns {Promise<boolean>} True if the ActivityGrade exists, false otherwise.
     */
    async activityGradeExists(ctx, id) {
        const activityGradeData = await ctx.stub.getState(id);
        return activityGradeData && activityGradeData.length > 0;
    }

    /**
     * Retrieve all ActivityGrades for a specific activity and student.
     * @param {Context} ctx - The transaction context.
     * @param {string} activity_id - The identifier of the activity.
     * @param {string} student_id - The identifier of the student.
     * @returns {Promise<string>} A JSON string representing the list of ActivityGrades.
     */
    async getActivityGradesByActivityStudent(ctx, activity_id, student_id) {
        const query = { selector: { docType: "activity_grade", activity: activity_id, student: student_id, is_deleted: false } };
        const iterator = await ctx.stub.getQueryResult(JSON.stringify(query));
        const results = [];
        let result = await iterator.next();
        while (!result.done) {
            const jsonRes = JSON.parse(result.value.value.toString());
            results.push(jsonRes);
            result = await iterator.next();
        }
        return JSON.stringify(results);
    }

    /**
     * Retrieve all ActivityGrades for a specific student.
     * @param {Context} ctx - The transaction context.
     * @param {string} student_id - The identifier of the student.
     * @returns {Promise<string>} A JSON string representing the list of ActivityGrades.
     */
    async getActivityGradesByStudent(ctx, student_id) {
        const query = { selector: { docType: "activity_grade", student: student_id, is_deleted: false } };
        const iterator = await ctx.stub.getQueryResult(JSON.stringify(query));
        const results = [];
        let result = await iterator.next();
        while (!result.done) {
            const jsonRes = JSON.parse(result.value.value.toString());
            results.push(jsonRes);
            result = await iterator.next();
        }
        return JSON.stringify(results);
    }

    /**
     * Delete all ActivityGrades for a specific activity by marking them as deleted.
     * @param {Context} ctx - The transaction context.
     * @param {string} activity_id - The identifier of the activity.
     * @returns {Promise<string>} A JSON string representing the result of the deletion.
     */
    async deleteActivityGradesByActivity(ctx, activity_id) {
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

    /**
     * Delete all ActivityGrades for a specific activity and student by marking them as deleted.
     * @param {Context} ctx - The transaction context.
     * @param {string} activity_id - The identifier of the activity.
     * @param {string} student_id - The identifier of the student.
     * @returns {Promise<string>} A JSON string representing the result of the deletion.
     */
    async deleteActivityGradesByActivityStudent(ctx, activity_id, student_id) {
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