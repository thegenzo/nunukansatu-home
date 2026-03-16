// ============================================
// SEARCH BAR MODULE
// ============================================
// Handles all search modal functionality, including:
// - Local JSON search (Publik & ADM services)
// - External Berita API integration with pagination
// - Tab switching and content rendering

(function() {
    'use strict';

    // ============================================
    // STATE & CONSTANTS
    // ============================================
    let searchData = null;
    let currentBeritaData = null;
    let currentBeritaPage = 1;
    let currentBeritaKeyword = '';
    let beritaHasMorePages = true;

    const BERITA_API_URL = 'https://berita.nunukankab.go.id/api/search-berita';
    const BERITA_PER_PAGE = 10;

    // DOM Elements
    let searchModal = null;
    let searchBtn = null;
    let closeSearchBtn = null;
    let searchTabs = null;
    let searchInput = null;

    // ============================================
    // INITIALIZATION
    // ============================================
    function initializeSearchModal() {
        // Get DOM elements
        searchModal = document.getElementById('searchModal');
        searchBtn = document.querySelector('.floating-nav .btn-primary-red');
        closeSearchBtn = document.getElementById('closeSearchModal');
        searchTabs = document.querySelectorAll('.search-tab');
        searchInput = document.getElementById('searchInput');

        if (!searchBtn || !searchModal || !closeSearchBtn) {
            console.error('Search modal elements not found');
            return;
        }

        // Load search data and setup event listeners
        loadSearchData();
        setupEventListeners();
    }

    // ============================================
    // DATA LOADING
    // ============================================
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

    // ============================================
    // API FUNCTIONS
    // ============================================
    async function fetchBeritaFromAPI(keyword = '', page = 1, isLoadMore = false) {
        try {
            const url = keyword 
                ? `${BERITA_API_URL}?keyword=${encodeURIComponent(keyword)}&page=${page}`
                : `${BERITA_API_URL}?page=${page}`;
            
            console.log(`🔍 Fetching berita from API (Page ${page}):`, url);
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch berita');
            const apiResponse = await response.json();
            
            console.log(`📰 API Response (Page ${page}):`, apiResponse);
            
            // Handle the API response structure - data is nested in .data property
            const beritaArray = apiResponse.data || [];
            const totalResults = apiResponse.total || beritaArray.length;
            console.log(`📊 Results on page ${page}: ${beritaArray.length} | Total: ${totalResults}`);
            
            // Transform API response to match our data structure
            const transformedItems = Array.isArray(beritaArray) ? beritaArray.map(item => ({
                id: item.id || '',
                title: item.judul || item.title || '',
                date: item.tanggal || item.date || new Date().toLocaleDateString('id-ID'),
                category: item.kategori || item.category || '',
                link: item.url || item.link || ''
            })) : [];
            
            // If this is a new search (page 1), replace the data. Otherwise append (load more)
            if (page === 1 || !isLoadMore) {
                currentBeritaData = {
                    label: 'Berita',
                    count: totalResults,
                    service_page: '',
                    items: transformedItems
                };
                currentBeritaPage = 1;
                currentBeritaKeyword = keyword;
            } else {
                // Append new items for "Load More"
                if (currentBeritaData) {
                    currentBeritaData.items = [...currentBeritaData.items, ...transformedItems];
                }
                currentBeritaPage = page;
            }
            
            // Determine if there are more pages
            // Check if returned items < page size, which means we've reached the last page
            // This handles APIs where 'total' field represents items-per-page rather than total-overall
            const hasMorePages = transformedItems.length >= BERITA_PER_PAGE;
            beritaHasMorePages = hasMorePages;
            
            console.log(`📊 Pagination check - Items returned: ${transformedItems.length}, Per page: ${BERITA_PER_PAGE}, Has more: ${beritaHasMorePages}`);
            
            console.log(`📊 Pagination check - Items returned: ${transformedItems.length}, Per page: ${BERITA_PER_PAGE}, Has more: ${beritaHasMorePages}`);
            console.log(`✅ Transformed berita data: ${currentBeritaData.items.length} items loaded | Has more: ${beritaHasMorePages}`);
            return currentBeritaData;
        } catch (error) {
            console.error('❌ Error fetching berita from API:', error);
            currentBeritaData = {
                label: 'Berita',
                count: 0,
                service_page: '',
                items: []
            };
            beritaHasMorePages = false;
            return currentBeritaData;
        }
    }

    // ============================================
    // UI RENDERING
    // ============================================
    async function initializeSearchUI() {
        if (!searchData) return;

        // Update tab counts dynamically
        document.querySelector('[data-tab="publik"] .tab-count').textContent = searchData.informasi_publik.count;
        document.querySelector('[data-tab="adm"] .tab-count').textContent = searchData.informasi_adm.count;

        // Fetch initial berita from API
        await fetchBeritaFromAPI();
        const beritaCount = document.querySelector('[data-tab="berita"] .tab-count');
        if (beritaCount && currentBeritaData) {
            beritaCount.textContent = currentBeritaData.count;
        }

        // Render all tabs
        renderTabContent('all');
        renderTabContent('publik');
        renderTabContent('adm');
        renderTabContent('berita');
    }

    function renderTabContent(tabName) {
        const contentContainer = document.getElementById(`tab-${tabName}`);
        if (!contentContainer) return;

        console.log(`📑 Rendering tab: ${tabName}`);
        
        let html = '';

        if (tabName === 'all') {
            // Show all sections
            html += renderSection('informasi_publik', searchData.informasi_publik);
            html += renderSection('informasi_adm', searchData.informasi_adm);
            // For berita in 'all' tab, use currentBeritaData if available
            if (currentBeritaData) {
                console.log('📰 Using API berita data for all tab:', currentBeritaData.items.length, 'items');
                html += renderSection('berita', currentBeritaData);
            } else {
                console.log('📰 Using fallback berita data for all tab');
                html += renderSection('berita', searchData.berita);
            }
        } else if (tabName === 'publik') {
            html += renderSection('informasi_publik', searchData.informasi_publik);
        } else if (tabName === 'adm') {
            html += renderSection('informasi_adm', searchData.informasi_adm);
        } else if (tabName === 'berita') {
            // For berita tab, use currentBeritaData if available
            if (currentBeritaData) {
                console.log('📰 Using API berita data for berita tab:', currentBeritaData.items.length, 'items');
                html += renderSection('berita', currentBeritaData);
            } else {
                console.log('📰 Using fallback berita data for berita tab');
                html += renderSection('berita', searchData.berita);
            }
        }

        contentContainer.innerHTML = html;
        console.log(`✅ Tab ${tabName} rendered with HTML length:`, html.length);

        // Re-attach event listeners for show more buttons and search items
        attachShowMoreListeners();
        attachSearchItemListeners();
    }

    function renderSection(sectionKey, sectionData) {
        const isBerita = sectionKey === 'berita';
        const servicePage = sectionData.service_page || '';
        
        const itemsHtml = sectionData.items.map(item => {
            const dataLink = item.link ? `data-link="${item.link}"` : '';
            const dataServicePage = `data-service-page="${servicePage}"`;
            const dataTitle = `data-title="${item.title}"`;
            
            if (isBerita) {
                return `
                    <div class="search-item news-item" data-id="${item.id}" data-link="${item.link}" style="cursor: pointer;">
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

        const showMoreBtn = beritaHasMorePages && isBerita 
            ? `<button class="search-show-more-btn" data-section="${sectionKey}"><i class="bi bi-chevron-down"></i><span>Load More</span></button>`
            : `<button class="search-show-more-btn" data-section="${sectionKey}"><i class="bi bi-chevron-down"></i><span>Show More</span></button>`;

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
                ${showMoreBtn}
            </div>
        `;
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================
    function setupEventListeners() {
        // Open search modal
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
            tab.addEventListener('click', async function () {
                const tabName = this.getAttribute('data-tab');
                
                console.log(`📑 Switching to tab: ${tabName}`);
                
                // Update active tab
                searchTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');

                // If switching to berita tab with a search term, fetch from API
                if (tabName === 'berita' && searchInput.value.trim()) {
                    console.log('🔄 Fetching berita for current search on tab switch');
                    currentBeritaPage = 1;
                    await fetchBeritaFromAPI(searchInput.value.toLowerCase(), 1, false);
                }

                // Update active content
                const contents = document.querySelectorAll('.search-tab-content');
                contents.forEach(content => content.classList.remove('active'));
                const activeContent = document.getElementById(`tab-${tabName}`);
                if (activeContent) {
                    activeContent.classList.add('active');
                    // Render the tab content
                    renderTabContent(tabName);
                }
            });
        });

        // Search input filter
        searchInput.addEventListener('input', async function () {
            const searchTerm = this.value.toLowerCase();
            const activeTab = document.querySelector('.search-tab.active').getAttribute('data-tab');
            
            console.log(`🔎 Search triggered - Term: "${searchTerm}", Active Tab: ${activeTab}`);
            
            // If searching berita (in berita tab or 'all' tab), fetch from API
            if (searchTerm && (activeTab === 'berita' || activeTab === 'all')) {
                console.log('🔄 Fetching berita from API for search term (Page 1)');
                // Reset pagination for new search
                currentBeritaPage = 1;
                // Fetch berita from API with keyword (page 1, not load more)
                await fetchBeritaFromAPI(searchTerm, 1, false);
                // Re-render the active tab
                renderTabContent(activeTab);
            }
            
            // Apply local search filtering on all sections
            const searchItems = document.querySelectorAll('.search-item');
            const searchSections = document.querySelectorAll('.search-section');
            
            console.log('🔍 Total search items found:', searchItems.length);

            searchItems.forEach((item, index) => {
                const title = item.querySelector('.item-title').textContent.toLowerCase();
                const categoryOrDate = item.querySelector('.item-category, .item-date');
                const categoryOrDateText = categoryOrDate ? categoryOrDate.textContent.toLowerCase() : '';

                const matches = title.includes(searchTerm) || categoryOrDateText.includes(searchTerm);
                
                if (matches) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });

            // Check each section for visibility and show "Tidak ditemukan" message if needed
            searchSections.forEach(section => {
                const visibleItems = section.querySelectorAll('.search-item:not([style*="display: none"])');
                const notFoundMsg = section.querySelector('.search-not-found');
                const itemsContainer = section.querySelector('.section-items');
                const showMoreBtn = section.querySelector('.search-show-more-btn');
                const sectionTitle = section.querySelector('.section-title span:first-child')?.textContent || 'Unknown';
                
                console.log(`📊 Section "${sectionTitle}" - Visible items: ${visibleItems.length}`);
                
                if (visibleItems.length === 0) {
                    // No visible items - hide grid and show "Tidak ditemukan"
                    if (itemsContainer) {
                        itemsContainer.style.display = 'none';
                    }
                    if (showMoreBtn) {
                        showMoreBtn.style.display = 'none';
                    }
                    if (notFoundMsg) {
                        notFoundMsg.style.display = 'block';
                    }
                } else {
                    // Have visible items - show grid and hide "Tidak ditemukan"
                    if (itemsContainer) {
                        itemsContainer.style.display = 'grid';
                    }
                    if (showMoreBtn) {
                        showMoreBtn.style.display = 'block';
                    }
                    if (notFoundMsg) {
                        notFoundMsg.style.display = 'none';
                    }
                }
            });
        });
    }

    // ============================================
    // HELPER FUNCTIONS
    // ============================================
    function attachShowMoreListeners() {
        const showMoreBtns = document.querySelectorAll('.search-show-more-btn');
        showMoreBtns.forEach(btn => {
            btn.removeEventListener('click', handleShowMore);
            btn.addEventListener('click', handleShowMore);
        });
    }

    function attachSearchItemListeners() {
        // Attach listeners for regular search items (Publik & ADM)
        const searchItems = document.querySelectorAll('.search-item:not(.news-item)');
        searchItems.forEach(item => {
            item.removeEventListener('click', handleSearchItemClick);
            item.addEventListener('click', handleSearchItemClick);
        });

        // Attach listeners for berita items (news)
        const newsItems = document.querySelectorAll('.search-item.news-item');
        newsItems.forEach(item => {
            item.removeEventListener('click', handleNewsItemClick);
            item.addEventListener('click', handleNewsItemClick);
        });
    }

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

    function handleNewsItemClick(e) {
        const beritaLink = this.getAttribute('data-link');
        const title = this.querySelector('.item-title')?.textContent || 'Berita';
        
        if (!beritaLink) {
            console.warn('Berita link not found');
            return;
        }
        
        console.log(`📰 Opening berita in new tab: ${title}`);
        
        // Open berita link in new tab
        window.open(beritaLink, '_blank');
    }

    function handleShowMore(e) {
        e.preventDefault();
        const btn = e.target.closest('.search-show-more-btn');
        const sectionKey = btn.getAttribute('data-section');
        
        // Check if this is a berita section (pagination-based)
        if (sectionKey === 'berita') {
            // Handle pagination for berita
            console.log(`📄 Loading more berita... Current page: ${currentBeritaPage}, Has more: ${beritaHasMorePages}`);
            
            if (beritaHasMorePages) {
                // Fetch next page
                fetchBeritaFromAPI(currentBeritaKeyword, currentBeritaPage + 1, true).then(() => {
                    // Re-render just the berita section with appended items
                    const activeTab = document.querySelector('.search-tab.active').getAttribute('data-tab');
                    renderTabContent(activeTab);
                });
            } else {
                // No more pages
                console.log('⏹️ No more berita pages to load');
                btn.innerHTML = '<i class="bi bi-check-circle"></i><span>All Loaded</span>';
                btn.disabled = true;
            }
        } else {
            // Handle expand/collapse for other sections
            const isExpanded = btn.querySelector('i').classList.contains('bi-chevron-up');
            
            if (isExpanded) {
                // Collapse
                btn.querySelector('i').classList.remove('bi-chevron-up');
                btn.querySelector('i').classList.add('bi-chevron-down');
                btn.querySelector('span').textContent = 'Show More';
            } else {
                // Expand
                btn.querySelector('i').classList.remove('bi-chevron-down');
                btn.querySelector('i').classList.add('bi-chevron-up');
                btn.querySelector('span').textContent = 'Show Less';
            }
        }
    }

    // ============================================
    // INITIALIZATION ON DOM READY
    // ============================================
    document.addEventListener('DOMContentLoaded', initializeSearchModal);

})();
