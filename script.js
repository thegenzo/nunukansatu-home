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

    // Search Modal - Load from JSON
    const searchModal = document.getElementById('searchModal');
    const searchBtn = document.querySelector('.floating-nav .btn-primary-red');
    const closeSearchBtn = document.getElementById('closeSearchModal');
    const searchTabs = document.querySelectorAll('.search-tab');
    const searchInput = document.getElementById('searchInput');
    let searchData = null;

    // Load search data from JSON
    async function loadSearchData() {
        try {
            const response = await fetch('./search.json');
            if (!response.ok) throw new Error('Failed to load search data');
            const data = await response.json();
            searchData = data.results;
            initializeSearchUI();
        } catch (error) {
            console.error('Error loading search data:', error);
        }
    }

    // Initialize Search UI with data from JSON
    function initializeSearchUI() {
        if (!searchData) return;

        // Update tab counts dynamically
        document.querySelector('[data-tab="publik"] .tab-count').textContent = searchData.informasi_publik.count;
        document.querySelector('[data-tab="adm"] .tab-count').textContent = searchData.informasi_adm.count;
        document.querySelector('[data-tab="berita"] .tab-count').textContent = searchData.berita.count;

        // Render all tabs
        renderTabContent('all');
        renderTabContent('publik');
        renderTabContent('adm');
        renderTabContent('berita');
    }

    // Render content for each tab
    function renderTabContent(tabName) {
        const contentContainer = document.getElementById(`tab-${tabName}`);
        if (!contentContainer) return;

        let html = '';

        if (tabName === 'all') {
            // Show all sections
            html += renderSection('informasi_publik', searchData.informasi_publik);
            html += renderSection('informasi_adm', searchData.informasi_adm);
            html += renderSection('berita', searchData.berita);
        } else if (tabName === 'publik') {
            html += renderSection('informasi_publik', searchData.informasi_publik);
        } else if (tabName === 'adm') {
            html += renderSection('informasi_adm', searchData.informasi_adm);
        } else if (tabName === 'berita') {
            html += renderSection('berita', searchData.berita);
        }

        contentContainer.innerHTML = html;

        // Re-attach event listeners for show more buttons and search items
        attachShowMoreListeners();
        attachSearchItemListeners();
    }

    // Render a section with items
    function renderSection(sectionKey, sectionData) {
        const isBerita = sectionKey === 'berita';
        const servicePage = sectionData.service_page || '';
        
        const itemsHtml = sectionData.items.map(item => {
            const dataLink = item.link ? `data-link="${item.link}"` : '';
            const dataServicePage = `data-service-page="${servicePage}"`;
            const dataTitle = `data-title="${item.title}"`;
            
            if (isBerita) {
                return `
                    <div class="search-item news-item" data-id="${item.id}" style="cursor: pointer;">
                        <p class="item-title">${item.title}</p>
                        <p class="item-date">${item.date}</p>
                    </div>
                `;
            } else {
                return `
                    <div class="search-item" data-id="${item.id}" ${dataLink} ${dataServicePage} ${dataTitle} style="cursor: pointer;">
                        <p class="item-title">${item.title}</p>
                        <p class="item-category">${item.category}</p>
                    </div>
                `;
            }
        }).join('');

        return `
            <div class="search-section" data-section="${sectionKey}">
                <div class="section-header">
                    <h3 class="section-title">
                        <span>${sectionData.label}</span>
                        <span class="section-count">${sectionData.count}</span>
                    </h3>
                </div>
                <div class="section-items">
                    ${itemsHtml}
                </div>
                <div class="search-not-found" style="display: none; text-align: center; padding: 20px; color: #999;">
                    <p style="margin: 0;">Tidak ditemukan</p>
                </div>
                <button class="search-show-more-btn">
                    <i class="bi bi-chevron-down"></i>
                    <span>Show More</span>
                </button>
            </div>
        `;
    }

    // Attach event listeners for show more buttons
    function attachShowMoreListeners() {
        const showMoreBtns = document.querySelectorAll('.search-show-more-btn');
        showMoreBtns.forEach(btn => {
            btn.removeEventListener('click', handleShowMore);
            btn.addEventListener('click', handleShowMore);
        });
    }

    // Attach event listeners for search items (non-berita items)
    function attachSearchItemListeners() {
        const searchItems = document.querySelectorAll('.search-item:not(.news-item)');
        searchItems.forEach(item => {
            item.removeEventListener('click', handleSearchItemClick);
            item.addEventListener('click', handleSearchItemClick);
        });
    }

    // Handle search item click
    function handleSearchItemClick(e) {
        const link = this.getAttribute('data-link');
        const servicePage = this.getAttribute('data-service-page');
        const title = this.getAttribute('data-title');

        if (!link || !servicePage) return;

        // Determine which service page to open
        let servicePageUrl = '';
        if (servicePage === 'publik') {
            servicePageUrl = `./public-services/public-service.html?name=${encodeURIComponent(title)}&url=${encodeURIComponent(link)}`;
        } else if (servicePage === 'adm') {
            servicePageUrl = `./government-administration-service/administration-service.html?name=${encodeURIComponent(title)}&url=${encodeURIComponent(link)}`;
        }

        if (servicePageUrl) {
            // Close search modal first
            searchModal.classList.remove('show');
            setTimeout(() => {
                searchModal.style.display = 'none';
                // Navigate to service page
                window.location.href = servicePageUrl;
            }, 300);
        }
    }

    // Handle show more button click
    function handleShowMore(e) {
        e.preventDefault();
        const isExpanded = this.querySelector('i').classList.contains('bi-chevron-up');
        
        if (isExpanded) {
            // Collapse
            this.querySelector('i').classList.remove('bi-chevron-up');
            this.querySelector('i').classList.add('bi-chevron-down');
            this.querySelector('span').textContent = 'Show More';
        } else {
            // Expand
            this.querySelector('i').classList.remove('bi-chevron-down');
            this.querySelector('i').classList.add('bi-chevron-up');
            this.querySelector('span').textContent = 'Show Less';
        }
    }

    // Open search modal
    if (searchBtn && searchModal && closeSearchBtn) {
        searchBtn.addEventListener('click', function (e) {
            e.preventDefault();
            searchModal.style.display = 'flex';
            setTimeout(() => {
                searchModal.classList.add('show');
                searchInput.focus();
            }, 10);
        });

        // Close search modal
        closeSearchBtn.addEventListener('click', function () {
            searchModal.classList.remove('show');
            setTimeout(() => {
                searchModal.style.display = 'none';
            }, 300);
        });

        // Close search modal when clicking outside modal-content
        searchModal.addEventListener('click', function (e) {
            if (e.target === searchModal) {
                searchModal.classList.remove('show');
                setTimeout(() => {
                    searchModal.style.display = 'none';
                }, 300);
            }
        });

        // Tab switching
        searchTabs.forEach(tab => {
            tab.addEventListener('click', function () {
                const tabName = this.getAttribute('data-tab');
                
                // Update active tab
                searchTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');

                // Update active content
                const contents = document.querySelectorAll('.search-tab-content');
                contents.forEach(content => content.classList.remove('active'));
                const activeContent = document.getElementById(`tab-${tabName}`);
                if (activeContent) {
                    activeContent.classList.add('active');
                }
            });
        });

        // Search input filter
        searchInput.addEventListener('input', function () {
            const searchTerm = this.value.toLowerCase();
            const searchItems = document.querySelectorAll('.search-item');
            const searchSections = document.querySelectorAll('.search-section');

            searchItems.forEach(item => {
                const title = item.querySelector('.item-title').textContent.toLowerCase();
                const categoryOrDate = item.querySelector('.item-category, .item-date');
                const categoryOrDateText = categoryOrDate ? categoryOrDate.textContent.toLowerCase() : '';

                if (title.includes(searchTerm) || categoryOrDateText.includes(searchTerm)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });

            // Check each section for visibility and show "Tidak ditemukan" message if needed
            searchSections.forEach(section => {
                const visibleItems = section.querySelectorAll('.search-item:not([style*="display: none"])');
                const notFoundMsg = section.querySelector('.search-not-found');
                
                if (visibleItems.length === 0) {
                    // No visible items - show "Tidak ditemukan"
                    if (notFoundMsg) {
                        notFoundMsg.style.display = 'block';
                    }
                } else {
                    // Have visible items - hide "Tidak ditemukan"
                    if (notFoundMsg) {
                        notFoundMsg.style.display = 'none';
                    }
                }
            });
        });

        // Load search data on page load
        loadSearchData();
    } else {
        console.error('Search modal elements not found');
    }
});
