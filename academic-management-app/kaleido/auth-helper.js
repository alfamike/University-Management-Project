const fabConnectService = require('./fabConnectService');

async function auth(username) {

    let identity = await fabConnectService.getIdentity(username);

    console.log(`An identity for the user ${username} already exists in Kaleido`);
    return identity
}

module.exports = {auth};
