"use strict";

const { Contract } = require("fabric-contract-api");
const Title = require("./title");

/**
 * TitleContract class for handling Title-related transactions.
 * @extends Contract
 */
class TitleContract extends Contract {
    /**
     * Create a new Title.
     * @param {Context} ctx - The transaction context.
     * @param {string} name - The name of the title.
     * @param {string} description - The description of the title.
     * @returns {Promise<string>} The result of the creation operation.
     */
    async createTitle(ctx, name, description) {
        // Create a new Title instance
        const title = new Title(name, description);

        // Check if the generated ID already exists (edge case)
        const exists = await this.titleExists(ctx, title.id);
        if (exists) {
            throw new Error(`A collision occurred: Title with ID ${title.id} already exists`);
        }

        // Save the title to the ledger
        await ctx.stub.putState(title.id, Buffer.from(JSON.stringify(title)));
        return JSON.stringify({ success: true, id: title.id, message: "Title created successfully" });
    }

    /**
     * Retrieve a Title by ID.
     * @param {Context} ctx - The transaction context.
     * @param {string} id - The ID of the title.
     * @returns {Promise<string>} The title data as a JSON string.
     */
    async getTitle(ctx, id) {
        const titleData = await ctx.stub.getState(id);
        if (!titleData || titleData.length === 0) {
            throw new Error(`Title with ID ${id} not found`);
        }

        // Parse the stored JSON data into a Title object
        return titleData.toString();
    }

    /**
     * Retrieve all Titles.
     * @param {Context} ctx - The transaction context.
     * @returns {Promise<string>} The list of all titles as a JSON string.
     */
    async getAllTitles(ctx) {
        const query = { selector: { docType: "title", is_deleted: false } };
        const iterator = await ctx.stub.getQueryResult(JSON.stringify(query));

        const results = [];
        let result = await iterator.next();
        while (!result.done) {
            const jsonRes = JSON.parse(result.value.value.toString());
            results.push(jsonRes); // Push each result as a Title object
            result = await iterator.next();
        }

        return JSON.stringify(results);
    }

    /**
     * Update an existing Title.
     * @param {Context} ctx - The transaction context.
     * @param {string} id - The ID of the title.
     * @param {string} name - The new name of the title.
     * @param {string} description - The new description of the title.
     * @returns {Promise<string>} The result of the update operation.
     */
    async updateTitle(ctx, id, name, description) {
        const exists = await this.titleExists(ctx, id);
        if (!exists) {
            throw new Error(`Title with ID ${id} does not exist`);
        }

        // Generate an updated title instance
        const updatedTitle = new Title(name, description, id, false);

        // Update the ledger with the new title
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(updatedTitle)));
        return JSON.stringify({ success: true, message: "Title updated successfully" });
    }

    /**
     * Delete a Title by marking it as deleted.
     * @param {Context} ctx - The transaction context.
     * @param {string} id - The ID of the title.
     * @returns {Promise<string>} The result of the deletion operation.
     */
    async deleteTitle(ctx, id) {
        const exists = await this.titleExists(ctx, id);
        if (!exists) {
            throw new Error(`Title with ID ${id} does not exist`);
        }

        // Generate an updated title instance
        const titleData = await ctx.stub.getState(id);
        const title = JSON.parse(titleData.toString());
        const updatedTitle = new Title(title.name, title.description, title.id, true);

        // Update the ledger with the new title
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(updatedTitle)));
        return JSON.stringify({ success: true, message: "Title deleted successfully" });
    }

    /**
     * Check if a Title exists by ID.
     * @param {Context} ctx - The transaction context.
     * @param {string} id - The ID of the title.
     * @returns {Promise<boolean>} True if the title exists, false otherwise.
     */
    async titleExists(ctx, id) {
        const titleData = await ctx.stub.getState(id);
        return titleData && titleData.length > 0;
    }
}

module.exports = TitleContract;