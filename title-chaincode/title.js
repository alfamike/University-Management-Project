const { v4: uuidv4 } = require("uuid");

/**
 * Class representing a Title.
 */
class Title {
    /**
     * Create a Title.
     * @param {string} name - The name of the title.
     * @param {string} description - The description of the title.
     * @param {string} [id=uuidv4()] - The unique identifier for the title.
     * @param {boolean} [is_deleted=false] - The deletion status of the title.
     */
    constructor(name, description, id = uuidv4(), is_deleted = false) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.docType = "title";
        this.is_deleted = is_deleted;
    }
}

module.exports = Title;