// Global state
let membersData = [];
let filteredMembers = [];
let currentFilters = {
    search: '',
    stream: '',
    newsType: ''
};
let currentView = 'grid';

// DOM Elements
const elements = {
    membersContainer: document.getElementById('membersContainer'),
    searchInput: document.getElementById('searchInput'),
    streamFilter: document.getElementById('streamFilter'),
    newsTypeFilter: document.getElementById('newsTypeFilter'),
    memberModal: document.getElementById('memberModal'),
    modalContent: document.getElementById('modalContent'),
    closeModal: document.querySelector('.close'),
    clearSearchBtn: document.getElementById('clearSearch'),
    resetFiltersBtn: document.getElementById('resetFilters'),
    backToTopBtn: document.getElementById('backToTop'),
    resultsCount: document.getElementById('resultsCount'),
    totalMembers: document.getElementById('totalMembers'),
    loadingIndicator: document.getElementById('loadingIndicator'),
    noResultsState: document.getElementById('noResults'),
    headerMemberCount: document.getElementById('headerMemberCount'),
    viewButtons: document.querySelectorAll('.view-btn')
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    try {
        showLoadingState();
        initializeTabs();
        await loadMembersData();
        setupEventListeners();
        setupIntersectionObserver();
        hideLoadingState();
        updateHeaderStats();
        showTab('members');
    } catch (error) {
        handleInitializationError(error);
    }
}

function initializeTabs() {
    document.querySelectorAll('.tab-content').forEach(content => {
        if (!content.classList.contains('active')) {
            content.style.display = 'none';
            content.setAttribute('aria-hidden', 'true');
        }
    });
    
    document.querySelectorAll('.tab-button').forEach(tab => {
        const isActive = tab.classList.contains('active');
        tab.setAttribute('aria-selected', isActive.toString());
    });
}

function showTab(tabId) {
    console.log('Showing tab:', tabId);
    
    // Update tabs
    document.querySelectorAll('.tab-button').forEach(tab => {
        tab.classList.remove('active');
        tab.setAttribute('aria-selected', 'false');
    });
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
        content.classList.remove('active');
        content.setAttribute('aria-hidden', 'true');
    });
    
    const activeTab = document.querySelector(`[data-tab="${tabId}"]`);
    const activeContent = document.getElementById(tabId);
    
    if (activeTab && activeContent) {
        activeTab.classList.add('active');
        activeTab.setAttribute('aria-selected', 'true');
        activeContent.style.display = 'block';
        activeContent.classList.add('active');
        activeContent.setAttribute('aria-hidden', 'false');
        activeTab.focus();
    }
    
    // Render members if on members tab
    if (tabId === 'members') {
        setTimeout(() => {
            renderMembers();
        }, 50);
    }
    
    announceToScreenReader(`Switched to ${getTabName(tabId)} tab`);
}

function getTabName(tabId) {
    const tabNames = {
        'members': 'Team Members',
        'about': 'About Us',
        'beats': 'News Beats', 
        'contact': 'Contact'
    };
    return tabNames[tabId] || tabId;
}

function showLoadingState() {
    if (elements.loadingIndicator) {
        elements.loadingIndicator.style.display = 'flex';
    }
    if (elements.membersContainer) {
        elements.membersContainer.innerHTML = '';
    }
    if (elements.noResultsState) {
        elements.noResultsState.style.display = 'none';
    }
}

function hideLoadingState() {
    if (elements.loadingIndicator) {
        elements.loadingIndicator.style.display = 'none';
    }
}

