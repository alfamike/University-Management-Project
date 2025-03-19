"use strict";

const { Contract } = require("fabric-contract-api");
const Student = require("./student");

/**
 * StudentContract class extends the Fabric Contract class to manage student records.
 */
class StudentContract extends Contract {
    /**
     * Creates a new student record in the ledger.
     * @param {Context} ctx - The transaction context.
     * @param {string} first_name - The first name of the student.
     * @param {string} last_name - The last name of the student.
     * @param {string} email - The email address of the student.
     * @returns {Promise<string>} - A success message with the student ID.
     */
    async createStudent(ctx, first_name, last_name, email) {
        // Create a new Student instance
        const student = new Student(first_name, last_name, email);

        // Check if the generated ID already exists (edge case)
        const exists = await this.studentExists(ctx, student.id);
        if (exists) {
            throw new Error(`A collision occurred: Student with ID ${student.id} already exists`);
        }

        // Save the student to the ledger
        await ctx.stub.putState(student.id, Buffer.from(JSON.stringify(student)));
        return JSON.stringify({ success: true, id: student.id, message: "Student created successfully" });
    }

    /**
     * Retrieves a student record from the ledger.
     * @param {Context} ctx - The transaction context.
     * @param {string} id - The unique identifier of the student.
     * @returns {Promise<string>} - The student record as a JSON string.
     */
    async getStudent(ctx, id) {
        const studentData = await ctx.stub.getState(id);
        if (!studentData || studentData.length === 0) {
            throw new Error(`Student with ID ${id} not found`);
        }

        // Parse the stored JSON data into a Student object
        return studentData.toString();
    }

    /**
     * Retrieves all student records from the ledger.
     * @param {Context} ctx - The transaction context.
     * @returns {Promise<string>} - A JSON string of all student records.
     */
    async getAllStudents(ctx) {
        const query = { selector: { docType: "student", is_deleted: false } };
        const iterator = await ctx.stub.getQueryResult(JSON.stringify(query));

        const results = [];
        let result = await iterator.next();
        while (!result.done) {
            const jsonRes = JSON.parse(result.value.value.toString());
            results.push(jsonRes); // Push each result as a Student object
            result = await iterator.next();
        }

        return JSON.stringify(results);
    }

    /**
     * Updates an existing student record in the ledger.
     * @param {Context} ctx - The transaction context.
     * @param {string} id - The unique identifier of the student.
     * @param {string} first_name - The first name of the student.
     * @param {string} last_name - The last name of the student.
     * @param {string} email - The email address of the student.
     * @returns {Promise<string>} - A success message.
     */
    async updateStudent(ctx, id, first_name, last_name, email) {
        const exists = await this.studentExists(ctx, id);
        if (!exists) {
            throw new Error(`Student with ID ${id} does not exist`);
        }

        // Generate an updated student instance
        const studentData = await ctx.stub.getState(id);
        const student = JSON.parse(studentData.toString());
        const updatedStudent = new Student(first_name, last_name, email, id, false);

        // Update the ledger with the new student
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(updatedStudent)));
        return JSON.stringify({ success: true, message: "Student updated successfully" });
    }

    /**
     * Marks a student record as deleted in the ledger.
     * @param {Context} ctx - The transaction context.
     * @param {string} id - The unique identifier of the student.
     * @returns {Promise<string>} - A success message.
     */
    async deleteStudent(ctx, id) {
        const exists = await this.studentExists(ctx, id);
        if (!exists) {
            throw new Error(`Student with ID ${id} does not exist`);
        }

        // Generate an updated student instance
        const studentData = await ctx.stub.getState(id);
        const student = JSON.parse(studentData.toString());
        const updatedStudent = new Student(student.first_name, student.last_name, student.email, student.id, true);

        // Update the ledger with the new student
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(updatedStudent)));
        return JSON.stringify({ success: true, message: "Student deleted successfully" });
    }

    /**
     * Checks if a student record exists in the ledger.
     * @param {Context} ctx - The transaction context.
     * @param {string} id - The unique identifier of the student.
     * @returns {Promise<boolean>} - True if the student exists, false otherwise.
     */
    async studentExists(ctx, id) {
        const studentData = await ctx.stub.getState(id);
        return studentData && studentData.length > 0;
    }
}

module.exports = StudentContract;