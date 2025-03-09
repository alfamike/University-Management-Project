// Get CSRF token
const csrfToken = document.getElementById('csrfToken').value;
const studentId = document.getElementById('studentId')?.value;

// Function to show or hide popups
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
document.getElementById('manage-grade-btn')?.addEventListener('click', () => togglePopup('manage-grade-popup'));
document.getElementById('manage-activity-btn')?.addEventListener('click', () => togglePopup('manage-grade-activity-popup'));
document.getElementById('edit-student-btn')?.addEventListener('click', () => togglePopup('edit-student-popup'));

document.addEventListener('DOMContentLoaded', function() {
    const titleSelect = document.getElementById('course-title');
    const courseSelect = document.getElementById('course-name');
    const courseSelect2 = document.getElementById('course-grade-select');

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

    // Fetch courses for a selected student
    function fetchCoursesByStudent(studentId) {
        fetch(`/courses/byStudent?student=${studentId}`, {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'csrf-token': csrfToken,
            }
        })
            .then(response => response.json())
            .then(data => {
                updateCourseStudentDropdown(data.courses);
            })
            .catch(err => console.error('Error fetching courses:', err));
    }

    function updateCourseStudentDropdown(courses) {
        // Clear the existing options
        courseSelect.innerHTML = '<option value="">Select a course</option>';

        // Add new course options
        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.id;
            option.textContent = course.name;
            courseSelect2.appendChild(option);
        });
    }

    // Event listener for "Show Activities" button
    document.getElementById('show-activities-course-btn').addEventListener('click', function() {
        const selectedCheckboxes = document.querySelectorAll('.course-checkbox:checked');
        const activitiesTableBody = document.getElementById('activities-table-body');
        const activitiesSection = document.getElementById('activities-section');

        if (selectedCheckboxes.length === 1) {
            const selectedCourseId = selectedCheckboxes[0].value;

            fetch('/activities/byCourse', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'csrf-token': csrfToken,
                },
                body: JSON.stringify({
                    course_id: selectedCourseId,
                })
            })
            .then(response => response.json())
            .then(data => {
                activitiesTableBody.innerHTML = ''; // Clear previous activities
                const activityGradeSelect = document.getElementById('activity-grade-select');
                activityGradeSelect.innerHTML = ''; // Clear previous options

                data.activities.forEach(activity => {
                    const row = `
                        <tr>
                            <td>${activity.name}</td>
                            <td>${activity.description}</td>
                            <td>${activity.due_date}</td>
                            <td>${activity.grade}</td>
                        </tr>
                    `;
                    activitiesTableBody.insertAdjacentHTML('beforeend', row);

                    // Populate activities dropdown for managing grades

                    const option = document.createElement('option');
                    option.value = activity.id;
                    option.textContent = activity.name;
                    activityGradeSelect.appendChild(option);

                });

                activitiesSection.style.display = 'block';
            })
            .catch(error => console.error('Error:', error));
        } else {
            activitiesSection.style.display = 'none';
            alert('Please select exactly one course to view activities.');
            return;
        }
    });
});

document.getElementById('delete-course-btn').addEventListener('click', function() {
    const checkboxes = document.querySelectorAll('.course-checkbox:checked');
    const selectedCourses = Array.from(checkboxes).map(checkbox => checkbox.value);

    if (selectedCourses.length > 0) {
        if (confirm('Are you sure you want to remove the selected courses?')) {
            selectedCourses.forEach((courseId) => {
                fetch(`/students/${studentId}/deenroll`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'csrf-token': csrfToken,
                    },
                    body: JSON.stringify({ course_id: courseId })
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.sent === true) {
                            console.log('Enrollment removed successfully related with course ID:', courseId);
                        } else {
                            alert(`Failed to remove enrollment for course with ID: ${courseId}`);
                        }
                    })
                    .catch(error => console.error('Error:', error));
            });

            window.location.href = `/students/${studentId}`;
        }
    } else {
        alert('No courses selected.');
    }
});

document.getElementById('add-course-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const course = document.getElementById('course-name').value;

    fetch(`/students/${studentId}/enroll`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'csrf-token': csrfToken,
        },
        body: JSON.stringify({ course_id: course })
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

document.getElementById('manage-grade-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const courseId = document.getElementById('course-grade-select').value;
    const grade = document.getElementById('grade-input').value;

    fetch(`/manageGradeToCourse/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
            'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
            student_id: student.id,
            course_id: courseId,
            grade: grade
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            location.reload();
        } else {
            alert('Failed to manage grade.');
        }
    })
    .catch(error => console.error('Error:', error));
});

document.getElementById('manage-grade-activity-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const activityId = document.getElementById('activity-grade-select').value;
    const grade = document.getElementById('activity-grade-input').value;

    fetch(`/manageGradeToActivity/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
            'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
            student_id: student.id,
            activity_id: activityId,
            grade: grade
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            location.reload();
        } else {
            alert('Failed to manage grade.');
        }
    })
    .catch(error => console.error('Error:', error));
});

document.getElementById('edit-student-form').addEventListener('submit', function(event) {
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

document.getElementById('delete-student-btn').addEventListener('click', function() {
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
                window.location.href = '/students';
            } else {
                alert(data.message || 'Error deleting student.');
            }
        })
        .catch(error => console.error('Error:', error));
    }
});
