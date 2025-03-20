const fabConnectService = require('./fabConnectService');

/**
 * Authenticate a user by their username.
 * @async
 * @function auth
 * @param {string} username - The username of the user to authenticate.
 * @returns {Promise<Object>} The identity object of the authenticated user.
 */
async function auth(username) {
    let identity = await fabConnectService.getIdentity(username);
    console.log(`An identity for the user ${username} already exists in Kaleido`);
    return identity;
}

module.exports = { auth };