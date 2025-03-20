/**
 * Sets a timeout to auto-dismiss a toast notification after 3 seconds.
 * The toast will fade out smoothly before being removed from the DOM.
 */
setTimeout(() => {
    const toast = document.querySelector('.toast');
    if (toast) {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500); // Smooth fade-out
    }
}, 3000); // Auto-dismiss after 3 seconds