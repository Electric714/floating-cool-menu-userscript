// ==UserScript==
// @name         🌀 Floating Cool Menu + Pro Storage Editor v2.0
// @namespace    https://github.com/quoid/userscripts
// @version      2.0
// @description  Major redesign: Professional dark glassmorphism UI, completely rebuilt storage editor (tabs + table layout + modern UX), premium floating icon, elegant color palette
// @author       Grok
// @match        *://*/*
// @grant        GM.addStyle
// @inject-into  content
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    GM.addStyle(`
        :root { --accent: #6366f1; --bg: #0f172a; --card: #1e2937; --text: #e2e8f0; }
        
        #floating-rocket { 
            position:fixed; bottom:30px; right:30px; width:64px; height:64px; 
            background: linear-gradient(135deg, #6366f1, #0ea5e9); 
            color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; 
            font-size:28px; box-shadow:0 10px 30px rgba(99,102,241,0.5); z-index:999999; 
            cursor:grab; user-select:none; transition: all .2s cubic-bezier(0.4,0,0.2,1); 
            border: 3px solid rgba(255,255,255,0.2);
        }
        #floating-rocket:hover { transform: scale(1.1) rotate(5deg); box-shadow:0 15px 40px rgba(99,102,241,0.6); }
        #floating-rocket:active { transform:scale(0.95); }

        #floating-menu, #storage-editor {
            position:fixed; background: rgba(15,23,42,0.95); border:1px solid #334155;
            border-radius:20px; box-shadow:0 25px 60px rgba(0,0,0,0.6); padding:20px; 
            z-index:1000000; display:none; flex-direction:column; gap:16px; 
            min-width:340px; max-width:92vw; max-height:82vh; overflow-y:auto; 
            backdrop-filter: blur(20px); color: var(--text); font-family: system-ui, -apple-system, sans-serif;
        }
        .menu-btn { 
            padding:16px 20px; background:#1e2937; border:1px solid #475569; border-radius:14px; 
            font-size:15px; text-align:left; cursor:pointer; transition:all .2s; color:#e2e8f0;
            display:flex; align-items:center; gap:12px;
        }
        .menu-btn:hover { background:#334155; transform:translateX(4px); border-color:#6366f1; }
        .menu-close, .editor-close { position:absolute; top:16px; right:18px; font-size:26px; cursor:pointer; color:#94a3b8; transition:color .2s; }
        .menu-close:hover, .editor-close:hover { color:#f87171; }

        /* Professional Storage Editor */
        .editor-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
        .editor-title { font-size:20px; font-weight:600; color:#f1f5f9; }
        .tab-bar { display:flex; background:#1e2937; border-radius:12px; padding:4px; gap:4px; }
        .tab { flex:1; padding:10px 16px; border-radius:10px; font-size:14px; font-weight:500; cursor:pointer; transition:all .2s; text-align:center; }
        .tab.active { background:#6366f1; color:white; box-shadow:0 4px 12px rgba(99,102,241,0.4); }
        .tab:not(.active) { color:#94a3b8; }
        .tab:not(.active):hover { background:#334155; }

        .storage-table { width:100%; border-collapse:collapse; font-size:13px; }
        .storage-table th { text-align:left; padding:10px 12px; color:#64748b; font-weight:500; border-bottom:1px solid #334155; }
        .storage-row { border-bottom:1px solid #334155; }
        .storage-row:hover { background:#1e2937; }
        .storage-row td { padding:12px; vertical-align:middle; }
        .key-cell { font-family:monospace; color:#bae6fd; max-width:140px; overflow:hidden; text-overflow:ellipsis; }
        .value-cell { font-family:monospace; color:#e0f2fe; max-width:220px; word-break:break-all; }
        .action-btn { padding:6px 10px; font-size:12px; border-radius:8px; border:none; cursor:pointer; margin-left:4px; }
        .action-btn.copy { background:#0ea5e9; color:white; }
        .action-btn.edit { background:#6366f1; color:white; }
        .action-btn.delete { background:#f87171; color:white; }

        .add-form { display:flex; gap:8px; margin-top:16px; padding-top:16px; border-top:1px solid #334155; }
        .add-form input, .add-form textarea { flex:1; background:#1e2937; border:1px solid #475569; border-radius:10px; padding:10px 14px; color:#e2e8f0; font-size:13px; }
        .add-btn { background:#22c55e; color:white; border:none; border-radius:10px; padding:0 20px; font-weight:600; cursor:pointer; }

        .section-header { display:flex; justify-content:space-between; align-items:center; margin:16px 0 8px; }
        .section-header h4 { margin:0; font-size:15px; color:#cbd5e1; }
        .count-badge { background:#334155; color:#94a3b8; padding:2px 9px; border-radius:9999px; font-size:11px; font-weight:600; }
    `);

    const rocket = document.createElement('div'); 
    rocket.id = 'floating-rocket'; 
    rocket.innerHTML = '⚙️';  // Premium professional icon
    const menu = document.createElement('div'); menu.id = 'floating-menu';
    const editor = document.createElement('div'); editor.id = 'storage-editor';

    menu.innerHTML = `
        <span class="menu-close">✕</span>
        <div style="margin-bottom:8px; text-align:center; font-size:13px; color:#64748b; font-weight:600; letter-spacing:1px;">FLOATING MENU</div>
        <button class="menu-btn" id="btn-dark">🌙  Toggle Dark Mode</button>
        <button class="menu-btn" id="btn-top">⬆️  Scroll to Top</button>
        <button class="menu-btn" id="btn-refresh">🔄  Refresh Page</button>
        <button class="menu-btn" id="btn-copy">🔗  Copy Page URL</button>
        <button class="menu-btn" id="btn-fun">🎨  Random Background</button>
        <button class="menu-btn" id="btn-hide">🙈  Hide Images</button>
        <button class="menu-btn" id="btn-editor" style="background:#6366f1; color:white; border:none; margin-top:8px;">🍪  Edit Cookies & Storage</button>
    `;

    editor.innerHTML = `
        <span class="editor-close">✕</span>
        <div class="editor-header">
            <div class="editor-title">Storage Editor <span style="font-size:12px; color:#64748b;">v2.0</span></div>
        </div>
        <div class="tab-bar">
            <div class="tab active" data-tab="cookies">🍪 Cookies <span class="count-badge" id="cookie-count">0</span></div>
            <div class="tab" data-tab="local">📦 localStorage <span class="count-badge" id="local-count">0</span></div>
            <div class="tab" data-tab="session">⏳ sessionStorage <span class="count-badge" id="session-count">0</span></div>
        </div>
        <div id="editor-content" style="flex:1; overflow:auto; margin-top:12px;"></div>
        <div style="display:flex; gap:10px; margin-top:16px; padding-top:16px; border-top:1px solid #334155;">
            <button id="export-all" style="flex:1; padding:12px; background:#0ea5e9; color:white; border:none; border-radius:12px; font-weight:600; cursor:pointer;">📤 Export All</button>
            <button id="import-all" style="flex:1; padding:12px; background:#6366f1; color:white; border:none; border-radius:12px; font-weight:600; cursor:pointer;">📥 Import</button>
        </div>
    `;

    document.documentElement.appendChild(rocket);
    document.documentElement.appendChild(menu);
    document.documentElement.appendChild(editor);

    // Draggable logic (unchanged, improved slightly)
    function makeDraggable(el) { /* same as before */ 
        let isDragging = false, startX, startY, initialLeft, initialTop;
        const start = (e) => {
            isDragging = false;
            startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            startY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
            initialLeft = parseFloat(el.style.left) || el.offsetLeft;
            initialTop = parseFloat(el.style.top) || el.offsetTop;
            const drag = (ev) => {
                const cx = ev.type.includes('mouse') ? ev.clientX : ev.touches[0].clientX;
                const cy = ev.type.includes('mouse') ? ev.clientY : ev.touches[0].clientY;
                const dx = cx - startX, dy = cy - startY;
                if (Math.abs(dx) > 5 || Math.abs(dy) > 5) isDragging = true;
                el.style.left = (initialLeft + dx) + 'px';
                el.style.right = 'auto';
                el.style.top = (initialTop + dy) + 'px';
                el.style.bottom = 'auto';
            };
            const stop = () => {
                document.removeEventListener('mousemove', drag);
                document.removeEventListener('touchmove', drag);
                document.removeEventListener('mouseup', stop);
                document.removeEventListener('touchend', stop);
                if (!isDragging && el.id === 'floating-rocket') toggleMenu();
            };
            document.addEventListener('mousemove', drag);
            document.addEventListener('touchmove', drag, { passive: false });
            document.addEventListener('mouseup', stop);
            document.addEventListener('touchend', stop);
        };
        el.addEventListener('mousedown', start);
        el.addEventListener('touchstart', start, { passive: false });
    }

    makeDraggable(rocket);
    makeDraggable(menu);
    makeDraggable(editor);

    function toggleMenu() {
        if (menu.style.display === 'flex') menu.style.display = 'none';
        else {
            const r = rocket.getBoundingClientRect();
            menu.style.left = (r.left - 20) + 'px';
            menu.style.top = (r.top - 380) + 'px';
            menu.style.display = 'flex';
            editor.style.display = 'none';
        }
    }

    // === COMPLETELY REDESIGNED STORAGE EDITOR ===
    let currentTab = 'cookies';
    let currentFilter = '';

    function showEditor(filter = '') {
        currentFilter = filter;
        menu.style.display = 'none';
        editor.style.display = 'flex';
        
        const content = document.getElementById('editor-content');
        renderTabContent(content);
        
        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.onclick = () => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentTab = tab.dataset.tab;
                renderTabContent(content);
            };
        });

        // Global buttons
        document.getElementById('export-all').onclick = exportAll;
        document.getElementById('import-all').onclick = importAll;
    }

    function renderTabContent(container) {
        container.innerHTML = '';
        let html = '';
        let items = [];
        let type = currentTab;

        if (currentTab === 'cookies') {
            items = document.cookie ? document.cookie.split(';').map(c => {
                const [k, ...v] = c.trim().split('=');
                return {key: k.trim(), value: decodeURIComponent(v.join('=')) };
            }) : [];
        } else if (currentTab === 'local') {
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                items.push({key: k, value: localStorage.getItem(k)});
            }
        } else if (currentTab === 'session') {
            for (let i = 0; i < sessionStorage.length; i++) {
                const k = sessionStorage.key(i);
                items.push({key: k, value: sessionStorage.getItem(k)});
            }
        }

        if (currentFilter) {
            items = items.filter(item => 
                item.key.toLowerCase().includes(currentFilter) || 
                (item.value && item.value.toLowerCase().includes(currentFilter))
            );
        }

        // Update counts
        document.getElementById('cookie-count').textContent = document.cookie ? document.cookie.split(';').length : 0;
        document.getElementById('local-count').textContent = localStorage.length;
        document.getElementById('session-count').textContent = sessionStorage.length;

        html += `<div style="margin-bottom:12px; display:flex; gap:8px; align-items:center;">
            <input id="search-input" type="text" placeholder="Search keys or values..." value="${currentFilter}" 
                   style="flex:1; background:#1e2937; border:1px solid #475569; border-radius:12px; padding:10px 14px; color:#e2e8f0; font-size:14px;">
        </div>`;

        if (items.length === 0) {
            html += `<div style="text-align:center; padding:40px 20px; color:#64748b;">No items found</div>`;
        } else {
            html += `<table class="storage-table"><thead><tr>
                <th style="width:35%">Key</th><th style="width:45%">Value</th><th style="width:20%">Actions</th>
            </tr></thead><tbody>`;
            
            items.forEach((item, index) => {
                const shortValue = item.value ? (item.value.length > 60 ? item.value.substring(0,60) + '...' : item.value) : '';
                html += `<tr class="storage-row" data-key="${item.key}" data-type="${currentTab}">
                    <td class="key-cell" title="${item.key}">${item.key}</td>
                    <td class="value-cell" title="${item.value || ''}">${shortValue}</td>
                    <td>
                        <button class="action-btn copy" onclick="copyItem(this)">Copy</button>
                        <button class="action-btn edit" onclick="editItem(this)">Edit</button>
                        <button class="action-btn delete" onclick="deleteItem(this)">Del</button>
                    </td>
                </tr>`;
            });
            html += `</tbody></table>`;
        }

        // Add new form
        html += `<div class="add-form">
            <input id="new-key" placeholder="New key" style="flex:1.2">
            <input id="new-value" placeholder="Value" style="flex:2">
            <button class="add-btn" onclick="addNewItem()">+ Add</button>
        </div>`;

        container.innerHTML = html;

        // Search listener
        const search = document.getElementById('search-input');
        if (search) search.oninput = () => {
            currentFilter = search.value.toLowerCase();
            renderTabContent(container);
        };
    }

    // Global functions for editor actions
    window.copyItem = function(btn) {
        const row = btn.closest('tr');
        const key = row.dataset.key;
        const type = row.dataset.type;
        let value = '';
        if (type === 'cookies') value = getCookieValue(key);
        else if (type === 'local') value = localStorage.getItem(key);
        else value = sessionStorage.getItem(key);
        
        navigator.clipboard.writeText(value || '').then(() => alert('✅ Copied!'));
    };

    window.editItem = function(btn) {
        const row = btn.closest('tr');
        const key = row.dataset.key;
        const type = row.dataset.type;
        let currentValue = '';
        if (type === 'cookies') currentValue = getCookieValue(key);
        else if (type === 'local') currentValue = localStorage.getItem(key);
        else currentValue = sessionStorage.getItem(key);

        const newValue = prompt(`Edit value for ${key}:`, currentValue);
        if (newValue !== null) {
            if (type === 'cookies') document.cookie = `${key}=${encodeURIComponent(newValue)}; path=/`;
            else if (type === 'local') localStorage.setItem(key, newValue);
            else sessionStorage.setItem(key, newValue);
            renderTabContent(document.getElementById('editor-content'));
        }
    };

    window.deleteItem = function(btn) {
        if (!confirm('Delete this item?')) return;
        const row = btn.closest('tr');
        const key = row.dataset.key;
        const type = row.dataset.type;
        
        if (type === 'cookies') document.cookie = `${key}=; expires=Thu, 01 Jan 1970; path=/`;
        else if (type === 'local') localStorage.removeItem(key);
        else sessionStorage.removeItem(key);
        
        renderTabContent(document.getElementById('editor-content'));
    };

    window.addNewItem = function() {
        const keyInput = document.getElementById('new-key');
        const valueInput = document.getElementById('new-value');
        if (!keyInput.value.trim()) return;
        
        const key = keyInput.value.trim();
        const value = valueInput.value;
        
        if (currentTab === 'cookies') {
            document.cookie = `${key}=${encodeURIComponent(value)}; path=/`;
        } else if (currentTab === 'local') {
            localStorage.setItem(key, value);
        } else if (currentTab === 'session') {
            sessionStorage.setItem(key, value);
        }
        
        keyInput.value = '';
        valueInput.value = '';
        renderTabContent(document.getElementById('editor-content'));
    };

    function getCookieValue(name) {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? decodeURIComponent(match[2]) : '';
    }

    function exportAll() {
        const data = {
            cookies: document.cookie ? document.cookie.split(';').map(c => { const [k,...v]=c.trim().split('='); return {key:k.trim(), value:decodeURIComponent(v.join('='))}; }) : [],
            localStorage: Object.fromEntries(Object.keys(localStorage).map(k => [k, localStorage.getItem(k)])),
            sessionStorage: Object.fromEntries(Object.keys(sessionStorage).map(k => [k, sessionStorage.getItem(k)]))
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'storage-backup.json';
        a.click();
        alert('✅ Exported all storage!');
    }

    function importAll() {
        const json = prompt('Paste JSON backup:');
        if (!json) return;
        try {
            const data = JSON.parse(json);
            if (data.cookies) data.cookies.forEach(c => document.cookie = `${c.key}=${encodeURIComponent(c.value)}; path=/`);
            if (data.localStorage) Object.keys(data.localStorage).forEach(k => localStorage.setItem(k, data.localStorage[k]));
            if (data.sessionStorage) Object.keys(data.sessionStorage).forEach(k => sessionStorage.setItem(k, data.sessionStorage[k]));
            alert('✅ Imported successfully!');
            renderTabContent(document.getElementById('editor-content'));
        } catch(e) { alert('❌ Invalid JSON'); }
    }

    // Main menu buttons (same functionality, better styling)
    document.getElementById('btn-dark').addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark-mode');
        document.documentElement.style.filter = isDark ? 'invert(1) hue-rotate(180deg)' : '';
        menu.style.display = 'none';
    });
    document.getElementById('btn-top').addEventListener('click', () => { window.scrollTo({top:0, behavior:'smooth'}); menu.style.display = 'none'; });
    document.getElementById('btn-refresh').addEventListener('click', () => location.reload(true));
    document.getElementById('btn-copy').addEventListener('click', () => {
        navigator.clipboard.writeText(location.href).then(() => alert('✅ URL copied!')).catch(() => {
            const ta = document.createElement('textarea'); ta.value = location.href; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); alert('✅ Copied!');
        });
        menu.style.display = 'none';
    });
    document.getElementById('btn-fun').addEventListener('click', () => {
        const colors = ['#6366f1','#0ea5e9','#22c55e','#f59e0b','#ec4899','#8b5cf6'];
        const color = colors[Math.floor(Math.random()*colors.length)];
        document.documentElement.style.setProperty('background-color', color, 'important');
        document.body.style.setProperty('background-color', color, 'important');
        document.body.style.minHeight = '100vh';
        menu.style.display = 'none';
    });
    document.getElementById('btn-hide').addEventListener('click', () => {
        const els = document.querySelectorAll('img, picture, video, [style*="background-image"]');
        els.forEach(el => el.style.display = el.style.display === 'none' ? '' : 'none');
        menu.style.display = 'none';
    });
    document.getElementById('btn-editor').addEventListener('click', () => showEditor());

    menu.querySelector('.menu-close').addEventListener('click', () => menu.style.display = 'none');
    editor.querySelector('.editor-close').addEventListener('click', () => { editor.style.display = 'none'; });

    document.addEventListener('keydown', e => { if (e.key === 'Escape') { menu.style.display = 'none'; editor.style.display = 'none'; } });

    console.log('%c🌀 Floating Cool Menu v2.0 — Professional redesign complete! ✅', 'color:#6366f1; font-size:13px');
})();