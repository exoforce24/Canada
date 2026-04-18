/* ========================================
   Extras 3: KML Export + We Survived Stats
   ======================================== */

(function () {
    'use strict';

    // ===== KML EXPORT =====
    function escapeXml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    // Phase color mapping for KML pin colors (Google My Maps uses these)
    const phaseColors = {
        vancouver: 'ff00bcd4',   // Cyan
        rockies: 'ff4caf50',     // Green
        yoho: 'ff8bc34a',        // Light green
        jasper: 'ff66bb6a',      // Green
        quebec: 'ffff4dff',      // Purple
        montreal: 'ffff40fb',    // Pink
    };

    // KML style mapping
    const typeIcons = {
        star: 'http://maps.google.com/mapfiles/kml/paddle/ylw-stars.png',
        dining: 'http://maps.google.com/mapfiles/kml/paddle/orange-circle.png',
        hike: 'http://maps.google.com/mapfiles/kml/paddle/grn-diamond.png',
        flight: 'http://maps.google.com/mapfiles/kml/shapes/airports.png',
        activity: 'http://maps.google.com/mapfiles/kml/paddle/blu-circle.png',
        stay: 'http://maps.google.com/mapfiles/kml/paddle/red-stars.png',
    };

    function generateKML() {
        const locations = window._tripLocations || [];
        if (locations.length === 0) {
            alert('Map data not loaded yet. Please scroll to the map first, then try again.');
            return null;
        }

        // Group by phase for folders
        const groups = {};
        locations.forEach(loc => {
            const phase = loc.phase || 'other';
            if (!groups[phase]) groups[phase] = [];
            groups[phase].push(loc);
        });

        // Build KML styles
        const styles = Object.entries(typeIcons).map(([type, icon]) => `
    <Style id="style-${type}">
      <IconStyle>
        <scale>1.1</scale>
        <Icon><href>${icon}</href></Icon>
      </IconStyle>
      <LabelStyle><scale>0.9</scale></LabelStyle>
    </Style>`).join('');

        // Build folders for each phase
        const folders = Object.entries(groups).map(([phase, locs]) => {
            const phaseName = phase.charAt(0).toUpperCase() + phase.slice(1);
            const placemarks = locs.map(loc => {
                const desc = `
<b>Day ${loc.day} — ${loc.date}</b><br>
<b>${escapeXml(loc.name)}</b><br>
${escapeXml(loc.desc || '')}<br>
<i>Type: ${loc.type}</i>`;
                return `
      <Placemark>
        <name>${escapeXml(loc.name)}</name>
        <description><![CDATA[${desc}]]></description>
        <styleUrl>#style-${loc.type || 'activity'}</styleUrl>
        <Point><coordinates>${loc.lng},${loc.lat},0</coordinates></Point>
      </Placemark>`;
            }).join('');

            return `
    <Folder>
      <name>${phaseName}</name>
      <open>1</open>${placemarks}
    </Folder>`;
        }).join('');

        // Build route line
        const routeCoords = [
            '-123.1207,49.2827,0',
            '-122.9574,50.1163,0',
            '-123.1207,49.2827,0',
            '-114.0134,51.1215,0',
            '-115.3579,51.0884,0',
            '-115.5718,51.1740,0',
            '-116.4600,51.3980,0',
            '-116.1767,51.4167,0',
            '-116.1843,51.3217,0',
            '-116.5092,51.7275,0',
            '-117.2228,52.2197,0',
            '-118.0814,52.8737,0',
            '-117.3092,52.7328,0',
            '-118.0814,52.8737,0',
            '-116.4355,52.2157,0',
            '-114.0134,51.1215,0',
            '-73.5599,45.5067,0',
            '-71.1506,46.8912,0',
            '-71.2052,46.8119,0',
            '-73.5599,45.5067,0',
        ].join(' ');

        const routeFolder = `
    <Folder>
      <name>Route Line</name>
      <Placemark>
        <name>Full Trip Route</name>
        <Style>
          <LineStyle>
            <color>ffc8102e</color>
            <width>3</width>
          </LineStyle>
        </Style>
        <LineString>
          <tessellate>1</tessellate>
          <coordinates>${routeCoords}</coordinates>
        </LineString>
      </Placemark>
    </Folder>`;

        const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Our Canada Honeymoon — May 23 - June 14, 2026</name>
    <description>Full trip itinerary with ${locations.length} destinations</description>${styles}${folders}${routeFolder}
  </Document>
</kml>`;

        return kml;
    }

    function downloadKML() {
        const kml = generateKML();
        if (!kml) return;

        const blob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'canada-honeymoon-2026.kml';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    const exportBtn = document.getElementById('export-kml-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', downloadKML);
    }

    // ===== WE SURVIVED! EXPANDED STATS =====
    // Override the summary button handler to include fun stats
    function generateEnhancedSummary() {
        const statsEl = document.getElementById('summary-stats');
        const highlightsEl = document.getElementById('summary-highlights');
        const notesEl = document.getElementById('summary-notes');

        const allCheckboxes = document.querySelectorAll('.day-card .check-item input[type="checkbox"]');
        const checked = document.querySelectorAll('.day-card .check-item input[type="checkbox"]:checked');
        const totalItems = allCheckboxes.length;
        const completedItems = checked.length;

        let completedDays = 0;
        for (let d = 1; d <= 23; d++) {
            const card = document.getElementById('day-' + d);
            if (!card) continue;
            const cbs = card.querySelectorAll('.check-item input[type="checkbox"]');
            if (cbs.length > 0 && Array.from(cbs).every(cb => cb.checked)) completedDays++;
        }

        const starItems = document.querySelectorAll('.check-item.star input[type="checkbox"]:checked');
        const diningItems = document.querySelectorAll('.time-tag.dining');
        let diningChecked = 0;
        diningItems.forEach(tag => {
            const cb = tag.closest('.check-item')?.querySelector('input[type="checkbox"]');
            if (cb && cb.checked) diningChecked++;
        });

        const packingChecked = document.querySelectorAll('[data-id^="pk-"]:checked').length;
        const packingTotal = document.querySelectorAll('[data-id^="pk-"]').length;

        // Fun additional stats
        const hikesChecked = Array.from(document.querySelectorAll('.check-item input[type="checkbox"]:checked'))
            .filter(cb => {
                const tag = cb.closest('.check-item')?.querySelector('.time-tag');
                return tag && tag.textContent.toLowerCase().includes('hike');
            }).length;

        const reservationsChecked = document.querySelectorAll('[data-id^="res-"]:checked').length;
        const bookingsChecked = document.querySelectorAll('[data-id^="book-"]:checked').length;

        // Calculate trip progress
        const tripStart = new Date('2026-05-23');
        const tripEnd = new Date('2026-06-14');
        const now = new Date();
        let tripPhase = 'before';
        let daysUntil = Math.ceil((tripStart - now) / (1000 * 60 * 60 * 24));
        if (now >= tripStart && now <= tripEnd) tripPhase = 'during';
        if (now > tripEnd) tripPhase = 'after';

        // Pre-trip: show countdown
        // During-trip: show days in
        // After-trip: show "We Survived!"
        let headerHtml = '';
        if (tripPhase === 'after') {
            headerHtml = `<div class="we-survived-banner">
                <div class="we-survived-title">&#127881; WE SURVIVED! &#127881;</div>
                <div class="we-survived-sub">23 days, 2 provinces, 3 rental cars &mdash; and countless memories</div>
            </div>`;
        } else if (tripPhase === 'during') {
            const daysIn = Math.floor((now - tripStart) / (1000 * 60 * 60 * 24)) + 1;
            headerHtml = `<div class="we-survived-banner we-during">
                <div class="we-survived-title">&#127809; Day ${daysIn} of 23</div>
                <div class="we-survived-sub">Still making memories &mdash; enjoy every moment!</div>
            </div>`;
        }

        statsEl.innerHTML = headerHtml + `
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
                    <span class="summary-stat-num">${hikesChecked}</span>
                    <span class="summary-stat-label">hikes conquered</span>
                </div>
                <div class="summary-stat">
                    <span class="summary-stat-num">${bookingsChecked}</span>
                    <span class="summary-stat-label">activities booked</span>
                </div>
                <div class="summary-stat">
                    <span class="summary-stat-num">${packingChecked}</span>
                    <span class="summary-stat-label">of ${packingTotal} items packed</span>
                </div>
                <div class="summary-stat">
                    <span class="summary-stat-num">~1,900</span>
                    <span class="summary-stat-label">km driven across Canada</span>
                </div>
                <div class="summary-stat">
                    <span class="summary-stat-num">5</span>
                    <span class="summary-stat-label">flights &amp; 3 countries</span>
                </div>
                <div class="summary-stat">
                    <span class="summary-stat-num">3</span>
                    <span class="summary-stat-label">dream cars driven</span>
                </div>
                <div class="summary-stat">
                    <span class="summary-stat-num">7</span>
                    <span class="summary-stat-label">national parks &amp; cities</span>
                </div>
                <div class="summary-stat">
                    <span class="summary-stat-num">&#10084;&#65039;</span>
                    <span class="summary-stat-label">Together, forever</span>
                </div>
            </div>
        `;

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

    // Override the existing generate-summary button to use the enhanced version
    const summaryBtn = document.getElementById('generate-summary');
    if (summaryBtn) {
        // Clone and replace to remove old listener from extras.js
        const newBtn = summaryBtn.cloneNode(true);
        summaryBtn.parentNode.replaceChild(newBtn, summaryBtn);
        newBtn.addEventListener('click', generateEnhancedSummary);
    }

})();
