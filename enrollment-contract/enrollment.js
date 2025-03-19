const { v4: uuidv4 } = require("uuid");

/**
 * Represents an enrollment of a student in a course.
 */
class Enrollment {
    /**
     * Creates an instance of Enrollment.
     *
     * @param {Object} student - The student being enrolled.
     * @param {Object} course - The course the student is enrolling in.
     * @param {number} [grade=0.00] - The grade of the student in the course.
     * @param {string} [id=uuidv4()] - The unique identifier for the enrollment.
     * @param {boolean} [is_deleted=false] - The deletion status of the enrollment.
     */
    constructor(student, course, grade = 0.00, id = uuidv4(), is_deleted=false) {
        this.student = student;
        this.course = course;
        this.grade = grade;
        this.id = id;
        this.docType = "enrollment";
        this.is_deleted = is_deleted;
    }
}

module.exports = Enrollment;