const { v4: uuidv4 } = require("uuid");

class Enrollment {
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