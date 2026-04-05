/* ========================================
   Aurora Monitor - Live NOAA Data
   ======================================== */

(function () {
    'use strict';

    // NOAA Space Weather API - free, no key needed
    const KP_URL = 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json';
    const FORECAST_URL = 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json';

    // Minimum Kp for aurora visibility at each latitude
    const locations = {
        jasper:    { lat: 52.9, minKp: 3, goodKp: 5 },
        banff:     { lat: 51.2, minKp: 4, goodKp: 5 },
        icefields: { lat: 52.2, minKp: 3, goodKp: 5 },
    };

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
        // Rough probability mapping
        const diff = kp - loc.minKp;
        if (diff >= 4) return 95;
        if (diff >= 3) return 80;
        if (diff >= 2) return 60;
        if (diff >= 1) return 40;
        if (diff >= 0) return 20;
        if (diff >= -1) return 8;
        return 3;
    }

    function updateAuroraUI(kp) {
        // Main gauge
        const ring = document.getElementById('aurora-kp-ring');
        const value = document.getElementById('aurora-kp-value');
        const status = document.getElementById('aurora-status');
        const updated = document.getElementById('aurora-updated');

        // Remove old classes
        ring.className = 'aurora-kp-ring ' + getKpClass(kp);
        value.textContent = kp.toFixed(1);
        status.textContent = getStatusText(kp);
        updated.textContent = 'Updated: ' + new Date().toLocaleTimeString();

        // Location cards
        Object.entries(locations).forEach(([key, loc]) => {
            const bar = document.getElementById('aurora-bar-' + key);
            const chance = document.getElementById('aurora-chance-' + key);
            const pct = getChancePercent(kp, loc);
            const text = getChanceText(kp, loc);

            bar.style.width = pct + '%';
            chance.textContent = text + ' (' + pct + '%)';

            // Color the chance text
            if (pct >= 60) chance.style.color = '#66bb6a';
            else if (pct >= 30) chance.style.color = '#ffa726';
            else chance.style.color = 'var(--text-dim)';
        });
    }

    async function fetchAuroraData() {
        try {
            const response = await fetch(KP_URL);
            const data = await response.json();

            // Data format: array of arrays, first row is headers
            // Get the latest reading (last row)
            if (data && data.length > 1) {
                const latest = data[data.length - 1];
                // Column 1 is Kp value
                const kp = parseFloat(latest[1]);
                if (!isNaN(kp)) {
                    updateAuroraUI(kp);
                    return;
                }
            }

            // Fallback: try forecast
            const forecastResp = await fetch(FORECAST_URL);
            const forecastData = await forecastResp.json();
            if (forecastData && forecastData.length > 1) {
                const latest = forecastData[forecastData.length - 1];
                const kp = parseFloat(latest[1]);
                if (!isNaN(kp)) {
                    updateAuroraUI(kp);
                    return;
                }
            }

            throw new Error('No data');
        } catch {
            // Offline or API error — show last known or default
            document.getElementById('aurora-status').textContent =
                '📡 Unable to fetch live data — check back when online';
            document.getElementById('aurora-updated').textContent =
                'Last attempt: ' + new Date().toLocaleTimeString();
        }
    }

    // Fetch on load
    fetchAuroraData();

    // Refresh every 15 minutes
    setInterval(fetchAuroraData, 15 * 60 * 1000);

})();
