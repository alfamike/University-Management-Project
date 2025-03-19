# StudentContract

## Overview

`StudentContract` is a Hyperledger Fabric chaincode project for managing student records. It provides functionalities to create, retrieve, update, and delete student records on the blockchain ledger.

## Prerequisites

- Node.js (version 12.x or later)
- npm (version 6.x or later)
- Hyperledger Fabric (version 2.x)

## Installation

1. Clone the repository:
    ```sh
    git clone <repository-url>
    cd studentcontract
    ```

2. Install the dependencies:
    ```sh
    npm install
    ```

## Usage

### Start the Chaincode

To start the chaincode, run the following command:
```sh
npm start
```

### Chaincode Functions

The `StudentContract` class provides the following functions:

- `createStudent(ctx, first_name, last_name, email)`: Creates a new student record.
- `getStudent(ctx, id)`: Retrieves a student record by ID.
- `getAllStudents(ctx)`: Retrieves all student records.
- `updateStudent(ctx, id, first_name, last_name, email)`: Updates an existing student record.
- `deleteStudent(ctx, id)`: Marks a student record as deleted.
- `studentExists(ctx, id)`: Checks if a student record exists.

## Project Structure

- `studentChaincode.js`: Main chaincode file containing the `StudentContract` class.
- `student.js`: Defines the `Student` class representing a student.
- `package.json`: Project metadata and dependencies.

## Dependencies

- `fabric-contract-api`: Hyperledger Fabric contract API.
- `fabric-shim`: Hyperledger Fabric shim API.
- `uuid`: Library to generate unique identifiers.

## License

This project is licensed under the GPL-3.0-or-later License. See the `LICENSE` file for more details.