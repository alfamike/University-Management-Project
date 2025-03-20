document.addEventListener('DOMContentLoaded', () => {
    /**
     * CSRF token value extracted from the DOM element with ID 'csrfToken'.
     * @type {string}
     */
    const csrfToken = document.getElementById('csrfToken').value;

    /**
     * Event listener for pagination buttons.
     * Delegates click events to the document and handles pagination button clicks.
     * @param {Event} e - The event object.
     */
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('btn-page')) {
            e.preventDefault();
            const page = e.target.getAttribute('data-page');
            fetchTitles(page);
        }
    });

    /**
     * Fetch titles from the server.
     * @param {number} [page=1] - The page number to fetch.
     */
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

    /**
     * Update the title list in the DOM.
     * @param {Array<Object>} titles - The list of titles to display.
     */
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

    /**
     * Update the pagination buttons in the DOM.
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