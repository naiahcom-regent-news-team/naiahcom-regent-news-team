// ============================================================
// TeamDirectory Admin Panel — admin.js
// Password-protected member management with add/edit/delete
// Password: 123newspass
// ============================================================

const ADMIN_PASSWORD = "123newspass";
const STORAGE_KEY    = "td_admin_members";
const SESSION_KEY    = "td_admin_auth";

// ─────────────────────────────────────────────────────────────
// DEFAULT MEMBER DATA
// ─────────────────────────────────────────────────────────────
const DEFAULT_MEMBERS = [
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
    { id: "mr-bomah",  name: "Mr. Bomah",  class: "Faculty", stream: "Arts",       newsType: "Faculty Advisor",                                    newsAbout: "Mr. Bomah is the heart and soul of our press team. His dedication goes far beyond the classroom; he is a true mentor who invests deeply in each student's growth. With a perfect blend of wisdom and warmth, he creates an environment where we feel safe to experiment, learn, and excel.",                                                                                   photo: "assets/images/mr-bomah.jpg",   pronouns: "he/him",  tone: "A" }
];

// ─────────────────────────────────────────────────────────────
// ADMIN PANEL CLASS
// ─────────────────────────────────────────────────────────────
class AdminPanel {
    constructor() {
        this.members    = [];
        this.editingId  = null;
        this.authd      = false;
        this.currentTab = 'members';

        this.els = {};
    }

    // ── Boot ────────────────────────────────────────────────
    init() {
        this.cacheElements();
        this.loadMembers();
        this.bindEvents();
        this.checkSession();
    }

    cacheElements() {
        const ids = [
            'lockScreen','adminApp','passwordInput','loginBtn','loginError',
            'logoutBtn','memberList','searchInput','filterStream',
            'memberCount','memberForm','formTitle','cancelBtn','saveBtn',
            'addMemberBtn','exportBox','copyBtn','copyMsg','deleteModal',
            'deleteModalName','confirmDeleteBtn','cancelDeleteBtn',
            'toastContainer',
            // form fields
            'f-name','f-pronouns','f-class','f-stream','f-role','f-photo','f-tone','f-bio'
        ];
        ids.forEach(id => { this.els[id] = document.getElementById(id); });

        this.tabBtns    = document.querySelectorAll('.tab-btn');
        this.tabPanels  = document.querySelectorAll('.tab-panel');
    }

    // ── Auth / Session ──────────────────────────────────────
    checkSession() {
        if (sessionStorage.getItem(SESSION_KEY) === 'true') {
            this.grantAccess();
        }
    }

    attemptLogin() {
        const val = this.els['passwordInput']?.value || '';
        if (val === ADMIN_PASSWORD) {
            sessionStorage.setItem(SESSION_KEY, 'true');
            this.els['passwordInput'].value = '';
            this.els['loginError'].style.display = 'none';
            this.grantAccess();
        } else {
            this.els['loginError'].style.display = 'block';
            this.els['passwordInput'].value = '';
            this.els['passwordInput'].focus();
            this.els['loginError'].classList.remove('shake');
            void this.els['loginError'].offsetWidth; // reflow to restart animation
            this.els['loginError'].classList.add('shake');
        }
    }

    grantAccess() {
        this.authd = true;
        this.els['lockScreen'].classList.add('hidden');
        this.els['adminApp'].classList.remove('hidden');
        this.renderList();
    }

    logout() {
        sessionStorage.removeItem(SESSION_KEY);
        this.authd = false;
        this.els['adminApp'].classList.add('hidden');
        this.els['lockScreen'].classList.remove('hidden');
        this.els['passwordInput'].focus();
    }

