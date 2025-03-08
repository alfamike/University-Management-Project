document.addEventListener('DOMContentLoaded', function () {
    const filterForm = document.getElementById('filter-form');
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

    // Main fetch function
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

    // Update course table
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
