// ============================================
// SEARCH MODAL COMPONENT
// ============================================
// Centralized search modal template
// Import this in any page and call initializeSearchModal()

function createSearchModalHTML() {
    return `
    <!-- Search Results Modal -->
    <div id="searchModal" class="modal-overlay search-modal-overlay">
        <div class="modal-content search-modal-content">
            <!-- Search Header with Input -->
            <div class="search-header">
                <input type="text" id="searchInput" class="search-input" placeholder="Cari layanan, berita, atau informasi...">
                <button class="close-modal btn btn-sm btn-danger px-3" id="closeSearchModal">
                    <i class="bi bi-x"></i>
                    <span>Keluar</span>
                </button>
            </div>

            <!-- Tab Navigation -->
            <div class="search-tabs">
                <button class="search-tab active" data-tab="all">
                    <span class="tab-icon">
                        <i class="bi bi-list"></i>
                    </span>
                    <span class="tab-label">Semua</span>
                    <span class="tab-count">0</span>
                </button>
                <button class="search-tab" data-tab="publik">
                    <span class="tab-icon">
                        <i class="bi bi-info-circle"></i>
                    </span>
                    <span class="tab-label">Layanan Publik</span>
                    <span class="tab-count">0</span>
                </button>
                <button class="search-tab" data-tab="adm">
                    <span class="tab-icon">
                        <i class="bi bi-building"></i>
                    </span>
                    <span class="tab-label">Layanan ADM Pemerintah</span>
                    <span class="tab-count">0</span>
                </button>
                <button class="search-tab" data-tab="berita">
                    <span class="tab-icon">
                        <i class="bi bi-newspaper"></i>
                    </span>
                    <span class="tab-label">Berita</span>
                    <span class="tab-count">0</span>
                </button>
                <button class="search-tab" data-tab="data-informasi">
                    <span class="tab-icon">
                        <i class="bi bi-database"></i>
                    </span>
                    <span class="tab-label">Data & Informasi</span>
                    <span class="tab-count">0</span>
                </button>
            </div>

            <!-- Search Results Content -->
            <div class="search-results-body">
                <!-- Tab: Semua -->
                <div class="search-tab-content active" id="tab-all">
                    <!-- Will be populated by JavaScript -->
                </div>

                <!-- Tab: Layanan Publik -->
                <div class="search-tab-content" id="tab-publik">
                    <!-- Will be populated by JavaScript -->
                </div>

                <!-- Tab: Layanan ADM Pemerintah -->
                <div class="search-tab-content" id="tab-adm">
                    <!-- Will be populated by JavaScript -->
                </div>

                <!-- Tab: Berita -->
                <div class="search-tab-content" id="tab-berita">
                    <!-- Will be populated by JavaScript -->
                </div>

                <!-- Tab: Data & Informasi -->
                <div class="search-tab-content" id="tab-data-informasi">
                    <!-- Will be populated by JavaScript -->
                </div>
            </div>
        </div>
    </div>
    `;
}

function insertSearchModal() {
    // Check if modal already exists
    if (document.getElementById('searchModal')) {
        console.log('✅ Search modal already exists in DOM');
        return;
    }

    // Inject modal at end of body
    const modalHTML = createSearchModalHTML();
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    console.log('✅ Search modal injected into page');
}

// Auto-inject when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    insertSearchModal();
});
