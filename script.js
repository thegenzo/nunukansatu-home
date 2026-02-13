document.addEventListener('DOMContentLoaded', function () {
    // Helper function to setup modal interactions
    function setupModal(modalId, buttonSelector) {
        const modal = document.getElementById(modalId);
        const btn = document.querySelector(buttonSelector);
        const closeBtn = modal ? modal.querySelector('.close-modal') : null;

        if (!modal || !btn || !closeBtn) {
            console.error(`Modal ${modalId} elements not found`);
            return;
        }

        // Open modal
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            modal.style.display = 'flex';
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
        });

        // Close modal when clicking X
        closeBtn.addEventListener('click', function () {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        });

        // Close modal when clicking outside modal-content
        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                modal.classList.remove('show');
                setTimeout(() => {
                    modal.style.display = 'none';
                }, 300);
            }
        });
    }

    // Setup modals
    setupModal('publicModal', 'a[href="#"].menu-btn.btn-left');
    setupModal('admModal', 'a.menu-btn.btn-top');

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