function handleInitializationError(error) {
    console.error('Application initialization failed:', error);
    if (elements.membersContainer) {
        elements.membersContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Unable to Load Team Members</h3>
                <p>We're having trouble loading the team information. Please check your connection and try again.</p>
                <button onclick="location.reload()" class="retry-btn">
                    <i class="fas fa-redo"></i> Try Again
                </button>
            </div>
        `;
    }
    hideLoadingState();
}

async function loadMembersData() {
    try {
        // Use the provided JSON data directly
        membersData = [
          {
            "id": "philippa",
            "name": "Philippa",
            "class": "SSS3",
            "stream": "Arts",
            "newsType": "President",
            "newsAbout": "Philippa leads the press team with confidence and heart. Her calm leadership and dedication to teamwork make her a respected role model who brings out the best in everyone around her.",
            "photo": "assets/images/phillipa.jpg",
            "pronouns": "she/her",
            "tone": "B"
          },
  {
            "id": "veronica",
            "name": "Veronica",
            "class": "SSS2",
            "stream": "Arts",
            "newsType": "Vice President & Lead Broadcaster",
            "newsAbout": "Veronica’s confident voice and cheerful spirit make her the heart of every broadcast. As Vice President, she supports the team with leadership and creativity, helping guide projects and ensuring the press team presents its best work.",
            "photo": "assets/images/veronica.jpg",
            "pronouns": "she/her",
            "tone": "B"
          },
         
          {
            "id": "patricia",
            "name": "Patricia",
            "class": "SSS3",
            "stream": "Arts",
            "newsType": "Motivational Speaker & Finance Secretary",
            "newsAbout": "Patricia balances creativity and organization in her dual role. She inspires her peers with thoughtful talks and manages the team's finances responsibly and efficiently.",
            "photo": "assets/images/patricia.jpg",
            "pronouns": "she/her",
            "tone": "A"
          },
          {
            "id": "elizabeth",
            "name": "Elizabeth",
            "class": "SSS2",
            "stream": "Arts",
            "newsType": "Entertainment Reporter & Assistant Finance Secretary",
            "newsAbout": "Elizabeth balances her love for entertainment with a sharp sense of organization. She reports with creativity and helps manage the team's finances effectively.",
            "photo": "assets/images/elizabeth.jpg",
            "pronouns": "she/her",
            "tone": "A"
          },
          {
            "id": "bradley",
            "name": "Bradley",
            "class": "SSS3",
            "stream": "Arts",
            "newsType": "Head of Media & Video Production",
            "newsAbout": "Bradley leads the media unit with vision and creativity. His talent for video production and storytelling sets a high standard for the team's visual work.",
            "photo": "assets/images/bradley.jpg",
            "pronouns": "he/him",
            "tone": "B"
          },
          {
            "id": "nyamia",
            "name": "Nyamia",
            "class": "SSS2",
            "stream": "Science",
            "newsType": "Vice Head of Media & Video Production",
            "newsAbout": "Nyamia covers safety and awareness topics that keep students informed. His steady presence and sense of responsibility make him a dependable part of the team.",
            "photo": "assets/images/nyamia.jpg",
            "pronouns": "he/him",
            "tone": "A"
          },
          {
            "id": "lauren",
            "name": "Lauren",
            "class": "SSS3",
            "stream": "Science",
            "newsType": "Editor & Media Specialist",
            "newsAbout": "Lauren manages the digital side of the press team with creativity and skill. He designed and built the team's official website, TypeShift, using his technical talents to strengthen the team's online presence.",
            "photo": "assets/images/laurens.png",
            "pronouns": "he/him",
            "tone": "A"
          },
         {
            "id": "favour",
            "name": "Favour",
            "class": "SSS2",
            "stream": "Science",
            "newsType": "Local News Reporter",
            "newsAbout": "Favour contributes to local news coverage with dedication and reliability. Her strong work ethic and growing reporting skills make her a promising member of the team.",
            "photo": "assets/images/favour.jpg",
            "pronouns": "she/her",
            "tone": "B"
          },
          {
            "id": "rodney",
            "name": "Rodney",
            "class": "SSS3",
            "stream": "Science",
            "newsType": "Campus News Reporter",
            "newsAbout": "Rodney has a great eye for stories and a natural curiosity about student life. His approachable attitude and clear reporting make him one of the most trusted voices in the press team.",
            "photo": "assets/images/rodney.jpg",
            "pronouns": "he/him",
            "tone": "B"
          },
          {
            "id": "seriki",
            "name": "Seriki",
            "class": "SSS3",
            "stream": "Science",
            "newsType": "Local News Correspondent",
            "newsAbout": "Seriki reports on school updates and announcements with accuracy and care. Her approachable manner and sense of responsibility make her a dependable team member.",
            "photo": "assets/images/seriki.jpg",
            "pronouns": "she/her",
            "tone": "A"
          },
          {
            "id": "momoh",
            "name": "Momoh",
            "class": "SSS3",
            "stream": "Science",
            "newsType": "Head of Sports news",
            "newsAbout": "Momoh brings enthusiasm and insight to every sports story. His passion for teamwork and athletics helps him deliver exciting and accurate coverage of school competitions.",
            "photo": "assets/images/momoh.jpg",
            "pronouns": "he/him",
            "tone": "B"
          },
          {
            "id": "moriba",
            "name": "Moriba",
            "class": "SSS3",
            "stream": "Science",
            "newsType": "Sports Analyst",
            "newsAbout": "Moriba takes sports journalism to a thoughtful level with his detailed analysis and love for global competition. He enjoys helping others appreciate the skill and strategy behind every match.",
            "photo": "assets/images/moriba.jpg",
            "pronouns": "he/him",
            "tone": "A"
          },
          {
            "id": "bawoh",
            "name": "Bawoh",
            "class": "SSS3",
            "stream": "Arts",
            "newsType": "International Affairs Correspondent",
            "newsAbout": "Bawoh covers global issues with insight and clarity. Her thoughtful approach helps students connect international news to their everyday understanding of the world.",
            "photo": "assets/images/bawoh.jpg",
            "pronouns": "she/her",
            "tone": "A"
          },
          {
            "id": "fanta",
            "name": "Fanta",
            "class": "SSS2",
            "stream": "Science",
            "newsType": "Global News Correspondent",
            "newsAbout": "Fanta reports on global news that matters to young people. Her calm delivery and thoughtful storytelling make her pieces informative and inspiring.",
            "photo": "assets/images/fanta.jpg",
            "pronouns": "she/her",
            "tone": "B"
          },
          {
            "id": "augustine",
            "name": "Augustine",
            "class": "SSS3",
            "stream": "Arts",
            "newsType": "Entertainment & Culture Reporter",
            "newsAbout": "Augustine keeps the press team connected to arts and culture. His curiosity and sense of creativity help him share stories that reflect students' interests and school spirit.",
            "photo": "assets/images/augustine.jpg",
            "pronouns": "he/him",
            "tone": "A"
          },
          {
            "id": "isha",
            "name": "Isha",
            "class": "SSS2",
            "stream": "Science",
            "newsType": "Entertainment Correspondent",
            "newsAbout": "Isha brings positivity and confidence to her role as Entertainment Correspondent. She enjoys covering events that showcase student talent and creativity.",
            "photo": "assets/images/ishu.jpg",
            "pronouns": "she/her",
            "tone": "B"
          },
          {
            "id": "stellina",
            "name": "Stellina",
            "class": "SSS2",
            "stream": "Arts",
            "newsType": "International Culture Reporter",
            "newsAbout": "Stellina reports on culture and traditions from around the world. Her curiosity and appreciation for diversity make her stories both informative and enjoyable.",
            "photo": "assets/images/stellina.jpg",
            "pronouns": "she/her",
            "tone": "A"
          },
          {
            "id": "papah",
            "name": "Papah",
            "class": "SSS3",
            "stream": "Arts",
            "newsType": "Literary & Creative Arts Editor",
            "newsAbout": "Papah is passionate about creative writing and poetry. His dedication to helping others express themselves makes the school's literary section one of the press team's highlights.",
            "photo": "assets/images/papah.jpg",
            "pronouns": "he/him",
            "tone": "B"
          },
          {
            "id": "william",
            "name": "William",
            "class": "SSS3",
            "stream": "Arts",
            "newsType": "Business & Economics Reporter",
            "newsAbout": "William explores financial and business topics with interest and focus. His reports encourage students to think about entrepreneurship and smart decision-making.",
            "photo": "assets/images/william.jpg",
            "pronouns": "he/him",
            "tone": "A"
          },
          {
            "id": "daniella",
            "name": "Daniella",
            "class": "SSS3",
            "stream": "Commercial",
            "newsType": "Business & Finance Reporter",
            "newsAbout": "Daniella enjoys highlighting creative business ideas and achievements. Her professionalism and clear writing bring business news to life for students and staff alike.",
            "photo": "assets/images/daniella.jpg",
            "pronouns": "she/her",
            "tone": "B"
          },
          {
            "id": "augusta",
            "name": "Augusta",
            "class": "SSS1",
            "stream": "Arts",
            "newsType": "Media & Production Assistant",
            "newsAbout": "Augusta assists the media team with enthusiasm and commitment. Her willingness to learn and contribute makes her one of the most dependable younger members of the club.",
            "photo": "assets/images/augusta.jpg",
            "pronouns": "she/her",
            "tone": "B"
          },
          {
            "id": "mr-bomah",
            "name": "Mr. Bomah",
            "class": "Faculty",
            "stream": "Arts",
            "newsType": "Faculty Advisor",
            "newsAbout": "Mr. Bomah is the heart and soul of our press team. His dedication goes far beyond the classroom; he is a true mentor who invests deeply in each student's growth. With a perfect blend of wisdom and warmth, he creates an environment where we feel safe to experiment, learn, and excel. His encouragement is a constant source of motivation, and his belief in us often surpasses our belief in ourselves. The team's spirit and success are a direct reflection of his passionate leadership.",
            "photo": "assets/images/mr-bomah.jpg",
            "pronouns": "he/him",
            "tone": "A"
          }
        ];

        // Validate and normalize data
        if (!Array.isArray(membersData)) {
            throw new Error('Invalid data format: expected array');
        }
        
        membersData = membersData.map(member => ({
            id: member.id || generateId(member.name),
            name: member.name || 'Unknown Member',
            class: member.class || '',
            stream: member.stream || '',
            newsType: member.newsType || 'General',
            newsAbout: member.newsAbout || '',
            photo: member.photo || '',
            ...member
        }));
        
        filteredMembers = [...membersData];
        updateResultsCount();
        updateTotalMembers();
        updateHeaderStats();
        renderMembers();
        
    } catch (error) {
        console.error('Error loading member data:', error);
        throw new Error('Failed to load team members data');
    }
}

function generateId(name) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function setupEventListeners() {
    // Search functionality
    if (elements.searchInput) {
        elements.searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    if (elements.clearSearchBtn) {
        elements.clearSearchBtn.addEventListener('click', clearSearch);
    }
    
    // Filter functionality
    if (elements.streamFilter) {
        elements.streamFilter.addEventListener('change', handleFilterChange);
    }
    if (elements.newsTypeFilter) {
        elements.newsTypeFilter.addEventListener('change', handleFilterChange);
    }
    
    // Modal functionality
    if (elements.closeModal) {
        elements.closeModal.addEventListener('click', closeMemberModal);
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);
    
    // Reset filters
    if (elements.resetFiltersBtn) {
        elements.resetFiltersBtn.addEventListener('click', resetAllFilters);
    }
    
    // Back to top
    if (elements.backToTopBtn) {
        elements.backToTopBtn.addEventListener('click', scrollToTop);
    }
    
    // Tab navigation
    document.querySelectorAll('.tab-button').forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            const tabId = this.getAttribute('data-tab');
            showTab(tabId);
        });
        
        tab.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const tabId = this.getAttribute('data-tab');
                showTab(tabId);
            } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                navigateTabs(e.key);
            }
        });
    });
    
    // View toggle (grid/list)
    if (elements.viewButtons.length > 0) {
        elements.viewButtons.forEach(btn => {
            btn.addEventListener('click', handleViewToggle);
        });
    }
    
    // Modal overlays
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
            document.body.style.overflow = '';
        });
    });
    
    // Action buttons
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.querySelector('span').textContent.toLowerCase();
            handleActionButton(action);
        });
    });
    
    // Window resize
    window.addEventListener('resize', debounce(handleResize, 250));
}

function handleResize() {
    if (currentView === 'grid' && window.innerWidth < 768) {
        renderMembers();
    }
}

function navigateTabs(direction) {
    const tabs = Array.from(document.querySelectorAll('.tab-button'));
    const currentTab = document.querySelector('.tab-button.active');
    const currentIndex = tabs.indexOf(currentTab);
    
    let newIndex;
    if (direction === 'ArrowRight') {
        newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
    } else {
        newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
    }
    
    const newTabId = tabs[newIndex].getAttribute('data-tab');
    showTab(newTabId);
    tabs[newIndex].focus();
}

function handleActionButton(action) {
    switch(action) {
        case 'browse team':
            showTab('members');
            break;
        case 'meet random member':
            showRandomMember();
            break;
        case 'join our team':
            showTab('contact');
            break;
    }
}

function handleViewToggle(e) {
    const viewType = this.getAttribute('data-view');
    
    // Update view buttons state
    elements.viewButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
    });
    this.classList.add('active');
    this.setAttribute('aria-pressed', 'true');
    
    // Update current view and render
    currentView = viewType;
    if (elements.membersContainer) {
        elements.membersContainer.setAttribute('data-view', viewType);
    }
    
    renderMembers();
    announceToScreenReader(`Switched to ${viewType} view`);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function handleSearch() {
    currentFilters.search = elements.searchInput.value.toLowerCase();
    if (elements.clearSearchBtn) {
        elements.clearSearchBtn.style.display = currentFilters.search ? 'flex' : 'none';
    }
    applyFilters();
}

function clearSearch() {
    if (elements.searchInput) {
        elements.searchInput.value = '';
        currentFilters.search = '';
        if (elements.clearSearchBtn) {
            elements.clearSearchBtn.style.display = 'none';
        }
        applyFilters();
        elements.searchInput.focus();
    }
}

function handleFilterChange() {
    currentFilters.stream = elements.streamFilter ? elements.streamFilter.value : '';
    currentFilters.newsType = elements.newsTypeFilter ? elements.newsTypeFilter.value : '';
    applyFilters();
}

// FIXED FILTER FUNCTION - This is the key fix
function applyFilters() {
    const startTime = performance.now();
    
    filteredMembers = membersData.filter(member => {
        // Search filter (case-insensitive)
        const searchMatch = !currentFilters.search || 
            member.name.toLowerCase().includes(currentFilters.search) ||
            member.newsType.toLowerCase().includes(currentFilters.search) ||
            member.stream.toLowerCase().includes(currentFilters.search) ||
            (member.newsAbout && member.newsAbout.toLowerCase().includes(currentFilters.search));
        
        // Stream filter (exact match)
        const streamMatch = !currentFilters.stream || member.stream === currentFilters.stream;
        
        // News Type filter - FIXED: case-insensitive partial matching
        const newsTypeMatch = !currentFilters.newsType || 
            member.newsType.toLowerCase().includes(currentFilters.newsType.toLowerCase());
        
        return searchMatch && streamMatch && newsTypeMatch;
    });
    
    renderMembers();
    updateResultsCount();
    
    const endTime = performance.now();
    console.log(`Filtering took ${(endTime - startTime).toFixed(2)} milliseconds`);
}

function resetAllFilters() {
    // Reset input values
    if (elements.searchInput) elements.searchInput.value = '';
    if (elements.streamFilter) elements.streamFilter.value = '';
    if (elements.newsTypeFilter) elements.newsTypeFilter.value = '';
    
    // Reset filter state
    currentFilters = {
        search: '',
        stream: '',
        newsType: ''
    };
    
    // Update UI
    if (elements.clearSearchBtn) {
        elements.clearSearchBtn.style.display = 'none';
    }
    
    // Apply changes
    applyFilters();
    announceToScreenReader('All filters have been reset');
}

function updateResultsCount() {
    if (elements.resultsCount) {
        const count = filteredMembers.length;
        const total = membersData.length;
        
        if (count === total) {
            elements.resultsCount.textContent = `Showing all ${total} team members`;
        } else if (count === 0) {
            elements.resultsCount.textContent = 'No team members found matching your criteria';
        } else {
            elements.resultsCount.textContent = `Showing ${count} of ${total} team members`;
        }
    }
}

function updateTotalMembers() {
    if (elements.totalMembers) {
        elements.totalMembers.textContent = membersData.length;
    }
}

function updateHeaderStats() {
    if (elements.headerMemberCount) {
        elements.headerMemberCount.textContent = membersData.length;
    }
}

function renderMembers() {
    if (!elements.membersContainer) return;
    
    // Handle no results
    if (filteredMembers.length === 0) {
        elements.membersContainer.innerHTML = '';
        if (elements.noResultsState) {
            elements.noResultsState.style.display = 'block';
        }
        return;
    }
    
    // Hide no results state
    if (elements.noResultsState) {
        elements.noResultsState.style.display = 'none';
    }
    
    // Create and append member cards
    const fragment = document.createDocumentFragment();
    
    filteredMembers.forEach(member => {
        try {
            const card = createMemberCard(member);
            fragment.appendChild(card);
        } catch (error) {
            console.error('Error creating member card:', error);
            const errorCard = createErrorCard(member, error);
            fragment.appendChild(errorCard);
        }
    });
    
    elements.membersContainer.innerHTML = '';
    elements.membersContainer.appendChild(fragment);
}

function createMemberCard(member) {
    const card = document.createElement('div');
    card.className = 'member-card';
    card.setAttribute('data-id', member.id);
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `View details for ${member.name}, ${member.newsType}`);
    
    if (currentView === 'list') {
        card.innerHTML = `
            <div class="member-photo list-view">
                ${member.photo ? 
                    `<img src="${member.photo}" alt="${member.name}" class="member-photo-img" loading="lazy" onerror="handleImageError(this)">` : 
                    ''
                }
                <span class="photo-placeholder" style="${member.photo ? 'display: none;' : ''}">${getInitials(member.name)}</span>
            </div>
            <div class="member-info list-view">
                <div class="member-header">
                    <h3 class="member-name">${member.name}</h3>
                    <span class="role-tag">${member.newsType}</span>
                </div>
                <div class="member-details">
                    ${member.class ? `<span class="member-class">${member.class}</span>` : ''}
                    ${member.stream ? `<span class="member-stream">${member.stream}</span>` : ''}
                </div>
                ${member.newsAbout ? `<p class="member-preview">${truncateText(member.newsAbout, 120)}</p>` : ''}
            </div>
        `;
    } else {
        card.innerHTML = `
            <div class="member-photo">
                ${member.photo ? 
                    `<img src="${member.photo}" alt="${member.name}" class="member-photo-img" loading="lazy" onerror="handleImageError(this)">` : 
                    ''
                }
                <span class="photo-placeholder" style="${member.photo ? 'display: none;' : ''}">${getInitials(member.name)}</span>
            </div>
            <div class="member-info">
                <h3 class="member-name">${member.name}</h3>
                <div class="member-details">
                    ${member.class ? `<span class="member-class">${member.class}</span>` : ''}
                    ${member.stream ? `<span class="member-stream">${member.stream}</span>` : ''}
                </div>
                <div class="member-role">
                    <span class="role-tag">${member.newsType}</span>
                </div>
            </div>
        `;
    }
    
    // Add click and keyboard events
    card.addEventListener('click', () => showMemberModal(member));
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            showMemberModal(member);
        }
    });
    
    return card;
}

function handleImageError(img) {
    img.style.display = 'none';
    const placeholder = img.nextElementSibling;
    if (placeholder && placeholder.classList.contains('photo-placeholder')) {
        placeholder.style.display = 'flex';
    }
}

function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
}

function showMemberModal(member) {
    if (!elements.modalContent || !elements.memberModal) return;
    
    const modalHTML = `
        <div class="modal-body">
            <div class="modal-photo">
                ${member.photo ? 
                    `<img src="${member.photo}" alt="${member.name}" class="modal-photo-img" onerror="handleImageError(this)">` : 
                    ''
                }
                <span class="photo-placeholder" style="${member.photo ? 'display: none;' : ''}">${getInitials(member.name)}</span>
            </div>
            <h2 id="modalTitle" class="modal-name">${member.name}</h2>
            <div class="modal-details">
                ${member.class ? `<span class="member-class">${member.class}</span>` : ''}
                ${member.stream ? `<span class="member-stream">${member.stream}</span>` : ''}
            </div>
            ${member.newsAbout ? `
            <div class="modal-bio">
                <p>${member.newsAbout}</p>
            </div>
            ` : `
            <div class="modal-bio">
                <p><em>More information about ${member.name} will be added soon.</em></p>
            </div>
            `}
            <div class="modal-role">
                <span class="modal-role-tag">${member.newsType}</span>
            </div>
            <div class="modal-navigation">
                <button class="nav-btn prev-btn" onclick="navigateModal('prev')" aria-label="Previous member">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <span class="nav-position">${getMemberPosition(member)}</span>
                <button class="nav-btn next-btn" onclick="navigateModal('next')" aria-label="Next member">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>
    `;
    
    elements.modalContent.innerHTML = modalHTML;
    elements.memberModal.style.display = 'block';
    
    // Focus management
    if (elements.closeModal) {
        elements.closeModal.focus();
    }
    
    document.body.style.overflow = 'hidden';
    announceToScreenReader(`Opened profile for ${member.name}`);
}

function getMemberPosition(member) {
    const index = filteredMembers.findIndex(m => m.id === member.id);
    return `${index + 1} of ${filteredMembers.length}`;
}

function navigateModal(direction) {
    const currentMemberName = document.querySelector('#modalTitle')?.textContent;
    if (!currentMemberName) return;
    
    const currentIndex = filteredMembers.findIndex(m => m.name === currentMemberName);
    if (currentIndex === -1) return;
    
    let newIndex;
    if (direction === 'prev' || direction === 'ArrowLeft') {
        newIndex = currentIndex > 0 ? currentIndex - 1 : filteredMembers.length - 1;
    } else {
        newIndex = currentIndex < filteredMembers.length - 1 ? currentIndex + 1 : 0;
    }
    
    showMemberModal(filteredMembers[newIndex]);
}

function closeMemberModal() {
    if (elements.memberModal) {
        elements.memberModal.style.display = 'none';
    }
    document.body.style.overflow = '';
    
    // Return focus to the card that opened the modal
    const activeCard = document.querySelector('.member-card[data-id]:focus');
    if (activeCard) {
        activeCard.focus();
    }
}

function handleKeyboardNavigation(e) {
    // Close modal on Escape
    if (e.key === 'Escape' && elements.memberModal && elements.memberModal.style.display === 'block') {
        closeMemberModal();
    }
    
    // Navigate modal with arrow keys
    if (elements.memberModal && elements.memberModal.style.display === 'block' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        navigateModal(e.key === 'ArrowLeft' ? 'prev' : 'next');
    }
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function setupIntersectionObserver() {
    if (!elements.backToTopBtn) return;
    
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    elements.backToTopBtn.classList.remove('visible');
                } else {
                    elements.backToTopBtn.classList.add('visible');
                }
            });
        },
        { threshold: 0.1 }
    );
    
    const header = document.querySelector('header');
    if (header) {
        observer.observe(header);
    }
}

function announceToScreenReader(message) {
    const announcer = document.getElementById('aria-announcer') || createAriaAnnouncer();
    announcer.textContent = message;
    
    setTimeout(() => {
        announcer.textContent = '';
    }, 1000);
}

function createAriaAnnouncer() {
    const announcer = document.createElement('div');
    announcer.id = 'aria-announcer';
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'visually-hidden';
    document.body.appendChild(announcer);
    return announcer;
}

function showRandomMember() {
    if (filteredMembers.length > 0) {
        const randomIndex = Math.floor(Math.random() * filteredMembers.length);
        const randomMember = filteredMembers[randomIndex];
        showMemberModal(randomMember);
    }
}

function createErrorCard(member, error) {
    const card = document.createElement('div');
    card.className = 'member-card error';
    card.innerHTML = `
        <div class="member-photo error">
            <span class="photo-placeholder">!</span>
        </div>
        <div class="member-info">
            <h3 class="member-name">Error Loading</h3>
            <div class="member-details">
                <span class="member-class">Unable to load</span>
            </div>
            <div class="member-role">
                <span class="role-tag error">Error</span>
            </div>
        </div>
    `;
    console.error(`Error creating card for ${member.name}:`, error);
    return card;
}

function showMeetingInfo() {
    const modal = document.getElementById('meetingModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.focus();
        }
    }
}

function sendJoinEmail() {
    window.location.href = 'mailto:naiahcomregentnewtseam101@gmail.com?subject=Interest in Joining News Team&body=Hello, I am interested in joining the Naiahcom High School Regent News Team. Please send me more information.';
}

// Global functions
window.showTab = showTab;
window.resetAllFilters = resetAllFilters;
window.scrollToTop = scrollToTop;
window.showRandomMember = showRandomMember;
window.navigateModal = navigateModal;
window.showMemberModal = showMemberModal;
window.showMeetingInfo = showMeetingInfo;
window.sendJoinEmail = sendJoinEmail;
window.handleImageError = handleImageError;

// Error handling and performance monitoring
window.addEventListener('error', function(e) {
    console.error('Global error caught:', e.error);
});

if ('performance' in window) {
    window.addEventListener('load', function() {
        const loadTime = performance.now();
        console.log(`Page fully loaded in ${loadTime.toFixed(2)} milliseconds`);
    });
}

// Global image error handling
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('error', function(e) {
        if (e.target.tagName === 'IMG' && e.target.classList.contains('member-photo-img')) {
            handleImageError(e.target);
        }
    }, true);
});



