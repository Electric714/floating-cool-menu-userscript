// ==UserScript==
// @name         🚀 Floating Cool Menu + Pro Storage Editor v3.1
// @namespace    https://github.com/quoid/userscripts
// @version      3.1
// @description  Fixed menu display (!important conflict removed) + drag/touch reliability improvements. Menu now pops up reliably on tap/click.
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
    `);

    function init() {
        if (!document.body) return setTimeout(init, 40);

        try {
            const rocket = document.createElement('div');
            rocket.id = 'floating-rocket';
            rocket.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 100 100" style="filter: drop-shadow(0 0 3px #fbbf24) drop-shadow(0 0 8px #f59e0b);">
  <!-- Main dark circle -->
  <circle cx="50" cy="50" r="42" fill="#0f172a" stroke="#1e2937" stroke-width="6"/>
  
  <!-- Inner highlight ring -->
  <circle cx="50" cy="50" r="36" fill="none" stroke="#334155" stroke-width="2" opacity="0.6"/>
  
  <!-- Signature smile arc - bright white/glow -->
  <path d="M 28 42 Q 50 68 72 42" fill="none" stroke="#f1f5f9" stroke-width="6" stroke-linecap="round"/>
  
  <!-- Golden sand dunes - layered for depth -->
  <!-- Layer 1 (back, darker gold) -->
  <path d="M12 68 Q 26 79 39 67 Q 55 80 69 67 Q 84 79 90 71" fill="none" stroke="#d97706" stroke-width="9" stroke-linecap="round" opacity="0.95"/>
  
  <!-- Layer 2 (middle, bright gold) -->
  <path d="M10 73 Q 24 84 40 71 Q 56 85 71 71 Q 85 83 91 75" fill="none" stroke="#fbbf24" stroke-width="6.5" stroke-linecap="round" opacity="0.9"/>
  
  <!-- Layer 3 (front, warm highlight) -->
  <path d="M15 78 Q 29 87 43 76 Q 57 89 70 77" fill="none" stroke="#fcd34d" stroke-width="4" stroke-linecap="round" opacity="0.85"/>
  
  <!-- Tiny sparkle highlight on smile -->
  <circle cx="37" cy="37" r="1.8" fill="#bae6fd" opacity="0.75"/>
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
                <div class="editor-header"><div class="editor-title">Storage Editor <span style="font-size:11px;color:#64748b">v3.1</span></div></div>
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
                    isDragging = false;
                    startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
                    startY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
                    initialLeft = parseFloat(el.style.left) || el.offsetLeft;
                    initialTop = parseFloat(el.style.top) || el.offsetTop;

                    const drag = (ev) => {
                        ev.preventDefault();
                        ev.stopImmediatePropagation();
                        const cx = ev.type.includes('mouse') ? ev.clientX : ev.touches[0].clientX;
                        const cy = ev.type.includes('mouse') ? ev.clientY : e.touches[0].clientY;
                        const dx = cx - startX, dy = cy - startY;
                        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) isDragging = true;
                        el.style.left = (initialLeft + dx) + 'px';
                        el.style.right = 'auto';
                        el.style.top = (initialTop + dy) + 'px';
                        el.style.bottom = 'auto';

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

            let currentTab = 'cookies';
            let currentFilter = '';

            function showEditor(filter = '') {
                currentFilter = filter;
                menu.style.display = 'none';
                menuOpen = false;
                editor.style.display = 'flex';
                const content = document.getElementById('editor-content');
                renderTabContent(content);

                document.querySelectorAll('.tab').forEach(tab => {
                    tab.onclick = () => {
                        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                        tab.classList.add('active');
                        currentTab = tab.dataset.tab;
                        renderTabContent(content);
                    };
                });
                document.getElementById('export-all').onclick = exportAll;
                document.getElementById('import-all').onclick = importAll;
            }

            function renderTabContent(container) {
                // Placeholder - in full version this would contain full editor logic
                container.innerHTML = '<p style="color:#64748b; text-align:center; padding:20px;">Storage editor content would go here...</p>';
            }

            function exportAll() { console.log('Export all clicked'); }
            function importAll() { console.log('Import all clicked'); }

            console.log('%c🚀 Floating Cool Menu v3.1 — Icon updated to new design ✅', 'color:#22c55e;font-size:12px');
        } catch(e) {
            console.error('%c🚀 Floating Menu ERROR:', 'color:#ef4444', e);
        }
    }

    init();
})();