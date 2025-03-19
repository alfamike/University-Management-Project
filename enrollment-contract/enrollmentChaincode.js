"use strict";

const { Contract } = require("fabric-contract-api");
const Enrollment = require("./enrollment");

/**
 * EnrollmentContract provides the logic for managing enrollments in the blockchain ledger.
 */
class EnrollmentContract extends Contract {
    /**
     * Creates a new enrollment and saves it to the ledger.
     *
     * @param {Context} ctx - The transaction context.
     * @param {string} student_id - The ID of the student.
     * @param {string} course_id - The ID of the course.
     * @returns {Promise<string>} A success message with the enrollment ID.
     */
    async createEnrollment(ctx, student_id, course_id) {
        // Create a new Enrollment instance
        const enrollment = new Enrollment(student_id, course_id);

        // Check if the generated ID already exists (edge case)
        const exists = await this.enrollmentExists(ctx, enrollment.id);
        if (exists) {
            throw new Error(`A collision occurred: Enrollment with ID ${enrollment.id} already exists`);
        }

        // Save the enrollment to the ledger
        await ctx.stub.putState(enrollment.id, Buffer.from(JSON.stringify(enrollment)));
        return JSON.stringify({ success: true, id: enrollment.id, message: "Enrollment created successfully" });
    }

    /**
     * Retrieves an enrollment from the ledger by its ID.
     *
     * @param {Context} ctx - The transaction context.
     * @param {string} id - The ID of the enrollment.
     * @returns {Promise<string>} The enrollment data as a JSON string.
     */
    async getEnrollment(ctx, id) {
        const enrollmentData = await ctx.stub.getState(id);
        if (!enrollmentData || enrollmentData.length === 0) {
            throw new Error(`Enrollment with ID ${id} not found`);
        }

        // Parse the stored JSON data into an Enrollment object
        return enrollmentData.toString();
    }

    /**
     * Retrieves an enrollment by student ID and course ID.
     *
     * @param {Context} ctx - The transaction context.
     * @param {string} student_id - The ID of the student.
     * @param {string} course_id - The ID of the course.
     * @returns {Promise<string>} The enrollment data as a JSON string.
     */
    async getEnrollmentByStudentCourse(ctx, student_id, course_id) {
        const query = { selector: { docType: "enrollment", student: student_id, course: course_id, is_deleted: false } };
        const iterator = await ctx.stub.getQueryResult(JSON.stringify(query));

        let result = await iterator.next();
        if (result.done) {
            throw new Error(`Enrollment with Student ID ${student_id} and Course ID ${course_id} not found`);
        }

        return result.value.value.toString();
    }

    /**
     * Retrieves all enrollments from the ledger.
     *
     * @param {Context} ctx - The transaction context.
     * @returns {Promise<string>} A JSON string of all enrollments.
     */
    async getAllEnrollments(ctx) {
        const query = { selector: { docType: "enrollment", is_deleted: false } };
        const iterator = await ctx.stub.getQueryResult(JSON.stringify(query));

        const results = [];
        let result = await iterator.next();
        while (!result.done) {
            const jsonRes = JSON.parse(result.value.value.toString());
            results.push(jsonRes); // Push each result as an Enrollment object
            result = await iterator.next();
        }

        return JSON.stringify(results);
    }

