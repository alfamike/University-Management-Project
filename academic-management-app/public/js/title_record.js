// Get CSRF token and title ID
const csrfToken = document.getElementById('csrfToken')?.value;
const titleId = document.getElementById('titleId')?.value

// Open edit popup
document.getElementById('edit-title-btn')?.addEventListener('click', () => {
    document.getElementById('edit-title-popup').style.display = 'block';
});

// Close edit popup
document.querySelector('#edit-title-popup .close-btn')?.addEventListener('click', () => {
    document.getElementById('edit-title-popup').style.display = 'none';
});

// Close popup when clicking outside of it
window.addEventListener('click', (event) => {
    const popup = document.getElementById('edit-title-popup');
    if (event.target === popup) {
        popup.style.display = 'none';
    }
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
                document.getElementById('edit-title-popup').style.display = 'none';
                window.location.href = `/titles/${titleId}`;
            } else{
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
                    window.location.href = '/titles';
                } else {
                    alert(data.message || 'Error deleting title.');
                }
            })
            .catch(error => console.error('Error:', error));
    }
});
