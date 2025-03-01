const { Wallets, Gateway } = require('fabric-network');
const FabricCAClient = require('fabric-ca-client');
const path = require('path');
const fs = require('fs');
const {join} = require("path");
const os = require("os");
const KaleidoClient = require("./kaleido");
const axios = require('axios');
const fabConnectService = require('./fabConnectService');

async function initializeClient() {
    // Create a new instance of KaleidoClient
    const client = new KaleidoClient();
    await client.init();
    return client;
}

async function checkIdentityExt(username) {
    try {
        const response = await axios.
        get(`https://u0ow0byhsw:_CRD_nIOsSOsX3lhpxArnyXFFoc_yt0BET0H10SB9U0@u0msj43rc6-u0a7k1tlp8-connect.us0-aws-ws.kaleido.io/identities/${username}`);
        if (response.data) {
            console.log(`User ${username} already exists with name: ${response.data.name}`);
            return response.data;
        } else {
            console.log(`User ${username} does not exist`);
            return null;
        }
    } catch (error) {
        if (error.response && error.response.status !== 404) {
            console.error('Error checking user identity:', error.message);
            throw error;
        }
    }
}

async function checkIdentityWallet(username) {
    const walletPath = join(os.homedir(), "fabric", "wallet");
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    return await wallet.get(username);NEektyFPRGUP
}

async function authUser(username) {
    const client = await initializeClient();
    const walletPath = join(os.homedir(), "fabric", "wallet");
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    const identity = await checkIdentityWallet(username);

    if (identity) {
        console.log(`An identity for the user ${username} already exists in the wallet`);
        await getFabricConnection(client, identity, wallet);
        return identity.certificate;
    } else{
        const identityExt = await checkIdentityExt(username);

        if (identityExt){
            // get external and create internal
            const x509Identity = {
                credentials: {
                    certificate: enrollment.certificate,
                    privateKey: enrollment.key.toBytes()
                },
                mspId: mspId,
                type: 'X.509'
            };
            await wallet.put(username, x509Identity);
            console.log(`Successfully enrolled user ${username} and stored it in the wallet`);

            //identity = await wallet.get(username);
            await getFabricConnection(client, identity, wallet);

            return enrollment.certificate;
        } else{
            // Create ext and then create interal
        }

    }

}

async function auth2(username) {
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
async function enrollUser(username) {
    const client = await initializeClient();
    const mspId = process.env.KALEIDO_MEMBERSHIP
    const caURL = client.cas[mspId].url
    const caClient = new FabricCAClient(`${caURL}:443`, { verify: false });
    const walletPath = join(os.homedir(), "fabric", "wallet");
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    let identity = await wallet.get(username);

    if (identity) {
        console.log(`An identity for the user ${username} already exists in the wallet`);
        await getFabricConnection(client, identity, wallet);
        return identity.certificate;
    }

    // Enroll the user
    const enrollment = await caClient.enroll({
        enrollmentID: username,
        enrollmentSecret: 'TFM2025'
    });

    const x509Identity = {
        credentials: {
            certificate: enrollment.certificate,
            privateKey: enrollment.key.toBytes()
        },
        mspId: mspId,
        type: 'X.509'
    };

    await wallet.put(username, x509Identity);
    console.log(`Successfully enrolled user ${username} and stored it in the wallet`);

    identity = await wallet.get(username);
    await getFabricConnection(client, identity, wallet);

    return enrollment.certificate;
}

async function getFabricConnection(client, identity, wallet){
    const gateway = new Gateway();

    await gateway.connect(client.config, {
        wallet: wallet,
        identity: identity,
        clientTlsIdentity: identity,
        discovery: { enabled: false, asLocalhost: false }
    });

    const network = await gateway.getNetwork(client.channel.name);

    console.log("Connected to channel");
}

module.exports = { enrollUser , auth2 };
