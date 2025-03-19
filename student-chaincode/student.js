const { v4: uuidv4 } = require("uuid");

/**
 * Represents a student.
 */
class Student {
    /**
     * Creates a new student.
     * @param {string} first_name - The first name of the student.
     * @param {string} last_name - The last name of the student.
     * @param {string} email - The email address of the student.
     * @param {string} [id=uuidv4()] - The unique identifier for the student. Defaults to a new UUID.
     * @param {boolean} [is_deleted=false] - The deletion status of the student. Defaults to false.
     */
    constructor(first_name, last_name, email, id = uuidv4(), is_deleted = false) {
        this.first_name = first_name;
        this.last_name = last_name;
        this.email = email;
        this.id = id;
        this.docType = "student";
        this.is_deleted = is_deleted;
    }
}

module.exports = Student;