    /**
     * Updates an existing enrollment in the ledger.
     *
     * @param {Context} ctx - The transaction context.
     * @param {string} id - The ID of the enrollment.
     * @param {string} student_id - The ID of the student.
     * @param {string} course_id - The ID of the course.
     * @param {number} grade - The grade of the student in the course.
     * @returns {Promise<string>} A success message.
     */
    async updateEnrollment(ctx, id, student_id, course_id, grade) {
        const exists = await this.enrollmentExists(ctx, id);
        if (!exists) {
            throw new Error(`Enrollment with ID ${id} does not exist`);
        }

        // Generate an updated enrollment instance
        const enrollmentData = await ctx.stub.getState(id);
        const enrollment = JSON.parse(enrollmentData.toString());
        const updatedEnrollment = new Enrollment(student_id, course_id, grade, id, false);

        // Update the ledger with the new enrollment
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(updatedEnrollment)));
        return JSON.stringify({ success: true, message: "Enrollment updated successfully" });
    }

    /**
     * Marks an enrollment as deleted in the ledger.
     *
     * @param {Context} ctx - The transaction context.
     * @param {string} id - The ID of the enrollment.
     * @returns {Promise<string>} A success message.
     */
    async deleteEnrollment(ctx, id) {
        const exists = await this.enrollmentExists(ctx, id);
        if (!exists) {
            throw new Error(`Enrollment with ID ${id} does not exist`);
        }

        // Generate an updated enrollment instance
        const enrollmentData = await ctx.stub.getState(id);
        const enrollment = JSON.parse(enrollmentData.toString());
        const updatedEnrollment = new Enrollment(enrollment.student, enrollment.course, enrollment.grade, enrollment.id, true);

        // Update the ledger with the new enrollment
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(updatedEnrollment)));
        return JSON.stringify({ success: true, message: "Enrollment deleted successfully" });
    }

    /**
     * Checks if an enrollment exists in the ledger.
     *
     * @param {Context} ctx - The transaction context.
     * @param {string} id - The ID of the enrollment.
     * @returns {Promise<boolean>} True if the enrollment exists, false otherwise.
     */
    async enrollmentExists(ctx, id) {
        const enrollmentData = await ctx.stub.getState(id);
        return enrollmentData && enrollmentData.length > 0;
    }

    /**
     * Retrieves all enrollments for a specific student.
     *
     * @param {Context} ctx - The transaction context.
     * @param {string} student_id - The ID of the student.
     * @returns {Promise<string>} A JSON string of all enrollments for the student.
     */
    async getEnrollmentsByStudent(ctx, student_id) {
        const query = { selector: { docType: "enrollment", student: student_id, is_deleted: false } };
        const iterator = await ctx.stub.getQueryResult(JSON.stringify(query));

        const results = [];
        let result = await iterator.next();
        while (!result.done) {
            const jsonRes = JSON.parse(result.value.value.toString());
            results.push(jsonRes); // Push each result as an Enrollment object
            result = await iterator.next();
        }

        return JSON.stringify(results);
    }

    /**
     * Retrieves all enrollments for a specific course.
     *
     * @param {Context} ctx - The transaction context.
     * @param {string} course_id - The ID of the course.
     * @returns {Promise<string>} A JSON string of all enrollments for the course.
     */
    async getEnrollmentsByCourse(ctx, course_id) {
        const query = { selector: { docType: "enrollment", course: course_id, is_deleted: false } };
        const iterator = await ctx.stub.getQueryResult(JSON.stringify(query));

        const results = [];
        let result = await iterator.next();
        while (!result.done) {
            const jsonRes = JSON.parse(result.value.value.toString());
            results.push(jsonRes); // Push each result as an Enrollment object
            result = await iterator.next();
        }

        return JSON.stringify(results);
    }

    /**
     * Marks all enrollments for a specific student and course as deleted.
     *
     * @param {Context} ctx - The transaction context.
     * @param {string} student_id - The ID of the student.
     * @param {string} course_id - The ID of the course.
     * @returns {Promise<string>} A success message.
     */
    async deleteEnrollmentByStudentCourse(ctx, student_id, course_id) {
        const query = {selector: {docType: "enrollment", student: student_id, course: course_id, is_deleted: false}};
        const iterator = await ctx.stub.getQueryResult(JSON.stringify(query));

        let result = await iterator.next();
        while (!result.done) {
            const enrollment = JSON.parse(result.value.value.toString());
            const updatedEnrollment = new Enrollment(enrollment.student, enrollment.course, enrollment.grade, enrollment.id, true);
            await ctx.stub.putState(enrollment.id, Buffer.from(JSON.stringify(updatedEnrollment)));
        }

        return JSON.stringify({success: true, message: "Enrollment deleted successfully"});
    }

    /**
     * Marks all enrollments for a specific course as deleted.
     *
     * @param {Context} ctx - The transaction context.
     * @param {string} course_id - The ID of the course.
     * @returns {Promise<string>} A success message.
     */
    async deleteEnrollmentsByCourse(ctx, course_id) {
        const query = {selector: {docType: "enrollment", course: course_id, is_deleted: false}};
        const iterator = await ctx.stub.getQueryResult(JSON.stringify(query));

        let result = await iterator.next();
        while (!result.done) {
            const enrollment = JSON.parse(result.value.value.toString());
            const updatedEnrollment = new Enrollment(enrollment.student, enrollment.course, enrollment.grade, enrollment.id, true);
            await ctx.stub.putState(enrollment.id, Buffer.from(JSON.stringify(updatedEnrollment)));
        }

        return JSON.stringify({success: true, message: "Enrollments deleted successfully"});
    }
}

module.exports = EnrollmentContract;