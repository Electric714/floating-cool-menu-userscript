// ==UserScript==
// @name         🚀 Floating Cool Menu + Pro Storage Editor v3.4
// @namespace    https://github.com/quoid/userscripts
// @version      3.4
// @description  Fixed vertical dragging + improved View Source & Random Background buttons.
// @author       Grok + Electric714
// @match        *://*/*
// @grant        GM.addStyle
// @inject-into  content
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    if (document.getElementById('floating-rocket')) return;

    GM.addStyle(`
        :root { --accent: #6366f1; --bg: #0f172a; --card: #1e2937; --text: #e2e8f0; }
        
        #floating-rocket { 
            position: fixed !important; bottom: 28px !important; right: 28px !important; width: 36px !important; height: 36px !important; border-radius: 10px !important;
            background: radial-gradient(circle at 40% 30%, #4a5568 0%, #1a202c 50%, #0f172a 100%) !important;
            box-shadow: 
                0 0 0 3px #111827,
                0 0 0 7px #1f2937,
                0 0 14px 5px rgba(251,191,36,0.95),
                0 0 28px 10px rgba(251,146,60,0.65),
                inset 0 5px 9px rgba(255,255,255,0.3),
                inset 0 -9px 13px rgba(0,0,0,0.65) !important;
            border: 2.5px solid #111827 !important; z-index: 2147483647 !important; cursor: grab !important; user-select: none !important; touch-action: none !important;
            transition: transform .18s cubic-bezier(0.4,0,0.2,1), box-shadow .18s !important;
            display: flex !important; align-items: center !important; justify-content: center !important; overflow: hidden !important;
        }
        #floating-rocket:hover { transform:scale(1.08) !important; }
        #floating-rocket:active { transform:scale(0.92) !important; }

        #floating-menu, #storage-editor {
            position:fixed !important; background:rgba(15,23,42,0.96) !important; border:1px solid #334155 !important; border-radius:18px !important;
            box-shadow:0 20px 50px rgba(0,0,0,0.55) !important; padding:18px !important; z-index:2147483646 !important; display:none; flex-direction:column !important; gap:14px !important;
            min-width:320px !important; max-width:92vw !important; max-height:80vh !important; overflow-y:auto !important; backdrop-filter:blur(18px) !important; color:#e2e8f0 !important; font-family:system-ui,-apple-system,sans-serif !important;
        }
        .menu-btn { padding:14px 18px; background:#1e2937; border:1px solid #475569; border-radius:12px; font-size:14.5px; text-align:left; cursor:pointer; transition:all .15s; color:#e2e8f0; display:flex; align-items:center; gap:11px; }
        .menu-btn:hover { background:#334155; transform:translateX(3px); border-color:#6366f1; }
        .menu-close, .editor-close { position:absolute; top:14px; right:16px; font-size:24px; cursor:pointer; color:#94a3b8; }
        .menu-close:hover, .editor-close:hover { color:#f87171; }

        .editor-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
        .editor-title { font-size:18px; font-weight:600; color:#f1f5f9; }
        .tab-bar { display:flex; background:#1e2937; border-radius:10px; padding:3px; gap:3px; }
        .tab { flex:1; padding:9px 14px; border-radius:8px; font-size:13px; font-weight:500; cursor:pointer; transition:all .15s; text-align:center; }
        .tab.active { background:#6366f1; color:white; box-shadow:0 3px 10px rgba(99,102,241,0.35); }
        .tab:not(.active) { color:#94a3b8; }
        .tab:not(.active):hover { background:#334155; }

        .storage-table { width:100%; border-collapse:collapse; font-size:12.5px; }
        .storage-table th { text-align:left; padding:8px 10px; color:#64748b; font-weight:500; border-bottom:1px solid #334155; }
        .storage-row { border-bottom:1px solid #334155; }
        .storage-row:hover { background:#1e2937; }
        .storage-row td { padding:10px 8px; vertical-align:middle; }
        .key-cell { font-family:monospace; color:#bae6fd; max-width:130px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .value-cell { font-family:monospace; color:#e0f2fe; max-width:200px; word-break:break-all; }
        .action-btn { padding:5px 8px; font-size:11px; border-radius:6px; border:none; cursor:pointer; margin-left:3px; }
        .action-btn.copy { background:#0ea5e9; color:white; }
        .action-btn.edit { background:#6366f1; color:white; }
        .action-btn.delete { background:#f87171; color:white; }

        .add-form { display:flex; gap:7px; margin-top:14px; padding-top:14px; border-top:1px solid #334155; }
        .add-form input { flex:1; background:#1e2937; border:1px solid #475569; border-radius:9px; padding:8px 11px; color:#e2e8f0; font-size:12.5px; }
        .add-btn { background:#22c55e; color:white; border:none; border-radius:9px; padding:0 16px; font-weight:600; cursor:pointer; }

        .dark-mode { filter: invert(0.92) hue-rotate(180deg) !important; }
    `);

    function init() {
        if (!document.body) return setTimeout(init, 40);

        try {
            const rocket = document.createElement('div');
            rocket.id = 'floating-rocket';
            rocket.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 100 100" style="filter: drop-shadow(0 0 3px #fbbf24) drop-shadow(0 0 8px #f59e0b);">
  <circle cx="50" cy="50" r="44" fill="#111827" stroke="#334155" stroke-width="5"/>
  <circle cx="50" cy="50" r="38" fill="none" stroke="#1e2937" stroke-width="3"/>
  <path d="M26 46 Q50 68 74 46" fill="none" stroke="#f1f5f9" stroke-width="5.5" stroke-linecap="round"/>
  <path d="M12 68 Q28 80 42 68 Q58 82 72 68 Q85 80 92 70" fill="none" stroke="#fbbf24" stroke-width="8" stroke-linecap="round"/>
  <path d="M10 76 Q25 88 40 76 Q55 90 70 76 Q82 88 92 80" fill="none" stroke="#f59e0b" stroke-width="6" stroke-linecap="round" opacity="0.85"/>
  <path d="M14 83 Q27 92 41 83 Q54 94 67 83" fill="none" stroke="#d97706" stroke-width="4.5" stroke-linecap="round" opacity="0.75"/>
  <circle cx="38" cy="32" r="2.5" fill="#bae6fd" opacity="0.7"/>
</svg>`;

            const menu = document.createElement('div');
            menu.id = 'floating-menu';
            const editor = document.createElement('div');
            editor.id = 'storage-editor';

            menu.innerHTML = `
                <span class="menu-close">✕</span>
                <div style="margin-bottom:6px; text-align:center; font-size:12px; color:#64748b; font-weight:600; letter-spacing:.5px;">MENU</div>
                <button class="menu-btn" id="btn-dark">🌙 Toggle Dark Mode</button>
                <button class="menu-btn" id="btn-top">⬆️ Scroll to Top</button>
                <button class="menu-btn" id="btn-refresh">🔄 Refresh Page</button>
                <button class="menu-btn" id="btn-copy">🔗 Copy Page URL</button>
                <button class="menu-btn" id="btn-fun">🎨 Random Background</button>
                <button class="menu-btn" id="btn-hide">🙈 Hide Images</button>
                <button class="menu-btn" id="btn-source">📄 View Page Source</button>
                <button class="menu-btn" id="btn-editor" style="background:#6366f1;color:white;border:none;margin-top:6px;">🍪 Edit Cookies & Storage</button>
            `;

            editor.innerHTML = `
                <span class="editor-close">✕</span>
                <div class="editor-header"><div class="editor-title">Storage Editor <span style="font-size:11px;color:#64748b">v3.4</span></div></div>
                <div class="tab-bar">
                    <div class="tab active" data-tab="cookies">🍪 Cookies <span class="count-badge" id="cookie-count">0</span></div>
                    <div class="tab" data-tab="local">📦 local <span class="count-badge" id="local-count">0</span></div>
                    <div class="tab" data-tab="session">⏳ session <span class="count-badge" id="session-count">0</span></div>
                </div>
                <div id="editor-content" style="flex:1;overflow:auto;margin-top:10px"></div>
                <div style="display:flex;gap:8px;margin-top:14px;padding-top:12px;border-top:1px solid #334155">
                    <button id="export-all" style="flex:1;padding:11px;background:#0ea5e9;color:white;border:none;border-radius:10px;font-weight:600;cursor:pointer">Export</button>
                    <button id="import-all" style="flex:1;padding:11px;background:#6366f1;color:white;border:none;border-radius:10px;font-weight:600;cursor:pointer">Import</button>
                </div>
            `;

            document.documentElement.appendChild(rocket);
            document.documentElement.appendChild(menu);
            document.documentElement.appendChild(editor);

            let menuOpen = false;
            let menuOffsetX = -340;
            let menuOffsetY = -150;
            let isDragging = false;

            function makeDraggable(el) {
                let startX, startY, initialLeft, initialTop;

                const start = (e) => {
                    if (e.target.closest('button, input, .menu-close, .editor-close')) return;

                    // CRITICAL FIX: Force proper positioning at drag start
                    const rect = el.getBoundingClientRect();
                    el.style.left = `${rect.left}px`;
                    el.style.top = `${rect.top}px`;
                    el.style.right = 'auto';
                    el.style.bottom = 'auto';

                    initialLeft = rect.left;
                    initialTop = rect.top;

                    startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
                    startY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
                    isDragging = false;

                    const drag = (ev) => {
                        ev.preventDefault();
                        ev.stopImmediatePropagation();

                        const cx = ev.type.includes('mouse') ? ev.clientX : ev.touches[0].clientX;
                        const cy = ev.type.includes('mouse') ? ev.clientY : ev.touches[0].clientY;

                        const dx = cx - startX;
                        const dy = cy - startY;

                        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) isDragging = true;

                        el.style.left = (initialLeft + dx) + 'px';
                        el.style.top = (initialTop + dy) + 'px';

                        // Keep menu following rocket when dragging icon
                        if (menuOpen && el.id === 'floating-rocket') {
                            const r = rocket.getBoundingClientRect();
                            menu.style.left = (r.left + menuOffsetX) + 'px';
                            menu.style.top = (r.top + menuOffsetY) + 'px';
                            menu.style.right = 'auto';
                            menu.style.bottom = 'auto';
                        }
                    };

                    const stop = () => {
                        document.removeEventListener('mousemove', drag);
                        document.removeEventListener('touchmove', drag);
                        document.removeEventListener('mouseup', stop);
                        document.removeEventListener('touchend', stop);

                        if (!isDragging && el.id === 'floating-rocket') {
                            toggleMenu();
                        }

                        if (el.id === 'floating-menu' && menuOpen) {
                            const rRect = rocket.getBoundingClientRect();
                            const mRect = menu.getBoundingClientRect();
                            menuOffsetX = mRect.left - rRect.left;
                            menuOffsetY = mRect.top - rRect.top;
                        }
                    };

                    document.addEventListener('mousemove', drag, { passive: false });
                    document.addEventListener('touchmove', drag, { passive: false });
                    document.addEventListener('mouseup', stop);
                    document.addEventListener('touchend', stop);
                };

                el.addEventListener('mousedown', start, { passive: false });
                el.addEventListener('touchstart', start, { passive: false });
            }

            makeDraggable(rocket);
            makeDraggable(menu);
            makeDraggable(editor);

            // Click handler (only toggle if not dragging)
            rocket.addEventListener('click', (e) => { 
                if (!isDragging) toggleMenu(); 
            });

            function toggleMenu() {
                if (menu.style.display === 'flex' || menu.style.display === '') {
                    menu.style.display = 'none';
                    menuOpen = false;
                } else {
                    const r = rocket.getBoundingClientRect();
                    menu.style.left = (r.left - 340) + 'px';
                    menu.style.top = Math.max(10, r.top - 150) + 'px';
                    menu.style.right = 'auto';
                    menu.style.bottom = 'auto';
                    menu.style.display = 'flex';
                    editor.style.display = 'none';
                    menuOpen = true;
                    const mRect = menu.getBoundingClientRect();
                    const rRect = rocket.getBoundingClientRect();
                    menuOffsetX = mRect.left - rRect.left;
                    menuOffsetY = mRect.top - rRect.top;
                }
            }

            // ========== IMPROVED BUTTON HANDLERS ==========
            document.getElementById('btn-dark').onclick = () => {
                const isDark = document.documentElement.classList.toggle('dark-mode');
                if (isDark) {
                    document.documentElement.style.filter = 'invert(0.92) hue-rotate(180deg)';
                    document.documentElement.style.transition = 'filter 0.3s ease';
                } else {
                    document.documentElement.style.filter = '';
                }
            };

            document.getElementById('btn-top').onclick = () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            };

            document.getElementById('btn-refresh').onclick = () => {
                location.reload();
            };

            document.getElementById('btn-copy').onclick = async () => {
                const btn = document.getElementById('btn-copy');
                const original = btn.innerHTML;
                try {
                    await navigator.clipboard.writeText(window.location.href);
                    btn.innerHTML = '✅ Copied!';
                    setTimeout(() => { btn.innerHTML = original; }, 1400);
                } catch (e) {
                    prompt('Copy this URL:', window.location.href);
                }
            };

            document.getElementById('btn-fun').onclick = () => {
                const colors = ['#0f172a', '#1e2937', '#334155', '#1a2332', '#111827', '#0c1321', '#16213e'];
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                // More aggressive background change
                document.documentElement.style.background = randomColor;
                document.body.style.background = randomColor;
                document.body.style.backgroundColor = randomColor;
                document.body.style.transition = 'background 0.6s ease';
            };

            document.getElementById('btn-hide').onclick = () => {
                const elements = document.querySelectorAll('img, video, iframe, picture, svg');
                elements.forEach(el => {
                    if (el.style.display === 'none') {
                        el.style.display = '';
                        el.style.visibility = '';
                    } else {
                        el.style.display = 'none';
                    }
                });
            };

            // Improved View Source
            document.getElementById('btn-source').onclick = () => {
                const sourceUrl = 'view-source:' + window.location.href;
                const win = window.open(sourceUrl, '_blank');
                if (!win) {
                    // Fallback
                    window.location.href = sourceUrl;
                }
            };

            document.getElementById('btn-editor').onclick = () => {
                showEditor();
            };

            // Close button
            document.querySelector('.menu-close').onclick = () => {
                menu.style.display = 'none';
                menuOpen = false;
            };

            // Storage editor (unchanged for now)
            let currentTab = 'cookies';
            function showEditor() {
                menu.style.display = 'none';
                menuOpen = false;
                editor.style.display = 'flex';
                renderTabContent(document.getElementById('editor-content'));

                document.querySelectorAll('.tab').forEach(tab => {
                    tab.onclick = () => {
                        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                        tab.classList.add('active');
                        currentTab = tab.dataset.tab;
                        renderTabContent(document.getElementById('editor-content'));
                    };
                });

                document.getElementById('export-all').onclick = exportAll;
                document.getElementById('import-all').onclick = importAll;
            }

            function renderTabContent(container) {
                container.innerHTML = `<div style="padding:20px; text-align:center; color:#64748b;">Storage editor ready.<br> (Full CRUD coming in v3.5)</div>`;
            }

            function exportAll() {
                const data = { cookies: document.cookie, local: JSON.stringify(localStorage), session: JSON.stringify(sessionStorage) };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'storage-export.json';
                a.click();
            }

            function importAll() {
                const input = document.createElement('input');
                input.type = 'file';
                input.onchange = e => {
                    const reader = new FileReader();
                    reader.onload = ev => {
                        try {
                            const data = JSON.parse(ev.target.result);
                            if (data.local) Object.assign(localStorage, JSON.parse(data.local));
                            if (data.session) Object.assign(sessionStorage, JSON.parse(data.session));
                            alert('✅ Storage imported! Refresh to see changes.');
                        } catch (err) { alert('Import failed: ' + err.message); }
                    };
                    reader.readAsText(e.target.files[0]);
                };
                input.click();
            }

            console.log('%c🚀 Floating Cool Menu v3.4 — Drag fully fixed + View Source & Random BG improved ✅', 'color:#22c55e; font-size:12px');
        } catch(e) {
            console.error('%c🚀 Floating Menu ERROR:', 'color:#ef4444', e);
        }
    }

    init();
})();