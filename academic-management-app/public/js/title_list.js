document.addEventListener('DOMContentLoaded', () => {
    const csrfToken = document.getElementById('csrfToken').value;

    // Event delegation for pagination buttons
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('btn-page')) {
            e.preventDefault();
            const page = e.target.getAttribute('data-page');
            fetchTitles(page);
        }
    });

    // Main fetch function
    function fetchTitles(page = 1) {
        fetch(`/titles?page=${page}`, {
            headers: {
                'x-requested-with': 'XMLHttpRequest',
                'X-CSRFToken': csrfToken
            }
        })
            .then(response => response.json())
            .then(data => {
                updateTitleList(data.titles);
                updatePagination(data.pagination);
            })
            .catch(err => console.error('Error fetching titles:', err));
    }

    // Update title list
    function updateTitleList(titles) {
        const titleList = document.getElementById('title-list');
        titleList.innerHTML = titles.length
            ? titles.map(title => `
                <tr>
                    <td><a href="/titles/${title.id}">${title.name}</a></td>
                    <td>${title.description}</td>
                </tr>
            `).join('')
            : `
                <tr>
                    <td colspan="2">No titles found.</td>
                </tr>
            `;
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
