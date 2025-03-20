// Get CSRF token and title ID
const csrfToken = document.getElementById('csrfToken')?.value;
const titleId = document.getElementById('titleId')?.value

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

// Add event listener to the edit title button to show the edit popup
document.getElementById('edit-title-btn')?.addEventListener('click', () => togglePopup('edit-title-popup'));

// Close popups via close buttons
document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const popup = btn.closest('.popup');
        if (popup) popup.style.display = 'none';
    });
});

// Close popups by clicking outside of them
window.addEventListener('click', event => {
    ['edit-title-popup'].forEach(popupId => {
        const popup = document.getElementById(popupId);
        if (event.target === popup) togglePopup(popupId, false);
    });
});

// Handle edit form submission
document.getElementById('edit-title-form')?.addEventListener('submit', (event) => {
    event.preventDefault();

    const titleName = document.getElementById('edit-title-name').value;
    const titleDescription = document.getElementById('edit-title-description').value;

    fetch(`/titles/${titleId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'csrf-token': csrfToken,
        },
        body: JSON.stringify({
            title_name: titleName,
            title_description: titleDescription,
        })
    })
        .then(response => {
            if (!response.ok) throw new Error('Failed to update title');
            return response.json();
        })
        .then(data => {
            if (data.sent === true) {
                togglePopup('edit-title-popup', false);
                window.location.href = `/titles/${titleId}`;
            } else {
                alert(data.message || 'Error updating title.');
            }
        })
        .catch(error => console.error('Error:', error));
});

// Handle delete action
document.getElementById('delete-title-btn')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete this title?')) {
        fetch(`/titles/${titleId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'csrf-token': csrfToken,
            }
        })
            .then(response => {
                if (!response.ok) throw new Error('Failed to delete title');
                return response.json();
            })
            .then(data => {
                if (data.sent === true) {
                    alert(data.message)
                    window.location.href = '/titles';
                } else {
                    alert('Error deleting title');
                }
            })
            .catch(error => console.error('Error:', error));
    }
});