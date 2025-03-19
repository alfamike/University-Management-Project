"use strict";

const { Contract } = require("fabric-contract-api");
const Course = require("./course");

/**
 * CourseContract class for managing courses on the blockchain.
 * @extends Contract
 */
class CourseContract extends Contract {
    /**
     * Create a new course.
     * @param {Context} ctx - The transaction context.
     * @param {string} name - The name of the course.
     * @param {string} description - The description of the course.
     * @param {Date} start_date - The start date of the course.
     * @param {Date} end_date - The end date of the course.
     * @param {string} title_id - The title ID of the course.
     * @returns {Promise<string>} The result of the course creation.
     */
    async createCourse(ctx, name, description, start_date, end_date, title_id) {
        // Create a new Course instance
        const course = new Course(title_id, name, description, start_date, end_date);

        // Check if the generated ID already exists (edge case)
        const exists = await this.courseExists(ctx, course.id);
        if (exists) {
            throw new Error(`A collision occurred: Course with ID ${course.id} already exists`);
        }

        // Save the course to the ledger
        await ctx.stub.putState(course.id, Buffer.from(JSON.stringify(course)));
        return JSON.stringify({ success: true, id: course.id, message: "Course created successfully" });
    }

    /**
     * Retrieve a course by ID.
     * @param {Context} ctx - The transaction context.
     * @param {string} id - The ID of the course.
     * @returns {Promise<string>} The course data.
     */
    async getCourse(ctx, id) {
        const courseData = await ctx.stub.getState(id);
        if (!courseData || courseData.length === 0) {
            throw new Error(`Course with ID ${id} not found`);
        }

        // Parse the stored JSON data into a Course object
        return courseData.toString();
    }

    /**
     * Retrieve all courses.
     * @param {Context} ctx - The transaction context.
     * @returns {Promise<string>} The list of all courses.
     */
    async getAllCourses(ctx) {
        const query = { selector: { docType: "course", is_deleted: false } };
        const iterator = await ctx.stub.getQueryResult(JSON.stringify(query));

        const results = [];
        let result = await iterator.next();
        while (!result.done) {
            const jsonRes = JSON.parse(result.value.value.toString());
            results.push(jsonRes); // Push each result as a Course object
            result = await iterator.next();
        }

        return JSON.stringify(results);
    }

    /**
     * Update an existing course.
     * @param {Context} ctx - The transaction context.
     * @param {string} id - The ID of the course.
     * @param {string} name - The name of the course.
     * @param {string} description - The description of the course.
     * @param {Date} start_date - The start date of the course.
     * @param {Date} end_date - The end date of the course.
     * @returns {Promise<string>} The result of the course update.
     */
    async updateCourse(ctx, id, name, description, start_date, end_date) {
        const exists = await this.courseExists(ctx, id);
        if (!exists) {
            throw new Error(`Course with ID ${id} does not exist`);
        }

        // Generate an updated course instance
        const courseData = await ctx.stub.getState(id);
        const course = JSON.parse(courseData.toString());
        const updatedCourse = new Course(course.title_id, name, description, start_date, end_date, id, false);

        // Update the ledger with the new course
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(updatedCourse)));
        return JSON.stringify({ success: true, message: "Course updated successfully" });
    }

    /**
     * Delete a course by marking it as deleted.
     * @param {Context} ctx - The transaction context.
     * @param {string} id - The ID of the course.
     * @returns {Promise<string>} The result of the course deletion.
     */
    async deleteCourse(ctx, id) {
        const exists = await this.courseExists(ctx, id);
        if (!exists) {
            throw new Error(`Course with ID ${id} does not exist`);
        }

        // Generate an updated course instance
        const courseData = await ctx.stub.getState(id);
        const course = JSON.parse(courseData.toString());
        const updatedCourse = new Course(course.title_id, course.name, course.description, course.start_date, course.end_date, course.id, true);

        // Update the ledger with the new course
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(updatedCourse)));
        return JSON.stringify({ success: true, message: "Course deleted successfully" });
    }

    /**
     * Check if a course exists.
     * @param {Context} ctx - The transaction context.
     * @param {string} id - The ID of the course.
     * @returns {Promise<boolean>} True if the course exists, false otherwise.
     */
    async courseExists(ctx, id) {
        const courseData = await ctx.stub.getState(id);
        return courseData && courseData.length > 0;
    }

    /**
     * Retrieve courses by title and year.
     * @param {Context} ctx - The transaction context.
     * @param {string} title_id - The title ID of the course.
     * @param {string} year - The year of the course.
     * @returns {Promise<string>} The list of courses matching the criteria.
     */
    async getCoursesByTitleYear(ctx, title_id, year) {
        let query = { selector: { docType: "course", is_deleted: false } };

        if (title_id !== "") {
            query.selector.title_id = title_id;
        }

        if (year !== "") {
            query.selector.start_date = { "$regex": `^${year}` };
        }

        const iterator = await ctx.stub.getQueryResult(JSON.stringify(query));

        const results = [];
        let result = await iterator.next();
        while (!result.done) {
            const jsonRes = JSON.parse(result.value.value.toString());
            results.push(jsonRes); // Push each result as a Course object
            result = await iterator.next();
        }

        return JSON.stringify(results);
    }
}

module.exports = CourseContract;