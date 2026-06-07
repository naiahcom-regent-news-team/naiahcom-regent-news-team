// ============================================================
// TeamDirectory — Advanced Edition
// Upgrades: Analytics Dashboard, Advanced Filtering & Sorting,
//           Entrance Animations, Micro-interactions, Spotlight,
//           Keyboard shortcuts, Export, Member Stats
// ============================================================

class TeamDirectory {
    constructor() {
        this.membersData = [];
        this.filteredMembers = [];
        this.currentFilters = {
            search: '',
            stream: '',
            newsType: '',
            classLevel: ''
        };
        this.currentSort = { field: 'name', direction: 'asc' };
        this.currentView = 'grid';
        this.currentMemberIndex = 0;
        this.isAnimating = false;

        // ── Spotlight / "Member of the Day" ──────────────────
        this.spotlightMember = null;

        // ── Analytics state ──────────────────────────────────
        this.analytics = {
            profileViews: {},       // id → count
            searchHistory: [],      // last 10 queries
            filterUsage: {},        // filterKey → count
            sessionStart: Date.now()
        };

        this.cacheElements();
    }

    // ─────────────────────────────────────────────────────────
    // INIT
    // ─────────────────────────────────────────────────────────
    async init() {
        try {
            this.showLoadingState();
            await this.loadMembersData();
            this.setupEventListeners();
            this.setupIntersectionObserver();
            this.setupScrollProgress();
            this.setupKeyboardShortcuts();
            this.hideLoadingState();
            this.updateHeaderStats();
            this.showTab('members');
            this.pickSpotlightMember();
            this.announceToScreenReader('Team directory loaded successfully');
            this.logPerformance();
        } catch (error) {
            this.handleInitializationError(error);
        }
    }

    // ─────────────────────────────────────────────────────────
    // DOM CACHE
    // ─────────────────────────────────────────────────────────
    cacheElements() {
        this.elements = {
            membersContainer:   document.getElementById('membersContainer'),
            searchInput:        document.getElementById('searchInput'),
            streamFilter:       document.getElementById('streamFilter'),
            newsTypeFilter:     document.getElementById('newsTypeFilter'),
            classFilter:        document.getElementById('classFilter'),
            sortSelect:         document.getElementById('sortSelect'),
            memberModal:        document.getElementById('memberModal'),
            modalContent:       document.getElementById('modalContent'),
            closeModal:         document.querySelector('.close'),
            clearSearchBtn:     document.getElementById('clearSearch'),
            resetFiltersBtn:    document.getElementById('resetFilters'),
            backToTopBtn:       document.getElementById('backToTop'),
            resultsCount:       document.getElementById('resultsCount'),
            totalMembers:       document.getElementById('totalMembers'),
            loadingIndicator:   document.getElementById('loadingIndicator'),
            noResultsState:     document.getElementById('noResults'),
            headerMemberCount:  document.getElementById('headerMemberCount'),
            viewButtons:        document.querySelectorAll('.view-btn'),
            tabButtons:         document.querySelectorAll('.tab-button'),
            tabContents:        document.querySelectorAll('.tab-content'),
            spotlightBanner:    document.getElementById('spotlightBanner'),
            analyticsTab:       document.getElementById('analytics'),
            shortcutHint:       document.getElementById('shortcutHint'),
            scrollProgress:     document.getElementById('scrollProgress'),
            exportBtn:          document.getElementById('exportBtn')
        };
    }

