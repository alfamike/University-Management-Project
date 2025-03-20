// Get DOM elements
/**
 * The input element where the user types their message.
 * @type {HTMLInputElement}
 */
const userInput = document.getElementById('user-input');

/**
 * The container element where chat messages are displayed.
 * @type {HTMLElement}
 */
const chatContainer = document.getElementById('chat-container');

/**
 * Sends the user message to the server.
 * Appends the user message to the chat container, clears the input box,
 * and sends the message to the server using AJAX (fetch API).
 */
function sendMessage() {
    const message = userInput.value;
    if (!message) return; // Don't send empty messages

    // Append user message to chat container
    chatContainer.innerHTML += `<div class="user-message">${message}</div>`;
    scrollToBottom();

    userInput.value = ''; // Clear input box

    // Get CSRF token from the document
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    // Send message to the Django server using AJAX (fetch API)
    fetch('/chat/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({message: message}),
    })
        .then(response => response.json())
        .then(data => {
            // Append server response to chat container
            chatContainer.innerHTML += `<div class="bot-message">${data.response}</div>`;
            scrollToBottom();
        })
        .catch(error => {
            console.error('Error:', error);
            chatContainer.innerHTML += `<div class="bot-message">Sorry, there was an issue processing your message. Please try again later.</div>`;
            scrollToBottom();
        });
}

/**
 * Handles the Enter key press to send the message.
 * @param {KeyboardEvent} event - The keyboard event object.
 */
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

/**
 * Scrolls to the bottom of the chat container.
 */
function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}