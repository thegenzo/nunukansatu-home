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
        // Try to find search button by ID first, then fallback to selector
        searchBtn = document.getElementById('searchBtn') || document.querySelector('.floating-nav .btn-primary-red') || document.querySelector('button:has-text("Search")');
        closeSearchBtn = document.getElementById('closeSearchModal');
        searchTabs = document.querySelectorAll('.search-tab');
        searchInput = document.getElementById('searchInput');

        console.log('🔧 Search Modal Initialization:');
        console.log('  - searchModal:', searchModal ? '✅ Found' : '❌ Not found');
        console.log('  - searchBtn:', searchBtn ? '✅ Found' : '❌ Not found');
        console.log('  - closeSearchBtn:', closeSearchBtn ? '✅ Found' : '❌ Not found');
        console.log('  - searchTabs:', searchTabs.length > 0 ? `✅ Found (${searchTabs.length})` : '❌ Not found');
        console.log('  - searchInput:', searchInput ? '✅ Found' : '❌ Not found');

        if (!searchBtn || !searchModal || !closeSearchBtn) {
            console.error('❌ Critical: Search modal elements not found');
            console.error('   Please ensure searchBtn (id="searchBtn"), searchModal (id="searchModal"), and closeSearchModal (id="closeSearchModal") exist in HTML');
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
            console.log('📂 Loading search data from /search.json...');
            // Use absolute path to work from any page location
            const response = await fetch('/search.json');
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            searchData = data.results;
            console.log('✅ Search data loaded successfully:', searchData);
            initializeSearchUI();
        } catch (error) {
            console.error('❌ Error loading search data:', error);
            console.error('   Trying alternative path: ./search.json');
            // Try alternative path
            try {
                const response = await fetch('./search.json');
                if (!response.ok) throw new Error('Alternative path also failed');
                const data = await response.json();
                searchData = data.results;
                console.log('✅ Search data loaded from alternative path');
                initializeSearchUI();
            } catch (error2) {
                console.error('❌ Failed to load search data from both paths:', error2);
            }
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
                    // Update count with total items loaded so far
                    currentBeritaData.count = currentBeritaData.items.length;
                    console.log(`📊 Berita count updated after Load More: ${currentBeritaData.count}`);
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
            
            // Update berita tab count if this is a new search (page 1)
            if (page === 1 || !isLoadMore) {
                const beritaCountElement = document.querySelector('[data-tab="berita"] .tab-count');
                if (beritaCountElement && currentBeritaData) {
                    beritaCountElement.textContent = currentBeritaData.count;
                    console.log(`📊 Updated berita tab count: ${currentBeritaData.count}`);
                }
            }
            
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
        document.querySelector('[data-tab="publik"] .tab-count').textContent = searchData.layanan_publik.count;
        document.querySelector('[data-tab="adm"] .tab-count').textContent = searchData.layanan_adm.count;
        document.querySelector('[data-tab="data-informasi"] .tab-count').textContent = searchData.data_informasi.count;

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
        renderTabContent('data-informasi');
        
        // Update 'Semua' tab count with accurate total (publik + adm + berita from API + data_informasi)
        const semuaCountEl = document.querySelector('[data-tab="all"] .tab-count');
        if (semuaCountEl) {
            const totalCount = searchData.layanan_publik.count + searchData.layanan_adm.count + (currentBeritaData?.count || 0) + searchData.data_informasi.count;
            semuaCountEl.textContent = totalCount;
            console.log(`📊 Initial 'Semua' tab count set to: ${totalCount}`);
        }
    }

    function renderTabContent(tabName) {
        const contentContainer = document.getElementById(`tab-${tabName}`);
        if (!contentContainer) return;

        console.log(`📑 Rendering tab: ${tabName}`);
        
        let html = '';

        if (tabName === 'all') {
            // Show all sections
            html += renderSection('layanan_publik', searchData.layanan_publik);
            html += renderSection('layanan_adm', searchData.layanan_adm);
            // For berita in 'all' tab, use currentBeritaData if available
            if (currentBeritaData) {
                console.log('📰 Using API berita data for all tab:', currentBeritaData.items.length, 'items');
                html += renderSection('berita', currentBeritaData);
            } else {
                console.log('📰 Using fallback berita data for all tab');
                html += renderSection('berita', searchData.berita);
            }
            html += renderSection('data_informasi', searchData.data_informasi);
        } else if (tabName === 'publik') {
            html += renderSection('layanan_publik', searchData.layanan_publik);
        } else if (tabName === 'adm') {
            html += renderSection('layanan_adm', searchData.layanan_adm);
        } else if (tabName === 'berita') {
            // For berita tab, use currentBeritaData if available
            if (currentBeritaData) {
                console.log('📰 Using API berita data for berita tab:', currentBeritaData.items.length, 'items');
                html += renderSection('berita', currentBeritaData);
            } else {
                console.log('📰 Using fallback berita data for berita tab');
                html += renderSection('berita', searchData.berita);
            }
        } else if (tabName === 'data-informasi') {
            html += renderSection('data_informasi', searchData.data_informasi);
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
            const dataKeywords = item.keywords ? `data-keywords="${item.keywords.join(',')}"` : '';
            
            if (isBerita) {
                return `
                    <div class="search-item news-item" data-id="${item.id}" data-link="${item.link}" ${dataKeywords} style="cursor: pointer;">
                        <p class="item-title">${item.title}</p>
                        <p class="item-date">${item.date}</p>
                    </div>
                `;
            } else {
                return `
                    <div class="search-item" data-id="${item.id}" ${dataLink} ${dataServicePage} ${dataTitle} ${dataKeywords} style="cursor: pointer;">
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
    // SEARCH FILTERING LOGIC
    // ============================================
    function applySearchFilter(searchTerm) {
        const searchItems = document.querySelectorAll('.search-item');
        const searchSections = document.querySelectorAll('.search-section');
        
        console.log(`🔍 Applying search filter - Term: "${searchTerm}", Total items: ${searchItems.length}`);

        // Filter items based on search term
        searchItems.forEach((item) => {
            const title = item.querySelector('.item-title').textContent.toLowerCase();
            const categoryOrDate = item.querySelector('.item-category, .item-date');
            const categoryOrDateText = categoryOrDate ? categoryOrDate.textContent.toLowerCase() : '';
            
            // Get keywords from data attribute if available
            const keywordsText = item.getAttribute('data-keywords') ? item.getAttribute('data-keywords').toLowerCase() : '';

            const matches = title.includes(searchTerm) 
                || categoryOrDateText.includes(searchTerm)
                || keywordsText.includes(searchTerm);
            
            // Check if this is a news item (already filtered by API)
            const isNewsItem = item.classList.contains('news-item');
            
            if (searchTerm) {
                // When search term is active:
                // - For news items: Show all (already filtered by API), don't apply additional filtering
                // - For publik/adm items: Apply local filtering
                if (isNewsItem) {
                    // News items are already server-filtered, show them all
                    item.style.display = 'flex';
                } else {
                    // Publik & ADM items: apply local filtering
                    if (matches) {
                        item.style.display = 'flex';
                    } else {
                        item.style.display = 'none';
                    }
                }
            } else {
                // No search term: show all items
                item.style.display = 'flex';
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
    }

    // ============================================
    function setupEventListeners() {
        console.log('🎯 Setting up event listeners...');
        
        // Open search modal
        searchBtn.addEventListener('click', function (e) {
            e.preventDefault();
            console.log('🔓 Search button clicked - Opening modal');
            searchModal.style.display = 'flex';
            setTimeout(() => {
                searchModal.classList.add('show');
                searchInput.focus();
                console.log('✅ Modal displayed');
            }, 10);
        });

        // Close search modal
        closeSearchBtn.addEventListener('click', function () {
            console.log('🔒 Close button clicked - Closing modal');
            searchModal.classList.remove('show');
            setTimeout(() => {
                searchModal.style.display = 'none';
            }, 300);
        });

        // Close search modal when clicking outside modal-content
        searchModal.addEventListener('click', function (e) {
            if (e.target === searchModal) {
                console.log('🔒 Clicked outside modal - Closing');
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

                // Get current search term and re-apply filter if needed
                const searchTerm = searchInput.value.toLowerCase();
                if (searchTerm) {
                    // Re-apply search filter to newly active tab
                    console.log(`🔍 Re-applying search filter after tab switch: "${searchTerm}"`);
                    applySearchFilter(searchTerm);
                }

                // Update tab counts for current search term
                updateTabCounts(searchTerm);
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
            
            // Apply search filter to items
            applySearchFilter(searchTerm);

            // Update tab counts dynamically based on filtered results
            updateTabCounts(searchTerm);
        });
    }

    function updateTabCounts(searchTerm) {
        if (!searchTerm) {
            // Reset to original counts when search is cleared
            if (searchData) {
                const totalCount = searchData.layanan_publik.count + searchData.layanan_adm.count + (currentBeritaData?.count || 0) + searchData.data_informasi.count;
                const allCountEl = document.querySelector('[data-tab="all"] .tab-count');
                const publikCountEl = document.querySelector('[data-tab="publik"] .tab-count');
                const admCountEl = document.querySelector('[data-tab="adm"] .tab-count');
                const beritaCountEl = document.querySelector('[data-tab="berita"] .tab-count');
                const dataInformasiCountEl = document.querySelector('[data-tab="data-informasi"] .tab-count');
                
                if (allCountEl) allCountEl.textContent = String(totalCount);
                if (publikCountEl) publikCountEl.textContent = String(searchData.layanan_publik.count);
                if (admCountEl) admCountEl.textContent = String(searchData.layanan_adm.count);
                if (beritaCountEl && currentBeritaData) beritaCountEl.textContent = String(currentBeritaData.count);
                if (dataInformasiCountEl) dataInformasiCountEl.textContent = String(searchData.data_informasi.count);
                
                // Reset section counts to original values (update ALL instances - sections appear in both Semua tab and individual tabs)
                document.querySelectorAll('[data-section="layanan_publik"] .section-count').forEach(el => {
                    el.textContent = String(searchData.layanan_publik.count);
                });
                document.querySelectorAll('[data-section="layanan_adm"] .section-count').forEach(el => {
                    el.textContent = String(searchData.layanan_adm.count);
                });
                if (currentBeritaData) {
                    document.querySelectorAll('[data-section="berita"] .section-count').forEach(el => {
                        el.textContent = String(currentBeritaData.count);
                    });
                }
                document.querySelectorAll('[data-section="data_informasi"] .section-count').forEach(el => {
                    el.textContent = String(searchData.data_informasi.count);
                });
            }
            console.log('🔄 Tab counts reset to original values');
            return;
        }

        // Count visible items in each section
        const publikSection = document.querySelector('[data-section="layanan_publik"]');
        const admSection = document.querySelector('[data-section="layanan_adm"]');
        const beritaSection = document.querySelector('[data-section="berita"]');
        const dataInformasiSection = document.querySelector('[data-section="data_informasi"]');

        let publikVisible = 0;
        let admVisible = 0;
        let beritaVisible = 0;
        let dataInformasiVisible = 0;

        if (publikSection) {
            // Count items where style.display is NOT 'none'
            const publikItems = Array.from(publikSection.querySelectorAll('.search-item'));
            publikVisible = publikItems.filter(item => item.style.display !== 'none').length;
            
            // Update tab counter
            const publikCountEl = document.querySelector('[data-tab="publik"] .tab-count');
            if (publikCountEl) publikCountEl.textContent = String(publikVisible);
            
            // Update ALL instances of section-count (appears in Semua tab AND Layanan Publik tab)
            document.querySelectorAll('[data-section="layanan_publik"] .section-count').forEach(el => {
                el.textContent = String(publikVisible);
            });
            console.log(`📊 Publik tab count updated: ${publikVisible}`);
        }

        if (admSection) {
            // Count items where style.display is NOT 'none'
            const admItems = Array.from(admSection.querySelectorAll('.search-item'));
            admVisible = admItems.filter(item => item.style.display !== 'none').length;
            
            // Update tab counter
            const admCountEl = document.querySelector('[data-tab="adm"] .tab-count');
            if (admCountEl) admCountEl.textContent = String(admVisible);
            
            // Update ALL instances of section-count (appears in Semua tab AND Layanan ADM tab)
            document.querySelectorAll('[data-section="layanan_adm"] .section-count').forEach(el => {
                el.textContent = String(admVisible);
            });
            console.log(`📊 ADM tab count updated: ${admVisible}`);
        }

        if (beritaSection) {
            // Count items where style.display is NOT 'none'
            const beritaItems = Array.from(beritaSection.querySelectorAll('.search-item'));
            beritaVisible = beritaItems.filter(item => item.style.display !== 'none').length;
        }

        // For berita tab counter during search filtering, use currentBeritaData.count (API result)
        // This is consistent with how berita items are included in the 'Semua' total
        // Berita items are already filtered by API, so all items are relevant
        const beritaCountFromAPI = currentBeritaData?.count || 0;
        const beritaCountEl = document.querySelector('[data-tab="berita"] .tab-count');
        if (beritaCountEl) beritaCountEl.textContent = String(beritaCountFromAPI);
        // Update ALL instances of berita section-count
        document.querySelectorAll('[data-section="berita"] .section-count').forEach(el => {
            el.textContent = String(beritaCountFromAPI);
        });
        console.log(`📊 Berita tab count updated: ${beritaCountFromAPI}`);

        if (dataInformasiSection) {
            const dataInformasiItems = Array.from(dataInformasiSection.querySelectorAll('.search-item'));
            dataInformasiVisible = dataInformasiItems.filter(item => item.style.display !== 'none').length;

            const dataInformasiCountEl = document.querySelector('[data-tab="data-informasi"] .tab-count');
            if (dataInformasiCountEl) dataInformasiCountEl.textContent = String(dataInformasiVisible);

            document.querySelectorAll('[data-section="data_informasi"] .section-count').forEach(el => {
                el.textContent = String(dataInformasiVisible);
            });
            console.log(`📊 Data & Informasi tab count updated: ${dataInformasiVisible}`);
        }

        // Update total count for 'Semua' tab
        const totalVisible = publikVisible + admVisible + beritaCountFromAPI + dataInformasiVisible;
        const allCountEl = document.querySelector('[data-tab="all"] .tab-count');
        if (allCountEl) allCountEl.textContent = String(totalVisible);
        console.log(`📊 Total (Semua) tab count updated: ${totalVisible} (Publik: ${publikVisible}, ADM: ${admVisible}, Berita: ${beritaCountFromAPI}, Data: ${dataInformasiVisible})`);
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
        } else if (servicePage === 'data_informasi') {
            servicePageUrl = link;
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
                    
                    // Re-apply search filter to newly rendered items if search term active
                    const searchTerm = searchInput.value.toLowerCase();
                    if (searchTerm) {
                        console.log(`🔍 Re-applying search filter after Load More: "${searchTerm}"`);
                        applySearchFilter(searchTerm);
                    }
                    
                    // Update counters after loading more items
                    updateTabCounts(searchTerm);
                    console.log('📊 Tab counts updated after Load More');
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
            
            // Update counters after expand/collapse
            const searchTerm = searchInput.value.toLowerCase();
            updateTabCounts(searchTerm);
            console.log('📊 Tab counts updated after Show More/Less');
        }
    }

    // ============================================
    // INITIALIZATION ON DOM READY
    // ============================================
    document.addEventListener('DOMContentLoaded', initializeSearchModal);

})();
