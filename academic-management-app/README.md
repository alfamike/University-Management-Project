# Academic Management App

## Introduction

This academic project

Kaleido simplifies the deployment and management of blockchain networks, offering enterprise-grade infrastructure with minimal complexity. Using FabConnect, you can easily connect to Fabric nodes and interact with the blockchain through REST APIs.

## Features

- **A:** 
- **B:** 
- **C:**
- **D:**
- **E:**

## Prerequisites

Ensure you have the following set up:

- Kaleido Account
- Environment variables configured in a `.env` file:

```
PORT : Port number for the application
NODE_ENV : Environment mode (development, production, etc.)
SECRET : Secret key for Session token
KALEIDO_NODE_URL : Kaleido Node Rest API Gateway URL
KALEIDO_NODE_CREDENTIAL_ID : Kaleido APP CREDENTIAL ID
KALEIDO_NODE_PASSWORD : Kaleido APP CREDENTIAL Password
```
**How to get the variables:**
```
PORT : Choose a port number (e.g. 3000)
NODE_ENV : Set the environment mode (e.g. development)
SECRET : Set a secret key for the session token (e.g. mysecret)
KALEIDO_NODE_URL : Go to Kaleido Console -> Select a node -> Node Overview -> Connect your node -> Copy the Rest API Gateway URL
KALEIDO_NODE_CREDENTIAL_ID : Go to Kaleido Console -> Security -> App Creds -> New App Cred -> Copy the App Cred ID
KALEIDO_NODE_PASSWORD : After an app credential is created -> Copy the password
```

## Installation

1. Clone this repository:

```bash
git clone <repository-url>
cd <project-directory>
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file with your FabConnect API details (see Prerequisites section).

## Usage

### Import the Service

You can use the `fabConnectService` in your Node.js application like this:

```javascript
const fabConnectService = require('./fabConnectService');

(async () => {
  try {
    const identities = await fabConnectService.listIdentities();
    console.log('Identities:', identities);
  } catch (error) {
    console.error('Error fetching identities:', error.message);
  }
})();
```

### Available Methods

The following methods are available in the `fabConnectService`:

#### Identities

- `listIdentities()`
- `getIdentity(username)`
- `registerIdentity(identityData)`
- `enrollIdentity(username, enrollData)`
- `reenrollIdentity(username, reenrollData)`
- `revokeIdentity(username, revokeData)`

#### Ledger

- `getChainInfo(channel, signer)`
- `getBlockByNumberOrHash(blockNumberOrHash, channel, signer)`
- `getBlockByTxId(txId, channel, signer)`

#### Transactions

- `submitTransaction(transactionData, sync)`
- `getTransaction(txId, channel, signer)`

#### Queries

- `queryChaincode(queryData)`

#### Receipts

- `listReceipts()`
- `getReceipt(receiptId)`

#### Event Streams

- `listEventStreams()`
- `createEventStream(eventStreamData)`
- `getEventStream(eventstreamId)`
- `deleteEventStream(eventstreamId)`

#### Subscriptions

- `listSubscriptions()`
- `createSubscription(subscriptionData)`
- `getSubscription(subscriptionId)`
- `deleteSubscription(subscriptionId)`

## License

This project is private and confidential.

