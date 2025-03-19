# EnrollmentContract

## Overview

`EnrollmentContract` is a Hyperledger Fabric chaincode project that manages student enrollments in courses on a blockchain ledger. It provides functionalities to create, retrieve, update, and delete enrollments, ensuring data integrity and immutability.

## Prerequisites

- Node.js (version 12.x or later)
- npm (version 6.x or later)
- Hyperledger Fabric (version 2.x)

## Installation

1. Clone the repository:
    ```sh
    git clone <repository-url>
    cd enrollmentcontract
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

### Chaincode Methods

The `EnrollmentContract` class provides the following methods:

- `createEnrollment(ctx, student_id, course_id)`: Creates a new enrollment and saves it to the ledger.
- `getEnrollment(ctx, id)`: Retrieves an enrollment from the ledger by its ID.
- `getEnrollmentByStudentCourse(ctx, student_id, course_id)`: Retrieves an enrollment by student ID and course ID.
- `getAllEnrollments(ctx)`: Retrieves all enrollments from the ledger.
- `updateEnrollment(ctx, id, student_id, course_id, grade)`: Updates an existing enrollment in the ledger.
- `deleteEnrollment(ctx, id)`: Marks an enrollment as deleted in the ledger.
- `enrollmentExists(ctx, id)`: Checks if an enrollment exists in the ledger.
- `getEnrollmentsByStudent(ctx, student_id)`: Retrieves all enrollments for a specific student.
- `getEnrollmentsByCourse(ctx, course_id)`: Retrieves all enrollments for a specific course.
- `deleteEnrollmentByStudentCourse(ctx, student_id, course_id)`: Marks all enrollments for a specific student and course as deleted.
- `deleteEnrollmentsByCourse(ctx, course_id)`: Marks all enrollments for a specific course as deleted.

## Project Structure

- `enrollmentChaincode.js`: Main chaincode file containing the `EnrollmentContract` class.
- `enrollment.js`: Defines the `Enrollment` class representing an enrollment of a student in a course.
- `package.json`: Project metadata and dependencies.

## Dependencies

- `fabric-contract-api`: Hyperledger Fabric contract API.
- `fabric-shim`: Hyperledger Fabric shim API.
- `uuid`: Library to generate unique identifiers.

## License

This project is licensed under the GPL-3.0-or-later License. See the `LICENSE` file for details.