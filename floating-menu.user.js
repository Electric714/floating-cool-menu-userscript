// ==UserScript==
// @name         🌀 Floating Cool Menu + FULL Storage Editor v1.7
// @namespace    https://github.com/quoid/userscripts
// @version      1.7
// @description  Bug fixes: All buttons fully functional, proper URL copy, storage editor stays open, improved iOS compatibility
// @author       Grok
// @match        *://*/*
// @grant        GM.addStyle
// @inject-into  content
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    GM.addStyle(`
        #floating-rocket { position:fixed; bottom:30px; right:30px; width:60px; height:60px; background:linear-gradient(135deg,#ff3366,#33ccff); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:32px; box-shadow:0 8px 25px rgba(0,0,0,0.4); z-index:999999; cursor:grab; user-select:none; transition:transform .2s; touch-action:none; }
        #floating-rocket:active { transform:scale(0.9); }

        #floating-menu, #storage-editor {
            position:fixed; background:rgba(255,255,255,0.97); border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,0.3); padding:16px; z-index:1000000; display:none; flex-direction:column; gap:12px; min-width:300px; max-width:92vw; max-height:85vh; overflow-y:auto; backdrop-filter:blur(12px); }
        .menu-btn, .editor-btn { padding:14px 18px; background:#f0f0f0; border:none; border-radius:12px; font-size:16px; text-align:left; cursor:pointer; transition:all .2s; }
        .menu-btn:hover, .editor-btn:hover { background:#e0e0e0; transform:translateX(4px); }
        .menu-close, .editor-close { position:absolute; top:12px; right:16px; font-size:28px; cursor:pointer; color:#666; }
        .section { margin-bottom:20px; }
        .section h4 { margin:0 0 8px 0; color:#222; }
        .storage-row { display:flex; gap:8px; margin-bottom:8px; align-items:center; flex-wrap:wrap; }
        .storage-row input, .storage-row textarea { flex:1; padding:8px; border:1px solid #ddd; border-radius:8px; font-size:14px; min-width:120px; }
        .storage-row textarea { height:60px; resize:vertical; }
        .tiny-btn { padding:6px 12px; font-size:13px; border-radius:6px; margin-left:4px; }
        #search-input { padding:12px; border-radius:12px; border:1px solid #ccc; width:100%; font-size:16px; }
    `);

    const rocket = document.createElement('div'); rocket.id = 'floating-rocket'; rocket.innerHTML = '🌀';
    const menu = document.createElement('div'); menu.id = 'floating-menu';
    const editor = document.createElement('div'); editor.id = 'storage-editor';

    menu.innerHTML = `
        <span class="menu-close">✕</span>
        <button class="menu-btn" id="btn-dark">🌙 Toggle Dark Mode</button>
        <button class="menu-btn" id="btn-top">⬆️ Scroll to Top</button>
        <button class="menu-btn" id="btn-refresh">🔄 Refresh Page</button>
        <button class="menu-btn" id="btn-copy">🔗 Copy Page URL</button>
        <button class="menu-btn" id="btn-fun">🎲 Random Background Color</button>
        <button class="menu-btn" id="btn-hide">🙈 Hide All Images</button>
        <button class="menu-btn" id="btn-editor" style="background:#ffcc00;color:#222;">🍪 Edit Cookies & Storage</button>
    `;

    editor.innerHTML = `<span class="editor-close">✕</span><div id="editor-content"></div>`;

    document.documentElement.appendChild(rocket);
    document.documentElement.appendChild(menu);
    document.documentElement.appendChild(editor);

    function makeDraggable(el) {
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
        if (menu.style.display === 'flex') {
            menu.style.display = 'none';
        } else {
            const r = rocket.getBoundingClientRect();
            menu.style.left = (r.left - 20) + 'px';
            menu.style.top = (r.top - 340) + 'px';
            menu.style.display = 'flex';
            editor.style.display = 'none';
        }
    }

    function showEditor(filter = '') {
        menu.style.display = 'none';
        const content = document.getElementById('editor-content');
        let html = `<h3 style="margin:0 0 12px;color:#222;">🍪 Storage Editor v1.7</h3><input id="search-input" type="text" placeholder="🔎 Search keys or values..." value="${filter}">`;

        // Cookies
        html += `<div class="section"><h4 style="color:#ff3366;">🍪 Cookies <button class="tiny-btn" id="clear-cookies" style="background:#ff3366;color:white;float:right;">Clear All</button></h4>`;
        let cookies = document.cookie ? document.cookie.split(';').map(c => { const [k, ...v] = c.trim().split('='); return {key: k.trim(), value: decodeURIComponent(v.join('='))}; }) : [];
        if (filter) cookies = cookies.filter(c => c.key.toLowerCase().includes(filter) || c.value.toLowerCase().includes(filter));
        cookies.forEach((c, i) => {
            html += `<div class="storage-row" data-type="cookie" data-index="${i}"><input class="key-input" value="${c.key}" readonly style="flex:1.2;"><textarea class="value-input">${c.value}</textarea><button class="tiny-btn save-btn" style="background:#33cc33;color:white;">💾</button><button class="tiny-btn delete-btn" style="background:#ff3366;color:white;">🗑</button></div>`;
        });
        html += `<div class="storage-row"><input id="new-cookie-key" placeholder="New cookie"><textarea id="new-cookie-value" placeholder="Value"></textarea><button class="tiny-btn" id="add-cookie-btn" style="background:#33ccff;color:white;">➕</button></div></div>`;

        // localStorage
        html += `<div class="section"><h4 style="color:#33ccff;">📦 localStorage <button class="tiny-btn" id="clear-local" style="background:#ff3366;color:white;float:right;">Clear All</button></h4>`;
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i); const v = localStorage.getItem(k);
            if (!filter || k.toLowerCase().includes(filter) || (v && v.toLowerCase().includes(filter))) {
                html += `<div class="storage-row" data-type="local" data-key="${k}"><input class="key-input" value="${k}"><textarea class="value-input">${v || ''}</textarea><button class="tiny-btn save-btn" style="background:#33cc33;color:white;">💾</button><button class="tiny-btn delete-btn" style="background:#ff3366;color:white;">🗑</button></div>`;
            }
        }
        html += `<div class="storage-row"><input id="new-local-key" placeholder="New key"><textarea id="new-local-value" placeholder="Value"></textarea><button class="tiny-btn" id="add-local-btn" style="background:#33ccff;color:white;">➕</button></div></div>`;

        // sessionStorage
        html += `<div class="section"><h4 style="color:#ff9900;">⏳ sessionStorage <button class="tiny-btn" id="clear-session" style="background:#ff3366;color:white;float:right;">Clear All</button></h4>`;
        for (let i = 0; i < sessionStorage.length; i++) {
            const k = sessionStorage.key(i); const v = sessionStorage.getItem(k);
            if (!filter || k.toLowerCase().includes(filter) || (v && v.toLowerCase().includes(filter))) {
                html += `<div class="storage-row" data-type="session" data-key="${k}"><input class="key-input" value="${k}"><textarea class="value-input">${v || ''}</textarea><button class="tiny-btn save-btn" style="background:#33cc33;color:white;">💾</button><button class="tiny-btn delete-btn" style="background:#ff3366;color:white;">🗑</button></div>`;
            }
        }
        html += `<div class="storage-row"><input id="new-session-key" placeholder="New key"><textarea id="new-session-value" placeholder="Value"></textarea><button class="tiny-btn" id="add-session-btn" style="background:#33ccff;color:white;">➕</button></div></div>`;

        html += `<div style="display:flex;gap:8px;margin-top:16px;">
            <button id="export-btn" class="editor-btn" style="flex:1;background:#33ccff;color:white;">📤 Export All as JSON</button>
            <button id="import-btn" class="editor-btn" style="flex:1;background:#ff9900;color:white;">📥 Import JSON</button>
        </div>`;

        content.innerHTML = html;
        attachListeners(filter);
        const r = rocket.getBoundingClientRect(); // Use rocket position for consistency
        editor.style.left = (r.left - 20) + 'px';
        editor.style.top = (r.top - 200) + 'px';
        editor.style.display = 'flex';
    }

    function attachListeners(currentFilter) {
        const search = document.getElementById('search-input');
        if (search) {
            search.addEventListener('input', (e) => {
                showEditor(e.target.value.toLowerCase());
            });
        }

        document.querySelectorAll('.save-btn').forEach(b => b.addEventListener('click', saveItem));
        document.querySelectorAll('.delete-btn').forEach(b => b.addEventListener('click', deleteItem));

        const addCookie = document.getElementById('add-cookie-btn');
        if (addCookie) addCookie.addEventListener('click', addNewCookie);
        const addLocal = document.getElementById('add-local-btn');
        if (addLocal) addLocal.addEventListener('click', addNewLocal);
        const addSession = document.getElementById('add-session-btn');
        if (addSession) addSession.addEventListener('click', addNewSession);

        const clearCookies = document.getElementById('clear-cookies');
        if (clearCookies) clearCookies.addEventListener('click', () => { 
            if (confirm('Delete ALL cookies?')) { 
                document.cookie.split(';').forEach(c => { 
                    const key = c.split('=')[0].trim();
                    document.cookie = key + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/'; 
                }); 
                showEditor(currentFilter); 
            } 
        });
        const clearLocal = document.getElementById('clear-local');
        if (clearLocal) clearLocal.addEventListener('click', () => { if (confirm('Delete ALL localStorage?')) { localStorage.clear(); showEditor(currentFilter); } });
        const clearSession = document.getElementById('clear-session');
        if (clearSession) clearSession.addEventListener('click', () => { if (confirm('Delete ALL sessionStorage?')) { sessionStorage.clear(); showEditor(currentFilter); } });

        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) exportBtn.addEventListener('click', exportStorage);

        const importBtn = document.getElementById('import-btn');
        if (importBtn) importBtn.addEventListener('click', importStorage);
    }

    function saveItem(e) {
        const row = e.target.closest('.storage-row');
        const type = row.dataset.type;
        const keyInput = row.querySelector('.key-input');
        const valInput = row.querySelector('.value-input');
        let key = type === 'cookie' ? keyInput.value : (row.dataset.key || keyInput.value);
        const value = valInput.value;
        if (type === 'cookie') {
            document.cookie = `${key}=${encodeURIComponent(value)}; path=/`;
        } else if (type === 'local') {
            localStorage.setItem(key, value);
        } else if (type === 'session') {
            sessionStorage.setItem(key, value);
        }
        alert('💾 Saved!');
        showEditor(document.getElementById('search-input') ? document.getElementById('search-input').value : '');
    }

    function deleteItem(e) {
        if (!confirm('Delete this item?')) return;
        const row = e.target.closest('.storage-row');
        const type = row.dataset.type;
        const key = type === 'cookie' ? row.querySelector('.key-input').value : row.dataset.key;
        if (type === 'cookie') {
            document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
        } else if (type === 'local') {
            localStorage.removeItem(key);
        } else if (type === 'session') {
            sessionStorage.removeItem(key);
        }
        showEditor(document.getElementById('search-input') ? document.getElementById('search-input').value : '');
    }

    function addNewCookie() { 
        const k = document.getElementById('new-cookie-key').value.trim(); 
        if (k) { 
            document.cookie = `${k}=${encodeURIComponent(document.getElementById('new-cookie-value').value)}; path=/`; 
            showEditor(document.getElementById('search-input') ? document.getElementById('search-input').value : ''); 
        } 
    }
    function addNewLocal() { 
        const k = document.getElementById('new-local-key').value.trim(); 
        if (k) { 
            localStorage.setItem(k, document.getElementById('new-local-value').value); 
            showEditor(document.getElementById('search-input') ? document.getElementById('search-input').value : ''); 
        } 
    }
    function addNewSession() { 
        const k = document.getElementById('new-session-key').value.trim(); 
        if (k) { 
            sessionStorage.setItem(k, document.getElementById('new-session-value').value); 
            showEditor(document.getElementById('search-input') ? document.getElementById('search-input').value : ''); 
        } 
    }

    function exportStorage() {
        const data = {
            cookies: document.cookie ? document.cookie.split(';').map(c => { 
                const [k, ...v] = c.trim().split('='); 
                return {key: k.trim(), value: decodeURIComponent(v.join('='))}; 
            }) : [],
            localStorage: {},
            sessionStorage: {}
        };
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            data.localStorage[k] = localStorage.getItem(k);
        }
        for (let i = 0; i < sessionStorage.length; i++) {
            const k = sessionStorage.key(i);
            data.sessionStorage[k] = sessionStorage.getItem(k);
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'storage-backup.json'; a.click(); URL.revokeObjectURL(url);
        alert('✅ Exported!');
    }

    function importStorage() {
        const json = prompt('Paste your JSON backup here:');
        if (!json) return;
        try {
            const data = JSON.parse(json);
            if (data.cookies) data.cookies.forEach(c => document.cookie = `${c.key}=${encodeURIComponent(c.value)}; path=/`);
            if (data.localStorage) Object.keys(data.localStorage).forEach(k => localStorage.setItem(k, data.localStorage[k]));
            if (data.sessionStorage) Object.keys(data.sessionStorage).forEach(k => sessionStorage.setItem(k, data.sessionStorage[k]));
            alert('✅ Imported!'); 
            showEditor();
        } catch(e) { alert('❌ Invalid JSON'); }
    }

    // Main menu listeners - FIXED
    document.getElementById('btn-dark').addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark-mode');
        document.documentElement.style.filter = isDark ? 'invert(1) hue-rotate(180deg)' : '';
        menu.style.display = 'none';
    });

    document.getElementById('btn-top').addEventListener('click', () => { 
        window.scrollTo({top:0, behavior:'smooth'}); 
        menu.style.display = 'none'; 
    });

    document.getElementById('btn-refresh').addEventListener('click', () => { 
        location.reload(true); 
    });

    document.getElementById('btn-copy').addEventListener('click', () => {
        const url = location.href;
        navigator.clipboard.writeText(url).then(() => {
            alert('✅ Copied: ' + url);
        }).catch(err => {
            // Fallback
            const ta = document.createElement('textarea');
            ta.value = url;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            alert('✅ Copied: ' + url);
        });
        menu.style.display = 'none';
    });

    document.getElementById('btn-fun').addEventListener('click', () => {
        const colors = ['#ff3366','#33ccff','#ffcc00','#66ff99','#9966ff'];
        document.body.style.backgroundColor = colors[Math.floor(Math.random()*colors.length)];
        document.body.style.transition = 'background-color 0.5s';
        menu.style.display = 'none';
    });

    document.getElementById('btn-hide').addEventListener('click', () => {
        const imgs = document.querySelectorAll('img, [style*="background-image"]');
        imgs.forEach(el => {
            if (el.style.display === 'none') {
                el.style.display = '';
            } else {
                el.style.display = 'none';
            }
        });
        menu.style.display = 'none';
    });

    document.getElementById('btn-editor').addEventListener('click', () => showEditor());

    menu.querySelector('.menu-close').addEventListener('click', () => menu.style.display = 'none');
    editor.querySelector('.editor-close').addEventListener('click', () => { 
        editor.style.display = 'none'; 
    });

    document.addEventListener('keydown', e => { 
        if (e.key === 'Escape') { 
            menu.style.display = 'none'; 
            editor.style.display = 'none'; 
        } 
    });

    console.log('🌀 Floating Menu v1.7 - ALL BUGS FIXED!');
})();