    // ─────────────────────────────────────────────────────────
    // DATA LOADING
    // ── Checks localStorage (admin panel saves here) first.
    // ── Falls back to the hardcoded list if nothing is saved.
    // ─────────────────────────────────────────────────────────
    async loadMembersData() {

        // ── HARDCODED FALLBACK LIST ───────────────────────────
        const fallbackMembers = [
            { id: "philippa",  name: "Philippa",   class: "SSS3",    stream: "Arts",       newsType: "President",                                          newsAbout: "Philippa leads the press team with confidence and heart. Her calm leadership and dedication to teamwork make her a respected role model who brings out the best in everyone around her.",                                                                                                                                                                                               photo: "assets/images/phillipa.jpg",   pronouns: "she/her", tone: "A" },
            { id: "favour",    name: "Favour",     class: "SSS2",    stream: "Science",    newsType: "Vice President & Local News Reporter",               newsAbout: "Favour supports the President and contributes to local news coverage. Her dedication and growing leadership skills make her a promising future leader of the team.",                                                                                                                                                                                                             photo: "assets/images/favour.jpg",     pronouns: "she/her", tone: "A" },
            { id: "patricia",  name: "Patricia",   class: "SSS3",    stream: "Arts",       newsType: "Motivational Speaker & Finance Secretary",           newsAbout: "Patricia balances creativity and organization in her dual role. She inspires her peers with thoughtful talks and manages the team's finances responsibly and efficiently.",                                                                                                                                                                                                    photo: "assets/images/patricia.jpg",   pronouns: "she/her", tone: "A" },
            { id: "elizabeth", name: "Elizabeth",  class: "SSS2",    stream: "Arts",       newsType: "Entertainment Reporter & Assistant Finance Secretary",newsAbout: "Elizabeth balances her love for entertainment with a sharp sense of organization. She reports with creativity and helps manage the team's finances effectively.",                                                                                                                                                                                                           photo: "assets/images/elizabeth.jpg",  pronouns: "she/her", tone: "A" },
            { id: "bradley",   name: "Bradley",    class: "SSS3",    stream: "Arts",       newsType: "Head of Media & Video Production",                   newsAbout: "Bradley leads the media unit with vision and creativity. His talent for video production and storytelling sets a high standard for the team's visual work.",                                                                                                                                                                                                                 photo: "assets/images/bradley.jpg",    pronouns: "he/him",  tone: "B" },
            { id: "nyamia",    name: "Nyamia",     class: "SSS2",    stream: "Science",    newsType: "Vice Head of Media & Video Production",              newsAbout: "Nyamia covers safety and awareness topics that keep students informed. His steady presence and sense of responsibility make him a dependable part of the team.",                                                                                                                                                                                                             photo: "assets/images/nyamia.jpg",     pronouns: "he/him",  tone: "A" },
            { id: "lauren",    name: "Lauren",     class: "SSS3",    stream: "Science",    newsType: "Editor & Media Specialist",                          newsAbout: "Lauren manages the digital side of the press team with creativity and intelligence. He designed and built the team's official website, TypeShift, using his technical talents to strengthen the team's online presence.",                                                                                                                                                    photo: "assets/images/laurens.png",    pronouns: "he/him",  tone: "A" },
            { id: "veronica",  name: "Veronica",   class: "SSS2",    stream: "Arts",       newsType: "Lead Broadcaster",                                   newsAbout: "Veronica is the clear and confident voice of the school. Her professionalism behind the mic and her cheerful energy make every broadcast engaging and enjoyable to listen to.",                                                                                                                                                                                              photo: "assets/images/veronica.jpg",   pronouns: "she/her", tone: "B" },
            { id: "rodney",    name: "Rodney",     class: "SSS3",    stream: "Science",    newsType: "Campus News Reporter",                               newsAbout: "Rodney has a great eye for stories and a natural curiosity about student life. His approachable attitude and clear reporting make him one of the most trusted voices in the press team.",                                                                                                                                                                                    photo: "assets/images/rodney.jpg",     pronouns: "he/him",  tone: "B" },
            { id: "seriki",    name: "Seriki",     class: "SSS3",    stream: "Science",    newsType: "Local News Correspondent",                           newsAbout: "Seriki reports on school updates and announcements with accuracy and care. Her approachable manner and sense of responsibility make her a dependable team member.",                                                                                                                                                                                                          photo: "assets/images/seriki.jpg",     pronouns: "she/her", tone: "A" },
            { id: "momoh",     name: "Momoh",      class: "SSS3",    stream: "Science",    newsType: "Local Sports Correspondent",                         newsAbout: "Momoh brings enthusiasm and insight to every sports story. His passion for teamwork and athletics helps him deliver exciting and accurate coverage of school competitions.",                                                                                                                                                                                                  photo: "assets/images/momoh.jpg",      pronouns: "he/him",  tone: "B" },
            { id: "moriba",    name: "Moriba",     class: "SSS3",    stream: "Science",    newsType: "International Sports Analyst",                       newsAbout: "Moriba takes sports journalism to a thoughtful level with his detailed analysis and love for global competition. He enjoys helping others appreciate the skill and strategy behind every match.",                                                                                                                                                                             photo: "assets/images/moriba.jpg",     pronouns: "he/him",  tone: "A" },
            { id: "bawoh",     name: "Bawoh",      class: "SSS3",    stream: "Arts",       newsType: "International Affairs Correspondent",                newsAbout: "Bawoh covers global issues with insight and clarity. Her thoughtful approach helps students connect international news to their everyday understanding of the world.",                                                                                                                                                                                                       photo: "assets/images/bawoh.jpg",      pronouns: "she/her", tone: "A" },
            { id: "fanta",     name: "Fanta",      class: "SSS2",    stream: "Science",    newsType: "Global News Correspondent",                          newsAbout: "Fanta reports on global news that matters to young people. Her calm delivery and thoughtful storytelling make her pieces informative and inspiring.",                                                                                                                                                                                                                       photo: "assets/images/fanta.jpg",      pronouns: "she/her", tone: "B" },
            { id: "augustine", name: "Augustine",  class: "SSS3",    stream: "Arts",       newsType: "Entertainment & Culture Reporter",                   newsAbout: "Augustine keeps the press team connected to arts and culture. His curiosity and sense of creativity help him share stories that reflect students' interests and school spirit.",                                                                                                                                                                                             photo: "assets/images/augustine.jpg",  pronouns: "he/him",  tone: "A" },
            { id: "isha",      name: "Isha",       class: "SSS2",    stream: "Science",    newsType: "Entertainment Correspondent",                        newsAbout: "Isha brings positivity and confidence to her role as Entertainment Correspondent. She enjoys covering events that showcase student talent and creativity.",                                                                                                                                                                                                                 photo: "assets/images/ishu.jpg",       pronouns: "she/her", tone: "B" },
            { id: "stellina",  name: "Stellina",   class: "SSS2",    stream: "Arts",       newsType: "International Culture Reporter",                     newsAbout: "Stellina reports on culture and traditions from around the world. Her curiosity and appreciation for diversity make her stories both informative and enjoyable.",                                                                                                                                                                                                           photo: "assets/images/stellina.jpg",   pronouns: "she/her", tone: "A" },
            { id: "papah",     name: "Papah",      class: "SSS3",    stream: "Arts",       newsType: "Literary & Creative Arts Editor",                    newsAbout: "Papah is passionate about creative writing and poetry. His dedication to helping others express themselves makes the school's literary section one of the press team's highlights.",                                                                                                                                                                                        photo: "assets/images/papah.jpg",      pronouns: "he/him",  tone: "B" },
            { id: "william",   name: "William",    class: "SSS3",    stream: "Arts",       newsType: "Business & Economics Reporter",                      newsAbout: "William explores financial and business topics with interest and focus. His reports encourage students to think about entrepreneurship and smart decision-making.",                                                                                                                                                                                                          photo: "assets/images/william.jpg",    pronouns: "he/him",  tone: "A" },
            { id: "daniella",  name: "Daniella",   class: "SSS3",    stream: "Commercial", newsType: "Business & Finance Reporter",                        newsAbout: "Daniella enjoys highlighting creative business ideas and achievements. Her professionalism and clear writing bring business news to life for students and staff alike.",                                                                                                                                                                                                    photo: "assets/images/daniella.jpg",   pronouns: "she/her", tone: "B" },
            { id: "augusta",   name: "Augusta",    class: "SSS1",    stream: "Arts",       newsType: "Media & Production Assistant",                       newsAbout: "Augusta assists the media team with enthusiasm and commitment. Her willingness to learn and contribute makes her one of the most dependable younger members of the club.",                                                                                                                                                                                                  photo: "assets/images/augusta.jpg",    pronouns: "she/her", tone: "B" },
            { id: "mr-bomah",  name: "Mr. Bomah",  class: "Faculty", stream: "Arts",       newsType: "Faculty Advisor",                                    newsAbout: "Mr. Bomah is the heart and soul of our press team. His dedication goes far beyond the classroom; he is a true mentor who invests deeply in each student's growth. With a perfect blend of wisdom and warmth, he creates an environment where we feel safe to experiment, learn, and excel. His encouragement is a constant source of motivation, and his belief in us often surpasses our belief in ourselves.", photo: "assets/images/mr-bomah.jpg", pronouns: "he/him",  tone: "A" }
        ];

        // ── LOAD FROM ADMIN PANEL (localStorage) IF AVAILABLE ─
        // The admin panel (admin.js) saves under the key "td_admin_members".
        // If that data exists and is valid, use it — otherwise fall back
        // to the hardcoded list above so the site always works.
        let members = fallbackMembers;

        try {
            const saved = localStorage.getItem('td_admin_members');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    members = parsed;
                    console.log(`[TeamDirectory] Loaded ${members.length} members from admin panel data.`);
                }
            } else {
                console.log('[TeamDirectory] No admin data found — using built-in member list.');
            }
        } catch (err) {
            console.warn('[TeamDirectory] Could not read admin data from localStorage:', err);
        }

        if (!Array.isArray(members)) throw new Error('Invalid data format: expected array');

        this.membersData     = this.normalizeMemberData(members);
        this.filteredMembers = [...this.membersData];

        this.populateFilterOptions();
        this.updateResultsCount();
        this.updateTotalMembers();
        this.renderMembers();
    }

    // ─────────────────────────────────────────────────────────
    // DATA NORMALIZATION
    // ─────────────────────────────────────────────────────────
    normalizeMemberData(members) {
        return members.map((member, index) => ({
            id:             member.id   || this.generateId(member.name),
            name:           member.name?.trim()      || 'Unknown Member',
            class:          member.class?.trim()     || 'Not specified',
            stream:         member.stream?.trim()    || 'General',
            newsType:       member.newsType?.trim()  || 'Team Member',
            newsAbout:      member.newsAbout?.trim() || 'More information coming soon.',
            photo:          member.photo             || '',
            pronouns:       member.pronouns          || 'they/them',
            tone:           member.tone              || 'A',
            initials:       this.getInitials(member.name),
            searchableText: this.createSearchableText(member),
            _index:         index,
            // ── Extra computed ───────────────────────────────
            department:     this.inferDepartment(member.newsType),
            isLeadership:   this.checkLeadership(member.newsType)
        }));
    }

    inferDepartment(role = '') {
        const r = role.toLowerCase();
        if (r.includes('president') || r.includes('advisor'))    return 'Leadership';
        if (r.includes('sport'))                                  return 'Sports';
        if (r.includes('entertain') || r.includes('culture'))    return 'Entertainment';
        if (r.includes('media') || r.includes('broadcast') || r.includes('video')) return 'Media';
        if (r.includes('finance') || r.includes('business') || r.includes('economics')) return 'Business';
        if (r.includes('international') || r.includes('global')) return 'World';
        if (r.includes('literary') || r.includes('creative'))    return 'Creative';
        return 'News';
    }

    checkLeadership(role = '') {
        const r = role.toLowerCase();
        return r.includes('president') || r.includes('head') ||
               r.includes('advisor')   || r.includes('editor') || r.includes('lead');
    }

    createSearchableText(member) {
        return [member.name, member.class, member.stream,
                member.newsType, member.newsAbout, member.pronouns]
            .filter(Boolean).join(' ').toLowerCase();
    }

    // ─────────────────────────────────────────────────────────
    // FILTER OPTIONS — now includes Class + Sort
    // ─────────────────────────────────────────────────────────
    populateFilterOptions() {
        const streams    = [...new Set(this.membersData.map(m => m.stream).filter(Boolean))].sort();
        const newsTypes  = [...new Set(this.membersData.map(m => m.newsType).filter(Boolean))].sort();
        const classes    = [...new Set(this.membersData.map(m => m.class).filter(Boolean))].sort();

        this.populateSelect(this.elements.streamFilter,   streams,   'All Streams');
        this.populateSelect(this.elements.newsTypeFilter, newsTypes, 'All Roles');
        this.populateSelect(this.elements.classFilter,    classes,   'All Classes');
    }

    populateSelect(el, options, defaultLabel) {
        if (!el) return;
        el.innerHTML = `<option value="">${defaultLabel}</option>` +
            options.map(o => `<option value="${o}">${o}</option>`).join('');
    }

    // ─────────────────────────────────────────────────────────
    // FILTERING & SORTING
    // ─────────────────────────────────────────────────────────
    applyFilters() {
        const t0 = performance.now();

        this.filteredMembers = this.membersData.filter(m =>
            this.passesSearchFilter(m) &&
            this.passesStreamFilter(m) &&
            this.passesNewsTypeFilter(m) &&
            this.passesClassFilter(m)
        );

        this.applySorting();
        this.renderMembers();
        this.updateResultsCount();
        this.trackFilterUsage();

        console.log(`Filter+sort: ${(performance.now() - t0).toFixed(2)}ms`);
    }

    passesSearchFilter(m) {
        if (!this.currentFilters.search) return true;
        return m.searchableText.includes(this.currentFilters.search);
    }
    passesStreamFilter(m) {
        return !this.currentFilters.stream || m.stream === this.currentFilters.stream;
    }
    passesNewsTypeFilter(m) {
        if (!this.currentFilters.newsType) return true;
        return m.newsType.toLowerCase().includes(this.currentFilters.newsType.toLowerCase());
    }
    passesClassFilter(m) {
        return !this.currentFilters.classLevel || m.class === this.currentFilters.classLevel;
    }

    // ── Sorting ──────────────────────────────────────────────
    applySorting() {
        const { field, direction } = this.currentSort;
        const dir = direction === 'asc' ? 1 : -1;

        this.filteredMembers.sort((a, b) => {
            let va = a[field] || '';
            let vb = b[field] || '';

            // Numeric class sort (SSS1 < SSS2 etc.)
            if (field === 'class') {
                const numA = parseInt(va.replace(/\D/g, '')) || 0;
                const numB = parseInt(vb.replace(/\D/g, '')) || 0;
                return (numA - numB) * dir;
            }

            return va.toString().localeCompare(vb.toString()) * dir;
        });
    }

    handleSortChange() {
        const val = this.elements.sortSelect?.value || 'name-asc';
        const [field, direction] = val.split('-');
        this.currentSort = { field, direction };
        this.applyFilters();
        this.announceToScreenReader(`Sorted by ${field}, ${direction === 'asc' ? 'ascending' : 'descending'}`);
    }

    // ── Analytics tracking ───────────────────────────────────
    trackFilterUsage() {
        const key = JSON.stringify(this.currentFilters);
        this.analytics.filterUsage[key] = (this.analytics.filterUsage[key] || 0) + 1;
    }

    trackProfileView(memberId) {
        this.analytics.profileViews[memberId] = (this.analytics.profileViews[memberId] || 0) + 1;
    }

    trackSearch(term) {
        if (!term) return;
        this.analytics.searchHistory.unshift(term);
        this.analytics.searchHistory = this.analytics.searchHistory.slice(0, 10);
    }

    // ─────────────────────────────────────────────────────────
    // SPOTLIGHT — Member of the Day
    // ─────────────────────────────────────────────────────────
    pickSpotlightMember() {
        if (!this.membersData.length) return;
        // Deterministic by date so it's stable all day
        const dayIndex = Math.floor(Date.now() / 86400000) % this.membersData.length;
        this.spotlightMember = this.membersData[dayIndex];
        this.renderSpotlight();
    }

    renderSpotlight() {
        const banner = this.elements.spotlightBanner;
        if (!banner || !this.spotlightMember) return;

        const m = this.spotlightMember;
        banner.innerHTML = `
            <div class="spotlight-inner" role="complementary" aria-label="Member spotlight">
                <div class="spotlight-badge">✦ Member of the Day</div>
                <div class="spotlight-photo">
                    ${m.photo
                        ? `<img src="${m.photo}" alt="${m.name}" loading="lazy" onerror="teamDirectory.handleImageError(this)"><span class="photo-placeholder" style="display:none">${m.initials}</span>`
                        : `<span class="photo-placeholder">${m.initials}</span>`}
                </div>
                <div class="spotlight-info">
                    <span class="spotlight-name">${m.name}</span>
                    <span class="spotlight-role">${m.newsType}</span>
                    <p class="spotlight-bio">${this.truncateText(m.newsAbout, 100)}</p>
                </div>
                <button class="spotlight-cta" onclick="teamDirectory.showMemberModal(teamDirectory.spotlightMember)">
                    View Profile →
                </button>
            </div>`;

        banner.style.display = 'block';
        // Animate in
        requestAnimationFrame(() => banner.classList.add('spotlight-visible'));
    }

    // ─────────────────────────────────────────────────────────
    // ANALYTICS DASHBOARD
    // ─────────────────────────────────────────────────────────
    renderAnalyticsDashboard() {
        const tab = this.elements.analyticsTab;
        if (!tab) return;

        const total    = this.membersData.length;
        const byStream = this.groupBy(this.membersData, 'stream');
        const byClass  = this.groupBy(this.membersData, 'class');
        const byDept   = this.groupBy(this.membersData, 'department');
        const leaders  = this.membersData.filter(m => m.isLeadership).length;

        // Top viewed profiles
        const topViewed = Object.entries(this.analytics.profileViews)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([id, count]) => {
                const m = this.membersData.find(x => x.id === id);
                return m ? { name: m.name, count } : null;
            })
            .filter(Boolean);

        tab.innerHTML = `
            <div class="analytics-dashboard">
                <h2 class="analytics-title">📊 Team Analytics</h2>

                <!-- KPI Row -->
                <div class="kpi-row">
                    ${this.kpiCard('👥', 'Total Members', total)}
                    ${this.kpiCard('🏆', 'Leadership Roles', leaders)}
                    ${this.kpiCard('📚', 'Streams', Object.keys(byStream).length)}
                    ${this.kpiCard('🎓', 'Class Levels', Object.keys(byClass).length)}
                </div>

                <!-- Charts Row -->
                <div class="charts-row">
                    ${this.barChartHtml('Members by Stream', byStream, 'chart-stream')}
                    ${this.barChartHtml('Members by Class', byClass, 'chart-class')}
                    ${this.barChartHtml('Members by Department', byDept, 'chart-dept')}
                </div>

                <!-- Top Profiles -->
                <div class="analytics-section">
                    <h3 class="analytics-section-title">🔥 Most Viewed Profiles (this session)</h3>
                    ${topViewed.length
                        ? `<ol class="top-viewed-list">${topViewed.map(v =>
                            `<li><span class="tv-name">${v.name}</span><span class="tv-count">${v.count} view${v.count > 1 ? 's' : ''}</span></li>`
                        ).join('')}</ol>`
                        : `<p class="analytics-empty">No profiles viewed yet — explore the team!</p>`}
                </div>

                <!-- Recent Searches -->
                <div class="analytics-section">
                    <h3 class="analytics-section-title">🔎 Recent Searches</h3>
                    ${this.analytics.searchHistory.length
                        ? `<div class="search-chips">${this.analytics.searchHistory.map(s =>
                            `<button class="search-chip" onclick="teamDirectory.applySavedSearch('${s}')">${s}</button>`
                        ).join('')}</div>`
                        : `<p class="analytics-empty">No searches yet.</p>`}
                </div>

                <!-- Export -->
                <div class="analytics-section">
                    <h3 class="analytics-section-title">⬇ Export</h3>
                    <div class="export-buttons">
                        <button class="export-btn" onclick="teamDirectory.exportCSV()">Export CSV</button>
                        <button class="export-btn" onclick="teamDirectory.exportJSON()">Export JSON</button>
                    </div>
                </div>
            </div>`;

        // Animate bars after render
        requestAnimationFrame(() => {
            document.querySelectorAll('.bar-fill').forEach(bar => {
                const target = bar.getAttribute('data-width');
                bar.style.width = target + '%';
            });
        });
    }

    kpiCard(icon, label, value) {
        return `
            <div class="kpi-card animate-in">
                <span class="kpi-icon">${icon}</span>
                <span class="kpi-value">${value}</span>
                <span class="kpi-label">${label}</span>
            </div>`;
    }

    barChartHtml(title, data, id) {
        const max = Math.max(...Object.values(data));
        const rows = Object.entries(data)
            .sort((a, b) => b[1] - a[1])
            .map(([label, count]) => {
                const pct = max > 0 ? Math.round((count / max) * 100) : 0;
                return `
                    <div class="bar-row">
                        <span class="bar-label">${label}</span>
                        <div class="bar-track">
                            <div class="bar-fill" data-width="${pct}" style="width:0%"></div>
                        </div>
                        <span class="bar-count">${count}</span>
                    </div>`;
            }).join('');
        return `
            <div class="chart-card" id="${id}">
                <h4 class="chart-title">${title}</h4>
                <div class="bar-chart">${rows}</div>
            </div>`;
    }

    groupBy(arr, key) {
        return arr.reduce((acc, item) => {
            const k = item[key] || 'Unknown';
            acc[k] = (acc[k] || 0) + 1;
            return acc;
        }, {});
    }

    // ─────────────────────────────────────────────────────────
    // EXPORT
    // ─────────────────────────────────────────────────────────
    exportCSV() {
        const headers = ['Name', 'Class', 'Stream', 'Role', 'Pronouns'];
        const rows = this.filteredMembers.map(m =>
            [m.name, m.class, m.stream, m.newsType, m.pronouns]
                .map(v => `"${v}"`)
                .join(',')
        );
        const csv = [headers.join(','), ...rows].join('\n');
        this.downloadFile(csv, 'team-directory.csv', 'text/csv');
        this.announceToScreenReader('CSV exported');
    }

    exportJSON() {
        const data = this.filteredMembers.map(({ name, class: cls, stream, newsType, newsAbout, pronouns }) =>
            ({ name, class: cls, stream, newsType, newsAbout, pronouns }));
        this.downloadFile(JSON.stringify(data, null, 2), 'team-directory.json', 'application/json');
        this.announceToScreenReader('JSON exported');
    }

    downloadFile(content, filename, type) {
        const blob = new Blob([content], { type });
        const url  = URL.createObjectURL(blob);
        const a    = Object.assign(document.createElement('a'), { href: url, download: filename });
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ─────────────────────────────────────────────────────────
    // CARD RENDERING — with staggered entrance animation
    // ─────────────────────────────────────────────────────────
    createMemberCard(member) {
        const card = document.createElement('article');
        card.className = 'member-card card-enter';
        card.setAttribute('data-id', member.id);
        card.setAttribute('data-index', member._index);
        card.setAttribute('role', 'article');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-labelledby', `card-title-${member.id}`);
        card.setAttribute('aria-describedby', `card-desc-${member.id}`);

        // Leadership badge
        const leaderBadge = member.isLeadership
            ? `<span class="leadership-badge" aria-label="Leadership role">★</span>` : '';

        const isListView = this.currentView === 'list';

        card.innerHTML = `
            ${this.createPhotoHtml(member, isListView)}
            ${this.createInfoHtml(member, isListView)}
            ${leaderBadge}
        `;

        this.addCardEventListeners(card, member);
        return card;
    }

    createPhotoHtml(member, isListView = false) {
        const cls = isListView ? 'member-photo list-view' : 'member-photo';
        return `
            <div class="${cls}">
                ${member.photo
                    ? `<img src="${member.photo}" alt="Portrait of ${member.name}" class="member-photo-img" loading="lazy"
                            onerror="teamDirectory.handleImageError(this)" data-src="${member.photo}">`
                    : ''}
                <span class="photo-placeholder" style="${member.photo ? 'display:none' : ''}" aria-hidden="true">
                    ${member.initials}
                </span>
            </div>`;
    }

    createInfoHtml(member, isListView = false) {
        if (isListView) {
            return `
                <div class="member-info list-view">
                    <div class="member-header">
                        <h3 id="card-title-${member.id}" class="member-name">${member.name}</h3>
                        <span class="role-tag" aria-label="Role: ${member.newsType}">${member.newsType}</span>
                    </div>
                    <div class="member-details">
                        ${member.class  ? `<span class="member-class">${member.class}</span>`   : ''}
                        ${member.stream ? `<span class="member-stream">${member.stream}</span>` : ''}
                        <span class="member-dept dept-${member.department.toLowerCase()}">${member.department}</span>
                    </div>
                    <p id="card-desc-${member.id}" class="member-preview">
                        ${this.truncateText(member.newsAbout, 120)}
                    </p>
                </div>`;
        }
        return `
            <div class="member-info">
                <h3 id="card-title-${member.id}" class="member-name">${member.name}</h3>
                <div class="member-details">
                    ${member.class  ? `<span class="member-class">${member.class}</span>`   : ''}
                    ${member.stream ? `<span class="member-stream">${member.stream}</span>` : ''}
                </div>
                <div class="member-role">
                    <span class="role-tag" aria-label="Role: ${member.newsType}">${member.newsType}</span>
                </div>
                <span class="member-dept dept-${member.department.toLowerCase()}">${member.department}</span>
            </div>`;
    }

    addCardEventListeners(card, member) {
        card.addEventListener('click', () => this.showMemberModal(member));
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.showMemberModal(member); }
        });
        card.addEventListener('mouseenter', () => this.previewTooltip(card, member));
        card.addEventListener('mouseleave', () => this.hideTooltip());
        card.addEventListener('focus',  () => card.classList.add('focused'));
        card.addEventListener('blur',   () => card.classList.remove('focused'));
    }

    // ── Tooltip on hover ─────────────────────────────────────
    previewTooltip(card, member) {
        let tip = document.getElementById('hoverTooltip');
        if (!tip) {
            tip = document.createElement('div');
            tip.id = 'hoverTooltip';
            tip.className = 'hover-tooltip';
            document.body.appendChild(tip);
        }
        tip.innerHTML = `
            <strong>${member.name}</strong>
            <span>${member.department} · ${member.stream}</span>
            <em>${this.truncateText(member.newsAbout, 80)}</em>`;
        const rect = card.getBoundingClientRect();
        tip.style.top  = `${rect.bottom + window.scrollY + 8}px`;
        tip.style.left = `${rect.left   + window.scrollX}px`;
        tip.classList.add('tooltip-visible');
    }

    hideTooltip() {
        const tip = document.getElementById('hoverTooltip');
        if (tip) tip.classList.remove('tooltip-visible');
    }

    // ─────────────────────────────────────────────────────────
    // MODAL
    // ─────────────────────────────────────────────────────────
    showMemberModal(member) {
        if (!this.elements.modalContent || !this.elements.memberModal) return;

        this.currentMemberIndex = this.filteredMembers.findIndex(m => m.id === member.id);
        this.trackProfileView(member.id);

        this.elements.modalContent.innerHTML = this.createModalHtml(member);
        this.elements.memberModal.style.display = 'block';

        requestAnimationFrame(() => {
            this.elements.memberModal.classList.add('modal-open');
        });

        setTimeout(() => {
            const closeBtn = this.elements.memberModal.querySelector('.close');
            if (closeBtn) closeBtn.focus();
        }, 60);

        document.body.style.overflow = 'hidden';
        document.body.setAttribute('aria-hidden', 'true');
        this.elements.memberModal.setAttribute('aria-hidden', 'false');
        this.announceToScreenReader(`Opened profile for ${member.name}`);
    }

    createModalHtml(member) {
        const views = this.analytics.profileViews[member.id] || 0;
        return `
            <div class="modal-body" role="dialog" aria-labelledby="modalTitle" aria-describedby="modalDescription">
                <div class="modal-photo">
                    ${member.photo
                        ? `<img src="${member.photo}" alt="Portrait of ${member.name}" class="modal-photo-img" onerror="teamDirectory.handleImageError(this)">`
                        : ''}
                    <span class="photo-placeholder" style="${member.photo ? 'display:none' : ''}">${member.initials}</span>
                    ${member.isLeadership ? `<span class="modal-leader-badge">★ Leadership</span>` : ''}
                </div>

                <h2 id="modalTitle" class="modal-name">${member.name}</h2>

                <div class="modal-metadata">
                    ${member.pronouns ? `<span class="member-pronouns">${member.pronouns}</span>` : ''}
                    ${member.class    ? `<span class="member-class">${member.class}</span>`        : ''}
                    ${member.stream   ? `<span class="member-stream">${member.stream}</span>`      : ''}
                    <span class="member-dept dept-${member.department.toLowerCase()}">${member.department}</span>
                </div>

                <div id="modalDescription" class="modal-bio">
                    <p>${member.newsAbout}</p>
                </div>

                <div class="modal-role">
                    <span class="modal-role-tag">${member.newsType}</span>
                </div>

                ${views > 0 ? `<div class="modal-views">${views} view${views > 1 ? 's' : ''} this session</div>` : ''}

                <div class="modal-navigation" aria-label="Member navigation">
                    <button class="nav-btn prev-btn" onclick="teamDirectory.navigateModal('prev')" aria-label="Previous member">
                        <i class="fas fa-chevron-left" aria-hidden="true"></i>
                    </button>
                    <span class="nav-position" aria-live="polite">
                        ${this.currentMemberIndex + 1} of ${this.filteredMembers.length}
                    </span>
                    <button class="nav-btn next-btn" onclick="teamDirectory.navigateModal('next')" aria-label="Next member">
                        <i class="fas fa-chevron-right" aria-hidden="true"></i>
                    </button>
                </div>
            </div>`;
    }

    navigateModal(direction) {
        if (this.isAnimating) return;
        this.isAnimating = true;

        const content = this.elements.modalContent;
        content?.classList.add('modal-slide-out');

        setTimeout(() => {
            if (direction === 'prev') {
                this.currentMemberIndex = this.currentMemberIndex > 0
                    ? this.currentMemberIndex - 1
                    : this.filteredMembers.length - 1;
            } else {
                this.currentMemberIndex = this.currentMemberIndex < this.filteredMembers.length - 1
                    ? this.currentMemberIndex + 1
                    : 0;
            }
            const member = this.filteredMembers[this.currentMemberIndex];
            this.showMemberModal(member);

            content?.classList.remove('modal-slide-out');
            this.isAnimating = false;
        }, 200);
    }

    closeMemberModal() {
        if (!this.elements.memberModal) return;

        this.elements.memberModal.classList.remove('modal-open');
        setTimeout(() => {
            this.elements.memberModal.style.display = 'none';
        }, 250);

        document.body.style.overflow = '';
        document.body.removeAttribute('aria-hidden');

        const activeCard = document.querySelector(`.member-card[data-index="${this.currentMemberIndex}"]`);
        if (activeCard) setTimeout(() => activeCard.focus(), 60);

        this.announceToScreenReader('Modal closed');
    }

    // ─────────────────────────────────────────────────────────
    // SCROLL PROGRESS BAR
    // ─────────────────────────────────────────────────────────
    setupScrollProgress() {
        const bar = this.elements.scrollProgress;
        if (!bar) return;

        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            const total    = document.documentElement.scrollHeight - window.innerHeight;
            const pct      = total > 0 ? (scrolled / total) * 100 : 0;
            bar.style.width = `${pct}%`;
        }, { passive: true });
    }

    // ─────────────────────────────────────────────────────────
    // KEYBOARD SHORTCUTS
    // ─────────────────────────────────────────────────────────
    setupKeyboardShortcuts() {
        const shortcuts = {
            '/':  () => { this.elements.searchInput?.focus(); },
            'r':  () => this.showRandomMember(),
            'g':  () => this.handleViewToggle('grid'),
            'l':  () => this.handleViewToggle('list'),
            '1':  () => this.showTab('members'),
            '2':  () => this.showTab('about'),
            '3':  () => this.showTab('analytics'),
            '?':  () => this.toggleShortcutHint()
        };

        document.addEventListener('keydown', e => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (e.key === 'Escape') {
                if (this.elements.memberModal?.style.display === 'block') this.closeMemberModal();
                return;
            }
            const fn = shortcuts[e.key];
            if (fn) { e.preventDefault(); fn(); }

            if (this.elements.memberModal?.style.display === 'block') {
                if (e.key === 'ArrowLeft')  this.navigateModal('prev');
                if (e.key === 'ArrowRight') this.navigateModal('next');
            }
        });
    }

    toggleShortcutHint() {
        const hint = this.elements.shortcutHint;
        if (!hint) return;
        const isVisible = hint.classList.contains('hint-visible');
        hint.classList.toggle('hint-visible', !isVisible);
    }

    // ─────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────
    renderMembers() {
        const container = this.elements.membersContainer;
        if (!container) return;

        if (this.filteredMembers.length === 0) {
            container.innerHTML = '';
            if (this.elements.noResultsState) this.elements.noResultsState.style.display = 'block';
            return;
        }

        if (this.elements.noResultsState) this.elements.noResultsState.style.display = 'none';

        const fragment = document.createDocumentFragment();
        this.filteredMembers.forEach((member, i) => {
            try {
                member._index = i;
                const card = this.createMemberCard(member);
                // stagger animation delay
                card.style.animationDelay = `${i * 40}ms`;
                fragment.appendChild(card);
            } catch (err) {
                fragment.appendChild(this.createErrorCard(member, err));
            }
        });

        container.innerHTML = '';
        container.appendChild(fragment);
        this.lazyLoadImages();

        // Trigger entrance animation
        requestAnimationFrame(() => {
            container.querySelectorAll('.card-enter').forEach(c => c.classList.add('card-visible'));
        });
    }

    lazyLoadImages() {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.getAttribute('data-src');
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });
        document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
    }

    // ─────────────────────────────────────────────────────────
    // EVENT LISTENERS
    // ─────────────────────────────────────────────────────────
    setupEventListeners() {
        // Search
        this.elements.searchInput?.addEventListener('input',
            this.debounce(this.handleSearch.bind(this), 250));

        // Clear search
        this.elements.clearSearchBtn?.addEventListener('click', this.clearSearch.bind(this));

        // Filters
        this.elements.streamFilter?.addEventListener('change',   this.handleFilterChange.bind(this));
        this.elements.newsTypeFilter?.addEventListener('change', this.handleFilterChange.bind(this));
        this.elements.classFilter?.addEventListener('change',    this.handleFilterChange.bind(this));

        // Sort
        this.elements.sortSelect?.addEventListener('change', this.handleSortChange.bind(this));

        // Modal
        this.elements.closeModal?.addEventListener('click', this.closeMemberModal.bind(this));
        this.elements.memberModal?.addEventListener('click', e => {
            if (e.target === this.elements.memberModal) this.closeMemberModal();
        });

        // Reset & scroll
        this.elements.resetFiltersBtn?.addEventListener('click', this.resetAllFilters.bind(this));
        this.elements.backToTopBtn?.addEventListener('click', this.scrollToTop.bind(this));

        // Export button
        this.elements.exportBtn?.addEventListener('click', () => this.exportCSV());

        // Tabs
        this.setupTabNavigation();

        // View
        this.setupViewToggle();

        // Resize
        window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 250));

        // Global image errors
        document.addEventListener('error', this.handleGlobalImageError.bind(this), true);
    }

    setupTabNavigation() {
        this.elements.tabButtons.forEach(tab => {
            tab.addEventListener('click', e => {
                e.preventDefault();
                this.showTab(tab.getAttribute('data-tab'));
            });
            tab.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.showTab(tab.getAttribute('data-tab'));
                } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                    this.navigateTabs(e.key);
                }
            });
        });
    }

    setupViewToggle() {
        this.elements.viewButtons.forEach(btn => {
            btn.addEventListener('click', () => this.handleViewToggle(btn.getAttribute('data-view')));
        });
    }

    // ─────────────────────────────────────────────────────────
    // HANDLERS
    // ─────────────────────────────────────────────────────────
    handleSearch() {
        const val = this.elements.searchInput.value.toLowerCase().trim();
        this.currentFilters.search = val;
        this.trackSearch(val);

        if (this.elements.clearSearchBtn) {
            this.elements.clearSearchBtn.style.display = val ? 'flex' : 'none';
        }
        this.applyFilters();
    }

    clearSearch() {
        if (!this.elements.searchInput) return;
        this.elements.searchInput.value = '';
        this.currentFilters.search = '';
        if (this.elements.clearSearchBtn) this.elements.clearSearchBtn.style.display = 'none';
        this.applyFilters();
        this.elements.searchInput.focus();
        this.announceToScreenReader('Search cleared');
    }

    handleFilterChange() {
        this.currentFilters.stream     = this.elements.streamFilter?.value    || '';
        this.currentFilters.newsType   = this.elements.newsTypeFilter?.value  || '';
        this.currentFilters.classLevel = this.elements.classFilter?.value     || '';
        this.applyFilters();
    }

    handleViewToggle(viewType) {
        this.elements.viewButtons.forEach(btn => {
            const active = btn.getAttribute('data-view') === viewType;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-pressed', active.toString());
        });
        this.currentView = viewType;
        this.elements.membersContainer?.setAttribute('data-view', viewType);
        this.renderMembers();
        this.announceToScreenReader(`Switched to ${viewType} view`);
    }

    handleResize() {
        if (this.currentView === 'grid' && window.innerWidth < 768) this.renderMembers();
    }

    handleGlobalImageError(e) {
        if (e.target.tagName === 'IMG' &&
            (e.target.classList.contains('member-photo-img') ||
             e.target.classList.contains('modal-photo-img'))) {
            this.handleImageError(e.target);
        }
    }

    handleImageError(img) {
        img.style.display = 'none';
        const ph = img.nextElementSibling;
        if (ph?.classList.contains('photo-placeholder')) {
            ph.style.display = 'flex';
            ph.setAttribute('aria-hidden', 'false');
        }
    }

    // ─────────────────────────────────────────────────────────
    // TABS
    // ─────────────────────────────────────────────────────────
    showTab(tabId) {
        this.elements.tabButtons.forEach(tab => {
            const active = tab.getAttribute('data-tab') === tabId;
            tab.classList.toggle('active', active);
            tab.setAttribute('aria-selected', active.toString());
        });
        this.elements.tabContents.forEach(content => {
            const active = content.id === tabId;
            content.style.display = active ? 'block' : 'none';
            content.classList.toggle('active', active);
            content.setAttribute('aria-hidden', (!active).toString());
        });

        if (tabId === 'members')   setTimeout(() => this.renderMembers(), 50);
        if (tabId === 'analytics') setTimeout(() => this.renderAnalyticsDashboard(), 50);

        this.announceToScreenReader(`Switched to ${this.getTabName(tabId)} tab`);
    }

    getTabName(tabId) {
        return { members: 'Team Members', about: 'About Us', beats: 'News Beats', contact: 'Contact', analytics: 'Analytics' }[tabId] || tabId;
    }

    navigateTabs(direction) {
        const tabs   = Array.from(this.elements.tabButtons);
        const cur    = tabs.indexOf(document.querySelector('.tab-button.active'));
        const newIdx = direction === 'ArrowRight'
            ? (cur < tabs.length - 1 ? cur + 1 : 0)
            : (cur > 0 ? cur - 1 : tabs.length - 1);
        const newId  = tabs[newIdx].getAttribute('data-tab');
        this.showTab(newId);
        tabs[newIdx].focus();
    }

    // ─────────────────────────────────────────────────────────
    // MISC
    // ─────────────────────────────────────────────────────────
    applySavedSearch(term) {
        if (!this.elements.searchInput) return;
        this.elements.searchInput.value = term;
        this.currentFilters.search = term.toLowerCase();
        this.applyFilters();
        this.showTab('members');
        this.announceToScreenReader(`Applied search: ${term}`);
    }

    showRandomMember() {
        if (!this.filteredMembers.length) return;
        const m = this.filteredMembers[Math.floor(Math.random() * this.filteredMembers.length)];
        this.showMemberModal(m);
        this.announceToScreenReader(`Showing random member: ${m.name}`);
    }

    updateResultsCount() {
        if (!this.elements.resultsCount) return;
        const count = this.filteredMembers.length;
        const total = this.membersData.length;
        this.elements.resultsCount.textContent = count === total
            ? `Showing all ${total} team members`
            : count === 0
                ? 'No team members found matching your criteria'
                : `Showing ${count} of ${total} team members`;
        this.elements.resultsCount.setAttribute('aria-live', 'polite');
    }

    updateTotalMembers()  { if (this.elements.totalMembers)      this.elements.totalMembers.textContent      = this.membersData.length; }
    updateHeaderStats()   { if (this.elements.headerMemberCount) this.elements.headerMemberCount.textContent = this.membersData.length; }

    resetAllFilters() {
        if (this.elements.searchInput)    this.elements.searchInput.value    = '';
        if (this.elements.streamFilter)   this.elements.streamFilter.value   = '';
        if (this.elements.newsTypeFilter) this.elements.newsTypeFilter.value = '';
        if (this.elements.classFilter)    this.elements.classFilter.value    = '';
        if (this.elements.sortSelect)     this.elements.sortSelect.value     = 'name-asc';
        if (this.elements.clearSearchBtn) this.elements.clearSearchBtn.style.display = 'none';

        this.currentFilters = { search: '', stream: '', newsType: '', classLevel: '' };
        this.currentSort    = { field: 'name', direction: 'asc' };

        this.applyFilters();
        this.announceToScreenReader('All filters reset');
        this.elements.searchInput?.focus();
    }

    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const header = document.querySelector('header');
        if (header) {
            header.setAttribute('tabindex', '-1');
            header.focus();
            setTimeout(() => header.removeAttribute('tabindex'), 1000);
        }
    }

    setupIntersectionObserver() {
        if (!this.elements.backToTopBtn) return;
        const observer = new IntersectionObserver(
            entries => entries.forEach(e =>
                this.elements.backToTopBtn.classList.toggle('visible', !e.isIntersecting)),
            { threshold: 0.1 }
        );
        const header = document.querySelector('header');
        if (header) observer.observe(header);
    }

    createErrorCard(member, error) {
        const card = document.createElement('div');
        card.className = 'member-card error';
        card.innerHTML = `<div class="member-photo error"><span class="photo-placeholder">!</span></div>
            <div class="member-info"><h3 class="member-name">Error Loading</h3>
            <div class="member-role"><span class="role-tag error">Error</span></div></div>`;
        console.error(`Error creating card for ${member?.name}:`, error);
        return card;
    }

    handleInitializationError(error) {
        console.error('Init failed:', error);
        if (this.elements.membersContainer) {
            this.elements.membersContainer.innerHTML = `
                <div class="error-message" role="alert">
                    <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
                    <h3>Unable to Load Team Members</h3>
                    <p>Please check your connection and try again.</p>
                    <button onclick="teamDirectory.retryInitialization()" class="retry-btn">
                        <i class="fas fa-redo" aria-hidden="true"></i> Try Again
                    </button>
                </div>`;
        }
        this.hideLoadingState();
    }

    retryInitialization() { this.init(); }

    showLoadingState() {
        if (this.elements.loadingIndicator) this.elements.loadingIndicator.style.display = 'flex';
        if (this.elements.membersContainer) this.elements.membersContainer.innerHTML = '';
        if (this.elements.noResultsState)   this.elements.noResultsState.style.display = 'none';
    }

    hideLoadingState() {
        if (this.elements.loadingIndicator) this.elements.loadingIndicator.style.display = 'none';
    }

    announceToScreenReader(message) {
        let el = document.getElementById('aria-announcer');
        if (!el) {
            el = document.createElement('div');
            el.id = 'aria-announcer';
            el.setAttribute('aria-live', 'polite');
            el.setAttribute('aria-atomic', 'true');
            el.className = 'visually-hidden';
            document.body.appendChild(el);
        }
        el.textContent = message;
        setTimeout(() => { el.textContent = ''; }, 1000);
    }

    logPerformance() {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                console.log(`Page loaded in ${performance.now().toFixed(2)}ms`);
                console.log(`${this.membersData.length} members loaded`);
            });
        }
    }

    debounce(fn, wait) {
        let t;
        return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
    }

    generateId(name) {
        return (name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }

    getInitials(name) {
        if (!name) return '??';
        return name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 3);
    }

    truncateText(text, max) {
        if (!text || text.length <= max) return text || '';
        return text.substring(0, max).trim() + '…';
    }
}

