/* ========================================
   Canada Honeymoon - Interactive Map
   ======================================== */

(function () {
    'use strict';

    // All trip locations with coordinates
    const locations = [
        // VANCOUVER (Days 1-3)
        { lat: 49.2827, lng: -123.1207, name: 'Vancouver Airbnb', day: 1, date: 'May 23', phase: 'vancouver', type: 'stay', desc: 'Arrival & check-in' },
        { lat: 49.3431, lng: -123.1139, name: 'Capilano Suspension Bridge', day: 2, date: 'May 24', phase: 'vancouver', type: 'activity', desc: 'Morning adventure' },
        { lat: 49.3017, lng: -123.1417, name: 'Stanley Park', day: 2, date: 'May 24', phase: 'vancouver', type: 'activity', desc: 'E-bike ride' },
        { lat: 49.2712, lng: -123.1340, name: 'Granville Island Market', day: 2, date: 'May 24', phase: 'vancouver', type: 'dining', desc: 'Lunch spot' },
        { lat: 49.2844, lng: -123.1046, name: 'Gastown', day: 2, date: 'May 24', phase: 'vancouver', type: 'activity', desc: 'Afternoon walk' },
        { lat: 49.2766, lng: -123.2220, name: 'Spanish Banks', day: 2, date: 'May 24', phase: 'vancouver', type: 'activity', desc: 'Sunset drive in Porsche 911' },
        { lat: 49.2757, lng: -123.1469, name: 'Blue Water Cafe', day: 2, date: 'May 24', phase: 'vancouver', type: 'dining', desc: 'Dinner' },
        { lat: 49.3749, lng: -123.2905, name: 'Whytecliff Park', day: 3, date: 'May 25', phase: 'vancouver', type: 'activity', desc: 'Sea-to-Sky stop' },
        { lat: 49.5584, lng: -123.2383, name: 'Porteau Cove', day: 3, date: 'May 25', phase: 'vancouver', type: 'activity', desc: 'Sea-to-Sky stop' },
        { lat: 49.6745, lng: -123.1558, name: 'Sea-to-Sky Gondola', day: 3, date: 'May 25', phase: 'vancouver', type: 'activity', desc: 'Squamish' },
        { lat: 50.1163, lng: -122.9574, name: 'Araxi (Whistler)', day: 3, date: 'May 25', phase: 'vancouver', type: 'dining', desc: 'Lunch in Whistler' },

        // ROCKIES - CANMORE/BANFF (Days 4-6)
        { lat: 51.0884, lng: -115.3579, name: 'Canmore', day: 4, date: 'May 26', phase: 'rockies', type: 'stay', desc: 'Drive from Calgary' },
        { lat: 51.0486, lng: -115.3525, name: 'Crazyweed Kitchen', day: 4, date: 'May 26', phase: 'rockies', type: 'dining', desc: 'Dinner in Canmore' },
        { lat: 51.1692, lng: -115.5590, name: 'Surprise Corner', day: 5, date: 'May 27', phase: 'rockies', type: 'activity', desc: 'Banff viewpoint' },
        { lat: 51.1602, lng: -115.5340, name: 'Hoodoos Viewpoint', day: 5, date: 'May 27', phase: 'rockies', type: 'activity', desc: 'Banff viewpoint' },
        { lat: 51.2455, lng: -115.8394, name: 'Johnston Canyon', day: 5, date: 'May 27', phase: 'rockies', type: 'hike', desc: 'Canyon hike' },
        { lat: 51.1643, lng: -115.5676, name: 'Banff Upper Hot Springs', day: 5, date: 'May 27', phase: 'rockies', type: 'activity', desc: 'Afternoon relaxation' },
        { lat: 51.1740, lng: -115.5718, name: 'The Bison Restaurant', day: 5, date: 'May 27', phase: 'rockies', type: 'dining', desc: 'Dinner' },
        { lat: 51.1810, lng: -115.6170, name: 'Vermilion Lakes', day: 5, date: 'May 27', phase: 'rockies', type: 'star', desc: '⭐ Jaw-dropping sunset viewpoint' },
        { lat: 51.2495, lng: -115.5263, name: 'Lake Minnewanka', day: 6, date: 'May 28', phase: 'rockies', type: 'activity', desc: 'Scenic loop' },
        { lat: 51.2396, lng: -115.5143, name: 'Two Jack Lake', day: 6, date: 'May 28', phase: 'rockies', type: 'activity', desc: 'Scenic stop' },
        { lat: 51.1750, lng: -115.5710, name: 'Banff Gondola', day: 6, date: 'May 28', phase: 'rockies', type: 'activity', desc: 'Evening gondola ride' },
        { lat: 51.1505, lng: -115.5580, name: 'Sky Bistro', day: 6, date: 'May 28', phase: 'rockies', type: 'dining', desc: 'Dinner at the top' },

        // YOHO (Days 7-9)
        { lat: 51.2085, lng: -115.9300, name: 'Storm Mountain', day: 7, date: 'May 29', phase: 'yoho', type: 'activity', desc: 'Bow Valley Parkway stop' },
        { lat: 51.2600, lng: -116.0500, name: 'Castle Mountain', day: 7, date: 'May 29', phase: 'yoho', type: 'activity', desc: 'Bow Valley Parkway stop' },
        { lat: 51.2900, lng: -116.1500, name: "Morant's Curve", day: 7, date: 'May 29', phase: 'yoho', type: 'activity', desc: 'Famous photo spot' },
        { lat: 51.4417, lng: -116.5324, name: 'Emerald Lake', day: 7, date: 'May 29', phase: 'yoho', type: 'activity', desc: '9:30 AM canoe' },
        { lat: 51.3891, lng: -116.5256, name: 'Natural Bridge', day: 7, date: 'May 29', phase: 'yoho', type: 'activity', desc: 'Afternoon stop' },
        { lat: 51.4960, lng: -116.4830, name: 'Takakkaw Falls', day: 7, date: 'May 29', phase: 'yoho', type: 'activity', desc: 'Stunning waterfall' },
        { lat: 51.3980, lng: -116.4600, name: 'Field', day: 7, date: 'May 29', phase: 'yoho', type: 'stay', desc: 'Field Airbnb' },
        { lat: 51.4167, lng: -116.1767, name: 'Lake Louise', day: 8, date: 'May 30', phase: 'rockies', type: 'star', desc: 'Sunrise at Lake Louise' },
        { lat: 51.4230, lng: -116.1850, name: "Laggan's Bakery", day: 8, date: 'May 30', phase: 'rockies', type: 'dining', desc: 'Breakfast' },
        { lat: 51.4100, lng: -116.1900, name: 'Lake Agnes', day: 8, date: 'May 30', phase: 'rockies', type: 'hike', desc: 'Optional afternoon hike' },
        { lat: 51.3816, lng: -116.4741, name: 'Truffle Pigs Bistro', day: 9, date: 'May 31', phase: 'yoho', type: 'dining', desc: 'Recovery day dinner' },

        // ICEFIELDS PARKWAY (Day 10)
        { lat: 51.3217, lng: -116.1843, name: 'Moraine Lake', day: 10, date: 'Jun 1', phase: 'rockies', type: 'star', desc: '⭐ Rockpile viewpoint — jaw-dropping!' },
        { lat: 51.7275, lng: -116.5092, name: 'Peyto Lake', day: 10, date: 'Jun 1', phase: 'rockies', type: 'star', desc: '⭐ Iconic turquoise lake viewpoint' },
        { lat: 51.6709, lng: -116.4596, name: 'Bow Lake', day: 10, date: 'Jun 1', phase: 'rockies', type: 'activity', desc: 'Icefields Parkway stop' },
        { lat: 51.8200, lng: -116.5400, name: 'Mistaya Canyon', day: 10, date: 'Jun 1', phase: 'rockies', type: 'activity', desc: 'Quick canyon walk' },
        { lat: 51.9200, lng: -116.7200, name: 'Big Bend', day: 10, date: 'Jun 1', phase: 'rockies', type: 'star', desc: '⭐ Jaw-dropping Parkway viewpoint' },
        { lat: 51.9600, lng: -116.7800, name: 'Panther Falls', day: 10, date: 'Jun 1', phase: 'rockies', type: 'activity', desc: 'Roadside waterfall' },
        { lat: 52.0117, lng: -116.8283, name: 'Parker Ridge', day: 10, date: 'Jun 1', phase: 'rockies', type: 'star', desc: '⭐ Saskatchewan Glacier viewpoint' },
        { lat: 52.2197, lng: -117.2228, name: 'Glacier View Lodge', day: 10, date: 'Jun 1', phase: 'rockies', type: 'stay', desc: 'Columbia Icefield overnight' },

        // JASPER (Days 11-15)
        { lat: 52.2330, lng: -117.2280, name: 'Ice Explorer Glacier Tour', day: 11, date: 'Jun 2', phase: 'jasper', type: 'activity', desc: 'Walk on the glacier' },
        { lat: 52.5337, lng: -117.1048, name: 'Sunwapta Falls', day: 11, date: 'Jun 2', phase: 'jasper', type: 'activity', desc: 'Powerful falls' },
        { lat: 52.6648, lng: -117.2211, name: 'Athabasca Falls', day: 11, date: 'Jun 2', phase: 'jasper', type: 'activity', desc: 'Thundering waterfall' },
        { lat: 52.8737, lng: -118.0814, name: 'Jasper Town', day: 11, date: 'Jun 2', phase: 'jasper', type: 'activity', desc: 'Dinner & Planetarium' },
        { lat: 53.3994, lng: -117.5900, name: 'Hinton Airbnb', day: 11, date: 'Jun 2', phase: 'jasper', type: 'stay', desc: 'Accommodation base' },
        { lat: 52.9064, lng: -117.7967, name: 'Maligne Canyon', day: 12, date: 'Jun 3', phase: 'jasper', type: 'hike', desc: 'Canyon hike' },
        { lat: 52.7328, lng: -117.3092, name: 'Maligne Lake', day: 12, date: 'Jun 3', phase: 'jasper', type: 'activity', desc: 'Spirit Island cruise' },
        { lat: 52.8350, lng: -117.4650, name: 'Medicine Lake', day: 12, date: 'Jun 3', phase: 'jasper', type: 'activity', desc: 'Stargazing spot' },
        { lat: 53.0267, lng: -117.7714, name: 'Miette Hot Springs', day: 13, date: 'Jun 4', phase: 'jasper', type: 'activity', desc: 'Hottest springs in the Rockies' },
        { lat: 52.8693, lng: -118.0619, name: 'Jasper SkyTram', day: 13, date: 'Jun 4', phase: 'jasper', type: 'activity', desc: 'Afternoon ride up' },
        { lat: 52.9083, lng: -118.0700, name: 'Pyramid Island', day: 13, date: 'Jun 4', phase: 'jasper', type: 'star', desc: '⭐ Jaw-dropping sunset viewpoint' },
        { lat: 52.8450, lng: -117.8690, name: 'Valley of the Five Lakes', day: 14, date: 'Jun 5', phase: 'jasper', type: 'hike', desc: 'Beautiful lake hike' },
        { lat: 52.9050, lng: -118.0500, name: 'Patricia & Pyramid Lakes', day: 14, date: 'Jun 5', phase: 'jasper', type: 'activity', desc: 'Afternoon relaxation' },

        // CALGARY (Days 16)
        { lat: 52.2157, lng: -116.4355, name: 'Abraham Lake', day: 16, date: 'Jun 7', phase: 'rockies', type: 'activity', desc: 'Scenic stop on drive south' },
        { lat: 51.1215, lng: -114.0134, name: 'Calgary Airport (YYC)', day: 16, date: 'Jun 7', phase: 'rockies', type: 'stay', desc: 'Hampton Inn overnight' },

        // QUEBEC CITY (Days 17-18)
        { lat: 46.8912, lng: -71.1506, name: 'Montmorency Falls', day: 17, date: 'Jun 8', phase: 'quebec', type: 'activity', desc: 'Stop en route to Quebec City' },
        { lat: 46.8119, lng: -71.2052, name: 'Old Quebec', day: 17, date: 'Jun 8', phase: 'quebec', type: 'dining', desc: 'Dinner in Old Quebec' },
        { lat: 46.8122, lng: -71.2039, name: 'Château Frontenac', day: 18, date: 'Jun 9', phase: 'quebec', type: 'activity', desc: 'Iconic castle hotel' },
        { lat: 46.8110, lng: -71.2034, name: 'Terrasse Dufferin', day: 18, date: 'Jun 9', phase: 'quebec', type: 'activity', desc: 'River views' },
        { lat: 46.8092, lng: -71.2048, name: 'Petit Champlain', day: 18, date: 'Jun 9', phase: 'quebec', type: 'activity', desc: 'Charming street' },
        { lat: 46.8133, lng: -71.2080, name: 'Chez Boulay', day: 18, date: 'Jun 9', phase: 'quebec', type: 'dining', desc: 'Lunch' },

        // MONTREAL (Days 18-21)
        { lat: 45.5067, lng: -73.5599, name: 'Modavie', day: 18, date: 'Jun 9', phase: 'montreal', type: 'dining', desc: 'Dinner in Old Montreal' },
        { lat: 45.5087, lng: -73.5875, name: 'Mount Royal Lookout', day: 19, date: 'Jun 10', phase: 'montreal', type: 'star', desc: '⭐ Jaw-dropping city panorama' },
        { lat: 45.5046, lng: -73.5566, name: 'Notre Dame Basilica', day: 19, date: 'Jun 10', phase: 'montreal', type: 'activity', desc: 'Stunning interior' },
        { lat: 45.5064, lng: -73.5530, name: 'Old Port', day: 19, date: 'Jun 10', phase: 'montreal', type: 'activity', desc: 'Waterfront walk' },
        { lat: 45.5050, lng: -73.5563, name: 'Crew Collective Cafe', day: 19, date: 'Jun 10', phase: 'montreal', type: 'dining', desc: 'Beautiful cafe' },
        { lat: 45.5231, lng: -73.6003, name: 'St-Viateur Bagel', day: 20, date: 'Jun 11', phase: 'montreal', type: 'dining', desc: 'Montreal bagel #1' },
        { lat: 45.5228, lng: -73.5979, name: 'Fairmount Bagel', day: 20, date: 'Jun 11', phase: 'montreal', type: 'dining', desc: 'Montreal bagel #2' },
        { lat: 45.5363, lng: -73.6145, name: 'Jean Talon Market', day: 20, date: 'Jun 11', phase: 'montreal', type: 'activity', desc: 'Vibrant food market' },
        { lat: 45.4800, lng: -73.5803, name: 'Joe Beef', day: 20, date: 'Jun 11', phase: 'montreal', type: 'dining', desc: 'Legendary dinner' },
        { lat: 45.5592, lng: -73.5635, name: 'Montreal Botanical Garden', day: 21, date: 'Jun 12', phase: 'montreal', type: 'activity', desc: 'Morning before departure' },
    ];

    // Phase colors matching CSS
    const phaseColors = {
        vancouver: '#00bcd4',
        rockies: '#4caf50',
        yoho: '#8bc34a',
        jasper: '#66bb6a',
        quebec: '#7c4dff',
        montreal: '#e040fb',
    };

    const starColor = '#d4a853';

    // Route waypoints (major stops in order for the route line)
    const routeWaypoints = [
        [49.2827, -123.1207],   // Vancouver
        [50.1163, -122.9574],   // Whistler
        [49.2827, -123.1207],   // Vancouver (return)
        [51.1215, -114.0134],   // Calgary
        [51.0884, -115.3579],   // Canmore
        [51.1740, -115.5718],   // Banff
        [51.2455, -115.8394],   // Johnston Canyon
        [51.3980, -116.4600],   // Field
        [51.4417, -116.5324],   // Emerald Lake
        [51.4167, -116.1767],   // Lake Louise
        [51.3217, -116.1843],   // Moraine Lake
        [51.7275, -116.5092],   // Peyto Lake
        [52.0117, -116.8283],   // Parker Ridge
        [52.2197, -117.2228],   // Columbia Icefield
        [52.6648, -117.2211],   // Athabasca Falls
        [52.8737, -118.0814],   // Jasper
        [52.7328, -117.3092],   // Maligne Lake
        [52.8737, -118.0814],   // Jasper (return)
        [52.2157, -116.4355],   // Abraham Lake
        [51.1215, -114.0134],   // Calgary
        [45.5088, -73.5878],    // Montreal
        [46.8912, -71.1506],    // Montmorency Falls
        [46.8119, -71.2052],    // Quebec City
        [45.5088, -73.5878],    // Montreal (return)
    ];

    // Custom marker icon
    function createIcon(color, isLarge) {
        const size = isLarge ? 14 : 10;
        const border = isLarge ? 3 : 2;
        return L.divIcon({
            className: 'custom-marker',
            html: `<div style="
                width:${size}px;height:${size}px;
                background:${color};
                border:${border}px solid rgba(255,255,255,0.9);
                border-radius:50%;
                box-shadow:0 0 8px ${color}88;
            "></div>`,
            iconSize: [size + border * 2, size + border * 2],
            iconAnchor: [(size + border * 2) / 2, (size + border * 2) / 2],
        });
    }

    // Build popup HTML
    function popupContent(loc) {
        const tagColors = {
            star: 'background:rgba(212,168,83,0.2);color:#d4a853',
            dining: 'background:rgba(212,168,83,0.15);color:#d4a853',
            hike: 'background:rgba(76,175,80,0.15);color:#66bb6a',
            flight: 'background:rgba(66,165,245,0.15);color:#42a5f5',
            activity: 'background:rgba(255,255,255,0.05);color:#888',
            stay: 'background:rgba(255,255,255,0.05);color:#888',
        };
        const tagStyle = tagColors[loc.type] || tagColors.activity;
        const typeLabel = loc.type === 'star' ? '⭐ Viewpoint' : loc.type.charAt(0).toUpperCase() + loc.type.slice(1);

        return `
            <div class="popup-day">Day ${loc.day} · ${loc.date}</div>
            <b>${loc.name}</b><br>
            <span style="color:#aaa;font-size:12px">${loc.desc}</span><br>
            <span class="popup-tag" style="${tagStyle}">${typeLabel}</span>
        `;
    }

    // Initialize map
    const map = L.map('trip-map', {
        zoomControl: true,
        scrollWheelZoom: true,
    }).setView([52.0, -110.0], 4);

    // Dark tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a> © <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
    }).addTo(map);

    // Route line
    const routeLine = L.polyline(routeWaypoints, {
        color: '#c8102e',
        weight: 2,
        opacity: 0.4,
        dashArray: '8,8',
        smoothFactor: 1.5,
    }).addTo(map);

    // Add markers
    const allMarkers = [];

    locations.forEach(loc => {
        const color = loc.type === 'star' ? starColor : (phaseColors[loc.phase] || '#888');
        const isLarge = loc.type === 'star';
        const marker = L.marker([loc.lat, loc.lng], {
            icon: createIcon(color, isLarge),
        }).bindPopup(popupContent(loc), { maxWidth: 240 });

        marker._locData = loc;
        marker.addTo(map);
        allMarkers.push(marker);
    });

    // Fit to all markers
    const group = L.featureGroup(allMarkers);
    map.fitBounds(group.getBounds().pad(0.1));

    // Filter buttons
    document.querySelectorAll('.map-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.map-filter').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            allMarkers.forEach(marker => {
                const loc = marker._locData;
                let show = false;

                if (filter === 'all') show = true;
                else if (filter === 'star') show = loc.type === 'star';
                else if (filter === 'dining') show = loc.type === 'dining';
                else if (filter === 'hike') show = loc.type === 'hike';
                else if (filter === 'flight') show = loc.type === 'flight';

                if (show) {
                    marker.addTo(map);
                } else {
                    map.removeLayer(marker);
                }
            });

            // Fit to visible markers
            const visible = allMarkers.filter(m => map.hasLayer(m));
            if (visible.length > 0) {
                map.fitBounds(L.featureGroup(visible).getBounds().pad(0.15));
            }
        });
    });

})();
