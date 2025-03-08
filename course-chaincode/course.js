const { v4: uuidv4 } = require("uuid");

class Course {
    constructor(title_id, name, id = uuidv4(), description, start_date, end_date, is_deleted=false) {
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