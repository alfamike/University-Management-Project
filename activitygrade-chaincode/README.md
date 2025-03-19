# ActivityGradeContract

## Overview

`ActivityGradeContract` implements a Hyperledger Fabric chaincode for managing activity grades on a blockchain ledger. The chaincode allows for creating, retrieving, updating, and deleting activity grades for students.

## Prerequisites

- Node.js
- npm
- Hyperledger Fabric

## Installation

1. Clone the repository:
    ```sh
    git clone <repository-url>
    cd activitygradecontract
    ```

2. Install the dependencies:
    ```sh
    npm install
    ```

## Usage

### Start the Chaincode

To start the chaincode, run:
```sh
npm start
```

### Chaincode Methods

The `ActivityGradeContract` class provides the following methods:

- `createActivityGrade(ctx, activity, student)`: Create a new `ActivityGrade`.
- `getActivityGrade(ctx, id)`: Retrieve an `ActivityGrade` by ID.
- `getAllActivityGrades(ctx)`: Retrieve all `ActivityGrades`.
- `updateActivityGrade(ctx, id, activity, student, grade)`: Update an existing `ActivityGrade`.
- `deleteActivityGrade(ctx, id)`: Delete an `ActivityGrade` by marking it as deleted.
- `getActivityGradesByActivityStudent(ctx, activity_id, student_id)`: Retrieve all `ActivityGrades` for a specific activity and student.
- `getActivityGradesByStudent(ctx, student_id)`: Retrieve all `ActivityGrades` for a specific student.
- `deleteActivityGradesByActivity(ctx, activity_id)`: Delete all `ActivityGrades` for a specific activity by marking them as deleted.
- `deleteActivityGradesByActivityStudent(ctx, activity_id, student_id)`: Delete all `ActivityGrades` for a specific activity and student by marking them as deleted.

## Project Structure

- `activityGradeChaincode.js`: Main chaincode file containing the `ActivityGradeContract` class.
- `activity_grade.js`: Defines the `ActivityGrade` class representing the grade of a student for an activity.
- `package.json`: Project metadata and dependencies.

## Dependencies

- `fabric-contract-api`: Hyperledger Fabric contract API.
- `fabric-shim`: Hyperledger Fabric shim API.
- `uuid`: Library to generate unique identifiers.

## License

This project is licensed under the GPL-3.0-or-later License. See the `LICENSE` file for details.