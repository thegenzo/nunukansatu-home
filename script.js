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

    // Pengaduan Modal
    const pengaduanModal = document.getElementById('pengaduanModal');
    const pengaduanBtn = document.querySelector('footer button.btn-outline-danger'); // Select the Pengaduan button in footer
    const pengaduanCloseBtn = pengaduanModal ? pengaduanModal.querySelector('.close-modal') : null;

    if (pengaduanModal && pengaduanBtn && pengaduanCloseBtn) {
        // Open pengaduan modal
        pengaduanBtn.addEventListener('click', function (e) {
            e.preventDefault();
            pengaduanModal.style.display = 'flex';
            setTimeout(() => {
                pengaduanModal.classList.add('show');
            }, 10);
        });

        // Close pengaduan modal when clicking X
        pengaduanCloseBtn.addEventListener('click', function () {
            pengaduanModal.classList.remove('show');
            setTimeout(() => {
                pengaduanModal.style.display = 'none';
            }, 300);
        });

        // Close pengaduan modal when clicking outside
        window.addEventListener('click', function (e) {
            if (e.target === pengaduanModal) {
                pengaduanModal.classList.remove('show');
                setTimeout(() => {
                    pengaduanModal.style.display = 'none';
                }, 300);
            }
        });
    } else {
        console.error('Pengaduan modal elements not found');
    }

    // Pengaduan Popup
    const pengaduanPopup = document.getElementById('pengaduanPopup');
    const pengaduanPopupBtn = document.querySelector('footer button.btn-outline-danger'); // Same button as modal

    if (pengaduanPopup && pengaduanPopupBtn) {
        // Toggle pengaduan popup
        pengaduanPopupBtn.addEventListener('click', function (e) {
            e.preventDefault();
            if (pengaduanPopup.classList.contains('show')) {
                pengaduanPopup.classList.remove('show');
                pengaduanPopupBtn.classList.remove('btn-pengaduan-active');
            } else {
                pengaduanPopup.classList.add('show');
                pengaduanPopupBtn.classList.add('btn-pengaduan-active');
            }
        });

        // Close popup when clicking outside
        document.addEventListener('click', function (e) {
            if (!pengaduanPopup.contains(e.target) && !pengaduanPopupBtn.contains(e.target)) {
                pengaduanPopup.classList.remove('show');
                pengaduanPopupBtn.classList.remove('btn-pengaduan-active');
            }
        });
    } else {
        console.error('Pengaduan popup elements not found');
    }
});
