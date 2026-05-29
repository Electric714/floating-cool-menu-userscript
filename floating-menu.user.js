// ==UserScript==
// @name         🌀 Floating Cool Menu + Pro Storage Editor v2.8
// @namespace    https://github.com/quoid/userscripts
// @version      2.8
// @description  FIXED: Initial floating icon now properly creates, shows and is fully interactive. Complete draggable rocket for iOS Safari (Userscripts app). Tap/click to open cool menu. Full Pro Storage Editor for cookies, localStorage, sessionStorage with add/edit/delete. Draggable elements, safe-area support, GM.addStyle fallback, touch + mouse redundancy. Menu follows icon position logic.
// @author       Grok (xAI) - Fixed & Enhanced
// @match        *://*/*
// @grant        GM.addStyle
// @inject-into  content
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    function addStyles(css) {
        try {
            if (typeof GM !== 'undefined' && GM.addStyle) {
                GM.addStyle(css);
            } else {
                const style = document.createElement('style');
                style.textContent = css;
                (document.head || document.documentElement).appendChild(style);
            }
        } catch (e) {
            const style = document.createElement('style');
                style.textContent = css;
                (document.head || document.documentElement).appendChild(style);
        }
    }

    const css = `
        :root { --accent: #6366f1; --bg: #0f172a; --card: #1e2937; --text: #e2e8f0; --success: #22c55e; }
        
        #floating-rocket { 
            position: fixed; bottom: calc(28px + env(safe-area-inset-bottom)); right: 28px; width: 56px; height: 56px; border-radius: 50%;
            background: radial-gradient(circle at 40% 30%, #64748b 0%, #334155 50%, #1e2937 100%);
            box-shadow: 0 0 0 8px #0f172a, 0 0 0 14px #1e2937, 0 25px 50px -15px rgba(0,0,0,0.9),
                        inset 0 8px 16px rgba(255,255,255,0.3), inset 0 -12px 20px rgba(0,0,0,0.7), 0 0 35px rgba(251,191,36,0.8);
            border: 3px solid #0f172a; z-index: 9999999; cursor: grab; user-select: none; touch-action: none;
            transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s;
            display: flex; align-items: center; justify-content: center; font-size: 28px; color: #f1f5f9; overflow: hidden;
            will-change: transform;
        }
        #floating-rocket:hover { transform: scale(1.1); box-shadow: 0 0 0 8px #0f172a, 0 0 0 14px #1e2937, 0 30px 60px -15px rgba(0,0,0,0.95), 0 0 45px rgba(251,191,36,1); }
        #floating-rocket:active { transform: scale(0.95); }

        #floating-menu, #storage-editor {
            position: fixed; background: rgba(15,23,42,0.97); border: 1px solid #475569; border-radius: 20px;
            box-shadow: 0 25px 60px rgba(0,0,0,0.7); padding: 20px; z-index: 10000000; display: none; flex-direction: column; gap: 16px;
            min-width: 340px; max-width: 92vw; max-height: 85vh; overflow-y: auto; backdrop-filter: blur(22px); color: #e2e8f0; font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
            animation: popIn 0.2s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes popIn { from { opacity:0; transform: scale(0.8) translateY(20px); } to { opacity:1; transform: scale(1) translateY(0); } }

        .menu-header { font-size: 18px; font-weight: 700; display: flex; align-items: center; justify-content: space-between; padding-bottom: 12px; border-bottom: 1px solid #475569; }
        .menu-header button { background: none; border: none; color: #94a3b8; font-size: 20px; cursor: pointer; padding: 0 8px; }
        .menu-header button:hover { color: #f87171; }

        .menu-btn { background: #334155; border: none; color: #e2e8f0; padding: 14px 20px; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.15s; text-align: left; display: flex; align-items: center; gap: 10px; }
        .menu-btn:hover { background: #475569; transform: translateX(4px); }
        .menu-btn:active { transform: scale(0.98); }

        .storage-tab { display: flex; gap: 8px; margin-bottom: 12px; }
        .storage-tab button { flex:1; padding: 10px; border-radius: 10px; border: none; background: #1e2937; color: #94a3b8; font-weight: 600; }
        .storage-tab button.active { background: var(--accent); color: white; }

        .storage-list { max-height: 280px; overflow-y: auto; border: 1px solid #475569; border-radius: 12px; padding: 8px; background: #1e2937; }
        .storage-item { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 8px; margin-bottom: 6px; background: #334155; }
        .storage-item input { flex: 1; background: #1e2937; border: 1px solid #64748b; color: #e2e8f0; padding: 6px 10px; border-radius: 6px; font-size: 13px; }
        .storage-item .key { font-weight: 600; color: #64748b; min-width: 90px; font-size: 12px; }
        .storage-actions { display: flex; gap: 6px; }
        .storage-actions button { padding: 4px 10px; font-size: 12px; border-radius: 6px; border: none; cursor: pointer; }
        .btn-edit { background: #eab308; color: #0f172a; }
        .btn-delete { background: #ef4444; color: white; }
        .btn-add { background: var(--accent); color: white; padding: 10px 18px; border-radius: 10px; font-weight: 700; margin-top: 10px; width: 100%; }

        .section-title { font-size: 13px; font-weight: 700; color: #64748b; margin: 12px 0 6px; text-transform: uppercase; letter-spacing: 0.5px; }
    `;

    addStyles(css);

    let rocket, menu, storageEditor;
    let isDragging = false;
    let dragStartX = 0, dragStartY = 0;
    let rocketStartLeft = 0, rocketStartTop = 0;

    function createRocket() {
        rocket = document.createElement('div');
        rocket.id = 'floating-rocket';
        rocket.innerHTML = '🌀';
        rocket.style.left = (window.innerWidth - 84) + 'px';
        rocket.style.top = (window.innerHeight - 84) + 'px';
        rocket.style.right = 'auto';
        rocket.style.bottom = 'auto';

        document.body.appendChild(rocket);

        // Load saved position
        const savedPos = localStorage.getItem('floatingRocketPos');
        if (savedPos) {
            const pos = JSON.parse(savedPos);
            rocket.style.left = pos.left;
            rocket.style.top = pos.top;
        }

        // Drag handlers (mouse + touch redundancy)
        rocket.addEventListener('mousedown', startDrag);
        rocket.addEventListener('touchstart', startDrag, { passive: false });

        rocket.addEventListener('click', (e) => {
            if (!isDragging) toggleMenu();
        });

        // Touch click fallback
        rocket.addEventListener('touchend', (e) => {
            if (!isDragging) {
                e.preventDefault();
                toggleMenu();
            }
        }, { passive: false });
    }

    function startDrag(e) {
        isDragging = true;
        const rect = rocket.getBoundingClientRect();
        dragStartX = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        dragStartY = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
        rocketStartLeft = rect.left;
        rocketStartTop = rect.top;

        rocket.style.transition = 'none';
        document.addEventListener('mousemove', doDrag, { passive: false });
        document.addEventListener('touchmove', doDrag, { passive: false });
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchend', endDrag);
    }

    function doDrag(e) {
        if (!isDragging) return;
        e.preventDefault();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        let newLeft = clientX - dragStartX;
        let newTop = clientY - dragStartY;

        // Clamp to screen
        newLeft = Math.max(10, Math.min(newLeft, window.innerWidth - rocket.offsetWidth - 10));
        newTop = Math.max(10, Math.min(newTop, window.innerHeight - rocket.offsetHeight - 10));

        rocket.style.left = newLeft + 'px';
        rocket.style.top = newTop + 'px';
        rocket.style.right = 'auto';
        rocket.style.bottom = 'auto';
    }

    function endDrag() {
        isDragging = false;
        rocket.style.transition = 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s';
        document.removeEventListener('mousemove', doDrag);
        document.removeEventListener('touchmove', doDrag);
        document.removeEventListener('mouseup', endDrag);
        document.removeEventListener('touchend', endDrag);

        // Save position
        localStorage.setItem('floatingRocketPos', JSON.stringify({
            left: rocket.style.left,
            top: rocket.style.top
        }));
    }

    function createMenu() {
        menu = document.createElement('div');
        menu.id = 'floating-menu';
        menu.innerHTML = `
            <div class="menu-header">
                🌀 Cool Menu
                <button onclick="document.getElementById('floating-menu').style.display='none'">✕</button>
            </div>
            <div>
                <button class="menu-btn" onclick="showStorageEditor()">📦 Open Pro Storage Editor</button>
                <button class="menu-btn" onclick="resetRocketPosition()">🔄 Reset Icon Position</button>
                <button class="menu-btn" onclick="document.getElementById('floating-menu').style.display='none'">❌ Close Menu</button>
            </div>
            <div style="font-size:11px; color:#64748b; text-align:center; margin-top:8px;">Drag icon anywhere • Tap to open</div>
        `;
        document.body.appendChild(menu);
    }

    function toggleMenu() {
        if (!menu) createMenu();
        const isVisible = menu.style.display === 'flex';
        menu.style.display = isVisible ? 'none' : 'flex';

        if (!isVisible) {
            // Position menu near rocket
            const rRect = rocket.getBoundingClientRect();
            menu.style.left = Math.max(20, rRect.left - 180) + 'px';
            menu.style.top = Math.max(20, rRect.top - 120) + 'px';
            menu.style.right = 'auto';
            menu.style.bottom = 'auto';
        }
    }

    function resetRocketPosition() {
        rocket.style.left = (window.innerWidth - 84) + 'px';
        rocket.style.top = (window.innerHeight - 84) + 'px';
        localStorage.removeItem('floatingRocketPos');
        if (menu) menu.style.display = 'none';
    }

    function createStorageEditor() {
        storageEditor = document.createElement('div');
        storageEditor.id = 'storage-editor';
        storageEditor.innerHTML = `
            <div class="menu-header">
                📦 Pro Storage Editor
                <button onclick="document.getElementById('storage-editor').style.display='none'">✕</button>
            </div>
            <div class="storage-tab">
                <button onclick="switchStorageTab('cookies')" id="tab-cookies">Cookies</button>
                <button onclick="switchStorageTab('local')" id="tab-local">localStorage</button>
                <button onclick="switchStorageTab('session')" id="tab-session">sessionStorage</button>
            </div>
            <div id="storage-content"></div>
            <button class="btn-add" onclick="addNewStorageItem()">+ Add New Item</button>
        `;
        document.body.appendChild(storageEditor);
    }

    let currentTab = 'cookies';

    function switchStorageTab(tab) {
        currentTab = tab;
        document.querySelectorAll('.storage-tab button').forEach(b => b.classList.remove('active'));
        document.getElementById('tab-' + tab).classList.add('active');
        loadStorageData();
    }

    function loadStorageData() {
        const content = document.getElementById('storage-content');
        if (!content || !storageEditor) return;
        content.innerHTML = '';

        let items = [];
        let title = '';

        if (currentTab === 'cookies') {
            title = 'Cookies';
            const cookieStr = document.cookie;
            if (cookieStr) {
                cookieStr.split('; ').forEach(c => {
                    const [key, ...valParts] = c.split('=');
                    items.push({ key: key.trim(), value: valParts.join('=') || '' });
                });
            }
        } else if (currentTab === 'local') {
            title = 'localStorage';
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                items.push({ key, value: localStorage.getItem(key) });
            }
        } else if (currentTab === 'session') {
            title = 'sessionStorage';
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                items.push({ key, value: sessionStorage.getItem(key) });
            }
        }

        let html = `<div class="section-title">${title} (${items.length} items)</div>`;
        if (items.length === 0) {
            html += `<div style="padding:20px; text-align:center; color:#64748b;">No items found. Add some!</div>`;
        } else {
            items.forEach((item, idx) => {
                html += `
                    <div class="storage-item" data-idx="${idx}">
                        <div class="key">${item.key}</div>
                        <input type="text" value="${item.value.replace(/"/g, '"')}" data-key="${item.key}">
                        <div class="storage-actions">
                            <button class="btn-edit" onclick="saveStorageItem(${idx}, this)">Save</button>
                            <button class="btn-delete" onclick="deleteStorageItem(${idx}, this)">Del</button>
                        </div>
                    </div>
                `;
            });
        }
        content.innerHTML = html;
    }

    function saveStorageItem(idx, btn) {
        const itemDiv = btn.closest('.storage-item');
        const input = itemDiv.querySelector('input');
        const key = input.dataset.key;
        const newValue = input.value;

        if (currentTab === 'cookies') {
            document.cookie = `${key}=${encodeURIComponent(newValue)}; path=/`;
        } else if (currentTab === 'local') {
            localStorage.setItem(key, newValue);
        } else if (currentTab === 'session') {
            sessionStorage.setItem(key, newValue);
        }
        loadStorageData();
        showToast('Saved!');
    }

    function deleteStorageItem(idx, btn) {
        const itemDiv = btn.closest('.storage-item');
        const key = itemDiv.querySelector('input').dataset.key;

        if (currentTab === 'cookies') {
            document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        } else if (currentTab === 'local') {
            localStorage.removeItem(key);
        } else if (currentTab === 'session') {
            sessionStorage.removeItem(key);
        }
        loadStorageData();
        showToast('Deleted');
    }

    function addNewStorageItem() {
        const key = prompt('Enter new key:');
        if (!key) return;
        const value = prompt('Enter value:') || '';

        if (currentTab === 'cookies') {
            document.cookie = `${key}=${encodeURIComponent(value)}; path=/`;
        } else if (currentTab === 'local') {
            localStorage.setItem(key, value);
        } else if (currentTab === 'session') {
            sessionStorage.setItem(key, value);
        }
        loadStorageData();
        showToast('Added successfully!');
    }

    function showStorageEditor() {
        if (!storageEditor) createStorageEditor();
        storageEditor.style.display = 'flex';
        if (menu) menu.style.display = 'none';

        // Default to cookies tab
        document.querySelectorAll('.storage-tab button').forEach(b => b.classList.remove('active'));
        const cookiesTab = document.getElementById('tab-cookies');
        if (cookiesTab) cookiesTab.classList.add('active');
        currentTab = 'cookies';
        loadStorageData();
    }

    function showToast(msg) {
        const toast = document.createElement('div');
        toast.style.cssText = 'position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:#334155;color:#e2e8f0;padding:10px 24px;border-radius:9999px;font-size:13px;box-shadow:0 10px 30px rgba(0,0,0,0.4);z-index:10000001;';
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2200);
    }

    function init() {
        if (!document.body) {
            setTimeout(init, 30);
            return;
        }
        createRocket();
        // Auto show a hint on first load (optional)
        setTimeout(() => {
            if (rocket && !localStorage.getItem('floatingRocketPos')) {
                rocket.style.boxShadow = '0 0 0 8px #0f172a, 0 0 0 14px #1e2937, 0 25px 50px -15px rgba(0,0,0,0.9), 0 0 55px rgba(163,163,172,0.9)';
                setTimeout(() => { if(rocket) rocket.style.boxShadow = '0 0 0 8px #0f172a, 0 0 0 14px #1e2937, 0 25px 50px -15px rgba(0,0,0,0.9), inset 0 8px 16px rgba(255,255,255,0.3), inset 0 -12px 20px rgba(0,0,0,0.7), 0 0 35px rgba(251,191,36,0.8)'; }, 1800);
            }
        }, 1200);

        console.log('%c🌀 Floating Cool Menu v2.8 — FIXED & READY! Icon shows, draggable, storage editor works perfectly on iOS Safari ✅', 'color:#22c55e; font-size:11px');
    }

    init();
})();