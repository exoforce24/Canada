/* ========================================
   Extras 2: Currency, Wear, Scroll Anim, Thumbnails, Dark Sky
   ======================================== */

(function () {
    'use strict';

    // ===== CURRENCY CONVERTER (Open Exchange Rates via free API) =====
    let exchangeRate = 0.97; // Fallback SGD to CAD rate

    async function fetchExchangeRate() {
        try {
            // Free API: exchangerate.host
            const resp = await fetch('https://open.er-api.com/v6/latest/SGD');
            const data = await resp.json();
            if (data && data.rates && data.rates.CAD) {
                exchangeRate = data.rates.CAD;
            }
        } catch {
            // Use fallback rate
        }

        document.getElementById('currency-rate').textContent =
            `1 SGD = ${exchangeRate.toFixed(4)} CAD  •  1 CAD = ${(1 / exchangeRate).toFixed(4)} SGD`;
    }

    fetchExchangeRate();

    const sgdInput = document.getElementById('sgd-input');
    const cadInput = document.getElementById('cad-input');

    sgdInput.addEventListener('input', () => {
        const val = parseFloat(sgdInput.value);
        if (!isNaN(val)) {
            cadInput.value = (val * exchangeRate).toFixed(2);
        } else {
            cadInput.value = '';
        }
    });

    cadInput.addEventListener('input', () => {
        const val = parseFloat(cadInput.value);
        if (!isNaN(val)) {
            sgdInput.value = (val / exchangeRate).toFixed(2);
        } else {
            sgdInput.value = '';
        }
    });

    // Quick chips
    document.querySelectorAll('.currency-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const sgd = parseFloat(chip.dataset.sgd);
            sgdInput.value = sgd.toFixed(2);
            cadInput.value = (sgd * exchangeRate).toFixed(2);
        });
    });

    // ===== WHAT TO WEAR TODAY =====
    const tripDates = {};
    for (let d = 1; d <= 23; d++) {
        const date = new Date('2026-05-23');
        date.setDate(date.getDate() + d - 1);
        tripDates[d] = date.toISOString().split('T')[0];
    }

    const weatherData = {
        1:  { hi: 17, lo: 10, cond: 'partly_cloudy', loc: 'Vancouver', activities: ['arrival', 'walk'] },
        2:  { hi: 18, lo: 10, cond: 'sunny', loc: 'Vancouver', activities: ['bridge', 'bike', 'market', 'driving', 'dinner_nice'] },
        3:  { hi: 16, lo: 9, cond: 'partly_cloudy', loc: 'Whistler', activities: ['driving', 'gondola', 'dinner_nice'] },
        4:  { hi: 19, lo: 7, cond: 'partly_cloudy', loc: 'Calgary', activities: ['flight', 'driving', 'dinner'] },
        5:  { hi: 15, lo: 3, cond: 'sunny', loc: 'Banff', activities: ['hike', 'hot_springs', 'dinner'] },
        6:  { hi: 15, lo: 3, cond: 'mix', loc: 'Banff', activities: ['scenic_drive', 'gondola', 'dinner_nice'] },
        7:  { hi: 14, lo: 2, cond: 'sunny', loc: 'Yoho', activities: ['driving', 'canoe', 'waterfall'] },
        8:  { hi: 13, lo: 1, cond: 'clear', loc: 'Lake Louise', activities: ['sunrise_early', 'hike'] },
        9:  { hi: 14, lo: 2, cond: 'mix', loc: 'Field', activities: ['rest', 'walk', 'dinner'] },
        10: { hi: 13, lo: 1, cond: 'sunny', loc: 'Icefields', activities: ['hike', 'driving', 'stargazing'] },
        11: { hi: 14, lo: 2, cond: 'partly_cloudy', loc: 'Jasper', activities: ['glacier', 'waterfall', 'planetarium'] },
        12: { hi: 15, lo: 3, cond: 'sunny', loc: 'Jasper', activities: ['hike', 'cruise', 'stargazing'] },
        13: { hi: 16, lo: 4, cond: 'mix', loc: 'Jasper', activities: ['hot_springs', 'skytram', 'sunset'] },
        14: { hi: 16, lo: 4, cond: 'sunny', loc: 'Jasper', activities: ['hike', 'lake'] },
        15: { hi: 15, lo: 3, cond: 'partly_cloudy', loc: 'Jasper', activities: ['rest', 'walk', 'dinner'] },
        16: { hi: 18, lo: 6, cond: 'mix', loc: 'Calgary', activities: ['driving'] },
        17: { hi: 22, lo: 13, cond: 'partly_cloudy', loc: 'Montreal', activities: ['flight', 'driving', 'waterfall', 'dinner'] },
        18: { hi: 21, lo: 12, cond: 'sunny', loc: 'Quebec City', activities: ['walk', 'driving', 'dinner_nice'] },
        19: { hi: 22, lo: 13, cond: 'sunny', loc: 'Montreal', activities: ['walk', 'church'] },
        20: { hi: 23, lo: 14, cond: 'partly_cloudy', loc: 'Montreal', activities: ['walk', 'market', 'dinner_nice'] },
        21: { hi: 22, lo: 13, cond: 'mix', loc: 'Montreal', activities: ['garden', 'flight'] },
        22: { hi: 40, lo: 30, cond: 'sunny', loc: 'Doha', activities: ['transit'] },
        23: { hi: 31, lo: 26, cond: 'humid', loc: 'Singapore', activities: ['arrival'] },
    };

    function generateOutfit(dayNum) {
        const w = weatherData[dayNum];
        if (!w) return null;

        const items = [];

        // Temperature-based layers
        if (w.lo <= 3) {
            items.push({ icon: '🧥', text: '<strong>Warm jacket</strong> + fleece layer', reason: `Low of ${w.lo}°C` });
            items.push({ icon: '🧤', text: '<strong>Gloves & beanie</strong>', reason: 'Cold mornings' });
        } else if (w.lo <= 10) {
            items.push({ icon: '🧥', text: '<strong>Light jacket</strong> or hoodie', reason: `Low of ${w.lo}°C` });
        }

        if (w.hi >= 20) {
            items.push({ icon: '👕', text: '<strong>T-shirt & shorts</strong>', reason: `High of ${w.hi}°C — warm!` });
        } else if (w.hi >= 15) {
            items.push({ icon: '👕', text: '<strong>Long sleeve + light pants</strong>', reason: `High of ${w.hi}°C` });
        } else {
            items.push({ icon: '🧶', text: '<strong>Warm layers</strong> — sweater + pants', reason: `Only ${w.hi}°C high` });
        }

        // Activity-based
        if (w.activities.includes('hike')) {
            items.push({ icon: '🥾', text: '<strong>Hiking boots</strong> + wool socks', reason: 'Hiking today' });
        }
        if (w.activities.includes('hot_springs')) {
            items.push({ icon: '🩱', text: '<strong>Swimwear</strong> + towel', reason: 'Hot springs today!' });
        }
        if (w.activities.includes('canoe')) {
            items.push({ icon: '💧', text: '<strong>Quick-dry layer</strong>', reason: 'Canoeing — might get splashed' });
        }
        if (w.activities.includes('dinner_nice')) {
            items.push({ icon: '👔', text: '<strong>Smart dinner outfit</strong>', reason: 'Nice restaurant tonight' });
        }
        if (w.activities.includes('sunrise_early')) {
            items.push({ icon: '🌄', text: '<strong>Warmest layers!</strong>', reason: '3:45 AM wake-up — it\'ll be ~1°C' });
        }
        if (w.activities.includes('stargazing')) {
            items.push({ icon: '🌙', text: '<strong>Warmest jacket for night</strong>', reason: 'Stargazing — near freezing after dark' });
        }
        if (w.activities.includes('glacier')) {
            items.push({ icon: '🧊', text: '<strong>Wind-proof jacket</strong>', reason: 'Glacier is cold & windy' });
        }

        // Always
        if (w.cond === 'sunny' || w.cond === 'partly_cloudy') {
            items.push({ icon: '🕶️', text: '<strong>Sunglasses</strong> + sunscreen', reason: 'UV is strong at altitude' });
        }
        if (w.cond === 'mix' || w.cond === 'partly_cloudy') {
            items.push({ icon: '🌂', text: '<strong>Rain jacket</strong> just in case', reason: 'Mixed conditions' });
        }

        return { items, weather: w };
    }

    function renderWearToday() {
        const card = document.getElementById('wear-card');
        const today = new Date().toISOString().split('T')[0];

        let currentDay = null;
        Object.entries(tripDates).forEach(([d, date]) => {
            if (date === today) currentDay = parseInt(d);
        });

        if (!currentDay) {
            // Not during trip — show a preview for Day 5 (Banff) as example
            const outfit = generateOutfit(5);
            card.innerHTML = `
                <div class="wear-day-title">Preview: Day 5 — Banff (${outfit.weather.hi}°/${outfit.weather.lo}°C)</div>
                <div class="wear-items">${outfit.items.map(i => `
                    <div class="wear-item">
                        <span class="wear-item-icon">${i.icon}</span>
                        <div class="wear-item-text">${i.text}<br><span class="wear-reason">${i.reason}</span></div>
                    </div>`).join('')}
                </div>
                <p style="text-align:center;color:var(--text-dim);font-size:0.75rem;margin-top:12px;">During the trip, this updates daily based on your actual activities</p>
            `;
            return;
        }

        const outfit = generateOutfit(currentDay);
        if (!outfit) { card.innerHTML = '<div class="wear-loading">No data for today</div>'; return; }

        card.innerHTML = `
            <div class="wear-day-title">Day ${currentDay} — ${outfit.weather.loc} (${outfit.weather.hi}°/${outfit.weather.lo}°C, ${outfit.weather.cond.replace('_', ' ')})</div>
            <div class="wear-items">${outfit.items.map(i => `
                <div class="wear-item">
                    <span class="wear-item-icon">${i.icon}</span>
                    <div class="wear-item-text">${i.text}<br><span class="wear-reason">${i.reason}</span></div>
                </div>`).join('')}
            </div>
        `;
    }

    renderWearToday();

    // ===== SCROLL ANIMATIONS =====
    const animTargets = document.querySelectorAll(
        '.section-title, .day-card, .flight-card, .car-card, .viewpoint-card, ' +
        '.tip-card, .packing-card, .reservation-card, .star-night-card, ' +
        '.parking-card, .offline-map-card, .gas-station, .aurora-loc-card, ' +
        '.emergency-btn, .drive-row:not(.drive-header)'
    );

    animTargets.forEach(el => el.classList.add('animate-on-scroll'));

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                scrollObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    animTargets.forEach(el => scrollObserver.observe(el));

    // ===== DAY CARD THUMBNAILS =====
    // Using CSS gradients + emoji as reliable thumbnails (no external dependency)
    const dayThumbs = {
        1:  { gradient: 'linear-gradient(135deg, #0d47a1, #00bcd4)', emoji: '✈️', label: 'Vancouver Arrival' },
        2:  { gradient: 'linear-gradient(135deg, #00695c, #26a69a)', emoji: '🌲', label: 'Vancouver + Porsche' },
        3:  { gradient: 'linear-gradient(135deg, #1565c0, #4fc3f7)', emoji: '🏔️', label: 'Sea-to-Sky Drive' },
        4:  { gradient: 'linear-gradient(135deg, #33691e, #8bc34a)', emoji: '✈️', label: 'Fly to Calgary' },
        5:  { gradient: 'linear-gradient(135deg, #1b5e20, #66bb6a)', emoji: '⛰️', label: 'Banff Day' },
        6:  { gradient: 'linear-gradient(135deg, #1b5e20, #66bb6a)', emoji: '🚡', label: 'Banff Gondola' },
        7:  { gradient: 'linear-gradient(135deg, #004d40, #80cbc4)', emoji: '🛶', label: 'Yoho National Park' },
        8:  { gradient: 'linear-gradient(135deg, #0d47a1, #81d4fa)', emoji: '🌅', label: 'Lake Louise' },
        9:  { gradient: 'linear-gradient(135deg, #3e2723, #8d6e63)', emoji: '😴', label: 'Recovery Day' },
        10: { gradient: 'linear-gradient(135deg, #b71c1c, #d4a853)', emoji: '⭐', label: 'Moraine + Icefields' },
        11: { gradient: 'linear-gradient(135deg, #1a237e, #5c6bc0)', emoji: '🧊', label: 'Glacier → Jasper' },
        12: { gradient: 'linear-gradient(135deg, #004d40, #4db6ac)', emoji: '🚢', label: 'Maligne Lake' },
        13: { gradient: 'linear-gradient(135deg, #e65100, #ffb74d)', emoji: '♨️', label: 'Hot Springs + SkyTram' },
        14: { gradient: 'linear-gradient(135deg, #2e7d32, #a5d6a7)', emoji: '🥾', label: 'Five Lakes Trail' },
        15: { gradient: 'linear-gradient(135deg, #37474f, #90a4ae)', emoji: '🧘', label: 'Relax Day' },
        16: { gradient: 'linear-gradient(135deg, #4e342e, #a1887f)', emoji: '🚗', label: 'Drive to Calgary' },
        17: { gradient: 'linear-gradient(135deg, #4a148c, #ce93d8)', emoji: '✈️', label: 'Fly to Montreal' },
        18: { gradient: 'linear-gradient(135deg, #1a237e, #7c4dff)', emoji: '🏰', label: 'Quebec City' },
        19: { gradient: 'linear-gradient(135deg, #880e4f, #e040fb)', emoji: '⛪', label: 'Montreal' },
        20: { gradient: 'linear-gradient(135deg, #bf360c, #ff8a65)', emoji: '🥯', label: 'Montreal Food Day' },
        21: { gradient: 'linear-gradient(135deg, #1a237e, #9575cd)', emoji: '🌸', label: 'Departure' },
        22: { gradient: 'linear-gradient(135deg, #e65100, #ffcc02)', emoji: '🛫', label: 'Transit' },
        23: { gradient: 'linear-gradient(135deg, #c62828, #ef5350)', emoji: '❤️', label: 'Home' },
    };

    // Create gradient thumbnails (no external images — always works!)
    Object.entries(dayThumbs).forEach(([dayNum, data]) => {
        const card = document.getElementById('day-' + dayNum);
        if (!card) return;

        const thumb = document.createElement('div');
        thumb.className = 'day-thumb';
        thumb.style.background = data.gradient;
        thumb.innerHTML = `<span class="day-thumb-emoji">${data.emoji}</span><span class="day-thumb-label">${data.label}</span>`;
        card.insertBefore(thumb, card.firstChild);
    });

    // ===== DARK SKY MAP OVERLAY =====
    // Add Bortle scale circles for dark sky locations on the map
    const darkSkyBtn = document.getElementById('darksky-toggle');
    let darkSkyLayer = null;
    let darkSkyVisible = false;

    const darkSkySites = [
        { lat: 52.87, lng: -118.08, name: 'Jasper Dark Sky Preserve', bortle: 2, radius: 40000, color: '#1a237e' },
        { lat: 52.22, lng: -117.22, name: 'Columbia Icefield', bortle: 2, radius: 20000, color: '#1a237e' },
        { lat: 52.73, lng: -117.31, name: 'Maligne Lake', bortle: 2, radius: 15000, color: '#1a237e' },
        { lat: 51.18, lng: -115.57, name: 'Banff (Vermilion Lakes)', bortle: 4, radius: 8000, color: '#303f9f' },
        { lat: 51.32, lng: -116.18, name: 'Moraine Lake', bortle: 3, radius: 10000, color: '#283593' },
        { lat: 52.91, lng: -118.07, name: 'Pyramid Island', bortle: 3, radius: 10000, color: '#283593' },
    ];

    if (darkSkyBtn && typeof L !== 'undefined') {
        darkSkyBtn.addEventListener('click', () => {
            darkSkyVisible = !darkSkyVisible;
            darkSkyBtn.classList.toggle('active', darkSkyVisible);

            // Access the map from the map.js scope (it's on window via Leaflet)
            const mapEl = document.getElementById('trip-map');
            if (!mapEl || !mapEl._leaflet_id) return;

            // Find the map instance
            const mapInstance = Object.values(window).find(v =>
                v && v._container && v._container.id === 'trip-map'
            );

            // Alternative: iterate L maps
            let map = null;
            if (mapEl._leaflet_id) {
                // Access via internal Leaflet reference
                for (const key of Object.keys(mapEl)) {
                    if (key.startsWith('_leaflet')) {
                        map = mapEl[key];
                        if (map && map.addLayer) break;
                        map = null;
                    }
                }
            }

            if (!map) {
                // Fallback: check all Leaflet maps
                document.querySelectorAll('.leaflet-container').forEach(el => {
                    if (el._leaflet_map) map = el._leaflet_map;
                });
            }

            // If we still can't find the map, try the global approach
            if (!map && window._honeymoonMap) {
                map = window._honeymoonMap;
            }

            if (!map) return;

            if (darkSkyVisible && !darkSkyLayer) {
                darkSkyLayer = L.layerGroup();
                darkSkySites.forEach(site => {
                    L.circle([site.lat, site.lng], {
                        radius: site.radius,
                        color: site.color,
                        fillColor: site.color,
                        fillOpacity: 0.2,
                        weight: 1,
                        opacity: 0.5,
                    }).bindPopup(`<b>${site.name}</b><br>Bortle Class ${site.bortle}`).addTo(darkSkyLayer);
                });
                darkSkyLayer.addTo(map);
            } else if (darkSkyVisible && darkSkyLayer) {
                darkSkyLayer.addTo(map);
            } else if (!darkSkyVisible && darkSkyLayer) {
                map.removeLayer(darkSkyLayer);
            }
        });
    }

})();
