document.addEventListener('DOMContentLoaded', function () {
    /**
     * The form element used for filtering students.
     * @type {HTMLFormElement}
     */
    const filterForm = document.getElementById('filter-form');

    /**
     * CSRF token value extracted from the DOM element with ID 'csrfToken'.
     * @type {string}
     */
    const csrfToken = document.getElementById('csrfToken').value;

    // Filter form submit
    filterForm.addEventListener('submit', function (event) {
        event.preventDefault();
        fetchStudents(1); // Always reset to page 1 on new filter submit
    });

    // Pagination click
    document.addEventListener('click', function (event) {
        if (event.target.classList.contains('btn-page')) {
            event.preventDefault();
            const page = event.target.getAttribute('data-page');
            fetchStudents(page);
        }
    });

    /**
     * The select element for titles.
     * @type {HTMLSelectElement}
     */
    const titleSelect = document.getElementById('title');

    /**
     * The select element for courses.
     * @type {HTMLSelectElement}
     */
    const courseSelect = document.getElementById('course');

    // Fetch courses when the page loads
    const selectedTitle = titleSelect.value;
    if (selectedTitle) {
        fetchCoursesByTitle(selectedTitle);
    }

    // Fetch courses based on title selection
    titleSelect.addEventListener('change', function () {
        const selectedTitle = titleSelect.value;
        fetchCoursesByTitle(selectedTitle);
    });

    /**
     * Fetch courses for a selected title.
     * @param {string} titleId - The ID of the selected title.
     */
    function fetchCoursesByTitle(titleId) {
        let year = "";
        fetch(`/courses/?title=${titleId}&year=${year}&onlyFilter=true`, {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'csrf-token': csrfToken,
            }
        })
            .then(response => response.json())
            .then(data => {
                updateCourseDropdown(data.courses);
            })
            .catch(err => console.error('Error fetching courses:', err));
    }

    /**
     * Update course dropdown options.
     * @param {Array<Object>} courses - The list of courses to display.
     */
    function updateCourseDropdown(courses) {
        // Clear the existing options
        courseSelect.innerHTML = '<option value="">Select a course</option>';

        // Add new course options
        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.id;
            option.textContent = course.name;
            courseSelect.appendChild(option);
        });
    }

    /**
     * Fetch students based on the current filter and page.
     * @param {number} [page=1] - The page number to fetch.
     */
    function fetchStudents(page = 1) {
        const courseFilter = document.getElementById('course').value;

        fetch(`/students?course=${courseFilter}`, {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'csrf-token': csrfToken,
            }
        })
            .then(response => response.json())
            .then(data => {
                updateStudentList(data.students);
                updatePagination(data.pagination);
            })
            .catch(err => console.error('Error fetching students:', err));
    }

    /**
     * Update the student list in the DOM.
     * @param {Array<Object>} students - The list of students to display.
     */
    function updateStudentList(students) {
        const studentList = document.getElementById('student-list');
        studentList.innerHTML = students.length
            ? students.map(student => `
                <tr>
                    <td><a href="/students/${student.id}">${student.first_name} ${student.last_name}</a></td>
                    <td>${student.email}</td>
                </tr>
            `).join('')
            : `<tr><td colspan="4">No students found.</td></tr>`;
    }

    /**
     * Update the pagination buttons in the DOM.
     * @param {Object} pagination - The pagination data.
     * @param {boolean} pagination.has_previous - Indicates if there is a previous page.
     * @param {number} pagination.previous_page - The previous page number.
     * @param {number} pagination.current_page - The current page number.
     * @param {number} pagination.total_pages - The total number of pages.
     * @param {boolean} pagination.has_next - Indicates if there is a next page.
     * @param {number} pagination.next_page - The next page number.
     */
    function updatePagination(pagination) {
        const paginationContainer = document.querySelector('.pagination');
        paginationContainer.innerHTML = `
            ${pagination.has_previous ? `
                <a href="?page=1" data-page="1" class="btn-page">First</a>
                <a href="?page=${pagination.previous_page}" data-page="${pagination.previous_page}" class="btn-page">Previous</a>
            ` : ''}
            <span class="current-page">
                Page ${pagination.current_page} of ${pagination.total_pages}
            </span>
            ${pagination.has_next ? `
                <a href="?page=${pagination.next_page}" data-page="${pagination.next_page}" class="btn-page">Next</a>
                <a href="?page=${pagination.total_pages}" data-page="${pagination.total_pages}" class="btn-page">Last</a>
            ` : ''}
        `;
    }
});