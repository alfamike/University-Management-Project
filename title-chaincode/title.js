const { v4: uuidv4 } = require("uuid");

class Title {
    constructor(name, description, id = uuidv4(), is_deleted = false) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.docType = "title";
        this.is_deleted = is_deleted;
    }
}

module.exports = Title;