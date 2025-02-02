const { v4: uuidv4 } = require("uuid");

class Title {
    constructor(name, description, id = uuidv4()) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.docType = "title";
    }
}

module.exports = Title;