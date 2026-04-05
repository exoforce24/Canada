/* ========================================
   Extras: Weather, Route Progress, Confetti, Trip Summary
   ======================================== */

(function () {
    'use strict';

    // ===== TRIP DATE CONSTANTS =====
    const TRIP_START = new Date('2026-05-23');
    const TRIP_END = new Date('2026-06-14');

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

    // Location coords for weather lookups
    const dayLocations = {
        1: { lat: 49.28, lon: -123.12, name: 'Vancouver' },
        2: { lat: 49.28, lon: -123.12, name: 'Vancouver' },
        3: { lat: 50.12, lon: -122.96, name: 'Whistler' },
        4: { lat: 51.09, lon: -115.36, name: 'Canmore' },
        5: { lat: 51.18, lon: -115.57, name: 'Banff' },
        6: { lat: 51.18, lon: -115.57, name: 'Banff' },
        7: { lat: 51.40, lon: -116.46, name: 'Field' },
        8: { lat: 51.42, lon: -116.18, name: 'Lake Louise' },
        9: { lat: 51.40, lon: -116.46, name: 'Field' },
        10: { lat: 52.22, lon: -117.22, name: 'Icefields' },
        11: { lat: 52.87, lon: -118.08, name: 'Jasper' },
        12: { lat: 52.87, lon: -118.08, name: 'Jasper' },
        13: { lat: 52.87, lon: -118.08, name: 'Jasper' },
        14: { lat: 52.87, lon: -118.08, name: 'Jasper' },
        15: { lat: 52.87, lon: -118.08, name: 'Jasper' },
        16: { lat: 51.12, lon: -114.01, name: 'Calgary' },
        17: { lat: 45.51, lon: -73.59, name: 'Montreal' },
        18: { lat: 46.81, lon: -71.21, name: 'Quebec City' },
        19: { lat: 45.51, lon: -73.59, name: 'Montreal' },
        20: { lat: 45.51, lon: -73.59, name: 'Montreal' },
        21: { lat: 45.51, lon: -73.59, name: 'Montreal' },
    };

    function getCurrentTripDay() {
        const today = new Date().toISOString().split('T')[0];
        for (const [day, date] of Object.entries(tripDates)) {
            if (date === today) return parseInt(day);
        }
        return null;
    }

    // ===== LIVE WEATHER (Open-Meteo, free, no API key) =====
    async function fetchLiveWeather() {
        const currentDay = getCurrentTripDay();

        // Before trip: show current weather for key destinations as preview
        // During trip: show weather for current + next 2 days
        let daysToFetch = [];
        let previewMode = false;

        if (currentDay) {
            for (let d = currentDay; d <= Math.min(currentDay + 2, 23); d++) {
                if (dayLocations[d]) daysToFetch.push(d);
            }
        } else {
            // Preview mode — show current weather for key destinations
            previewMode = true;
            daysToFetch = []; // We'll fetch current weather for key cities instead
        }

        if (previewMode) {
            await fetchPreviewWeather();
            return;
        }

        if (daysToFetch.length === 0) return;

        const grid = document.getElementById('weather-live-grid');
        grid.innerHTML = '';

        // Group by unique location to minimize API calls
        const locGroups = {};
        daysToFetch.forEach(d => {
            const loc = dayLocations[d];
            const key = `${loc.lat},${loc.lon}`;
            if (!locGroups[key]) locGroups[key] = { loc, days: [] };
            locGroups[key].days.push(d);
        });

        for (const group of Object.values(locGroups)) {
            try {
                const url = `https://api.open-meteo.com/v1/forecast?latitude=${group.loc.lat}&longitude=${group.loc.lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode&current=temperature_2m,weathercode,windspeed_10m&timezone=auto&forecast_days=5`;
                const resp = await fetch(url);
                const data = await resp.json();

                if (data.current) {
                    // Current conditions card
                    const card = document.createElement('div');
                    card.className = 'weather-live-card weather-current';
                    card.innerHTML = `
                        <div class="wl-header">
                            <span class="wl-icon">${weatherCodeToEmoji(data.current.weathercode)}</span>
                            <div>
                                <div class="wl-title">Now in ${group.loc.name}</div>
                                <div class="wl-temp-big">${Math.round(data.current.temperature_2m)}°C</div>
                            </div>
                        </div>
                        <div class="wl-detail">Wind: ${Math.round(data.current.windspeed_10m)} km/h</div>
                    `;
                    grid.appendChild(card);
                }

                // Daily forecast cards
                if (data.daily) {
                    group.days.forEach(dayNum => {
                        const date = tripDates[dayNum];
                        const idx = data.daily.time.indexOf(date);
                        if (idx === -1) return;

                        const card = document.createElement('div');
                        card.className = 'weather-live-card';
                        card.innerHTML = `
                            <div class="wl-header">
                                <span class="wl-icon">${weatherCodeToEmoji(data.daily.weathercode[idx])}</span>
                                <div>
                                    <div class="wl-title">Day ${dayNum} &mdash; ${group.loc.name}</div>
                                    <div class="wl-temp">${Math.round(data.daily.temperature_2m_max[idx])}° / ${Math.round(data.daily.temperature_2m_min[idx])}°C</div>
                                </div>
                            </div>
                            <div class="wl-detail">Rain chance: ${data.daily.precipitation_probability_max[idx]}%</div>
                        `;
                        grid.appendChild(card);
                    });
                }
            } catch {
                // Silently fail for this location
            }
        }

        if (grid.children.length === 0) {
            grid.innerHTML = '<div class="weather-loading">Unable to fetch weather data</div>';
        }

        document.getElementById('weather-attribution').textContent = 'Weather data: Open-Meteo.com';
    }

    // Preview mode: show current weather for key destinations
    async function fetchPreviewWeather() {
        const grid = document.getElementById('weather-live-grid');
        grid.innerHTML = '';

        const previewCities = [
            { lat: 49.28, lon: -123.12, name: 'Vancouver' },
            { lat: 51.18, lon: -115.57, name: 'Banff' },
            { lat: 52.87, lon: -118.08, name: 'Jasper' },
            { lat: 45.51, lon: -73.59, name: 'Montreal' },
        ];

        for (const city of previewCities) {
            try {
                const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,weathercode,windspeed_10m&timezone=auto`;
                const resp = await fetch(url);
                const data = await resp.json();

                if (data.current) {
                    const card = document.createElement('div');
                    card.className = 'weather-live-card';
                    card.innerHTML = `
                        <div class="wl-header">
                            <span class="wl-icon">${weatherCodeToEmoji(data.current.weathercode)}</span>
                            <div>
                                <div class="wl-title">Now in ${city.name}</div>
                                <div class="wl-temp-big">${Math.round(data.current.temperature_2m)}°C</div>
                            </div>
                        </div>
                        <div class="wl-detail">Wind: ${Math.round(data.current.windspeed_10m)} km/h</div>
                    `;
                    grid.appendChild(card);
                }
            } catch {}
        }

        if (grid.children.length === 0) {
            grid.innerHTML = '<div class="weather-loading">Unable to fetch weather data</div>';
        } else {
            document.getElementById('weather-attribution').textContent =
                'Live conditions at your destinations • Weather data: Open-Meteo.com';
        }
    }

    function weatherCodeToEmoji(code) {
        if (code === 0) return '☀️';
        if (code <= 3) return '⛅';
        if (code <= 48) return '🌫️';
        if (code <= 57) return '🌧️';
        if (code <= 67) return '🌧️';
        if (code <= 77) return '🌨️';
        if (code <= 82) return '🌧️';
        if (code <= 86) return '🌨️';
        if (code >= 95) return '⛈️';
        return '🌤️';
    }

    // Fetch weather on load (only works during trip dates)
    fetchLiveWeather();

    // ===== ANIMATED ROUTE PROGRESS =====
    function updateRouteProgress() {
        const now = new Date();
        const routeEl = document.getElementById('route-progress');
        const filledEl = document.getElementById('route-filled');
        const carEl = document.getElementById('route-car');

        // Calculate progress
        const totalDays = 23;
        const currentDay = getCurrentTripDay();

        if (now < TRIP_START) {
            // Before trip — hide route progress
            routeEl.style.display = 'none';
            return;
        }

        if (now > TRIP_END) {
            // After trip — full progress
            routeEl.style.display = '';
            filledEl.style.width = '100%';
            carEl.style.left = '98%';
            return;
        }

        if (currentDay) {
            routeEl.style.display = '';
            const pct = ((currentDay - 0.5) / totalDays) * 100;
            filledEl.style.width = pct + '%';
            carEl.style.left = Math.min(pct, 97) + '%';

            // Highlight current stop
            document.querySelectorAll('.route-stop').forEach(stop => {
                const day = parseInt(stop.dataset.day);
                if (day <= currentDay) {
                    stop.classList.add('visited');
                }
                if (day === currentDay || (day < currentDay && parseInt(document.querySelector('.route-stop:not(.visited) + .route-stop')?.dataset.day || 99) > currentDay)) {
                    stop.classList.add('current');
                }
            });
        } else {
            routeEl.style.display = 'none';
        }
    }

    updateRouteProgress();

    // ===== CONFETTI ON DAY COMPLETION =====
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    let confettiPieces = [];
    let confettiActive = false;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const CONFETTI_COLORS = ['#c8102e', '#d4a853', '#00bcd4', '#4caf50', '#e040fb', '#ff7043', '#42a5f5'];

    function launchConfetti() {
        if (confettiActive) return;
        confettiActive = true;
        canvas.style.pointerEvents = 'none';
        canvas.style.display = 'block';
        confettiPieces = [];

        for (let i = 0; i < 150; i++) {
            confettiPieces.push({
                x: Math.random() * canvas.width,
                y: -20 - Math.random() * 200,
                w: 6 + Math.random() * 6,
                h: 4 + Math.random() * 4,
                color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
                vy: 2 + Math.random() * 3,
                vx: (Math.random() - 0.5) * 3,
                rotation: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 10,
                opacity: 1,
            });
        }

        animateConfetti();
    }

    function animateConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let alive = 0;

        confettiPieces.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.05;
            p.rotation += p.rotSpeed;

            if (p.y > canvas.height - 50) {
                p.opacity -= 0.02;
            }

            if (p.opacity <= 0) return;
            alive++;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.globalAlpha = p.opacity;
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();
        });

        if (alive > 0) {
            requestAnimationFrame(animateConfetti);
        } else {
            confettiActive = false;
            canvas.style.display = 'none';
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    // Check if all items in a day are checked — trigger confetti
    const dayCompletionState = {};

    function checkDayCompletion() {
        for (let d = 1; d <= 23; d++) {
            const card = document.getElementById('day-' + d);
            if (!card) continue;

            const checkboxes = card.querySelectorAll('.check-item input[type="checkbox"]');
            if (checkboxes.length === 0) continue;

            const allChecked = Array.from(checkboxes).every(cb => cb.checked);
            const wasComplete = dayCompletionState[d];

            if (allChecked && !wasComplete) {
                dayCompletionState[d] = true;
                // Fire confetti!
                launchConfetti();
                // Show a brief celebration message
                showDayComplete(d);
            } else if (!allChecked) {
                dayCompletionState[d] = false;
            }
        }
    }

    function showDayComplete(dayNum) {
        const card = document.getElementById('day-' + dayNum);
        if (!card) return;

        const banner = document.createElement('div');
        banner.className = 'day-complete-banner';
        banner.textContent = 'Day ' + dayNum + ' complete!';
        card.appendChild(banner);

        setTimeout(() => {
            banner.style.opacity = '0';
            setTimeout(() => banner.remove(), 500);
        }, 3000);
    }

    // Initialize completion state
    for (let d = 1; d <= 23; d++) {
        const card = document.getElementById('day-' + d);
        if (!card) continue;
        const checkboxes = card.querySelectorAll('.check-item input[type="checkbox"]');
        dayCompletionState[d] = checkboxes.length > 0 && Array.from(checkboxes).every(cb => cb.checked);
    }

    // Listen for checkbox changes
    document.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
            setTimeout(checkDayCompletion, 100);
        }
    });

    // ===== TRIP SUMMARY GENERATOR =====
    document.getElementById('generate-summary').addEventListener('click', generateSummary);

    function generateSummary() {
        const statsEl = document.getElementById('summary-stats');
        const highlightsEl = document.getElementById('summary-highlights');
        const notesEl = document.getElementById('summary-notes');

        // Count stats
        const allCheckboxes = document.querySelectorAll('.day-card .check-item input[type="checkbox"]');
        const checked = document.querySelectorAll('.day-card .check-item input[type="checkbox"]:checked');
        const totalItems = allCheckboxes.length;
        const completedItems = checked.length;

        // Count completed days
        let completedDays = 0;
        for (let d = 1; d <= 23; d++) {
            const card = document.getElementById('day-' + d);
            if (!card) continue;
            const cbs = card.querySelectorAll('.check-item input[type="checkbox"]');
            if (cbs.length > 0 && Array.from(cbs).every(cb => cb.checked)) completedDays++;
        }

        // Count viewpoints visited
        const starItems = document.querySelectorAll('.check-item.star input[type="checkbox"]:checked');

        // Count restaurants
        const diningItems = document.querySelectorAll('.time-tag.dining');
        let diningChecked = 0;
        diningItems.forEach(tag => {
            const cb = tag.closest('.check-item')?.querySelector('input[type="checkbox"]');
            if (cb && cb.checked) diningChecked++;
        });

        // Count packing items
        const packingChecked = document.querySelectorAll('[data-id^="pk-"]:checked').length;
        const packingTotal = document.querySelectorAll('[data-id^="pk-"]').length;

        statsEl.innerHTML = `
            <div class="summary-stat-grid">
                <div class="summary-stat">
                    <span class="summary-stat-num">${completedItems}</span>
                    <span class="summary-stat-label">of ${totalItems} activities done</span>
                </div>
                <div class="summary-stat">
                    <span class="summary-stat-num">${completedDays}</span>
                    <span class="summary-stat-label">of 23 days completed</span>
                </div>
                <div class="summary-stat">
                    <span class="summary-stat-num">${starItems.length}</span>
                    <span class="summary-stat-label">of 7 jaw-drop viewpoints</span>
                </div>
                <div class="summary-stat">
                    <span class="summary-stat-num">${diningChecked}</span>
                    <span class="summary-stat-label">restaurants visited</span>
                </div>
                <div class="summary-stat">
                    <span class="summary-stat-num">${packingChecked}</span>
                    <span class="summary-stat-label">of ${packingTotal} items packed</span>
                </div>
                <div class="summary-stat">
                    <span class="summary-stat-num">~1,900</span>
                    <span class="summary-stat-label">km driven across Canada</span>
                </div>
            </div>
        `;

        // Highlights: completed star viewpoints
        let highlightsHtml = '<h3>Jaw-Dropping Moments</h3><div class="summary-highlights-list">';
        starItems.forEach(cb => {
            const text = cb.closest('.check-item').querySelector('span').textContent;
            highlightsHtml += `<div class="summary-highlight-item">${text}</div>`;
        });
        if (starItems.length === 0) {
            highlightsHtml += '<div class="summary-highlight-item" style="color:var(--text-dim)">No viewpoints checked yet — get out there!</div>';
        }
        highlightsHtml += '</div>';
        highlightsEl.innerHTML = highlightsHtml;

        // Collect all notes
        let notesHtml = '<h3>Your Notes & Memories</h3><div class="summary-notes-list">';
        let hasNotes = false;
        try {
            const savedNotes = JSON.parse(localStorage.getItem('canada-honeymoon-notes')) || {};
            Object.entries(savedNotes).forEach(([dayId, text]) => {
                if (text.trim()) {
                    hasNotes = true;
                    const dayNum = dayId.replace('day-', '');
                    notesHtml += `<div class="summary-note-item"><strong>Day ${dayNum}:</strong> ${text}</div>`;
                }
            });
        } catch {}

        if (!hasNotes) {
            notesHtml += '<div class="summary-note-item" style="color:var(--text-dim)">No notes yet — jot down memories in the day cards!</div>';
        }
        notesHtml += '</div>';
        notesEl.innerHTML = notesHtml;
    }

})();
