const { v4: uuidv4 } = require("uuid");

/**
 * Class representing a Course.
 */
class Course {
    /**
     * Create a Course.
     * @param {string} title_id - The title ID of the course.
     * @param {string} name - The name of the course.
     * @param {string} description - The description of the course.
     * @param {Date} start_date - The start date of the course.
     * @param {Date} end_date - The end date of the course.
     * @param {string} [id=uuidv4()] - The unique ID of the course.
     * @param {boolean} [is_deleted=false] - The deletion status of the course.
     */
    constructor(title_id, name, description, start_date, end_date, id = uuidv4(), is_deleted=false) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.docType = "course";
        this.is_deleted = is_deleted;
        this.title_id = title_id;
        this.start_date = start_date;
        this.end_date = end_date;
    }
}

module.exports = Course;