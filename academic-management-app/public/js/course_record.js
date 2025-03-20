// Get CSRF token and course ID
/**
 * CSRF token value extracted from the DOM element with ID 'csrfToken'.
 * @type {string}
 */
const csrfToken = document.getElementById('csrfToken')?.value;

/**
 * Course ID value extracted from the DOM element with ID 'courseId'.
 * @type {string}
 */
const courseId = document.getElementById('courseId')?.value;

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

// Open popups
document.getElementById('add-activity-btn')?.addEventListener('click', () => togglePopup('add-activity-popup'));
document.getElementById('edit-course-btn')?.addEventListener('click', () => togglePopup('edit-course-popup'));

// Close popups via close buttons
document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const popup = btn.closest('.popup');
        if (popup) popup.style.display = 'none';
    });
});

// Close popups by clicking outside of them
window.addEventListener('click', event => {
    ['add-activity-popup', 'modify-activity-popup', 'edit-course-popup'].forEach(popupId => {
        const popup = document.getElementById(popupId);
        if (event.target === popup) togglePopup(popupId, false);
    });
});

/**
 * Event listener for the "Add Activity" form submission.
 * Handles the addition of a new activity.
 * @param {Event} event - The event object.
 */
document.getElementById('add-activity-form')?.addEventListener('submit', event => {
    event.preventDefault();
    const activity_name = document.getElementById('activity-name')?.value;
    const activity_description = document.getElementById('activity-description')?.value;
    const activity_due_date = document.getElementById('activity-due-date')?.value;

    fetch('/activities', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'csrf-token': csrfToken,
        },
        body: JSON.stringify({course_id: courseId, activity_name, activity_description, activity_due_date})
    })
        .then(response => response.json())
        .then(data => {
            if (data.sent) {
                togglePopup('add-activity-popup', false);
                window.location.href = `/courses/${courseId}`;
            } else {
                alert('Failed to add an activity.');
            }
        })
        .catch(error => console.error('Error:', error));
});

/**
 * Event listener for the "Modify Activity" form submission.
 * Handles the modification of an existing activity.
 * @param {Event} event - The event object.
 */
document.getElementById('modify-activity-form')?.addEventListener('submit', event => {
    event.preventDefault();
    const activityId = document.getElementById('modify-activity-id')?.value;
    const activityName = document.getElementById('modify-activity-name')?.value;
    const activityDescription = document.getElementById('modify-activity-description')?.value;
    const activityDueDate = document.getElementById('modify-activity-due-date')?.value;

    fetch(`/activities/${activityId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'csrf-token': csrfToken,
        },
        body: JSON.stringify({courseId, activityName, activityDescription, activityDueDate})
    })
        .then(response => response.json())
        .then(data => {
            if (data.sent) {
                togglePopup('modify-activity-popup', false);
                window.location.href = `/courses/${courseId}`;
            } else {
                alert('Failed to modify the activity.');
            }
        })
        .catch(error => console.error('Error:', error));
});

/**
 * Event listener for the "Delete Activity" button.
 * Handles the deletion of selected activities.
 */
document.getElementById('delete-activity-btn').addEventListener('click', function () {
    const checkboxes = document.querySelectorAll('.activity-checkbox:checked');
    const selectedActivities = Array.from(checkboxes).map(checkbox => checkbox.value);

    if (selectedActivities.length > 0) {
        if (confirm('Are you sure you want to remove the selected activities?')) {
            Promise.all(selectedActivities.map((activityId) => {
                return fetch(`/activities/${activityId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'csrf-token': csrfToken,
                    }
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.sent === true) {
                            console.log('Activity removed successfully with ID:', activityId);
                        } else {
                            alert(`Error deleting activity`);
                        }
                    })
                    .catch(error => console.error('Error:', error));
            })).then(() => {
                window.location.href = `/courses/${courseId}`;
            });
        }
    } else {
        alert('No activities selected.');
    }
});

/**
 * Event listener for the "Modify Activity" button.
 * Prepares the form for modifying an activity.
 */
document.getElementById('modify-activity-btn').addEventListener('click', function () {
    const checkboxes = document.querySelectorAll('.activity-checkbox:checked');
    if (checkboxes.length !== 1) {
        alert('Please select exactly one activity to modify.');
        return;
    }

    const activityId = checkboxes[0].value;
    const activityRow = checkboxes[0].closest('tr');
    const activityName = activityRow.querySelector('td:nth-child(2)').textContent;
    const activityDescription = activityRow.querySelector('td:nth-child(3)').textContent;
    const activityDueDate = activityRow.querySelector('td:nth-child(4)').textContent;

    document.getElementById('modify-activity-id').value = activityId;
    document.getElementById('modify-activity-name').value = activityName;
    document.getElementById('modify-activity-description').value = activityDescription;
    document.getElementById('modify-activity-due-date').value = activityDueDate;

    document.getElementById('modify-activity-popup').style.display = 'block';
});

/**
 * Event listener for the "Edit Course" form submission.
 * Handles the editing of course details.
 * @param {Event} event - The event object.
 */
document.getElementById('edit-course-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const courseName = document.getElementById('edit-course-name').value;
    const courseDescription = document.getElementById('edit-course-description').value;
    const courseStartDate = document.getElementById('edit-course-start-date').value;
    const courseEndDate = document.getElementById('edit-course-end-date').value;

    fetch(`/courses/${courseId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'csrf-token': csrfToken,
        },
        body: JSON.stringify({
            course_name: courseName,
            course_description: courseDescription,
            course_start_date: courseStartDate,
            course_end_date: courseEndDate
        })
    })
        .then(response => {
            if (!response.ok) throw new Error('Failed to update course');
            return response.json();
        })
        .then(data => {
            if (data.sent === true) {
                togglePopup('edit-course-popup', false);
                window.location.href = `/courses/${courseId}`;
            } else {
                alert(data.message || 'Error updating course.');
            }
        })
        .catch(error => console.error('Error:', error));
});

/**
 * Event listener for the "Delete Course" button.
 * Handles the deletion of the course.
 */
document.getElementById('delete-course-btn').addEventListener('click', function () {
    if (confirm('Are you sure you want to delete this course?')) {
        fetch(`/courses/${courseId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'csrf-token': csrfToken,
            }
        })
            .then(response => {
                if (!response.ok) throw new Error('Failed to delete course');
                return response.json();
            })
            .then(data => {
                if (data.sent === true) {
                    alert(data.message);
                    window.location.href = '/courses';
                } else {
                    alert('Error deleting course');
                }
            })
            .catch(error => console.error('Error:', error));
    }
});

/**
 * Event listener for the "Assign Activity" button.
 * Handles the assignment of selected activities to enrolled students.
 */
document.getElementById('assign-activity-btn').addEventListener('click', function () {
    const checkboxes = document.querySelectorAll('.activity-checkbox:checked');
    const selectedActivities = Array.from(checkboxes).map(checkbox => checkbox.value);

    if (selectedActivities.length > 0) {
        if (confirm('Are you sure you want to assign this activity to current enrolled students?')) {
            Promise.all(selectedActivities.map((activityId) => {
                return fetch(`/activities/${activityId}/assign`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'csrf-token': csrfToken,
                    },
                    body: JSON.stringify({
                        course_id: courseId
                    })
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.sent === true) {
                            console.log('Activity assign successfully to students');
                            alert(data.message);
                        } else {
                            alert(`Error assigning activity`);
                        }
                    })
                    .catch(error => console.error('Error:', error));
            })).then(() => {
                window.location.href = `/courses/${courseId}`;
            });
        }
    } else {
        alert('No activities selected.');
    }
});