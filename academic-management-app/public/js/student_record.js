// Get CSRF token
/**
 * CSRF token value extracted from the DOM element with ID 'csrfToken'.
 * @type {string}
 */
const csrfTokenElement = document.getElementById('csrfToken');
const csrfToken = csrfTokenElement ? csrfTokenElement.value : '';

/**
 * Student ID value extracted from the DOM element with ID 'studentId'.
 * @type {string}
 */
const studentIdElement = document.getElementById('studentId');
const studentId = studentIdElement ? studentIdElement.value : '';

/**
 * Function to show or hide popups.
 * @param {string} popupId - The ID of the popup element.
 * @param {boolean} [show=true] - Whether to show or hide the popup.
 */
const togglePopup = (popupId, show = true) => {
    const popup = document.getElementById(popupId);
    if (popup) {
        popup.style.display = show ? 'block' : 'none';
    }
};

// Close popups via close buttons
document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const popup = btn.closest('.popup');
        if (popup) popup.style.display = 'none';
    });
});

// Close popups by clicking outside of them
window.addEventListener('click', event => {
    ['add-course-popup', 'manage-grade-popup', 'manage-grade-activity-popup', 'edit-student-popup'].forEach(popupId => {
        const popup = document.getElementById(popupId);
        if (event.target === popup) togglePopup(popupId, false);
    });
});

// Open popups
document.getElementById('add-course-btn')?.addEventListener('click', () => {
    togglePopup('add-course-popup');

    // Populate course titles when opening the form
    fetch('/titles?isFilter=true', {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'csrf-token': csrfToken,
        }
    })
        .then(response => response.json())
        .then(data => {
            const titleSelect = document.getElementById('course-title');
            titleSelect.innerHTML = '<option value="">Select a title</option>';
            data.titles.forEach(title => {
                const option = document.createElement('option');
                option.value = title.id;
                option.textContent = title.name;
                titleSelect.appendChild(option);
            });
        })
        .catch(err => console.error('Error fetching titles:', err));
});

/**
 * Event listener for the "Manage Grade" button.
 * Shows the manage grade popup if exactly one course is selected.
 */
document.getElementById('manage-grade-btn')?.addEventListener('click', () => {
    if (document.querySelectorAll('.course-checkbox:checked').length !== 1) {
        alert('Please select one course to manage its grade.');
        return;
    }
    togglePopup('manage-grade-popup');
});

/**
 * Event listener for the "Manage Activity" button.
 * Shows the manage grade activity popup if exactly one activity is selected.
 */
document.getElementById('manage-activity-btn')?.addEventListener('click', () => {
    if (document.querySelectorAll('.activity-checkbox:checked').length !== 1) {
        alert('Please select one activity to manage its grade.');
        return;
    }
    togglePopup('manage-grade-activity-popup');
});

/**
 * Event listener for the "Edit Student" button.
 * Shows the edit student popup.
 */
document.getElementById('edit-student-btn')?.addEventListener('click', () => togglePopup('edit-student-popup'));

/**
 * Event listener for the "DOMContentLoaded" event.
 * Initializes event listeners for title and course selection.
 */
document.addEventListener('DOMContentLoaded', function () {
    const titleSelect = document.getElementById('course-title');
    const courseSelect = document.getElementById('course-name');

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
});

/**
 * Event listener for the "Delete Course" button.
 * Handles the deletion of selected courses.
 */
document.getElementById('delete-course-btn').addEventListener('click', async function () {
    const checkboxes = document.querySelectorAll('.course-checkbox:checked');
    const selectedCourses = Array.from(checkboxes).map(checkbox => checkbox.value);
    const selectedEnrollments = Array.from(checkboxes).map(checkbox => checkbox.getAttribute('data-enrollment-id'));

    if (selectedCourses.length > 0) {
        if (confirm('Are you sure you want to remove the selected courses?')) {
            try {
                for (const courseId of selectedCourses) {
                    const response = await fetch(`/students/${studentId}/deenroll`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'csrf-token': csrfToken,
                        },
                        body: JSON.stringify({
                            course_id: courseId,
                            enrollment_id: selectedEnrollments[selectedCourses.indexOf(courseId)]
                        })
                    });

                    const data = await response.json();
                    if (data.sent === true) {
                        console.log('Enrollment removed successfully related with course ID:', courseId);
                    } else {
                        alert(`Failed to remove enrollment for course with ID: ${courseId}`);
                    }
                }
                window.location.href = `/students/${studentId}`;
            } catch (error) {
                console.error('Error:', error);
            }
        }
    } else {
        alert('No courses selected.');
    }
});

/**
 * Event listener for the "Add Course" form submission.
 * Handles the enrollment of a student in a course.
 * @param {Event} event - The event object.
 */
document.getElementById('add-course-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const course = document.getElementById('course-name').value;

    fetch(`/students/${studentId}/enroll`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'csrf-token': csrfToken,
        },
        body: JSON.stringify({course_id: course})
    })
        .then(response => {
            if (!response.ok) throw new Error('Failed to enroll student');
            return response.json();
        })
        .then(data => {
            if (data.sent === true) {
                togglePopup('add-course-popup', false);
                window.location.href = `/students/${studentId}`;
            } else {
                alert('Failed to enroll student.');
            }
        })
        .catch(error => console.error('Error:', error));
});

