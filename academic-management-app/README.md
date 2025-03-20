# Academic Management App

## Overview

`Academic Management App` is a Node.js Express web application design for the management of an education system based on titles, courses, students and activities.
It uses a Hyperledge Fabric blockchain network as data storage and the connection is established through Hyperledge FireFly FabConnect, a connector that uses a Rest API to interact with the blockchain network.

The application interacts with the Platform-as-a-Service Kaleido, that simplifies the deployment and management of blockchain networks, like Hyperledge Fabric, offering enterprise-grade infrastructure with
minimal complexity.

## Prerequisites

Ensure you have the following set up:

1. Kaleido Account
2. Postman
3. Node.js (version 12.x or later)
4. npm (version 6.x or later)
5. Your favorite web development IDE

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

3. Create a `.env` file with your app secrets and Kaleido connection details.
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
KALEIDO_NODE_URL : Go to Kaleido Console -> Select a node -> Node Overview -> Connect your node -> Copy the Rest API Gateway URL without the last '/'
KALEIDO_NODE_CREDENTIAL_ID : Go to Kaleido Console -> Security -> App Creds -> New App Cred -> Copy the App Cred ID
KALEIDO_NODE_PASSWORD : After an app credential is created -> Copy the password
```
4. Run the application
```bash
npm start
```

## Features
- Auth using identities provided by the Fabric CA deployed in Kaleido
- CSRF and session middlewares to add auth security to API calls and users signing transactions for the blockchain ledger.
- Home page with a lateral menu navigation and a chat for future use of a LLM AI agent.
- Titles list and title management
- Course list and course management. Including related activities management.
- Student list and student management. Including managing grades for courses and activities.

### Available Methods with FireFly Fabconnect Rest API

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

This project is licensed under the GPL-3.0-or-later License. See the `LICENSE` file for details.

