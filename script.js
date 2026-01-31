document.addEventListener('DOMContentLoaded', function () {
    // Get the modal and buttons
    const modal = document.getElementById('publicModal');
    const btn = document.querySelector('a[href="#"].menu-btn.btn-left'); // Select the Layanan Publik button
    const closeBtn = document.querySelector('.close-modal');

    // Check if elements exist to avoid errors
    if (modal && btn && closeBtn) {
        // Open modal
        btn.addEventListener('click', function (e) {
            e.preventDefault(); // Prevent default anchor behavior
            modal.style.display = 'flex';
            // Slight delay to allow display:flex to apply before opacity transition
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
        });

        // Close modal when clicking X
        closeBtn.addEventListener('click', function () {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300); // Wait for transition to finish
        });

        // Close modal when clicking outside
        window.addEventListener('click', function (e) {
            if (e.target === modal) {
                modal.classList.remove('show');
                setTimeout(() => {
                    modal.style.display = 'none';
                }, 300);
            }
        });
    } else {
        console.error('Modal elements not found');
    }
});