/**
 * Event listener for the "Manage Grade" form submission.
 * Handles the management of a student's grade for a course.
 * @param {Event} event - The event object.
 */
document.getElementById('manage-grade-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const selectedCheckboxes = document.querySelectorAll('.course-checkbox:checked');
    const grade = document.getElementById('grade-input').value;

    const selectedCourseId = selectedCheckboxes[0].value;

    fetch(`/students/${studentId}/grade`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'csrf-token': csrfToken,
        },
        body: JSON.stringify({
            course_id: selectedCourseId,
            grade: grade
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.sent === true) {
                togglePopup('manage-grade-popup', false);
                window.location.href = `/students/${studentId}`;
            } else {
                alert('Failed to manage grade.');
            }
        })
        .catch(error => console.error('Error:', error));
});

/**
 * Event listener for the "Show Activities" button.
 * Fetches and displays activities for a selected course.
 */
document.getElementById('show-activities-course-btn').addEventListener('click', function () {
    const selectedCheckboxes = document.querySelectorAll('.course-checkbox:checked');
    const activitiesTableBody = document.getElementById('activities-table-body');
    const activitiesSection = document.getElementById('activities-section');

    if (selectedCheckboxes.length === 1) {
        const selectedCourseId = selectedCheckboxes[0].value;

        fetch(`/activities/byCourseStudent?courseId=${selectedCourseId}&studentId=${studentId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'csrf-token': csrfToken,
            },
        })
            .then(response => response.json())
            .then(data => {
                if (data.sent === true) {
                    activitiesTableBody.innerHTML = ''; // Clear previous activities

                    data.activities.forEach(activity => {
                        const row = `
                            <tr>
                                <td><label>
                                <input type="checkbox" class="activity-checkbox" value="${activity.id}">
                                </label></td>
                                <td>${activity.name}</td>
                                <td>${activity.description}</td>
                                <td>${activity.due_date}</td>
                                <td>${activity.grade}</td>
                            </tr>
                        `;
                        activitiesTableBody.insertAdjacentHTML('beforeend', row);
                    });

                    activitiesSection.style.display = 'block';
                } else {
                    alert(data.message);
                }
            })
            .catch(error => console.error('Error:', error));
    } else {
        activitiesSection.style.display = 'none';
        alert('Please select exactly one course to view activities.');
    }
});

/**
 * Event listener for the "Manage Grade Activity" form submission.
 * Handles the management of a student's grade for an activity.
 * @param {Event} event - The event object.
 */
document.getElementById('manage-grade-activity-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const selectedCheckboxes = document.querySelectorAll('.activity-checkbox:checked');
    const grade = document.getElementById('activity-grade-input').value;

    if (selectedCheckboxes.length === 1) {
        const selectedActivityId = selectedCheckboxes[0].value;
        fetch(`/activities/${selectedActivityId}/grade`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'csrf-token': csrfToken,
            },
            body: JSON.stringify({
                student_id: studentId,
                grade: grade
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.sent === true) {
                    togglePopup('manage-grade-activity-popup', false);
                    window.location.href = `/students/${studentId}`;
                } else {
                    alert('Failed to manage activity grade.');
                }
            })
            .catch(error => console.error('Error:', error));
    } else {
        alert('Please select exactly one activity to manage its grade.');
    }
});

/**
 * Event listener for the "Edit Student" form submission.
 * Handles the editing of a student's information.
 * @param {Event} event - The event object.
 */
document.getElementById('edit-student-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const firstName = document.getElementById('edit-first-name').value;
    const lastName = document.getElementById('edit-last-name').value;
    const email = document.getElementById('edit-email').value;

    fetch(`/students/${studentId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'csrf-token': csrfToken,
            'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            email: email
        })
    })
        .then(response => {
            if (!response.ok) throw new Error('Failed to update student');
            return response.json();
        })
        .then(data => {
            if (data.sent === true) {
                togglePopup('edit-student-popup', false);
                window.location.href = `/students/${studentId}`;
            } else {
                alert('Failed to edit student information.');
            }
        })
        .catch(error => console.error('Error:', error));
});

/**
 * Event listener for the "Delete Student" button.
 * Handles the deletion of a student.
 */
document.getElementById('delete-student-btn').addEventListener('click', function () {
    if (confirm('Are you sure you want to delete this student?')) {
        fetch(`/students/${studentId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'csrf-token': csrfToken,
                'X-Requested-With': 'XMLHttpRequest',
            },
        })
            .then(response => {
                if (!response.ok) throw new Error('Failed to delete student');
                return response.json();
            })
            .then(data => {
                if (data.sent === true) {
                    alert(data.message);
                    window.location.href = '/students';
                } else {
                    alert('Error deleting student');
                }
            })
            .catch(error => console.error('Error:', error));
    }
});