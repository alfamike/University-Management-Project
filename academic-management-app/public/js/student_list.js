document.addEventListener('DOMContentLoaded', function () {
    const filterForm = document.getElementById('filter-form');
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

    const titleSelect = document.getElementById('title');
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

    // Fetch courses for a selected title
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

    // Update course dropdown options
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

    // Main fetch function
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

    // Update student table
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

    // Update pagination buttons
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
