let membersData = [];
let filteredMembers = [];
let currentFilters = {
    search: '',
    stream: '',
    newsType: ''
};
let currentView = 'grid';

const membersContainer = document.getElementById('membersContainer');
const searchInput = document.getElementById('searchInput');
const streamFilter = document.getElementById('streamFilter');
const newsTypeFilter = document.getElementById('newsTypeFilter');
const memberModal = document.getElementById('memberModal');
const modalContent = document.getElementById('modalContent');
const closeModal = document.querySelector('.close');
const clearSearchBtn = document.getElementById('clearSearch');
const resetFiltersBtn = document.getElementById('resetFilters');
const backToTopBtn = document.getElementById('backToTop');
const resultsCount = document.getElementById('resultsCount');
const totalMembers = document.getElementById('totalMembers');
const loadingIndicator = document.getElementById('loadingIndicator');
const noResultsState = document.getElementById('noResults');
const headerMemberCount = document.getElementById('headerMemberCount');
const viewButtons = document.querySelectorAll('.view-btn');

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
    
    document.querySelectorAll('.tab-button').forEach(tab => {
        tab.classList.remove('active');
        tab.setAttribute('aria-selected', 'false');
    });
    
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
    if (loadingIndicator) {
        loadingIndicator.style.display = 'flex';
    }
    if (membersContainer) {
        membersContainer.innerHTML = '';
    }
    if (noResultsState) {
        noResultsState.style.display = 'none';
    }
}

function hideLoadingState() {
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
}

