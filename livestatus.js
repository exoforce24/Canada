/* ========================================
   Live Trip Status: Day Counter, Next Up,
   Road Closure Alerts
   ======================================== */

(function () {
    'use strict';

    const TRIP_START = new Date('2026-05-23T00:00:00');
    const TRIP_END = new Date('2026-06-14T23:59:59');
    const TOTAL_DAYS = 23;

    const tripDates = {};
    for (let d = 1; d <= TOTAL_DAYS; d++) {
        const dt = new Date(TRIP_START);
        dt.setDate(dt.getDate() + d - 1);
        tripDates[d] = dt.toISOString().split('T')[0];
    }

    function getCurrentDay() {
        const now = new Date();
        if (now < TRIP_START) return null;
        if (now > TRIP_END) return null;
        const daysSinceStart = Math.floor((now - TRIP_START) / (1000 * 60 * 60 * 24)) + 1;
        return Math.min(daysSinceStart, TOTAL_DAYS);
    }

    // ===== DAY COUNTER =====
    function updateDayCounter() {
        const liveSection = document.getElementById('live-status');
        const currentDay = getCurrentDay();

        if (!currentDay) {
            liveSection.style.display = 'none';
            return;
        }

        liveSection.style.display = '';
        const pct = Math.round((currentDay / TOTAL_DAYS) * 100);

        document.getElementById('live-day-num').textContent = currentDay;
        document.getElementById('live-day-fill').style.width = pct + '%';
        document.getElementById('live-day-pct').textContent = pct + '% complete';
    }

    // ===== NEXT UP WIDGET =====
    function updateNextUp() {
        const currentDay = getCurrentDay();
        const textEl = document.getElementById('live-next-text');
        const timeEl = document.getElementById('live-next-time');
        const dayEl = document.getElementById('live-next-day');

        if (!currentDay) {
            textEl.textContent = 'Trip not started yet';
            timeEl.textContent = '';
            dayEl.textContent = '';
            return;
        }

        // Look in current day's card first
        for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
            const day = currentDay + dayOffset;
            if (day > TOTAL_DAYS) break;

            const card = document.getElementById('day-' + day);
            if (!card) continue;

            const items = card.querySelectorAll('.check-item');
            for (const item of items) {
                const cb = item.querySelector('input[type="checkbox"]');
                if (!cb || cb.checked) continue;

                const span = item.querySelector('span');
                if (!span) continue;

                const tag = item.querySelector('.time-tag');

                textEl.textContent = span.textContent.replace(/\s*\([^)]*\)\s*$/, '').trim();
                timeEl.textContent = tag ? tag.textContent : '';
                dayEl.textContent = dayOffset === 0 ? 'Today (Day ' + day + ')' : (dayOffset === 1 ? 'Tomorrow (Day ' + day + ')' : 'Day ' + day);
                return;
            }
        }

        // All done!
        textEl.textContent = '&#127881; All caught up — enjoy the moment!';
        textEl.innerHTML = '🎉 All caught up — enjoy the moment!';
        timeEl.textContent = '';
        dayEl.textContent = 'Day ' + currentDay;
    }

    function updateLiveStatus() {
        updateDayCounter();
        updateNextUp();
    }

    // Initial + every minute
    updateLiveStatus();
    setInterval(updateLiveStatus, 60 * 1000);

    // Also update Next Up when checkboxes change
    document.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
            setTimeout(updateNextUp, 200);
        }
    });

    // ===== ROAD CLOSURE ALERTS =====
    // Keywords for roads on our route
    const routeKeywords = [
        // Alberta — Banff/Jasper/Calgary corridor
        'highway 1', 'hwy 1', 'trans-canada', 'transcanada',
        'highway 93', 'hwy 93', 'icefields parkway',
        'highway 11', 'hwy 11', 'david thompson',
        'highway 16', 'hwy 16', 'yellowhead',
        'banff', 'jasper', 'lake louise', 'canmore', 'field',
        'columbia icefield', 'sunwapta', 'athabasca',
        'bow valley parkway', 'highway 1a',
        // BC — Sea-to-Sky + Yoho
        'highway 99', 'hwy 99', 'sea-to-sky', 'sea to sky',
        'squamish', 'whistler', 'horseshoe bay',
        'yoho', 'kicking horse',
    ];

    function eventMatchesRoute(text) {
        if (!text) return false;
        const lower = text.toLowerCase();
        return routeKeywords.some(kw => lower.includes(kw));
    }

    function severityClass(severity) {
        const s = (severity || '').toLowerCase();
        if (s.includes('major') || s.includes('closure') || s.includes('closed') || s.includes('emergency')) return 'severity-critical';
        if (s.includes('minor') || s.includes('moderate') || s.includes('warning')) return 'severity-warn';
        return 'severity-info';
    }

    async function fetchAlbertaAlerts() {
        try {
            // Alberta 511 public events API
            const resp = await fetch('https://511.alberta.ca/api/v2/get/event');
            if (!resp.ok) throw new Error('AB API ' + resp.status);
            const events = await resp.json();
            return events
                .filter(e => {
                    const text = (e.RoadwayName || '') + ' ' + (e.Description || '') + ' ' + (e.LocationDescription || '');
                    return eventMatchesRoute(text);
                })
                .map(e => ({
                    region: 'AB',
                    road: e.RoadwayName || 'Unknown road',
                    desc: e.Description || e.EventSubType || 'Road event',
                    location: e.LocationDescription || '',
                    severity: e.Severity || e.EventType || '',
                    updated: e.LastUpdated || '',
                }));
        } catch (err) {
            return null;
        }
    }

    async function fetchBCAlerts() {
        try {
            // BC Open511 public API
            const resp = await fetch('https://api.open511.gov.bc.ca/events?limit=200&status=ACTIVE&format=json');
            if (!resp.ok) throw new Error('BC API ' + resp.status);
            const data = await resp.json();
            const events = data.events || [];
            return events
                .filter(e => {
                    const text = (e.headline || '') + ' ' + (e.description || '') + ' ' + (e.roads || []).map(r => r.name).join(' ');
                    return eventMatchesRoute(text);
                })
                .map(e => ({
                    region: 'BC',
                    road: (e.roads || []).map(r => r.name).join(', ') || 'BC road',
                    desc: e.headline || 'Road event',
                    location: e.description || '',
                    severity: e.severity || e.event_type || '',
                    updated: e.updated || '',
                }));
        } catch (err) {
            return null;
        }
    }

    function renderAlerts(alerts, hadAnyError) {
        const container = document.getElementById('road-alerts-container');
        const attribution = document.getElementById('road-alerts-attribution');

        if (alerts === null || alerts.length === 0) {
            if (hadAnyError) {
                container.innerHTML = '<div class="road-alert-card road-alert-info">' +
                    '<div class="road-alert-icon">📡</div>' +
                    '<div class="road-alert-body">' +
                    '<div class="road-alert-title">Unable to fetch live alerts</div>' +
                    '<div class="road-alert-desc">Check <a href="https://511.alberta.ca" target="_blank" rel="noopener">Alberta 511</a> and <a href="https://www.drivebc.ca" target="_blank" rel="noopener">DriveBC</a> directly</div>' +
                    '</div></div>';
            } else {
                container.innerHTML = '<div class="road-alert-card road-alert-ok">' +
                    '<div class="road-alert-icon">✅</div>' +
                    '<div class="road-alert-body">' +
                    '<div class="road-alert-title">All clear on your route!</div>' +
                    '<div class="road-alert-desc">No closures or warnings on the roads you\'ll be driving</div>' +
                    '</div></div>';
            }
            attribution.textContent = 'Sources: Alberta 511 & DriveBC Open511';
            return;
        }

        container.innerHTML = alerts.map(a => {
            const sev = severityClass(a.severity);
            const icon = sev === 'severity-critical' ? '🚨' : sev === 'severity-warn' ? '⚠️' : 'ℹ️';
            const updated = a.updated ? new Date(a.updated).toLocaleString() : '';
            return `<div class="road-alert-card ${sev}">
                <div class="road-alert-icon">${icon}</div>
                <div class="road-alert-body">
                    <div class="road-alert-title">${a.region} · ${a.road}</div>
                    <div class="road-alert-desc">${a.desc}</div>
                    ${a.location ? `<div class="road-alert-loc">${a.location}</div>` : ''}
                    ${updated ? `<div class="road-alert-time">Updated: ${updated}</div>` : ''}
                </div>
            </div>`;
        }).join('');
        attribution.textContent = `Sources: Alberta 511 & DriveBC · ${alerts.length} alert(s) on your route`;
    }

    async function fetchAlerts() {
        const [ab, bc] = await Promise.all([fetchAlbertaAlerts(), fetchBCAlerts()]);
        const hadError = ab === null && bc === null;
        const alerts = [...(ab || []), ...(bc || [])];
        renderAlerts(hadError ? null : alerts, hadError);
    }

    fetchAlerts();
    setInterval(fetchAlerts, 30 * 60 * 1000); // Refresh every 30 min

})();
