/* ========================================
   Aurora Monitor - Live NOAA Data
   ======================================== */

(function () {
    'use strict';

    // Multiple NOAA endpoints to try (in order of preference)
    const ENDPOINTS = [
        'https://services.swpc.noaa.gov/json/planetary_k_index_1m.json',
        'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json',
        'https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json',
    ];

    // Minimum Kp for aurora visibility at each latitude
    const locations = {
        jasper:    { lat: 52.9, minKp: 3, goodKp: 5 },
        banff:     { lat: 51.2, minKp: 4, goodKp: 5 },
        icefields: { lat: 52.2, minKp: 3, goodKp: 5 },
    };

    const CACHE_KEY = 'canada-honeymoon-aurora';

    function getKpClass(kp) {
        if (kp >= 7) return 'kp-extreme';
        if (kp >= 5) return 'kp-storm';
        if (kp >= 4) return 'kp-active';
        if (kp >= 3) return 'kp-moderate';
        return 'kp-low';
    }

    function getStatusText(kp) {
        if (kp >= 8) return '🟣 Extreme storm — SPECTACULAR aurora likely everywhere!';
        if (kp >= 7) return '🔴 Strong storm — brilliant aurora, get outside NOW!';
        if (kp >= 5) return '🟠 Geomagnetic storm — great aurora chance at your latitude!';
        if (kp >= 4) return '🟡 Active — aurora possible on the northern horizon';
        if (kp >= 3) return '🟢 Moderate — faint aurora possible from Jasper';
        if (kp >= 2) return '⚪ Quiet — aurora unlikely at your latitude';
        return '⚪ Very quiet — no aurora expected';
    }

    function getChanceText(kp, loc) {
        const diff = kp - loc.minKp;
        if (diff >= 3) return 'Very High';
        if (diff >= 2) return 'High';
        if (diff >= 1) return 'Good';
        if (diff >= 0) return 'Possible';
        if (diff >= -1) return 'Unlikely';
        return 'Very Unlikely';
    }

    function getChancePercent(kp, loc) {
        const diff = kp - loc.minKp;
        if (diff >= 4) return 95;
        if (diff >= 3) return 80;
        if (diff >= 2) return 60;
        if (diff >= 1) return 40;
        if (diff >= 0) return 20;
        if (diff >= -1) return 8;
        return 3;
    }

    function updateAuroraUI(kp, source) {
        const ring = document.getElementById('aurora-kp-ring');
        const value = document.getElementById('aurora-kp-value');
        const status = document.getElementById('aurora-status');
        const updated = document.getElementById('aurora-updated');

        ring.className = 'aurora-kp-ring ' + getKpClass(kp);
        value.textContent = kp.toFixed(1);
        status.textContent = getStatusText(kp);

        const timeStr = new Date().toLocaleTimeString();
        const sourceLabel = source === 'cache' ? ' (cached)' : '';
        updated.textContent = 'Updated: ' + timeStr + sourceLabel;

        // Location cards
        Object.entries(locations).forEach(([key, loc]) => {
            const bar = document.getElementById('aurora-bar-' + key);
            const chance = document.getElementById('aurora-chance-' + key);
            const pct = getChancePercent(kp, loc);
            const text = getChanceText(kp, loc);

            bar.style.width = pct + '%';
            chance.textContent = text + ' (' + pct + '%)';

            if (pct >= 60) chance.style.color = '#66bb6a';
            else if (pct >= 30) chance.style.color = '#ffa726';
            else chance.style.color = 'var(--text-dim)';
        });

        // Cache the result
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ kp, time: Date.now() }));
        } catch {}
    }

    // Parse Kp from different NOAA response formats
    function parseKpFromData(data, url) {
        if (!data || !Array.isArray(data) || data.length < 2) return null;

        // Format 1: planetary_k_index_1m.json — array of objects with kp_index
        if (data[0] && typeof data[0] === 'object' && 'kp_index' in data[0]) {
            const latest = data[data.length - 1];
            const kp = parseFloat(latest.kp_index);
            return isNaN(kp) ? null : kp;
        }

        // Format 2: noaa-planetary-k-index.json — array of arrays, header row first
        if (Array.isArray(data[0])) {
            const latest = data[data.length - 1];
            const kp = parseFloat(latest[1]);
            return isNaN(kp) ? null : kp;
        }

        return null;
    }

    async function fetchAuroraData() {
        // Try each endpoint
        for (const url of ENDPOINTS) {
            try {
                const response = await fetch(url, {
                    mode: 'cors',
                    cache: 'no-cache',
                });

                if (!response.ok) continue;

                const data = await response.json();
                const kp = parseKpFromData(data, url);

                if (kp !== null) {
                    updateAuroraUI(kp, 'live');
                    return;
                }
            } catch {
                // Try next endpoint
                continue;
            }
        }

        // All endpoints failed — try cached data
        try {
            const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
            if (cached && cached.kp !== undefined) {
                const ageMinutes = Math.round((Date.now() - cached.time) / 60000);
                updateAuroraUI(cached.kp, 'cache');
                document.getElementById('aurora-updated').textContent =
                    'Cached data (' + ageMinutes + ' min ago) — live update failed';
                return;
            }
        } catch {}

        // Absolute fallback
        document.getElementById('aurora-status').textContent =
            '📡 Unable to fetch live data — check back when online';
        document.getElementById('aurora-updated').textContent =
            'Last attempt: ' + new Date().toLocaleTimeString();
    }

    // Fetch on load
    fetchAuroraData();

    // Refresh every 15 minutes
    setInterval(fetchAuroraData, 15 * 60 * 1000);

})();