    // ── Data persistence ────────────────────────────────────
    loadMembers() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            this.members = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(DEFAULT_MEMBERS));
        } catch {
            this.members = JSON.parse(JSON.stringify(DEFAULT_MEMBERS));
        }
    }

    persistMembers() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.members));
    }

    // ── Events ──────────────────────────────────────────────
    bindEvents() {
        // Login
        this.els['loginBtn']?.addEventListener('click', () => this.attemptLogin());
        this.els['passwordInput']?.addEventListener('keydown', e => {
            if (e.key === 'Enter') this.attemptLogin();
        });

        // Logout
        this.els['logoutBtn']?.addEventListener('click', () => this.logout());

        // Tabs
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        // Search & filter
        this.els['searchInput']?.addEventListener('input', () => this.renderList());
        this.els['filterStream']?.addEventListener('change', () => this.renderList());

        // Add member button → opens form tab
        this.els['addMemberBtn']?.addEventListener('click', () => {
            this.openFormForNew();
            this.switchTab('form');
        });

        // Form cancel / save
        this.els['cancelBtn']?.addEventListener('click', () => this.switchTab('members'));
        this.els['saveBtn']?.addEventListener('click', () => this.handleSave());

        // Export copy
        this.els['copyBtn']?.addEventListener('click', () => this.copyExport());

        // Delete modal
        this.els['confirmDeleteBtn']?.addEventListener('click', () => this.confirmDelete());
        this.els['cancelDeleteBtn']?.addEventListener('click',  () => this.closeDeleteModal());
        this.els['deleteModal']?.addEventListener('click', e => {
            if (e.target === this.els['deleteModal']) this.closeDeleteModal();
        });

        // Keyboard: Esc closes delete modal
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') this.closeDeleteModal();
        });
    }

    // ── Tabs ────────────────────────────────────────────────
    switchTab(id) {
        this.currentTab = id;
        this.tabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === id));
        this.tabPanels.forEach(p => p.classList.toggle('active', p.id === 'panel-' + id));

        if (id === 'members') this.renderList();
        if (id === 'export')  this.renderExport();
    }

    // ── Member list ─────────────────────────────────────────
    renderList() {
        const q  = (this.els['searchInput']?.value || '').toLowerCase().trim();
        const fs = this.els['filterStream']?.value || '';

        const filtered = this.members.filter(m => {
            const text = (m.name + ' ' + m.newsType + ' ' + m.stream + ' ' + m.class).toLowerCase();
            return (!q || text.includes(q)) && (!fs || m.stream === fs);
        });

        this.els['memberCount'].textContent =
            filtered.length === this.members.length
                ? this.members.length + ' members'
                : filtered.length + ' of ' + this.members.length + ' members';

        const list = this.els['memberList'];
        if (!filtered.length) {
            list.innerHTML = '<div class="empty-state"><span class="empty-icon">🔍</span><p>No members match your search</p></div>';
            return;
        }

        list.innerHTML = filtered.map(m => `
            <div class="member-row" data-id="${m.id}">
                <div class="avatar">${this.initials(m.name)}</div>
                <div class="member-info">
                    <span class="member-name">${this.escapeHtml(m.name)}</span>
                    <span class="member-meta">${this.escapeHtml(m.newsType)} &middot; ${m.class} &middot; ${m.stream}</span>
                </div>
                <div class="row-actions">
                    <button class="action-btn edit-btn" data-id="${m.id}" title="Edit member" aria-label="Edit ${this.escapeHtml(m.name)}">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Edit
                    </button>
                    <button class="action-btn delete-btn" data-id="${m.id}" title="Remove member" aria-label="Remove ${this.escapeHtml(m.name)}">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                        Remove
                    </button>
                </div>
            </div>
        `).join('');

        // Bind row buttons
        list.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => this.openFormForEdit(btn.dataset.id));
        });
        list.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => this.openDeleteModal(btn.dataset.id));
        });
    }

    // ── Form: open for new member ────────────────────────────
    openFormForNew() {
        this.editingId = null;
        this.els['formTitle'].textContent = 'Add new member';
        this.clearForm();
    }

    // ── Form: open for existing member ───────────────────────
    openFormForEdit(id) {
        const m = this.members.find(x => x.id === id);
        if (!m) return;
        this.editingId = id;
        this.els['formTitle'].textContent = 'Edit member';

        this.setField('f-name',     m.name);
        this.setField('f-pronouns', m.pronouns);
        this.setField('f-class',    m.class);
        this.setField('f-stream',   m.stream);
        this.setField('f-role',     m.newsType);
        this.setField('f-photo',    m.photo);
        this.setField('f-tone',     m.tone || 'A');
        this.setField('f-bio',      m.newsAbout);

        this.switchTab('form');
    }

    clearForm() {
        ['f-name','f-photo','f-role','f-bio'].forEach(id => this.setField(id, ''));
        this.setField('f-pronouns', 'she/her');
        this.setField('f-class',    'SSS3');
        this.setField('f-stream',   'Arts');
        this.setField('f-tone',     'A');
    }

    setField(id, value) {
        const el = this.els[id];
        if (el) el.value = value || '';
    }

    getField(id) {
        return (this.els[id]?.value || '').trim();
    }

    // ── Save member ─────────────────────────────────────────
    handleSave() {
        const name = this.getField('f-name');
        const role = this.getField('f-role');
        const bio  = this.getField('f-bio');

        if (!name) { this.highlightError('f-name', 'Name is required'); return; }
        if (!role) { this.highlightError('f-role', 'Role is required');  return; }
        if (!bio)  { this.highlightError('f-bio',  'Bio is required');   return; }

        const data = {
            id:       this.editingId || this.slugify(name),
            name,
            class:    this.getField('f-class'),
            stream:   this.getField('f-stream'),
            newsType: role,
            newsAbout: bio,
            photo:    this.getField('f-photo'),
            pronouns: this.getField('f-pronouns'),
            tone:     this.getField('f-tone') || 'A'
        };

        if (this.editingId) {
            const idx = this.members.findIndex(x => x.id === this.editingId);
            if (idx > -1) this.members[idx] = data;
            this.showToast('Member updated successfully');
        } else {
            this.members.push(data);
            this.showToast('New member added successfully');
        }

        this.persistMembers();
        this.editingId = null;
        this.clearForm();
        this.switchTab('members');
    }

    highlightError(fieldId, message) {
        const el = this.els[fieldId];
        if (!el) return;
        el.classList.add('field-error');
        el.focus();
        this.showToast(message, 'error');
        el.addEventListener('input', () => el.classList.remove('field-error'), { once: true });
    }

    // ── Delete modal ─────────────────────────────────────────
    _pendingDeleteId = null;

    openDeleteModal(id) {
        const m = this.members.find(x => x.id === id);
        if (!m) return;
        this._pendingDeleteId = id;
        this.els['deleteModalName'].textContent = m.name;
        this.els['deleteModal'].classList.remove('hidden');
        this.els['deleteModal'].classList.add('show');
        this.els['confirmDeleteBtn'].focus();
    }

    closeDeleteModal() {
        this._pendingDeleteId = null;
        this.els['deleteModal'].classList.remove('show');
        this.els['deleteModal'].classList.add('hidden');
    }

    confirmDelete() {
        if (!this._pendingDeleteId) return;
        const m = this.members.find(x => x.id === this._pendingDeleteId);
        this.members = this.members.filter(x => x.id !== this._pendingDeleteId);
        this.persistMembers();
        this.closeDeleteModal();
        this.renderList();
        this.showToast((m?.name || 'Member') + ' has been removed');
    }

    // ── Export ───────────────────────────────────────────────
    renderExport() {
        this.els['exportBox'].textContent = this.buildExportString();
    }

    buildExportString() {
        const esc = s => (s || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        const lines = this.members.map(m =>
            `            { id: "${esc(m.id)}", name: "${esc(m.name)}", class: "${esc(m.class)}", stream: "${esc(m.stream)}", newsType: "${esc(m.newsType)}", newsAbout: "${esc(m.newsAbout)}", photo: "${esc(m.photo || '')}", pronouns: "${esc(m.pronouns)}", tone: "${esc(m.tone || 'A')}" }`
        );
        return `const members = [\n${lines.join(',\n')}\n        ];`;
    }

    copyExport() {
        const text = this.buildExportString();
        navigator.clipboard.writeText(text).then(() => {
            this.els['copyBtn'].textContent = '✓ Copied!';
            setTimeout(() => { this.els['copyBtn'].textContent = 'Copy to clipboard'; }, 2000);
        }).catch(() => {
            // Fallback for older browsers
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity  = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            this.els['copyBtn'].textContent = '✓ Copied!';
            setTimeout(() => { this.els['copyBtn'].textContent = 'Copy to clipboard'; }, 2000);
        });
    }

    // ── Toast notifications ──────────────────────────────────
    showToast(message, type = 'success') {
        const container = this.els['toastContainer'];
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        requestAnimationFrame(() => toast.classList.add('toast-show'));
        setTimeout(() => {
            toast.classList.remove('toast-show');
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    }

    // ── Utilities ────────────────────────────────────────────
    initials(name) {
        if (!name) return '??';
        return name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2);
    }

    slugify(name) {
        return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }

    escapeHtml(str) {
        return (str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
}

// ─────────────────────────────────────────────────────────────
// BOOT
// ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
    window.adminPanel.init();
});
