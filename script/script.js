 // ── Year
        document.getElementById('yr').textContent = new Date().getFullYear();

        // ── Stars
        const pEl = document.getElementById('particles');
        for (let i = 0; i < 60; i++) {
            const s = document.createElement('div');
            s.className = 'star';
            const sz = Math.random() * 2 + 0.5;
            s.style.cssText = `width:${sz}px;height:${sz}px;left:${Math.random()*100}%;top:${Math.random()*100}%;--d:${2+Math.random()*4}s;--dl:${Math.random()*5}s`;
            pEl.appendChild(s);
        }

        // ── Light streaks
        for (let i = 0; i < 5; i++) {
            const s = document.createElement('div');
            s.className = 'streak';
            const w = 80 + Math.random() * 200;
            s.style.cssText = `width:${w}px;top:${10+Math.random()*80}%;--d:${3+Math.random()*5}s;--dl:${i*1.8}s`;
            pEl.appendChild(s);
        }

        // ── Steps
        const STEPS = [
            { pct: 10, text: 'Initializing portal…' },
            { pct: 22, text: 'Connecting to press servers…' },
            { pct: 36, text: 'Loading team directory…' },
            { pct: 50, text: 'Fetching campus headlines…' },
            { pct: 65, text: 'Building press archive…' },
            { pct: 80, text: 'Syncing journalist profiles…' },
            { pct: 92, text: 'Almost ready…' },
            { pct: 100, text: 'Welcome, Regent Press!' },
        ];

        const TICKERS = [
            'Welcome to Naiahcom High School Regent Press Team Directory — Your campus voice, always on.',
            'Latest edition now live — check out the stories from our award-winning journalism team!',
            'Have a scoop? Submit your story tip to the Regent Press editorial desk today.',
            'Sports, Arts, Academics, Events — full campus coverage from Naiahcom\'s finest reporters.',
        ];

        const bar    = document.getElementById('loadingBar');
        const pct    = document.getElementById('progressPercent');
        const txt    = document.getElementById('loadingText');
        const pbAria = document.getElementById('progressBar');
        const ticker = document.getElementById('tickerText');
        const track  = document.getElementById('stepTrack');
        const flash  = document.getElementById('flash');

        // Build step segments
        STEPS.forEach((_, i) => {
            const s = document.createElement('div');
            s.className = 's';
            s.id = 'st' + i;
            track.appendChild(s);
        });

        function runStep(i) {
            if (i >= STEPS.length) return;
            const step = STEPS[i];

            bar.style.width = step.pct + '%';
            pct.textContent = step.pct + '%';
            txt.textContent = step.text;
            pbAria.setAttribute('aria-valuenow', step.pct);

            for (let d = 0; d < STEPS.length; d++) {
                const el = document.getElementById('st' + d);
                el.classList.remove('active', 'done');
                if (d < i)      el.classList.add('done');
                else if (d === i) el.classList.add('active');
            }

            // Ticker update
            if (TICKERS[Math.floor(i / 2)]) {
                ticker.style.transition = 'opacity 0.3s';
                ticker.style.opacity = '0';
                setTimeout(() => {
                    ticker.textContent = TICKERS[Math.floor(i / 2)];
                    ticker.style.opacity = '1';
                }, 300);
            }

            if (step.pct < 100) {
                setTimeout(() => runStep(i + 1), 450 + Math.random() * 650);
            } else {
                // All done
                document.getElementById('st' + i).classList.remove('active');
                document.getElementById('st' + i).classList.add('done');
                setTimeout(() => {
                    flash.classList.add('go');
                    Redirect: window.location.href = 'index.html';
                }, 800);
            }
        }

        setTimeout(() => runStep(0), 600);
