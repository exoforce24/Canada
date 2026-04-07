/* ========================================
   Firebase Real-Time Sync
   Syncs checklists & notes between devices
   ======================================== */

(function () {
    'use strict';

    // Guard: if Firebase SDK didn't load, skip entirely (site still works without sync)
    if (typeof firebase === 'undefined') {
        console.warn('Firebase SDK not loaded — sync disabled, site works offline only');
        var bar = document.getElementById('sync-bar');
        if (bar) bar.style.display = 'none';
        return;
    }

    try {

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

    // Push local checklist to Firebase (merge, never overwrite)
    function pushChecklist() {
        if (applyingRemote) return;
        try {
            const data = JSON.parse(localStorage.getItem(CHECKLIST_KEY)) || {};
            // Use update() instead of set() to merge, not overwrite
            if (Object.keys(data).length > 0) {
                checklistRef.update(data);
            }
        } catch {}
    }

    // Remove a single checklist item from Firebase when unchecked
    function removeChecklistItem(id) {
        if (applyingRemote) return;
        checklistRef.child(id).remove();
    }

    // Apply remote checklist to local + UI
    function applyRemoteChecklist(data) {
        if (!data) data = {};
        applyingRemote = true;

        // Merge remote into local (remote wins for conflicts)
        const local = JSON.parse(localStorage.getItem(CHECKLIST_KEY) || '{}');
        const merged = { ...local, ...data };

        // Remove items that are in local but explicitly removed from remote
        // (items that exist locally but not remotely were unchecked remotely)
        Object.keys(merged).forEach(key => {
            if (local[key] && !data[key]) {
                delete merged[key];
            }
        });

        localStorage.setItem(CHECKLIST_KEY, JSON.stringify(merged));

        // Update all checkboxes in the DOM
        document.querySelectorAll('.check-item input[type="checkbox"]').forEach(cb => {
            const id = cb.dataset.id;
            if (!id) return;
            const shouldBeChecked = !!merged[id];
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
            if (Object.keys(data).length > 0) {
                notesRef.update(data);
            }
        } catch {}
    }

    function removeNote(id) {
        if (applyingRemote) return;
        notesRef.child(id).remove();
    }

    function applyRemoteNotes(data) {
        if (!data) data = {};
        applyingRemote = true;

        // Merge remote into local
        const local = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}');
        const merged = { ...local, ...data };
        localStorage.setItem(NOTES_KEY, JSON.stringify(merged));

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
            const id = e.target.dataset.id;

            // Update localStorage
            const items = JSON.parse(localStorage.getItem(CHECKLIST_KEY)) || {};
            if (e.target.checked) {
                items[id] = true;
            } else {
                delete items[id];
            }
            localStorage.setItem(CHECKLIST_KEY, JSON.stringify(items));

            // Push individual change to Firebase (not full overwrite)
            updateSyncStatus('syncing');
            if (e.target.checked) {
                checklistRef.child(id).set(true);
            } else {
                checklistRef.child(id).remove();
            }
        }
    });

    // Notes: listen for input events on textareas (debounced)
    let notesSyncTimeout;
    document.addEventListener('input', (e) => {
        if (e.target.tagName === 'TEXTAREA' && e.target.dataset.note && !applyingRemote) {
            clearTimeout(notesSyncTimeout);
            notesSyncTimeout = setTimeout(() => {
                const noteId = e.target.dataset.note;
                const value = e.target.value.trim();
                updateSyncStatus('syncing');
                if (value) {
                    notesRef.child(noteId).set(value);
                } else {
                    notesRef.child(noteId).remove();
                }
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
    // On first load, merge local data into Firebase (update, not overwrite)
    setTimeout(() => {
        pushChecklist();
        pushNotes();
    }, 1500);

    // Expose sync functions globally for other scripts
    window._firebaseSync = {
        pushChecklist,
        pushNotes,
        isApplyingRemote: () => applyingRemote,
    };

    } catch (err) {
        console.warn('Firebase sync failed to initialize:', err);
        var bar = document.getElementById('sync-bar');
        if (bar) bar.style.display = 'none';
    }

})();
