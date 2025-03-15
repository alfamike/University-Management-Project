const { v4: uuidv4 } = require("uuid");

class ActivityGrade {
    constructor(activity, student, grade=0.00, id = uuidv4(), is_deleted=false) {
        this.activity = activity;
        this.student = student;
        this.grade = grade;
        this.id = id;
        this.docType = "activity_grade";
        this.is_deleted = is_deleted;
    }
}

module.exports = ActivityGrade;