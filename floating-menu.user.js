// ==UserScript==
// @name         🌀 Floating Cool Menu + Pro Storage Editor v2.4
// @namespace    https://github.com/quoid/userscripts
// @version      2.4
// @description  Fixed: menu no longer covers icon, menu now follows rocket when moved, Edit Cookies button fully working
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
            position: fixed; bottom: 28px; right: 28px; width: 46px; height: 46px; border-radius: 50%;
            background: radial-gradient(circle at 40% 30%, #4a5568 0%, #1a202c 50%, #0f172a 100%);
            box-shadow: 0 0 0 6px #111827, 0 0 0 10px #1f2937, 0 20px 40px -10px rgba(0,0,0,0.8),
                        inset 0 6px 12px rgba(255,255,255,0.25), inset 0 -10px 16px rgba(0,0,0,0.6), 0 0 28px rgba(251,191,36,0.65);
            border: 2.5px solid #111827; z-index: 999999; cursor: grab; user-select: none; touch-action: none;
            transition: transform .18s cubic-bezier(0.4,0,0.2,1), box-shadow .18s;
            display: flex; align-items: center; justify-content: center; font-size: 20px; color: #e2e8f0; overflow: hidden;
        }
        #floating-rocket::before { content:''; position:absolute; top:14%; left:20%; width:24%; height:24%; background:radial-gradient(circle,rgba(255,255,255,0.32)0%,transparent 70%); border-radius:50%; pointer-events:none; }
        #floating-rocket::after { content:''; position:absolute; bottom:-6%; left:50%; transform:translateX(-50%); width:65%; height:16%; background:linear-gradient(transparent,rgba(251,191,36,0.22)); border-radius:50%; pointer-events:none; }
        #floating-rocket:hover { transform:scale(1.06); box-shadow:0 0 0 6px #111827,0 0 0 10px #1f2937,0 25px 50px -12px rgba(0,0,0,0.9),inset 0 6px 12px rgba(255,255,255,0.3),inset 0 -10px 16px rgba(0,0,0,0.7),0 0 35px rgba(251,191,36,0.8); }
        #floating-rocket:active { transform:scale(0.92); }

        #floating-menu, #storage-editor {
            position:fixed; background:rgba(15,23,42,0.96); border:1px solid #334155; border-radius:18px;
            box-shadow:0 20px 50px rgba(0,0,0,0.55); padding:18px; z-index:1000000; display:none; flex-direction:column; gap:14px;
            min-width:320px; max-width:92vw; max-height:80vh; overflow-y:auto; backdrop-filter:blur(18px); color:#e2e8f0; font-family:system-ui,-apple-system,sans-serif;
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

    const rocket = document.createElement('div'); rocket.id = 'floating-rocket'; rocket.innerHTML = ' ';
    const menu = document.createElement('div'); menu.id = 'floating-menu';
    const editor = document.createElement('div'); editor.id = 'storage-editor';

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
        <div class="editor-header"><div class="editor-title">Storage Editor <span style="font-size:11px;color:#64748b">v2.4</span></div></div>
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

    // DRAG WITH MENU FOLLOWING
    let menuOpen = false;

    function makeDraggable(el) {
        let isDragging = false, startX, startY, initialLeft, initialTop;
        const start = (e) => {
            isDragging = false;
            startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            startY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
            initialLeft = parseFloat(el.style.left) || el.offsetLeft;
            initialTop = parseFloat(el.style.top) || el.offsetTop;
            
            const drag = (ev) => {
                ev.preventDefault();
                ev.stopImmediatePropagation();
                const cx = ev.type.includes('mouse') ? ev.clientX : ev.touches[0].clientX;
                const cy = ev.type.includes('mouse') ? ev.clientY : ev.touches[0].clientY;
                const dx = cx - startX, dy = cy - startY;
                if (Math.abs(dx) > 4 || Math.abs(dy) > 4) isDragging = true;
                el.style.left = (initialLeft + dx) + 'px';
                el.style.right = 'auto';
                el.style.top = (initialTop + dy) + 'px';
                el.style.bottom = 'auto';
                
                // If menu is open, make it follow the rocket
                if (menuOpen && el.id === 'floating-rocket') {
                    const r = rocket.getBoundingClientRect();
                    menu.style.left = (r.left - 8) + 'px';
                    menu.style.top = (r.top - 340) + 'px';
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

    function toggleMenu() {
        if (menu.style.display === 'flex') {
            menu.style.display = 'none';
            menuOpen = false;
        } else {
            const r = rocket.getBoundingClientRect();
            // Position menu ABOVE and slightly to the LEFT so it doesn't cover the icon
            menu.style.left = (r.left - 180) + 'px';
            menu.style.top = (r.top - 380) + 'px';
            menu.style.display = 'flex';
            editor.style.display = 'none';
            menuOpen = true;
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
        container.innerHTML = '';
        let html = '';
        let items = [];

        if (currentTab === 'cookies') {
            items = document.cookie ? document.cookie.split(';').map(c => { const [k,...v]=c.trim().split('='); return {key:k.trim(), value:decodeURIComponent(v.join('='))}; }) : [];
        } else if (currentTab === 'local') {
            for (let i=0; i<localStorage.length; i++) items.push({key:localStorage.key(i), value:localStorage.getItem(localStorage.key(i))});
        } else if (currentTab === 'session') {
            for (let i=0; i<sessionStorage.length; i++) items.push({key:sessionStorage.key(i), value:sessionStorage.getItem(sessionStorage.key(i))});
        }

        if (currentFilter) items = items.filter(i => i.key.toLowerCase().includes(currentFilter) || (i.value && i.value.toLowerCase().includes(currentFilter)));

        document.getElementById('cookie-count').textContent = document.cookie ? document.cookie.split(';').length : 0;
        document.getElementById('local-count').textContent = localStorage.length;
        document.getElementById('session-count').textContent = sessionStorage.length;

        html += `<input id="search-input" type="text" placeholder="Search..." value="${currentFilter}" style="width:100%;background:#1e2937;border:1px solid #475569;border-radius:10px;padding:9px 12px;color:#e2e8f0;font-size:13px;margin-bottom:10px">`;

        if (items.length === 0) {
            html += `<div style="text-align:center;padding:30px 10px;color:#64748b;font-size:13px">No items</div>`;
        } else {
            html += `<table class="storage-table"><thead><tr><th style="width:32%">Key</th><th style="width:48%">Value</th><th style="width:20%">Actions</th></tr></thead><tbody>`;
            items.forEach(item => {
                const short = item.value ? (item.value.length > 55 ? item.value.substring(0,55)+'...' : item.value) : '';
                html += `<tr class="storage-row" data-key="${item.key}" data-type="${currentTab}">
                    <td class="key-cell">${item.key}</td>
                    <td class="value-cell">${short}</td>
                    <td><button class="action-btn copy" onclick="copyItem(this)">Copy</button><button class="action-btn edit" onclick="editItem(this)">Edit</button><button class="action-btn delete" onclick="deleteItem(this)">Del</button></td>
                </tr>`;
            });
            html += `</tbody></table>`;
        }

        html += `<div class="add-form"><input id="new-key" placeholder="Key" style="flex:1.1"><input id="new-value" placeholder="Value" style="flex:1.8"><button class="add-btn" onclick="addNewItem()">Add</button></div>`;
        container.innerHTML = html;

        const search = document.getElementById('search-input');
        if (search) search.oninput = () => { currentFilter = search.value.toLowerCase(); renderTabContent(container); };
    }

    window.copyItem = btn => { const row=btn.closest('tr'); const key=row.dataset.key; const type=row.dataset.type; let val=''; if(type==='cookies')val=getCookieValue(key); else if(type==='local')val=localStorage.getItem(key); else val=sessionStorage.getItem(key); navigator.clipboard.writeText(val||'').then(()=>alert('✅ Copied')); };
    window.editItem = btn => { const row=btn.closest('tr'); const key=row.dataset.key; const type=row.dataset.type; let val=''; if(type==='cookies')val=getCookieValue(key); else if(type==='local')val=localStorage.getItem(key); else val=sessionStorage.getItem(key); const nv=prompt('Edit '+key, val); if(nv!==null){ if(type==='cookies')document.cookie=`${key}=${encodeURIComponent(nv)};path=/`; else if(type==='local')localStorage.setItem(key,nv); else sessionStorage.setItem(key,nv); renderTabContent(document.getElementById('editor-content')); } };
    window.deleteItem = btn => { if(!confirm('Delete?'))return; const row=btn.closest('tr'); const key=row.dataset.key; const type=row.dataset.type; if(type==='cookies')document.cookie=`${key}=;expires=Thu,01 Jan 1970;path=/`; else if(type==='local')localStorage.removeItem(key); else sessionStorage.removeItem(key); renderTabContent(document.getElementById('editor-content')); };
    window.addNewItem = () => { const k=document.getElementById('new-key').value.trim(); const v=document.getElementById('new-value').value; if(!k)return; if(currentTab==='cookies')document.cookie=`${k}=${encodeURIComponent(v)};path=/`; else if(currentTab==='local')localStorage.setItem(k,v); else sessionStorage.setItem(k,v); document.getElementById('new-key').value=''; document.getElementById('new-value').value=''; renderTabContent(document.getElementById('editor-content')); };

    function getCookieValue(n){ const m=document.cookie.match(new RegExp('(^| )'+n+'=([^;]+)')); return m?decodeURIComponent(m[2]):''; }
    function exportAll(){ const d={cookies:document.cookie?document.cookie.split(';').map(c=>{const[k,...v]=c.trim().split('=');return{key:k.trim(),value:decodeURIComponent(v.join('='))};}):[],localStorage:Object.fromEntries([...Array(localStorage.length)].map((_,i)=>{const k=localStorage.key(i);return[k,localStorage.getItem(k)]})),sessionStorage:Object.fromEntries([...Array(sessionStorage.length)].map((_,i)=>{const k=sessionStorage.key(i);return[k,sessionStorage.getItem(k)]}))}; const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([JSON.stringify(d,null,2)],{type:'application/json'})); a.download='backup.json'; a.click(); alert('✅ Exported'); }
    function importAll(){ const j=prompt('Paste JSON:'); if(!j)return; try{ const d=JSON.parse(j); if(d.cookies)d.cookies.forEach(c=>document.cookie=`${c.key}=${encodeURIComponent(c.value)};path=/`); if(d.localStorage)Object.keys(d.localStorage).forEach(k=>localStorage.setItem(k,d.localStorage[k])); if(d.sessionStorage)Object.keys(d.sessionStorage).forEach(k=>sessionStorage.setItem(k,d.sessionStorage[k])); alert('✅ Imported'); renderTabContent(document.getElementById('editor-content')); }catch(e){alert('❌ Bad JSON');} }

    // BUTTONS
    document.getElementById('btn-dark').addEventListener('click', () => { const d=document.documentElement.classList.toggle('dark-mode'); document.documentElement.style.filter = d ? 'invert(1) hue-rotate(180deg)' : ''; });
    document.getElementById('btn-top').addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));
    document.getElementById('btn-refresh').addEventListener('click', () => { location.reload(true); menu.style.display='none'; menuOpen=false; });
    document.getElementById('btn-copy').addEventListener('click', () => { navigator.clipboard.writeText(location.href).then(()=>alert('✅ Copied')).catch(()=>{const t=document.createElement('textarea');t.value=location.href;document.body.appendChild(t);t.select();document.execCommand('copy');document.body.removeChild(t);alert('✅ Copied');}); menu.style.display='none'; menuOpen=false; });
    document.getElementById('btn-fun').addEventListener('click', () => { const c=['#6366f1','#0ea5e9','#22c55e','#f59e0b','#ec4899','#8b5cf6'][Math.floor(Math.random()*6)]; document.documentElement.style.setProperty('background-color',c,'important'); document.body.style.setProperty('background-color',c,'important'); document.body.style.minHeight='100vh'; });
    document.getElementById('btn-hide').addEventListener('click', () => { document.querySelectorAll('img,picture,video,[style*="background-image"]').forEach(el=>el.style.display=el.style.display==='none'?'':'none'); });
    document.getElementById('btn-source').addEventListener('click', () => { window.open('view-source:' + location.href, '_blank'); menu.style.display='none'; menuOpen=false; });
    
    // EDIT COOKIES BUTTON - FIXED
    const editorBtn = document.getElementById('btn-editor');
    if (editorBtn) {
        editorBtn.addEventListener('click', () => {
            showEditor();
        });
    }

    menu.querySelector('.menu-close').addEventListener('click', () => { menu.style.display = 'none'; menuOpen = false; });
    editor.querySelector('.editor-close').addEventListener('click', () => { editor.style.display = 'none'; menu.style.display = 'flex'; menuOpen = true; });

    document.addEventListener('keydown', e => { if(e.key==='Escape'){ menu.style.display='none'; editor.style.display='none'; menuOpen=false; } });

    console.log('%c🌀 Floating Cool Menu v2.4 — Menu no longer covers icon + follows rocket + Editor button fixed! ✅', 'color:#22c55e;font-size:12px');
})();