document.addEventListener('DOMContentLoaded', function () {
    /**
     * The form element used for filtering courses.
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
        fetchCourses(1); // Always reset to page 1 on new filter submit
    });

    // Pagination click
    document.addEventListener('click', function (event) {
        if (event.target.classList.contains('btn-page')) {
            event.preventDefault();
            const page = event.target.getAttribute('data-page');
            fetchCourses(page);
        }
    });

    /**
     * Fetches courses based on the current filter and page.
     * @param {number} [page=1] - The page number to fetch.
     */
    function fetchCourses(page = 1) {
        const titleFilter = document.getElementById('title').value;
        const yearFilter = document.getElementById('year').value;

        fetch(`/courses?page=${page}&title=${titleFilter}&year=${yearFilter}`, {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'csrf-token': csrfToken,
            }
        })
            .then(response => response.json())
            .then(data => {
                updateCourseList(data.courses);
                updatePagination(data.pagination);
            })
            .catch(err => console.error('Error fetching courses:', err));
    }

    /**
     * Updates the course list in the DOM.
     * @param {Array<Object>} courses - The list of courses to display.
     */
    function updateCourseList(courses) {
        const courseList = document.getElementById('course-list');
        courseList.innerHTML = courses.length
            ? courses.map(course => `
                <tr>
                    <td><a href="/courses/${course.id}">${course.name}</a></td>
                    <td>${course.description}</td>
                    <td>${course.start_date}</td>
                    <td>${course.end_date}</td>
                </tr>
            `).join('')
            : `<tr><td colspan="4">No courses found.</td></tr>`;
    }

    /**
     * Updates the pagination buttons in the DOM.
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