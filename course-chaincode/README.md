# CourseContract

## Overview

`CourseContract` is a Hyperledger Fabric chaincode project that manages courses on a blockchain ledger. It provides functionalities to create, retrieve, update, and delete courses, ensuring data integrity and immutability.

## Prerequisites

- Node.js (version 12.x or later)
- npm (version 6.x or later)
- Hyperledger Fabric (version 2.x)

## Installation

1. Clone the repository:
    ```sh
    git clone <repository-url>
    cd coursecontract
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

The `CourseContract` class provides the following methods:

- `createCourse(ctx, name, description, start_date, end_date, title_id)`: Creates a new course and saves it to the ledger.
- `getCourse(ctx, id)`: Retrieves a course from the ledger by its ID.
- `getAllCourses(ctx)`: Retrieves all courses from the ledger.
- `updateCourse(ctx, id, name, description, start_date, end_date)`: Updates an existing course in the ledger.
- `deleteCourse(ctx, id)`: Marks a course as deleted in the ledger.
- `courseExists(ctx, id)`: Checks if a course exists in the ledger.
- `getCoursesByTitleYear(ctx, title_id, year)`: Retrieves courses by title and year.

## Project Structure

- `courseChaincode.js`: Main chaincode file containing the `CourseContract` class.
- `course.js`: Defines the `Course` class representing a course.
- `package.json`: Project metadata and dependencies.

## Dependencies

- `fabric-contract-api`: Hyperledger Fabric contract API.
- `fabric-shim`: Hyperledger Fabric shim API.
- `uuid`: Library to generate unique identifiers.

## License

This project is licensed under the GPL-3.0-or-later License. See the `LICENSE` file for details.