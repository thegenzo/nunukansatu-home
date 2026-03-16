// ============================================
// MODAL SETUP - Public & ADM Services
// ============================================
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

    // Setup modals for Public & ADM Services
    setupModal('publicModal', 'a[href="#"].menu-btn.btn-left');
    setupModal('admModal', 'a.menu-btn.btn-top');

    // ============================================
    // PENGADUAN MODAL & POPUP
    // ============================================
    const pengaduanModal = document.getElementById('pengaduanModal');
    const pengaduanBtn = document.querySelector('footer button.btn-outline-danger');
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
    const pengaduanPopupBtn = document.querySelector('footer button.btn-outline-danger');

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

    // ============================================
    // LIVE CHAT MODAL
    // ============================================
    const liveChatModal = document.getElementById('liveChatModal');
    const liveChatBtn = document.getElementById('liveChatBtn');
    const liveChatForm = document.getElementById('liveChatForm');
    const liveChatCloseBtn = liveChatModal ? liveChatModal.querySelector('.live-chat-close') : null;

    if (liveChatModal && liveChatBtn && liveChatCloseBtn) {
        // Open live chat modal
        liveChatBtn.addEventListener('click', function (e) {
            e.preventDefault();
            liveChatModal.style.display = 'flex';
            setTimeout(() => {
                liveChatModal.classList.add('show');
            }, 10);
        });

        // Close live chat modal when clicking X
        liveChatCloseBtn.addEventListener('click', function () {
            liveChatModal.classList.remove('show');
            setTimeout(() => {
                liveChatModal.style.display = 'none';
            }, 300);
        });

        // Close live chat modal when clicking outside modal-content
        liveChatModal.addEventListener('click', function (e) {
            if (e.target === liveChatModal) {
                liveChatModal.classList.remove('show');
                setTimeout(() => {
                    liveChatModal.style.display = 'none';
                }, 300);
            }
        });

        // Handle form submission
        if (liveChatForm) {
            liveChatForm.addEventListener('submit', function (e) {
                e.preventDefault();
                
                // Get form values
                const email = document.getElementById('chatEmail').value;
                const name = document.getElementById('chatName').value;
                const message = document.getElementById('chatMessage').value;

                // Log the form data (In real scenario, this would be sent to a server)
                console.log('Live Chat Form Submitted:', {
                    email: email,
                    name: name,
                    message: message
                });

                // Show success message (optional)
                alert(`Terima kasih ${name}! Pesan Anda telah dikirim. Kami akan menghubungi Anda segera di ${email}`);

                // Reset form
                liveChatForm.reset();

                // Close modal
                liveChatModal.classList.remove('show');
                setTimeout(() => {
                    liveChatModal.style.display = 'none';
                }, 300);
            });
        }
    } else {
        console.error('Live Chat modal elements not found');
    }
});
