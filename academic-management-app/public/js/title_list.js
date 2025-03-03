document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.btn-page').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('href').split('=')[1];
            // Get CSRF token
            const csrfToken = document.getElementById('csrfToken').value;
            fetch(`/titles?page=${page}`, {
                headers: {
                    'x-requested-with': 'XMLHttpRequest',
                    'X-CSRFToken': csrfToken
                }
            })
                .then(response => response.json())
                .then(data => {
                    const titleList = document.getElementById('title-list');
                    titleList.innerHTML = '';

                    if (data.titles.length > 0) {
                        data.titles.forEach(title => {
                            titleList.innerHTML += `
                                <tr>
                                    <td><a href="/titles/${title.id}">${title.name}</a></td>
                                    <td>${title.description}</td>
                                </tr>
                            `;
                        });
                    } else {
                        titleList.innerHTML = `
                            <tr>
                                <td colspan="2">No titles found.</td>
                            </tr>
                        `;
                    }

                    // Update pagination
                    document.querySelector('.pagination').innerHTML = `
                        ${data.pagination.current_page > 1 ? `
                            <a href="?page=1" class="btn-page">First</a>
                            <a href="?page=${data.pagination.previous_page}" class="btn-page">Previous</a>
                        ` : ''}
                        <span class="current-page">
                            Page ${data.pagination.current_page} of ${data.pagination.total_pages}
                        </span>
                        ${data.pagination.has_next ? `
                            <a href="?page=${data.pagination.next_page}" class="btn-page">Next</a>
                            <a href="?page=${data.pagination.total_pages}" class="btn-page">Last</a>
                        ` : ''}
                    `;
                })
                .catch(err => console.error('Error fetching titles:', err));
        });
    });
});