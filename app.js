/* ========================================
   Canada Honeymoon Dashboard - App Logic
   ======================================== */

(function () {
    'use strict';

    // ===== COUNTDOWN =====
    const DEPARTURE = new Date('2026-05-23T13:25:00+08:00'); // Singapore departure time

    function updateCountdown() {
        const now = new Date();
        const diff = DEPARTURE - now;

        if (diff <= 0) {
            document.getElementById('countdown-label').textContent = 'The adventure has begun!';
            document.getElementById('cd-days').textContent = '00';
            document.getElementById('cd-hours').textContent = '00';
            document.getElementById('cd-mins').textContent = '00';
            document.getElementById('cd-secs').textContent = '00';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diff / (1000 * 60)) % 60);
        const secs = Math.floor((diff / 1000) % 60);

        document.getElementById('cd-days').textContent = String(days).padStart(2, '0');
        document.getElementById('cd-hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('cd-mins').textContent = String(mins).padStart(2, '0');
        document.getElementById('cd-secs').textContent = String(secs).padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);

    // ===== CHECKLIST PERSISTENCE =====
    const STORAGE_KEY = 'canada-honeymoon-checklist';

    function loadCheckedItems() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        } catch {
            return {};
        }
    }

    function saveCheckedItems(items) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }

    const checked = loadCheckedItems();
    const checkboxes = document.querySelectorAll('.check-item input[type="checkbox"]');

    checkboxes.forEach(cb => {
        const id = cb.dataset.id;
        if (checked[id]) cb.checked = true;

        cb.addEventListener('change', () => {
            const items = loadCheckedItems();
            if (cb.checked) {
                items[id] = true;
            } else {
                delete items[id];
            }
            saveCheckedItems(items);
            updateProgress();
        });
    });

    // ===== PROGRESS BAR =====
    function updateProgress() {
        const total = checkboxes.length;
        const done = document.querySelectorAll('.check-item input[type="checkbox"]:checked').length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;

        const bar = document.getElementById('progress-bar');
        const text = document.getElementById('progress-text');
        const detail = document.getElementById('progress-detail');

        bar.style.width = Math.max(pct, 4) + '%';
        text.textContent = pct + '%';
        detail.textContent = `${done} of ${total} items checked`;
    }

    updateProgress();

    // ===== WEATHER DATA (historical averages for late May / early June) =====
    const weatherData = {
        1:  { hi: 17, lo: 10, icon: '🌤', cond: 'Partly cloudy', loc: 'Vancouver' },
        2:  { hi: 18, lo: 10, icon: '☀️', cond: 'Mostly sunny', loc: 'Vancouver' },
        3:  { hi: 16, lo: 9,  icon: '🌤', cond: 'Partly cloudy', loc: 'Whistler' },
        4:  { hi: 19, lo: 7,  icon: '🌤', cond: 'Partly cloudy', loc: 'Calgary' },
        5:  { hi: 15, lo: 3,  icon: '☀️', cond: 'Sunny', loc: 'Banff' },
        6:  { hi: 15, lo: 3,  icon: '⛅', cond: 'Mix sun/cloud', loc: 'Banff' },
        7:  { hi: 14, lo: 2,  icon: '☀️', cond: 'Sunny', loc: 'Yoho' },
        8:  { hi: 13, lo: 1,  icon: '🌤', cond: 'Cool & clear', loc: 'Lake Louise' },
        9:  { hi: 14, lo: 2,  icon: '⛅', cond: 'Mix sun/cloud', loc: 'Field' },
        10: { hi: 13, lo: 1,  icon: '☀️', cond: 'Sunny', loc: 'Icefields' },
        11: { hi: 14, lo: 2,  icon: '🌤', cond: 'Partly cloudy', loc: 'Jasper' },
        12: { hi: 15, lo: 3,  icon: '☀️', cond: 'Sunny', loc: 'Jasper' },
        13: { hi: 16, lo: 4,  icon: '⛅', cond: 'Mix sun/cloud', loc: 'Jasper' },
        14: { hi: 16, lo: 4,  icon: '☀️', cond: 'Sunny', loc: 'Jasper' },
        15: { hi: 15, lo: 3,  icon: '🌤', cond: 'Partly cloudy', loc: 'Jasper' },
        16: { hi: 18, lo: 6,  icon: '⛅', cond: 'Mix sun/cloud', loc: 'Calgary' },
        17: { hi: 22, lo: 13, icon: '🌤', cond: 'Partly cloudy', loc: 'Montreal' },
        18: { hi: 21, lo: 12, icon: '☀️', cond: 'Sunny', loc: 'Quebec City' },
        19: { hi: 22, lo: 13, icon: '☀️', cond: 'Sunny', loc: 'Montreal' },
        20: { hi: 23, lo: 14, icon: '🌤', cond: 'Partly cloudy', loc: 'Montreal' },
        21: { hi: 22, lo: 13, icon: '⛅', cond: 'Mix sun/cloud', loc: 'Montreal' },
        22: { hi: 40, lo: 30, icon: '☀️', cond: 'Hot & sunny', loc: 'Doha' },
        23: { hi: 31, lo: 26, icon: '🌤', cond: 'Warm & humid', loc: 'Singapore' },
    };

    // Inject weather badges into day headers
    Object.entries(weatherData).forEach(([dayNum, w]) => {
        const dayInfo = document.querySelector(`#day-${dayNum} .day-info`);
        if (dayInfo) {
            const badge = document.createElement('span');
            badge.className = 'weather-badge';
            badge.innerHTML = `<i class="weather-icon">${w.icon}</i> ${w.hi}°/${w.lo}°C &middot; ${w.cond}`;
            badge.title = `${w.loc} historical average for this date`;
            dayInfo.appendChild(badge);
        }
    });

    // ===== PER-DAY NOTES =====
    const NOTES_KEY = 'canada-honeymoon-notes';

    function loadNotes() {
        try { return JSON.parse(localStorage.getItem(NOTES_KEY)) || {}; }
        catch { return {}; }
    }

    function saveNotes(notes) {
        localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    }

    const savedNotes = loadNotes();

    document.querySelectorAll('.day-body').forEach(body => {
        const card = body.closest('.day-card');
        if (!card) return;
        const dayId = card.id; // e.g. "day-1"

        const notesDiv = document.createElement('div');
        notesDiv.className = 'day-notes';
        notesDiv.innerHTML = `
            <div class="day-notes-label">&#128221; Notes</div>
            <textarea placeholder="Jot down notes, reminders, or memories..." data-note="${dayId}"></textarea>
        `;
        body.appendChild(notesDiv);

        const textarea = notesDiv.querySelector('textarea');
        if (savedNotes[dayId]) textarea.value = savedNotes[dayId];

        let saveTimeout;
        textarea.addEventListener('input', () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                const notes = loadNotes();
                if (textarea.value.trim()) {
                    notes[dayId] = textarea.value;
                } else {
                    delete notes[dayId];
                }
                saveNotes(notes);
            }, 400);
        });

        // Prevent day card collapse when clicking textarea
        textarea.addEventListener('click', (e) => e.stopPropagation());
    });

    // ===== ESSENTIALS PERSISTENCE =====
    const ESSENTIALS_KEY = 'canada-honeymoon-essentials';

    function loadEssentials() {
        try { return JSON.parse(localStorage.getItem(ESSENTIALS_KEY)) || {}; }
        catch { return {}; }
    }

    function saveEssentials(data) {
        localStorage.setItem(ESSENTIALS_KEY, JSON.stringify(data));
    }

    const savedEssentials = loadEssentials();

    document.querySelectorAll('.essentials-field input').forEach(input => {
        const key = input.dataset.essential;
        if (savedEssentials[key]) input.value = savedEssentials[key];

        input.addEventListener('input', () => {
            const data = loadEssentials();
            if (input.value.trim()) {
                data[key] = input.value;
            } else {
                delete data[key];
            }
            saveEssentials(data);
        });
    });

    // ===== OFFLINE INDICATOR =====
    const offlineBanner = document.createElement('div');
    offlineBanner.className = 'offline-banner';
    offlineBanner.textContent = '📡 You\'re offline — don\'t worry, everything still works!';
    document.body.appendChild(offlineBanner);

    function updateOnlineStatus() {
        offlineBanner.classList.toggle('visible', !navigator.onLine);
    }

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();

    // ===== QUICK NAV =====
    const days = [
        { num: 1, label: 'D1', date: 'May 23' },
        { num: 2, label: 'D2', date: 'May 24' },
        { num: 3, label: 'D3', date: 'May 25' },
        { num: 4, label: 'D4', date: 'May 26' },
        { num: 5, label: 'D5', date: 'May 27' },
        { num: 6, label: 'D6', date: 'May 28' },
        { num: 7, label: 'D7', date: 'May 29' },
        { num: 8, label: 'D8', date: 'May 30' },
        { num: 9, label: 'D9', date: 'May 31' },
        { num: 10, label: 'D10', date: 'Jun 1' },
        { num: 11, label: 'D11', date: 'Jun 2' },
        { num: 12, label: 'D12', date: 'Jun 3' },
        { num: 13, label: 'D13', date: 'Jun 4' },
        { num: 14, label: 'D14', date: 'Jun 5' },
        { num: 15, label: 'D15', date: 'Jun 6' },
        { num: 16, label: 'D16', date: 'Jun 7' },
        { num: 17, label: 'D17', date: 'Jun 8' },
        { num: 18, label: 'D18', date: 'Jun 9' },
        { num: 19, label: 'D19', date: 'Jun 10' },
        { num: 20, label: 'D20', date: 'Jun 11' },
        { num: 21, label: 'D21', date: 'Jun 12' },
        { num: 22, label: 'D22', date: 'Jun 13' },
        { num: 23, label: 'D23', date: 'Jun 14' },
    ];

    const navPills = document.getElementById('nav-pills');

    // Add section links
    const sections = [
        { id: 'map-section', label: 'Map' },
        { id: 'flights', label: 'Flights' },
        { id: 'cars', label: 'Cars' },
        { id: 'viewpoints', label: 'Views' },
        { id: 'essentials', label: 'Info' },
    ];

    sections.forEach(s => {
        const a = document.createElement('a');
        a.href = '#' + s.id;
        a.className = 'nav-pill';
        a.textContent = s.label;
        navPills.appendChild(a);
    });

    // Separator
    const sep = document.createElement('span');
    sep.style.cssText = 'width:1px;height:20px;background:#333;flex-shrink:0;align-self:center;';
    navPills.appendChild(sep);

    // Day pills
    days.forEach(d => {
        const a = document.createElement('a');
        a.href = '#day-' + d.num;
        a.className = 'nav-pill';
        a.textContent = d.label;
        a.title = d.date;
        navPills.appendChild(a);
    });

    // ===== HIGHLIGHT CURRENT DAY =====
    const tripDates = {
        1: '2026-05-23', 2: '2026-05-24', 3: '2026-05-25',
        4: '2026-05-26', 5: '2026-05-27', 6: '2026-05-28',
        7: '2026-05-29', 8: '2026-05-30', 9: '2026-05-31',
        10: '2026-06-01', 11: '2026-06-02', 12: '2026-06-03',
        13: '2026-06-04', 14: '2026-06-05', 15: '2026-06-06',
        16: '2026-06-07', 17: '2026-06-08', 18: '2026-06-09',
        19: '2026-06-10', 20: '2026-06-11', 21: '2026-06-12',
        22: '2026-06-13', 23: '2026-06-14',
    };

    function highlightToday() {
        const today = new Date().toISOString().split('T')[0];
        Object.entries(tripDates).forEach(([dayNum, date]) => {
            const card = document.getElementById('day-' + dayNum);
            if (card) {
                if (date === today) {
                    card.classList.add('today');
                    // Scroll into view after a brief delay
                    setTimeout(() => {
                        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 500);
                } else {
                    card.classList.remove('today');
                }
            }
        });
    }

    highlightToday();

    // ===== COLLAPSIBLE DAY CARDS =====
    document.querySelectorAll('.day-header').forEach(header => {
        header.addEventListener('click', (e) => {
            // Don't toggle if clicking a checkbox
            if (e.target.tagName === 'INPUT') return;
            const body = header.nextElementSibling;
            if (body.style.display === 'none') {
                body.style.display = '';
            } else {
                body.style.display = 'none';
            }
        });
    });

    // ===== ACTIVE NAV PILL on scroll =====
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                document.querySelectorAll('.nav-pill').forEach(pill => {
                    pill.classList.toggle('active', pill.getAttribute('href') === '#' + id);
                });
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('.day-card, .flights-section, .cars-section, .viewpoints-section').forEach(el => {
        observer.observe(el);
    });

})();
