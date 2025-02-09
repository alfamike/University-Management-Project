const { FileSystemWallet, Gateway } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const fs = require('fs');
const {join} = require("path");
const os = require("os");
const KaleidoClient = require("./kaleido");

async function initializeClient() {
    // Create a new instance of KaleidoClient
    const client = new KaleidoClient();
    await client.init();
    return client;
}


async function enrollUser(username, password) {
    const client = await initializeClient();
    const caURL = process.env.KALEIDO_CA_URL
    // const caName = 'Admin Universidad AMR CA';
    const mspId = process.env.KALEIDO_MSPID
    const walletPath = join(os.homedir(), "fabric", "wallet");
    const wallet = new FileSystemWallet(walletPath);

    const ca = new FabricCAServices(caURL);
    let identity = await wallet.get(username);

    if (identity) {
        console.log(`An identity for the user ${username} already exists in the wallet`);
        await getFabricConnection(client, identity, wallet);
        return identity.certificate;
    }

    // Enroll the user
    const enrollment = await ca.enroll({
        enrollmentID: username,
        enrollmentSecret: password
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
        discovery: { enabled: true, asLocalhost: false }
    });

    const network = await gateway.getNetwork(client.channel.name);
    console.log("Connected to channel");
}

module.exports = { enrollUser };
