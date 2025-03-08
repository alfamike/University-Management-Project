const { v4: uuidv4 } = require("uuid");

class Activity {
    constructor(course, name, description, due_date, id = uuidv4(), is_deleted=false) {
        this.course = course;
        this.name = name;
        this.description = description;
        this.due_date = due_date;
        this.id = id;
        this.docType = "activity";
        this.is_deleted = is_deleted
    }
}

module.exports = Activity;