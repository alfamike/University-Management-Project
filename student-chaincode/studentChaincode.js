"use strict";

const { Contract } = require("fabric-contract-api");
const Student = require("./student");

class StudentContract extends Contract {
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

    async getStudent(ctx, id) {
        const studentData = await ctx.stub.getState(id);
        if (!studentData || studentData.length === 0) {
            throw new Error(`Student with ID ${id} not found`);
        }

        // Parse the stored JSON data into a Student object
        return studentData.toString();
    }

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

    async studentExists(ctx, id) {
        const studentData = await ctx.stub.getState(id);
        return studentData && studentData.length > 0;
    }

    async getStudentsByTitle(ctx, title_id) {
        const courses = await this.getCoursesByTitle(ctx, title_id);

        const results = [];
        for (const course of courses) {
            const query = { selector: { docType: "enrollment", course: course.id, is_deleted: false } };
            const iterator = await ctx.stub.getQueryResult(JSON.stringify(query));

            let result = await iterator.next();
            while (!result.done) {
                const enrollment = JSON.parse(result.value.value.toString());
                const studentData = await ctx.stub.getState(enrollment.student);
                if (studentData && studentData.length > 0) {
                    const student = JSON.parse(studentData.toString());
                    results.push(student);
                }
                result = await iterator.next();
            }
        }

        return JSON.stringify(results);
    }

    async getCoursesByTitle(ctx, title_id) {
        try {
            const channel = ctx.channelId;
            const chaincodeName = "course_contract";
            const functionName = "getCoursesByTitleYear";
            const args = [title_id, ""];

            // Invoke the chaincode
            const resultBuffer = await ctx.stub.invokeChaincode(chaincodeName, [functionName, ...args], channel);

            // If the result is successful, return it
            if (resultBuffer && resultBuffer.length > 0) {
                console.log('Result:', resultBuffer.toString());
                const result = JSON.parse(resultBuffer.toString());
                return result;
            } else {
                new Error(`No data returned from chaincode ${chaincodeName}`);
            }
        } catch (error) {
            console.error('Error querying other chaincode:', error);
            throw new Error(`Error querying courses by title: ${error.message}`);
        }
    }

    async getStudentsByCourse(ctx, course_id) {
        const query = { selector: { docType: "enrollment", course: course_id, is_deleted: false } };
        const iterator = await ctx.stub.getQueryResult(JSON.stringify(query));

        const results = [];
        let result = await iterator.next();
        while (!result.done) {
            const enrollment = JSON.parse(result.value.value.toString());
            const studentData = await ctx.stub.getState(enrollment.student);
            if (studentData && studentData.length > 0) {
                const student = JSON.parse(studentData.toString());
                results.push(student);
            }
            result = await iterator.next();
        }

        return JSON.stringify(results);
    }
}

module.exports = StudentContract;