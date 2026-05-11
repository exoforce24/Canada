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
    // Roads relevant to each trip day
    const dayRoadKeywords = {
        3: ['highway 99', 'hwy 99', 'sea-to-sky', 'sea to sky', 'squamish', 'whistler', 'horseshoe bay'],
        4: ['highway 1', 'hwy 1', 'trans-canada', 'transcanada', 'canmore'],
        5: ['highway 1', 'hwy 1', 'banff', 'bow valley parkway', 'highway 1a', 'johnston canyon'],
        6: ['highway 1', 'hwy 1', 'banff', 'lake minnewanka', 'two jack'],
        7: ['highway 1', 'hwy 1', 'bow valley parkway', 'highway 1a', 'yoho', 'field', 'emerald lake', 'takakkaw'],
        8: ['highway 1', 'hwy 1', 'lake louise'],
        9: ['yoho', 'field', 'kicking horse'],
        10: ['highway 1', 'hwy 1', 'highway 93', 'hwy 93', 'icefields parkway', 'lake louise', 'moraine lake', 'peyto', 'columbia icefield'],
        11: ['highway 93', 'hwy 93', 'icefields parkway', 'columbia icefield', 'sunwapta', 'athabasca falls', 'jasper'],
        12: ['highway 16', 'hwy 16', 'yellowhead', 'jasper', 'maligne'],
        13: ['highway 16', 'hwy 16', 'jasper', 'miette'],
        14: ['jasper', 'patricia lake', 'pyramid lake', 'five lakes'],
        15: ['jasper'],
        16: ['highway 11', 'hwy 11', 'david thompson', 'abraham lake', 'rocky mountain house', 'calgary'],
    };

    // All route keywords (union)
    const routeKeywords = [...new Set(Object.values(dayRoadKeywords).flat())];

    function eventMatchesRoute(text, keywords) {
        if (!text) return false;
        const lower = text.toLowerCase();
        return keywords.some(kw => lower.includes(kw));
    }

    function getTodayRoadKeywords() {
        const day = getCurrentDay();
        if (day && dayRoadKeywords[day]) return dayRoadKeywords[day];
        // If not on trip or no roads today, return all
        return routeKeywords;
    }

    function severityClass(severity) {
        const s = (severity || '').toLowerCase();
        if (s.includes('major') || s.includes('closure') || s.includes('closed') || s.includes('emergency')) return 'severity-critical';
        if (s.includes('minor') || s.includes('moderate') || s.includes('warning')) return 'severity-warn';
        return 'severity-info';
    }

    async function fetchAlbertaAlerts() {
        try {
            const resp = await fetch('https://511.alberta.ca/api/v2/get/event');
            if (!resp.ok) throw new Error('AB API ' + resp.status);
            const events = await resp.json();
            return events
                .filter(e => {
                    const text = (e.RoadwayName || '') + ' ' + (e.Description || '') + ' ' + (e.LocationDescription || '');
                    return eventMatchesRoute(text, routeKeywords);
                })
                .map(e => ({
                    region: 'AB',
                    road: e.RoadwayName || 'Unknown road',
                    desc: e.Description || e.EventSubType || 'Road event',
                    location: e.LocationDescription || '',
                    severity: e.Severity || e.EventType || '',
                    updated: e.LastUpdated || '',
                    _searchText: ((e.RoadwayName || '') + ' ' + (e.Description || '') + ' ' + (e.LocationDescription || '')).toLowerCase(),
                }));
        } catch (err) {
            return null;
        }
    }

    async function fetchBCAlerts() {
        try {
            const resp = await fetch('https://api.open511.gov.bc.ca/events?limit=200&status=ACTIVE&format=json');
            if (!resp.ok) throw new Error('BC API ' + resp.status);
            const data = await resp.json();
            const events = data.events || [];
            return events
                .filter(e => {
                    const text = (e.headline || '') + ' ' + (e.description || '') + ' ' + (e.roads || []).map(r => r.name).join(' ');
                    return eventMatchesRoute(text, routeKeywords);
                })
                .map(e => ({
                    region: 'BC',
                    road: (e.roads || []).map(r => r.name).join(', ') || 'BC road',
                    desc: e.headline || 'Road event',
                    location: e.description || '',
                    severity: e.severity || e.event_type || '',
                    updated: e.updated || '',
                    _searchText: ((e.headline || '') + ' ' + (e.description || '') + ' ' + (e.roads || []).map(r => r.name).join(' ')).toLowerCase(),
                }));
        } catch (err) {
            return null;
        }
    }

    // State
    let _allAlerts = [];
    let _hadError = false;
    let _expanded = false;
    let _todayOnly = false;

    function getFilteredAlerts() {
        if (!_todayOnly) return _allAlerts;
        const todayKw = getTodayRoadKeywords();
        return _allAlerts.filter(a => todayKw.some(kw => a._searchText.includes(kw)));
    }

    function getCountBySeverity(alerts) {
        let crit = 0, warn = 0, info = 0;
        alerts.forEach(a => {
            const s = severityClass(a.severity);
            if (s === 'severity-critical') crit++;
            else if (s === 'severity-warn') warn++;
            else info++;
        });
        return { crit, warn, info, total: alerts.length };
    }

    function renderAlertCard(a) {
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
    }

    function renderSummary() {
        const summary = document.getElementById('road-alerts-summary');
        const controls = document.getElementById('road-alerts-controls');
        const container = document.getElementById('road-alerts-container');
        const filterBtn = document.getElementById('road-alerts-filter-btn');
        const toggleBtn = document.getElementById('road-alerts-toggle-btn');
        const attribution = document.getElementById('road-alerts-attribution');

        const filtered = getFilteredAlerts();
        const totalCounts = getCountBySeverity(_allAlerts);
        const filteredCounts = getCountBySeverity(filtered);
        const onTrip = getCurrentDay() !== null;

        // Build summary line
        if (_hadError) {
            summary.innerHTML = '<span class="ra-icon">📡</span> Unable to fetch live alerts &mdash; <a href="https://511.alberta.ca" target="_blank" rel="noopener">Alberta 511</a> · <a href="https://www.drivebc.ca" target="_blank" rel="noopener">DriveBC</a>';
            summary.className = 'road-alerts-summary ra-error';
            controls.style.display = 'none';
            container.style.display = 'none';
            attribution.textContent = '';
            return;
        }

        if (_allAlerts.length === 0) {
            summary.innerHTML = '<span class="ra-icon">✅</span> All clear &mdash; no alerts on your route';
            summary.className = 'road-alerts-summary ra-ok';
            controls.style.display = 'none';
            container.style.display = 'none';
            attribution.textContent = 'Sources: Alberta 511 & DriveBC';
            return;
        }

        // Build chips for summary
        const chips = [];
        if (totalCounts.crit) chips.push(`<span class="ra-chip ra-chip-crit">🚨 ${totalCounts.crit} closure${totalCounts.crit > 1 ? 's' : ''}</span>`);
        if (totalCounts.warn) chips.push(`<span class="ra-chip ra-chip-warn">⚠️ ${totalCounts.warn} warning${totalCounts.warn > 1 ? 's' : ''}</span>`);
        if (totalCounts.info) chips.push(`<span class="ra-chip ra-chip-info">ℹ️ ${totalCounts.info} info</span>`);

        summary.innerHTML = `<div class="ra-summary-line">${chips.join(' ')}</div>` +
            (_todayOnly && onTrip ? `<div class="ra-summary-sub">Showing ${filtered.length} for today's roads</div>` : '');
        summary.className = 'road-alerts-summary';

        controls.style.display = 'flex';
        toggleBtn.textContent = _expanded ? 'Hide alerts' : `Show ${filtered.length} alert${filtered.length !== 1 ? 's' : ''}`;
        filterBtn.style.display = onTrip ? 'inline-block' : 'none';
        filterBtn.textContent = _todayOnly ? 'Show all roads' : 'Today\'s roads only';
        filterBtn.classList.toggle('active', _todayOnly);

        if (_expanded) {
            container.style.display = '';
            if (filtered.length === 0) {
                container.innerHTML = '<div class="road-alert-card road-alert-ok">' +
                    '<div class="road-alert-icon">✅</div>' +
                    '<div class="road-alert-body">' +
                    '<div class="road-alert-title">No alerts for today\'s roads</div>' +
                    '<div class="road-alert-desc">There are alerts on other parts of your route &mdash; toggle "Show all roads" to see them</div>' +
                    '</div></div>';
            } else {
                container.innerHTML = filtered.map(renderAlertCard).join('');
            }
        } else {
            container.style.display = 'none';
        }

        attribution.textContent = `Sources: Alberta 511 & DriveBC · ${_allAlerts.length} total alert${_allAlerts.length !== 1 ? 's' : ''} on your route`;
    }

    async function fetchAlerts() {
        const [ab, bc] = await Promise.all([fetchAlbertaAlerts(), fetchBCAlerts()]);
        _hadError = ab === null && bc === null;
        _allAlerts = [...(ab || []), ...(bc || [])];
        // Auto-enable today-only filter during trip
        if (getCurrentDay() && !_todayOnly && _allAlerts.length > 5) {
            _todayOnly = true;
        }
        renderSummary();
    }

    // Wire up toggle buttons
    document.addEventListener('DOMContentLoaded', wireRoadAlertButtons);
    function wireRoadAlertButtons() {
        const toggleBtn = document.getElementById('road-alerts-toggle-btn');
        const filterBtn = document.getElementById('road-alerts-filter-btn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                _expanded = !_expanded;
                renderSummary();
            });
        }
        if (filterBtn) {
            filterBtn.addEventListener('click', () => {
                _todayOnly = !_todayOnly;
                renderSummary();
            });
        }
    }
    // Run immediately too in case DOM already loaded
    wireRoadAlertButtons();

    fetchAlerts();
    setInterval(fetchAlerts, 30 * 60 * 1000); // Refresh every 30 min

})();
