"use strict";

const { Contract } = require("fabric-contract-api");
const Activity = require("./activity");

class ActivityContract extends Contract {
    /**
     * Create a new activity.
     * @param {Context} ctx - The transaction context.
     * @param {string} course - The course associated with the activity.
     * @param {string} name - The name of the activity.
     * @param {string} description - The description of the activity.
     * @param {Date} due_date - The due date of the activity.
     * @returns {Promise<string>} A JSON string representing the result of the creation.
     */
    async createActivity(ctx, course, name, description, due_date) {
        // Create a new Activity instance
        const activity = new Activity(course, name, description, due_date);

        // Check if the generated ID already exists (edge case)
        const exists = await this.activityExists(ctx, activity.id);
        if (exists) {
            throw new Error(`A collision occurred: Activity with ID ${activity.id} already exists`);
        }

        // Save the activity to the ledger
        await ctx.stub.putState(activity.id, Buffer.from(JSON.stringify(activity)));
        return JSON.stringify({ success: true, id: activity.id, message: "Activity created successfully" });
    }

    /**
     * Retrieve an activity by its ID.
     * @param {Context} ctx - The transaction context.
     * @param {string} id - The ID of the activity to retrieve.
     * @returns {Promise<string>} A JSON string representing the activity.
     */
    async getActivity(ctx, id) {
        const activityData = await ctx.stub.getState(id);
        if (!activityData || activityData.length === 0) {
            throw new Error(`Activity with ID ${id} not found`);
        }

        // Parse the stored JSON data into an Activity object
        return activityData.toString();
    }

    /**
     * Retrieve all activities.
     * @param {Context} ctx - The transaction context.
     * @returns {Promise<string>} A JSON string representing the list of activities.
     */
    async getAllActivities(ctx) {
        const query = { selector: { docType: "activity", is_deleted: false } };
        const iterator = await ctx.stub.getQueryResult(JSON.stringify(query));

        const results = [];
        let result = await iterator.next();
        while (!result.done) {
            const jsonRes = JSON.parse(result.value.value.toString());
            results.push(jsonRes); // Push each result as an Activity object
            result = await iterator.next();
        }

        return JSON.stringify(results);
    }

    /**
     * Update an existing activity.
     * @param {Context} ctx - The transaction context.
     * @param {string} id - The ID of the activity to update.
     * @param {string} course - The updated course associated with the activity.
     * @param {string} name - The updated name of the activity.
     * @param {string} description - The updated description of the activity.
     * @param {Date} due_date - The updated due date of the activity.
     * @returns {Promise<string>} A JSON string representing the result of the update.
     */
    async updateActivity(ctx, id, course, name, description, due_date) {
        const exists = await this.activityExists(ctx, id);
        if (!exists) {
            throw new Error(`Activity with ID ${id} does not exist`);
        }

        // Generate an updated activity instance
        const activityData = await ctx.stub.getState(id);
        const activity = JSON.parse(activityData.toString());
        const updatedActivity = new Activity(course, name, description, due_date, id, false);

        // Update the ledger with the new activity
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(updatedActivity)));
        return JSON.stringify({ success: true, message: "Activity updated successfully" });
    }

    /**
     * Mark an activity as deleted.
     * @param {Context} ctx - The transaction context.
     * @param {string} id - The ID of the activity to delete.
     * @returns {Promise<string>} A JSON string representing the result of the deletion.
     */
    async deleteActivity(ctx, id) {
        const exists = await this.activityExists(ctx, id);
        if (!exists) {
            throw new Error(`Activity with ID ${id} does not exist`);
        }

        // Generate an updated activity instance
        const activityData = await ctx.stub.getState(id);
        const activity = JSON.parse(activityData.toString());
        const updatedActivity = new Activity(activity.course, activity.name, activity.description, activity.due_date, activity.id, true);

        // Update the ledger with the new activity
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(updatedActivity)));
        return JSON.stringify({ success: true, message: "Activity deleted successfully" });
    }

    /**
     * Check if an activity exists.
     * @param {Context} ctx - The transaction context.
     * @param {string} id - The ID of the activity to check.
     * @returns {Promise<boolean>} True if the activity exists, false otherwise.
     */
    async activityExists(ctx, id) {
        const activityData = await ctx.stub.getState(id);
        return activityData && activityData.length > 0;
    }

    /**
     * Retrieve all activities associated with a specific course.
     * @param {Context} ctx - The transaction context.
     * @param {string} course_id - The ID of the course to filter activities by.
     * @returns {Promise<string>} A JSON string representing the list of activities.
     */
    async getActivitiesByCourse(ctx, course_id) {
        const query = { selector: { docType: "activity", course: course_id, is_deleted: false } };
        const iterator = await ctx.stub.getQueryResult(JSON.stringify(query));

        const results = [];
        let result = await iterator.next();
        while (!result.done) {
            const jsonRes = JSON.parse(result.value.value.toString());
            results.push(jsonRes); // Push each result as an Activity object
            result = await iterator.next();
        }

        return JSON.stringify(results);
    }
}

module.exports = ActivityContract;