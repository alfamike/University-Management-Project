const { v4: uuidv4 } = require("uuid");

class Student {
    constructor(first_name, last_name, email, id = uuidv4(), is_deleted=false) {
        this.first_name = first_name;
        this.last_name = last_name;
        this.email = email;
        this.id = id;
        this.docType = "student";
        this.is_deleted = is_deleted
    }
}

module.exports = Student;