// ─────────────────────────────────────────────────────────────
// BOOT
// ─────────────────────────────────────────────────────────────
let teamDirectory;

document.addEventListener('DOMContentLoaded', () => {
    teamDirectory = new TeamDirectory();
    teamDirectory.init();
    window.teamDirectory = teamDirectory;
});

window.addEventListener('error', e => {
    console.error('Global error:', e.error);
    if (typeof gtag !== 'undefined') {
        gtag('event', 'exception', { description: e.error?.message, fatal: true });
    }
});

// Global HTML onclick helpers
window.showTab          = id  => teamDirectory?.showTab(id);
window.resetAllFilters  = ()  => teamDirectory?.resetAllFilters();
window.scrollToTop      = ()  => teamDirectory?.scrollToTop();
window.showRandomMember = ()  => teamDirectory?.showRandomMember();
window.navigateModal    = dir => teamDirectory?.navigateModal(dir);

window.sendJoinEmail = () => {
    window.location.href = 'mailto:naiahcomregentnewtseam101@gmail.com?subject=Interest in Joining News Team&body=Hello, I am interested in joining the Naiahcom High School Regent News Team. Please send me more information.';
};

window.showMeetingInfo = () => {
    const modal = document.getElementById('meetingModal');
    if (!modal) return;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    modal.querySelector('.close')?.focus();
    modal.addEventListener('click', function(e) {
        if (e.target === this) { this.style.display = 'none'; document.body.style.overflow = ''; }
    });
};
