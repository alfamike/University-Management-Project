const axios = require('axios');

const fabConnectService = {
    // Identities
    async listIdentities() {
        return this.makeRequest('get', '/identities');
    },

    async getIdentity(username) {
        return this.makeRequest('get', `/identities/${username}`);
    },

    async registerIdentity(identityData) {
        return this.makeRequest('post', '/identities', identityData);
    },

    async enrollIdentity(username, enrollData) {
        return this.makeRequest('post', `/identities/${username}/enroll`, enrollData);
    },

    async reenrollIdentity(username, reenrollData) {
        return this.makeRequest('post', `/identities/${username}/reenroll`, reenrollData);
    },

    async revokeIdentity(username, revokeData) {
        return this.makeRequest('post', `/identities/${username}/revoke`, revokeData);
    },

    // Ledger
    async getChainInfo(channel, signer) {
        return this.makeRequest('get', `/chaininfo?fly-channel=${channel}&fly-signer=${signer}`);
    },

    async getBlockByNumberOrHash(blockNumberOrHash, channel, signer) {
        return this.makeRequest('get', `/blocks/${blockNumberOrHash}?fly-channel=${channel}&fly-signer=${signer}`);
    },

    async getBlockByTxId(txId, channel, signer) {
        return this.makeRequest('get', `/blockByTxId/${txId}?fly-channel=${channel}&fly-signer=${signer}`);
    },

    // Transactions
    async submitTransaction(transactionData, sync = true) {
        return this.makeRequest('post', `/transactions?fly-sync=${sync}`, transactionData);
    },

    async getTransaction(txId, channel, signer) {
        return this.makeRequest('get', `/transactions/${txId}?fly-channel=${channel}&fly-signer=${signer}`);
    },

    // Queries
    async queryChaincode(queryData) {
        return this.makeRequest('post', '/query', queryData);
    },

    // Receipts
    async listReceipts() {
        return this.makeRequest('get', '/receipts');
    },

    async getReceipt(receiptId) {
        return this.makeRequest('get', `/receipts/${receiptId}`);
    },

    // Event Streams
    async listEventStreams() {
        return this.makeRequest('get', '/eventstreams');
    },

    async createEventStream(eventStreamData) {
        return this.makeRequest('post', '/eventstreams', eventStreamData);
    },

    async getEventStream(eventstreamId) {
        return this.makeRequest('get', `/eventstreams/${eventstreamId}`);
    },

    async deleteEventStream(eventstreamId) {
        return this.makeRequest('delete', `/eventstreams/${eventstreamId}`);
    },

    // Subscriptions
    async listSubscriptions() {
        return this.makeRequest('get', '/subscriptions');
    },

    async createSubscription(subscriptionData) {
        return this.makeRequest('post', '/subscriptions', subscriptionData);
    },

    async getSubscription(subscriptionId) {
        return this.makeRequest('get', `/subscriptions/${subscriptionId}`);
    },

    async deleteSubscription(subscriptionId) {
        return this.makeRequest('delete', `/subscriptions/${subscriptionId}`);
    },

    // Generic request handler
    async makeRequest(method, endpoint, data = {}) {
        try {
            const response = await axios({
                method,
                url: `${process.env.KALEIDO_NODE_URL}${endpoint}`,
                auth: { username: process.env.KALEIDO_NODE_CREDENTIAL_ID, password: process.env.KALEIDO_NODE_PASSWORD },
                data,
            });

            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || error.message);
        }
    }
};

module.exports = fabConnectService;
