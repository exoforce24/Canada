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

    // ===== ENCRYPTED ESSENTIALS WITH AES-256-GCM =====
    // Data is encrypted with password — only decryptable client-side
    const ENCRYPTED_DATA = 'L/dD8uHug2mStdaSpDKUEgn3MwY+TkAWtkMJmxgl9YRNV/ES6QQntiq2rGJvIKyD0IAeBjjWrCkamUYwNQK9Jy/TY4i7jwJDrZ19V78Pj/ZEudspaRINq+Ai/m8h55s7uNLDsw36c8X6oxzBf3bFue9NSYIM5/rmrmYY6t1OR3q2JBszdCm/3hj5E5xoNXNu3BgsjMEJz+DDiHUofcD0/QzfnGhwS7OPLFkcS1FvV+b+alLKj0EJYEhlbZbIeGwAgxmD0PF9bCbV65lgcIqTjSl4TK7lhnpjiMN4Qz9krbkeQR7IIhXuXzawoDbAC4mxoybGrmOCIP2o5tvy6+Q2VwaaIHnyix3CSD5LDiqHRswDyQMcLfiMDcHwPTrGAWCKbBSlMwyti7xZGQPehlSePrcCfaik2ChiZKtJDSPzcYsznwUzcIMiOOjBO/8FgEMUmCr0GaLQwgke2L4+m65Ug+WLUTBndfPKINni721GJ87tj1+EWVEQpO01hJARJ4UusW+ga/uU3qmSyQJdGvaSE0ZHavuuON3FUAI7pQiFzgzowoSwElpYQP1+Xw4lXtIN65pU/omPr1PBVjmd2G7cDVRrwe/Rs8qiXY+cryzBUhCR+J0/KvPbE5R8aB+LO6K7//lZtaz7X6cDr6y1hWdkvtLIy5EFlVy+G8cmoNnuO4qBZ+HzDhplzfJsAZzh+/MjuhlbTKrJBE2kwKGM/5ACmddvR6N2aADuCHina0xvYs0EAxFkfi5RLW98+Fc3hXaV+x7+Wf86pxuFq7onpzzFclXEkvB4f7sVJIZubKnL8krBaz+jOH60EYY1MLP/jRnQWtBzZD1C4fiMHBT7rjJX5nnJWfMm0hpKSfhD5yTVfuP4/Xfpt11zODpuwH1wTWAGqIIKNjiL0epQtXKb7tbyuwJcFosmo0UR4s1/pM/AVHY08jNZDUSoB3rx2iCfg2wT3SmqoB7T/ySUhHdMwjW+HStwXwPAS7YdABNXHMj/f3/3LMUL4yv+S+xtZvgJSbvbyjK+pjQRJvtFnYveIYapKDIx1akaug/NXO0HlXhjHFPw3xXMgU+OxCEraWgbw9zkaSdHGtWc2u2CHloOoJdT8CJ85BIDii9AoBV+bfGP491pH1eRQVTaM+AviZ2YoRDyvo49jRTEAwQy0HP1dzmc5C9oVsEOOjp04cWokRKhvPyWkkEOB4paCOQE3r8AJgK6lg2BaS+CeY+7ZLqYkHnyxR1BtVk3AGiG88FPB/LaJ7luHYZ1ApTffBJZj9Bh7aG+Xr72nPP6GfSByKJKngqN0poy';

    const lockOverlay = document.getElementById('essentials-lock');
    const lockContent = document.getElementById('essentials-content');
    const lockPasswordInput = document.getElementById('lock-password');
    const lockSubmitBtn = document.getElementById('lock-submit');
    const lockError = document.getElementById('lock-error');
    const lockAgainBtn = document.getElementById('lock-btn');

    // Field display names
    const fieldLabels = {
        'accom-vancouver': 'Vancouver Airbnb',
        'accom-canmore': 'Canmore Accommodation',
        'accom-field': 'Field Airbnb (Yoho)',
        'accom-lakelouise': 'Lake Louise Inn',
        'accom-glacier': 'Glacier View Lodge',
        'accom-hinton': 'Hinton Airbnb (Jasper)',
        'accom-calgary': 'Hampton Inn Calgary',
        'accom-quebec': 'Quebec City Hotel',
        'accom-montreal': 'Montreal Hotel',
        'car-porsche': 'Porsche 911 (Vancouver)',
        'car-bmw': 'BMW 3 Series (Rockies)',
        'car-x4m': 'BMW X4M (Montreal)',
        'insurance': 'Travel Insurance',
        'emergency-contact': 'Emergency Contact',
        'embassy': 'Singapore Embassy (Ottawa)',
    };

    // AES-256-GCM decryption using Web Crypto API
    async function decryptData(password, encryptedBase64) {
        const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));

        const salt = combined.slice(0, 16);
        const iv = combined.slice(16, 28);
        const authTag = combined.slice(28, 44);
        const ciphertext = combined.slice(44);

        // Recombine ciphertext + authTag (Web Crypto expects them together)
        const cipherWithTag = new Uint8Array(ciphertext.length + authTag.length);
        cipherWithTag.set(ciphertext);
        cipherWithTag.set(authTag, ciphertext.length);

        // Derive key with PBKDF2
        const encoder = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']
        );
        const key = await crypto.subtle.deriveKey(
            { name: 'PBKDF2', salt: salt, iterations: 100000, hash: 'SHA-256' },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['decrypt']
        );

        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            cipherWithTag
        );

        return JSON.parse(new TextDecoder().decode(decrypted));
    }

    function renderEssentials(data) {
        const accomList = document.getElementById('accom-list');
        const carsList = document.getElementById('cars-list');
        const contactsList = document.getElementById('contacts-list');

        accomList.innerHTML = '';
        carsList.innerHTML = '';
        contactsList.innerHTML = '';

        Object.entries(data).forEach(([key, value]) => {
            const label = fieldLabels[key] || key;
            const fieldHtml = `<div class="essentials-field"><label>${label}</label><div class="essentials-value">${value}</div></div>`;

            if (key.startsWith('accom-')) {
                accomList.insertAdjacentHTML('beforeend', fieldHtml);
            } else if (key.startsWith('car-')) {
                carsList.insertAdjacentHTML('beforeend', fieldHtml);
            } else {
                contactsList.insertAdjacentHTML('beforeend', fieldHtml);
            }
        });
    }

    async function tryUnlock() {
        const pw = lockPasswordInput.value.trim();
        if (!pw) return;

        lockSubmitBtn.textContent = '...';
        lockSubmitBtn.disabled = true;

        try {
            const data = await decryptData(pw, ENCRYPTED_DATA);
            renderEssentials(data);
            lockOverlay.style.display = 'none';
            lockContent.style.display = '';
            lockError.textContent = '';
        } catch {
            lockError.textContent = 'Wrong password. Try again.';
            lockPasswordInput.value = '';
            lockPasswordInput.focus();
        } finally {
            lockSubmitBtn.textContent = 'Unlock';
            lockSubmitBtn.disabled = false;
        }
    }

    lockSubmitBtn.addEventListener('click', tryUnlock);
    lockPasswordInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') tryUnlock();
    });

    // Lock again
    lockAgainBtn.addEventListener('click', () => {
        lockOverlay.style.display = '';
        lockContent.style.display = 'none';
        lockPasswordInput.value = '';
        lockError.textContent = '';
        document.getElementById('accom-list').innerHTML = '';
        document.getElementById('cars-list').innerHTML = '';
        document.getElementById('contacts-list').innerHTML = '';
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
        { id: 'packing', label: 'Pack' },
        { id: 'reservations', label: 'Reserv.' },
        { id: 'aurora', label: 'Aurora' },
        { id: 'stargazing', label: 'Stars' },
        { id: 'driving', label: 'Drives' },
        { id: 'gas-stations', label: 'Gas' },
        { id: 'offline-maps', label: 'Offline' },
        { id: 'tips', label: 'Tips' },
        { id: 'currency', label: 'FX' },
        { id: 'wear-today', label: 'Wear' },
        { id: 'emergency', label: 'SOS' },
        { id: 'parking', label: 'Park' },
        { id: 'live-weather', label: 'Wx Live' },
        { id: 'trip-summary', label: 'Summary' },
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

    // ===== SUNRISE / SUNSET TIMES =====
    // Pre-calculated for each day's location (late May / early June 2026)
    const sunData = {
        1:  { rise: '5:18', set: '21:08', loc: 'Vancouver' },
        2:  { rise: '5:17', set: '21:09', loc: 'Vancouver' },
        3:  { rise: '5:16', set: '21:10', loc: 'Vancouver' },
        4:  { rise: '5:24', set: '21:28', loc: 'Calgary' },
        5:  { rise: '5:27', set: '21:35', loc: 'Banff' },
        6:  { rise: '5:26', set: '21:36', loc: 'Banff' },
        7:  { rise: '5:29', set: '21:39', loc: 'Yoho/Field' },
        8:  { rise: '5:28', set: '21:38', loc: 'Lake Louise' },
        9:  { rise: '5:28', set: '21:39', loc: 'Field' },
        10: { rise: '5:27', set: '21:40', loc: 'Icefields' },
        11: { rise: '5:14', set: '21:52', loc: 'Jasper' },
        12: { rise: '5:13', set: '21:53', loc: 'Jasper' },
        13: { rise: '5:12', set: '21:54', loc: 'Jasper' },
        14: { rise: '5:12', set: '21:55', loc: 'Jasper' },
        15: { rise: '5:11', set: '21:56', loc: 'Jasper' },
        16: { rise: '5:22', set: '21:30', loc: 'Calgary' },
        17: { rise: '5:05', set: '20:39', loc: 'Montreal' },
        18: { rise: '4:52', set: '20:42', loc: 'Quebec City' },
        19: { rise: '5:04', set: '20:40', loc: 'Montreal' },
        20: { rise: '5:04', set: '20:41', loc: 'Montreal' },
        21: { rise: '5:04', set: '20:41', loc: 'Montreal' },
        22: { rise: '4:30', set: '18:18', loc: 'Doha' },
        23: { rise: '6:59', set: '19:07', loc: 'Singapore' },
    };

    // Inject sunrise/sunset into day headers (after weather badge)
    Object.entries(sunData).forEach(([dayNum, s]) => {
        const dayInfo = document.querySelector(`#day-${dayNum} .day-info`);
        if (dayInfo) {
            const badge = document.createElement('span');
            badge.className = 'sun-badge';
            badge.innerHTML = `<span class="sun-rise">&#127749; ${s.rise}</span><span class="sun-set">&#127751; ${s.set}</span>`;
            badge.title = `Sunrise/sunset times for ${s.loc}`;
            dayInfo.appendChild(badge);
        }
    });

    // ===== "THIS TIME TOMORROW" WIDGET =====
    const tomorrowActivities = {
        1:  'You\'ll be settling into your Vancouver Airbnb after a long flight!',
        2:  'You\'ll be exploring Vancouver — Capilano Bridge, Stanley Park, and picking up the Porsche 911!',
        3:  'You\'ll be driving the Sea-to-Sky Highway in a Porsche 911 Cabriolet with the top down!',
        4:  'You\'ll be driving through the Rockies to Canmore with mountain views all around!',
        5:  'You\'ll be hiking Johnston Canyon and soaking in the Banff Hot Springs!',
        6:  'You\'ll be riding the Banff Gondola and dining at Sky Bistro at the summit!',
        7:  'You\'ll be canoeing on Emerald Lake and chasing waterfalls in Yoho!',
        8:  'You\'ll be at Lake Louise for sunrise — the most iconic view in Canada!',
        9:  'You\'ll be having a well-deserved rest day in Field.',
        10: 'You\'ll be at Moraine Lake, then driving the legendary Icefields Parkway — 3 jaw-drop viewpoints!',
        11: 'You\'ll be walking on a glacier and standing under Athabasca Falls!',
        12: 'You\'ll be cruising to Spirit Island on Maligne Lake and stargazing at Medicine Lake!',
        13: 'You\'ll be soaking in Miette Hot Springs and watching sunset from Pyramid Island!',
        14: 'You\'ll be hiking the Valley of the Five Lakes trail!',
        15: 'You\'ll be enjoying a relaxing last day in Jasper.',
        16: 'You\'ll be driving past Abraham Lake on your way to Calgary!',
        17: 'You\'ll be flying to Montreal and driving to Quebec City — hello, French Canada!',
        18: 'You\'ll be exploring Château Frontenac and the charming streets of Old Quebec!',
        19: 'You\'ll be at the Mount Royal Lookout — the final jaw-dropping viewpoint!',
        20: 'You\'ll be on a Montreal food crawl — St-Viateur bagels, Jean Talon Market, and Joe Beef!',
        21: 'You\'ll be visiting the Botanical Garden before your evening flight home.',
        22: 'You\'ll be transiting through Doha on your way back to Singapore.',
    };

    function updateTomorrow() {
        const card = document.getElementById('tomorrow-card');
        const content = document.getElementById('tomorrow-content');
        const today = new Date().toISOString().split('T')[0];

        // Find which trip day is today
        let currentDay = null;
        Object.entries(tripDates).forEach(([dayNum, date]) => {
            if (date === today) currentDay = parseInt(dayNum);
        });

        if (currentDay && tomorrowActivities[currentDay]) {
            card.style.display = '';
            content.textContent = tomorrowActivities[currentDay];
        } else {
            card.style.display = 'none';
        }
    }

    updateTomorrow();

})();