function handleInitializationError(error) {
    console.error('Application initialization failed:', error);
    if (membersContainer) {
        membersContainer.innerHTML = `
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
        if (window.membersJSONData) {
            membersData = window.membersJSONData;
        } else {
            const response = await fetch('data/members.json');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            membersData = await response.json();
        }
        
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
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', clearSearch);
    }
    
    if (streamFilter) {
        streamFilter.addEventListener('change', handleFilterChange);
    }
    if (newsTypeFilter) {
        newsTypeFilter.addEventListener('change', handleFilterChange);
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', closeMemberModal);
    }
    document.addEventListener('keydown', handleKeyboardNavigation);
    
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', resetAllFilters);
    }
    
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', scrollToTop);
    }
    
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
    
    if (viewButtons.length > 0) {
        viewButtons.forEach(btn => {
            btn.addEventListener('click', handleViewToggle);
        });
    }
    
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
            document.body.style.overflow = '';
        });
    });
    
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.querySelector('span').textContent.toLowerCase();
            handleActionButton(action);
        });
    });
    
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
    
    viewButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
    });
    this.classList.add('active');
    this.setAttribute('aria-pressed', 'true');
    
    currentView = viewType;
    if (membersContainer) {
        membersContainer.setAttribute('data-view', viewType);
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
    currentFilters.search = searchInput.value.toLowerCase();
    if (clearSearchBtn) {
        clearSearchBtn.style.display = currentFilters.search ? 'flex' : 'none';
    }
    applyFilters();
}

function clearSearch() {
    if (searchInput) {
        searchInput.value = '';
        currentFilters.search = '';
        if (clearSearchBtn) {
            clearSearchBtn.style.display = 'none';
        }
        applyFilters();
        searchInput.focus();
    }
}

function handleFilterChange() {
    currentFilters.stream = streamFilter ? streamFilter.value : '';
    currentFilters.newsType = newsTypeFilter ? newsTypeFilter.value : '';
    applyFilters();
}

function applyFilters() {
    const startTime = performance.now();
    
    filteredMembers = membersData.filter(member => {
        const searchMatch = !currentFilters.search || 
            member.name.toLowerCase().includes(currentFilters.search) ||
            (member.newsType && member.newsType.toLowerCase().includes(currentFilters.search)) ||
            (member.stream && member.stream.toLowerCase().includes(currentFilters.search));
        
        const streamMatch = !currentFilters.stream || 
            (member.stream && member.stream.toLowerCase() === currentFilters.stream.toLowerCase());
        
        const newsTypeMatch = !currentFilters.newsType || 
            (member.newsType && member.newsType.toLowerCase() === currentFilters.newsType.toLowerCase());
        
        return searchMatch && streamMatch && newsTypeMatch;
    });
    
    renderMembers();
    updateResultsCount();
    
    const endTime = performance.now();
    console.log(`Filtering took ${(endTime - startTime).toFixed(2)} milliseconds`);
}

function resetAllFilters() {
    if (searchInput) searchInput.value = '';
    if (streamFilter) streamFilter.value = '';
    if (newsTypeFilter) newsTypeFilter.value = '';
    
    currentFilters = {
        search: '',
        stream: '',
        newsType: ''
    };
    
    if (clearSearchBtn) {
        clearSearchBtn.style.display = 'none';
    }
    
    applyFilters();
    
    announceToScreenReader('All filters have been reset');
}

function updateResultsCount() {
    if (resultsCount) {
        const count = filteredMembers.length;
        const total = membersData.length;
        
        if (count === total) {
            resultsCount.textContent = `Showing all ${total} team members`;
        } else if (count === 0) {
            resultsCount.textContent = 'No team members found matching your criteria';
        } else {
            resultsCount.textContent = `Showing ${count} of ${total} team members`;
        }
    }
}

function updateTotalMembers() {
    if (totalMembers) {
        totalMembers.textContent = membersData.length;
    }
}

function updateHeaderStats() {
    if (headerMemberCount) {
        headerMemberCount.textContent = membersData.length;
    }
}

function renderMembers() {
    if (!membersContainer) return;
    
    if (filteredMembers.length === 0) {
        membersContainer.innerHTML = '';
        if (noResultsState) {
            noResultsState.style.display = 'block';
        }
        return;
    }
    
    if (noResultsState) {
        noResultsState.style.display = 'none';
    }
    
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
    
    membersContainer.innerHTML = '';
    membersContainer.appendChild(fragment);
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
                    `<img src="${member.photo}" alt="${member.name}" class="member-photo-img" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : 
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
                    `<img src="${member.photo}" alt="${member.name}" class="member-photo-img" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : 
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
    
    card.addEventListener('click', () => showMemberModal(member));
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            showMemberModal(member);
        }
    });
    
    return card;
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
    if (!modalContent || !memberModal) return;
    
    const modalHTML = `
        <div class="modal-body">
            <div class="modal-photo">
                ${member.photo ? 
                    `<img src="${member.photo}" alt="${member.name}" class="modal-photo-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : 
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
    
    modalContent.innerHTML = modalHTML;
    memberModal.style.display = 'block';
    
    if (closeModal) {
        closeModal.focus();
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
    if (memberModal) {
        memberModal.style.display = 'none';
    }
    document.body.style.overflow = '';
    
    const activeCard = document.querySelector('.member-card[data-id]:focus');
    if (activeCard) {
        activeCard.focus();
    }
}

function handleKeyboardNavigation(e) {
    if (e.key === 'Escape' && memberModal && memberModal.style.display === 'block') {
        closeMemberModal();
    }
    
    if (memberModal && memberModal.style.display === 'block' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
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
    if (!backToTopBtn) return;
    
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    backToTopBtn.classList.remove('visible');
                } else {
                    backToTopBtn.classList.add('visible');
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

window.showTab = showTab;
window.resetAllFilters = resetAllFilters;
window.scrollToTop = scrollToTop;
window.showRandomMember = showRandomMember;
window.navigateModal = navigateModal;
window.showMemberModal = showMemberModal;
window.showMeetingInfo = showMeetingInfo;
window.sendJoinEmail = sendJoinEmail;

window.addEventListener('error', function(e) {
    console.error('Global error caught:', e.error);
});

if ('performance' in window) {
    window.addEventListener('load', function() {
        const loadTime = performance.now();
        console.log(`Page fully loaded in ${loadTime.toFixed(2)} milliseconds`);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('error', function(e) {
        if (e.target.tagName === 'IMG' && e.target.classList.contains('member-photo-img')) {
            const placeholder = e.target.nextElementSibling;
            if (placeholder && placeholder.classList.contains('photo-placeholder')) {
                e.target.style.display = 'none';
                placeholder.style.display = 'flex';
            }
        }
    }, true);
});