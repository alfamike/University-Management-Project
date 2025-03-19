const { v4: uuidv4 } = require("uuid");

/**
 * Class representing an Activity Grade.
 */
class ActivityGrade {
    /**
     * Create an Activity Grade.
     * @param {string} activity - The activity identifier.
     * @param {string} student - The student identifier.
     * @param {number} [grade=0.00] - The grade for the activity.
     * @param {string} [id=uuidv4()] - The unique identifier for the activity grade.
     * @param {boolean} [is_deleted=false] - The deletion status of the activity grade.
     */
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