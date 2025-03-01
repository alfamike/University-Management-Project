const fabConnectService = require('./fabConnectService');

async function auth(username) {

    let identity = await fabConnectService.getIdentity(username);

    let identityData;
    let enrollData;
    if (identity) {
        console.log(`An identity for the user ${username} already exists in Kaleido`);
        return identity
    } else {
        identityData = {
            "name": username,
            "type": "client",
            "maxEnrollments": -1
        }
        const {name, secret} = await fabConnectService.registerIdentity(username, identityData);
        enrollData = {
            "secret": secret
        }
        const success = await fabConnectService.enrollIdentity(username, enrollData)

        if (success) {
            console.log(`Successfully enrolled user ${username} in Kaleido`);
            identity = await fabConnectService.getIdentity(username);
            return identity;
        }
    }

}

module.exports = {auth};
