/* ========================================
   Firebase Real-Time Sync
   Syncs checklists & notes between devices
   ======================================== */

(function () {
    'use strict';

    // Firebase config
    const firebaseConfig = {
        apiKey: "AIzaSyCl1Mbw7RGCYX7SL_AwBndffEcmmKm59vg",
        authDomain: "canada-honeymoon.firebaseapp.com",
        databaseURL: "https://canada-honeymoon-default-rtdb.firebaseio.com",
        projectId: "canada-honeymoon",
        storageBucket: "canada-honeymoon.firebasestorage.app",
        messagingSenderId: "446159072431",
        appId: "1:446159072431:web:e3e9183474c2b16fcf385a"
    };

    // Initialize Firebase
    const app = firebase.initializeApp(firebaseConfig);
    const db = firebase.database();

    // Simple hash to create a DB path from password (keeps data somewhat private)
    function hashPath(str) {
        let hash = 5381;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) + hash) + str.charCodeAt(i);
            hash = hash & hash; // Convert to 32-bit int
        }
        return 'trip_' + Math.abs(hash).toString(36);
    }

    // Database path based on shared password
    const DB_PATH = hashPath('MosesMichelle');

    // References
    const checklistRef = db.ref(DB_PATH + '/checklist');
    const notesRef = db.ref(DB_PATH + '/notes');

    // Local storage keys (same as app.js uses)
    const CHECKLIST_KEY = 'canada-honeymoon-checklist';
    const NOTES_KEY = 'canada-honeymoon-notes';

    // Status UI
    function updateSyncStatus(status, text) {
        const icon = document.getElementById('sync-icon');
        const textEl = document.getElementById('sync-text');
        const bar = document.getElementById('sync-bar');
        if (!icon || !textEl || !bar) return;

        if (status === 'connected') {
            icon.textContent = '🟢';
            textEl.textContent = text || 'Synced — both phones connected';
            bar.className = 'sync-bar sync-connected';
        } else if (status === 'syncing') {
            icon.textContent = '🔄';
            textEl.textContent = text || 'Syncing...';
            bar.className = 'sync-bar sync-syncing';
        } else if (status === 'offline') {
            icon.textContent = '🔴';
            textEl.textContent = text || 'Offline — changes saved locally';
            bar.className = 'sync-bar sync-offline';
        } else {
            icon.textContent = '🔄';
            textEl.textContent = text || 'Connecting...';
            bar.className = 'sync-bar';
        }
    }

    // Track if we're currently applying remote changes (to avoid echo loops)
    let applyingRemote = false;

    // ===== CHECKLIST SYNC =====

    // Push local checklist to Firebase
    function pushChecklist() {
        if (applyingRemote) return;
        try {
            const data = JSON.parse(localStorage.getItem(CHECKLIST_KEY)) || {};
            checklistRef.set(data);
        } catch {}
    }

    // Apply remote checklist to local + UI
    function applyRemoteChecklist(data) {
        if (!data) data = {};
        applyingRemote = true;

        // Save to localStorage
        localStorage.setItem(CHECKLIST_KEY, JSON.stringify(data));

        // Update all checkboxes in the DOM
        document.querySelectorAll('.check-item input[type="checkbox"]').forEach(cb => {
            const id = cb.dataset.id;
            if (!id) return;
            const shouldBeChecked = !!data[id];
            if (cb.checked !== shouldBeChecked) {
                cb.checked = shouldBeChecked;
            }
        });

        // Update progress bar
        updateProgressBar();

        applyingRemote = false;
    }

    // ===== NOTES SYNC =====

    function pushNotes() {
        if (applyingRemote) return;
        try {
            const data = JSON.parse(localStorage.getItem(NOTES_KEY)) || {};
            notesRef.set(data);
        } catch {}
    }

    function applyRemoteNotes(data) {
        if (!data) data = {};
        applyingRemote = true;

        localStorage.setItem(NOTES_KEY, JSON.stringify(data));

        // Update note textareas in the DOM
        document.querySelectorAll('.day-notes textarea').forEach(textarea => {
            const noteId = textarea.dataset.note;
            if (!noteId) return;
            const remoteValue = data[noteId] || '';
            if (textarea.value !== remoteValue) {
                textarea.value = remoteValue;
            }
        });

        applyingRemote = false;
    }

    // ===== PROGRESS BAR (re-calculate) =====
    function updateProgressBar() {
        const checkboxes = document.querySelectorAll('.check-item input[type="checkbox"]');
        const total = checkboxes.length;
        const done = document.querySelectorAll('.check-item input[type="checkbox"]:checked').length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;

        const bar = document.getElementById('progress-bar');
        const text = document.getElementById('progress-text');
        const detail = document.getElementById('progress-detail');

        if (bar) bar.style.width = Math.max(pct, 4) + '%';
        if (text) text.textContent = pct + '%';
        if (detail) detail.textContent = `${done} of ${total} items checked`;
    }

    // ===== LISTEN FOR REMOTE CHANGES =====

    checklistRef.on('value', (snapshot) => {
        const data = snapshot.val();
        applyRemoteChecklist(data);
        updateSyncStatus('connected');
    });

    notesRef.on('value', (snapshot) => {
        const data = snapshot.val();
        applyRemoteNotes(data);
    });

    // ===== LISTEN FOR LOCAL CHANGES =====

    // Override checkbox change handler — push to Firebase
    document.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox' && e.target.dataset.id && !applyingRemote) {
            // Update localStorage
            const items = JSON.parse(localStorage.getItem(CHECKLIST_KEY)) || {};
            if (e.target.checked) {
                items[e.target.dataset.id] = true;
            } else {
                delete items[e.target.dataset.id];
            }
            localStorage.setItem(CHECKLIST_KEY, JSON.stringify(items));

            // Push to Firebase
            updateSyncStatus('syncing');
            pushChecklist();
        }
    });

    // Notes: listen for input events on textareas (debounced)
    let notesSyncTimeout;
    document.addEventListener('input', (e) => {
        if (e.target.tagName === 'TEXTAREA' && e.target.dataset.note && !applyingRemote) {
            clearTimeout(notesSyncTimeout);
            notesSyncTimeout = setTimeout(() => {
                // localStorage is already updated by app.js
                updateSyncStatus('syncing');
                pushNotes();
            }, 800);
        }
    });

    // ===== CONNECTION STATE =====
    const connRef = db.ref('.info/connected');
    connRef.on('value', (snap) => {
        if (snap.val() === true) {
            updateSyncStatus('connected');
            // Push local data on reconnect (merge)
            pushChecklist();
            pushNotes();
        } else {
            updateSyncStatus('offline');
        }
    });

    // ===== INITIAL SYNC =====
    // On first load, push local data to Firebase (won't overwrite if remote has data
    // because the 'value' listener will fire and apply remote data)
    setTimeout(() => {
        const localChecklist = JSON.parse(localStorage.getItem(CHECKLIST_KEY) || '{}');
        const localNotes = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}');

        // Only push if local has data and remote might be empty
        if (Object.keys(localChecklist).length > 0) {
            checklistRef.once('value', (snap) => {
                if (!snap.val()) {
                    pushChecklist();
                }
            });
        }
        if (Object.keys(localNotes).length > 0) {
            notesRef.once('value', (snap) => {
                if (!snap.val()) {
                    pushNotes();
                }
            });
        }
    }, 1000);

    // Expose sync functions globally for other scripts
    window._firebaseSync = {
        pushChecklist,
        pushNotes,
        isApplyingRemote: () => applyingRemote,
    };

})();
