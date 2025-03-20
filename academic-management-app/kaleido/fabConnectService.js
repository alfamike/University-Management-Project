const axios = require('axios');

const fabConnectService = {
    /**
     * List all identities.
     * @async
     * @function listIdentities
     * @returns {Promise<Object>} The list of identities.
     */
    async listIdentities() {
        return this.makeRequest('get', '/identities');
    },

    /**
     * Get an identity by username.
     * @async
     * @function getIdentity
     * @param {string} username - The username of the identity.
     * @returns {Promise<Object>} The identity object.
     */
    async getIdentity(username) {
        return this.makeRequest('get', `/identities/${username}`);
    },

    /**
     * Register a new identity.
     * @async
     * @function registerIdentity
     * @param {Object} identityData - The data of the identity to register.
     * @returns {Promise<Object>} The registered identity object.
     */
    async registerIdentity(identityData) {
        return this.makeRequest('post', '/identities', identityData);
    },

    /**
     * Enroll an identity.
     * @async
     * @function enrollIdentity
     * @param {string} username - The username of the identity to enroll.
     * @param {Object} enrollData - The enrollment data.
     * @returns {Promise<Object>} The enrolled identity object.
     */
    async enrollIdentity(username, enrollData) {
        return this.makeRequest('post', `/identities/${username}/enroll`, enrollData);
    },

    /**
     * Reenroll an identity.
     * @async
     * @function reenrollIdentity
     * @param {string} username - The username of the identity to reenroll.
     * @param {Object} reenrollData - The reenrollment data.
     * @returns {Promise<Object>} The reenrolled identity object.
     */
    async reenrollIdentity(username, reenrollData) {
        return this.makeRequest('post', `/identities/${username}/reenroll`, reenrollData);
    },

    /**
     * Revoke an identity.
     * @async
     * @function revokeIdentity
     * @param {string} username - The username of the identity to revoke.
     * @param {Object} revokeData - The revocation data.
     * @returns {Promise<Object>} The revoked identity object.
     */
    async revokeIdentity(username, revokeData) {
        return this.makeRequest('post', `/identities/${username}/revoke`, revokeData);
    },

    /**
     * Get chain information.
     * @async
     * @function getChainInfo
     * @param {string} channel - The channel name.
     * @param {string} signer - The signer name.
     * @returns {Promise<Object>} The chain information.
     */
    async getChainInfo(channel, signer) {
        return this.makeRequest('get', `/chaininfo?fly-channel=${channel}&fly-signer=${signer}`);
    },

    /**
     * Get a block by number or hash.
     * @async
     * @function getBlockByNumberOrHash
     * @param {string} blockNumberOrHash - The block number or hash.
     * @param {string} channel - The channel name.
     * @param {string} signer - The signer name.
     * @returns {Promise<Object>} The block information.
     */
    async getBlockByNumberOrHash(blockNumberOrHash, channel, signer) {
        return this.makeRequest('get', `/blocks/${blockNumberOrHash}?fly-channel=${channel}&fly-signer=${signer}`);
    },

    /**
     * Get a block by transaction ID.
     * @async
     * @function getBlockByTxId
     * @param {string} txId - The transaction ID.
     * @param {string} channel - The channel name.
     * @param {string} signer - The signer name.
     * @returns {Promise<Object>} The block information.
     */
    async getBlockByTxId(txId, channel, signer) {
        return this.makeRequest('get', `/blockByTxId/${txId}?fly-channel=${channel}&fly-signer=${signer}`);
    },

    /**
     * Submit a transaction.
     * @async
     * @function submitTransaction
     * @param {Object} transactionData - The transaction data.
     * @param {boolean} [sync=true] - Whether to wait for the transaction to be committed.
     * @returns {Promise<Object>} The transaction result.
     */
    async submitTransaction(transactionData, sync = true) {
        return this.makeRequest('post', `/transactions?fly-sync=${sync}`, transactionData);
    },

    /**
     * Get a transaction by ID.
     * @async
     * @function getTransaction
     * @param {string} txId - The transaction ID.
     * @param {string} channel - The channel name.
     * @param {string} signer - The signer name.
     * @returns {Promise<Object>} The transaction information.
     */
    async getTransaction(txId, channel, signer) {
        return this.makeRequest('get', `/transactions/${txId}?fly-channel=${channel}&fly-signer=${signer}`);
    },

    /**
     * Query a chaincode.
     * @async
     * @function queryChaincode
     * @param {Object} queryData - The query data.
     * @returns {Promise<Object>} The query result.
     */
    async queryChaincode(queryData) {
        return this.makeRequest('post', '/query', queryData);
    },

    /**
     * List all receipts.
     * @async
     * @function listReceipts
     * @returns {Promise<Object>} The list of receipts.
     */
    async listReceipts() {
        return this.makeRequest('get', '/receipts');
    },

    /**
     * Get a receipt by ID.
     * @async
     * @function getReceipt
     * @param {string} receiptId - The receipt ID.
     * @returns {Promise<Object>} The receipt information.
     */
    async getReceipt(receiptId) {
        return this.makeRequest('get', `/receipts/${receiptId}`);
    },

    /**
     * List all event streams.
     * @async
     * @function listEventStreams
     * @returns {Promise<Object>} The list of event streams.
     */
    async listEventStreams() {
        return this.makeRequest('get', '/eventstreams');
    },

    /**
     * Create a new event stream.
     * @async
     * @function createEventStream
     * @param {Object} eventStreamData - The event stream data.
     * @returns {Promise<Object>} The created event stream object.
     */
    async createEventStream(eventStreamData) {
        return this.makeRequest('post', '/eventstreams', eventStreamData);
    },

    /**
     * Get an event stream by ID.
     * @async
     * @function getEventStream
     * @param {string} eventstreamId - The event stream ID.
     * @returns {Promise<Object>} The event stream information.
     */
    async getEventStream(eventstreamId) {
        return this.makeRequest('get', `/eventstreams/${eventstreamId}`);
    },

    /**
     * Delete an event stream by ID.
     * @async
     * @function deleteEventStream
     * @param {string} eventstreamId - The event stream ID.
     * @returns {Promise<Object>} The result of the deletion.
     */
    async deleteEventStream(eventstreamId) {
        return this.makeRequest('delete', `/eventstreams/${eventstreamId}`);
    },

    /**
     * List all subscriptions.
     * @async
     * @function listSubscriptions
     * @returns {Promise<Object>} The list of subscriptions.
     */
    async listSubscriptions() {
        return this.makeRequest('get', '/subscriptions');
    },

    /**
     * Create a new subscription.
     * @async
     * @function createSubscription
     * @param {Object} subscriptionData - The subscription data.
     * @returns {Promise<Object>} The created subscription object.
     */
    async createSubscription(subscriptionData) {
        return this.makeRequest('post', '/subscriptions', subscriptionData);
    },

    /**
     * Get a subscription by ID.
     * @async
     * @function getSubscription
     * @param {string} subscriptionId - The subscription ID.
     * @returns {Promise<Object>} The subscription information.
     */
    async getSubscription(subscriptionId) {
        return this.makeRequest('get', `/subscriptions/${subscriptionId}`);
    },

    /**
     * Delete a subscription by ID.
     * @async
     * @function deleteSubscription
     * @param {string} subscriptionId - The subscription ID.
     * @returns {Promise<Object>} The result of the deletion.
     */
    async deleteSubscription(subscriptionId) {
        return this.makeRequest('delete', `/subscriptions/${subscriptionId}`);
    },

    /**
     * Make a generic request.
     * @async
     * @function makeRequest
     * @param {string} method - The HTTP method.
     * @param {string} endpoint - The API endpoint.
     * @param {Object} [data={}] - The request data.
     * @returns {Promise<Object>} The response data.
     * @throws {Error} If the request fails.
     */
    async makeRequest(method, endpoint, data = {}) {
        try {
            const response = await axios({
                method,
                url: `${process.env.KALEIDO_NODE_URL}${endpoint}`,
                auth: {username: process.env.KALEIDO_NODE_CREDENTIAL_ID, password: process.env.KALEIDO_NODE_PASSWORD},
                data,
            });

            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || error.message);
        }
    }
};

module.exports = fabConnectService;