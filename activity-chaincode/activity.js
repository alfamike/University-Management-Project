const { v4: uuidv4 } = require("uuid");

/**
 * Class representing an activity.
 */
class Activity {
    /**
     * Create an activity.
     * @param {string} course - The course associated with the activity.
     * @param {string} name - The name of the activity.
     * @param {string} description - The description of the activity.
     * @param {Date} due_date - The due date of the activity.
     * @param {string} [id=uuidv4()] - The unique identifier for the activity.
     * @param {boolean} [is_deleted=false] - The deletion status of the activity.
     */
    constructor(course, name, description, due_date, id = uuidv4(), is_deleted=false) {
        this.course = course;
        this.name = name;
        this.description = description;
        this.due_date = due_date;
        this.id = id;
        this.docType = "activity";
        this.is_deleted = is_deleted;
    }
}

module.exports = Activity;