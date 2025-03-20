# University Management Project

## Introduction

This project aims the management of an education system like a university using Hyperledge Fabric blockchain as data storage.The connection is established through Hyperledge FireFly FabConnect, a connector that uses a Rest API to interact with the blockchain network.

For this Proof-of-Concept the scope was an academic functional block. Through a management web application that allows creating titles, courses, students, activities and grades for registered users.

The project interacts with the Platform-as-a-Service Kaleido, that simplifies the deployment and management of blockchain networks, offering enterprise-grade infrastructure with minimal complexity.

## Prerequisites

Ensure you have the following set up:

1. Kaleido Account
2. Postman
3. Node.js (version 12.x or later)
4. npm (version 6.x or later)
5. Your favorite web development IDE

## Installation

After creating your Kaleido Account:
1. Create consortia and environment via platform API with Postman in US public cloud availability zones.
2. Create orderer and peer nodes via web interface
3. Create a Hyperledge Fabric CA service via web interface
4. Create an app credential in Kaleido via web interface and associate your peer node with it
5. Create a protocol configuration and deploy it to your peer node via web interface
6. Create a channel via API with Postman and join your peer node via web interface
7. Create an identity via API with Postman and then enroll the identity also using the API.
8. Deploy chaincodes to your channel via web interface

## Project structure

### Infraestructure

- 1 `Fabric CA service`
- 1 `Orderer Node`
- 1 `Peer Node`
- 1 `Channel`

### Chaincodes

- `activity-chaincode`
- `activitygrade-chaincode`
- `course-chaincode`
- `enrollment-chaincode`
- `student-chaincode`
- `title-chaincode`

### API References
- Kaleido platform API reference
- Hyperledge FireFly FabConnect API reference

### Node.js Express App

- A Node.js app using Express framework and Nunjucks for the views engine.

## License

This project is licensed under the GPL-3.0-or-later License. See the `LICENSE` file for details.

