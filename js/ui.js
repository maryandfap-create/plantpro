/* ════════════════════════════════════════
   UI.JS — Toast · Sheet · Overlay · Form Controls
   PlantPro Business Edition
════════════════════════════════════════ */

/* ════════════════════════════════════════
   TOAST
════════════════════════════════════════ */
let _toastTimer = null;

function showToast(text, isError = false) {
  const el   = document.getElementById('toast');
  const bar  = document.getElementById('toast-bar');
  const txt  = document.getElementById('toast-text');
  if (!el) return;

  txt.textContent = text;
  bar.className   = 'toast-bar' + (isError ? ' error' : '');
  el.classList.add('active');

  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('active'), 2800);
}

/* ════════════════════════════════════════
   OVERLAY + SHEET
════════════════════════════════════════ */
let _activeSheet = null;

function openSheet(sheetId) {
  closeSheet(); // close any open sheet first

  const sheet   = document.getElementById(sheetId);
  const overlay = document.getElementById('overlay');
  if (!sheet || !overlay) return;

  overlay.classList.add('active');
  setTimeout(() => sheet.classList.add('active'), 10);
  _activeSheet = sheetId;

  // Auto-focus first visible input
  setTimeout(() => {
    const first = sheet.querySelector('input:not([type=hidden]):not([style*="display:none"]), select');
    if (first) first.focus();
  }, 360);
}

function closeSheet() {
  if (_activeSheet) {
    const sheet = document.getElementById(_activeSheet);
    if (sheet) sheet.classList.remove('active');
    _activeSheet = null;
  }
  const overlay = document.getElementById('overlay');
  if (overlay) overlay.classList.remove('active');
}

// Overlay click closes sheet
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('overlay');
  if (overlay) overlay.addEventListener('click', closeSheet);
});

/* ════════════════════════════════════════
   DETAIL PANEL
════════════════════════════════════════ */
function openDetail() {
  document.getElementById('detail-panel')?.classList.add('active');
}

function closeDetail() {
  document.getElementById('detail-panel')?.classList.remove('active');
}

/* ════════════════════════════════════════
   TYPE BUTTON GROUPS
════════════════════════════════════════ */
function initTypeGrid(gridEl, onChange) {
  if (!gridEl) return;
  gridEl.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      gridEl.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (onChange) onChange(btn.dataset.value);
    });
  });
}

function getTypeGridValue(gridEl) {
  if (!gridEl) return null;
  return gridEl.querySelector('.type-btn.active')?.dataset.value || null;
}

function setTypeGridValue(gridEl, value) {
  if (!gridEl) return;
  gridEl.querySelectorAll('.type-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.value === value);
  });
}

/* ════════════════════════════════════════
   LOCATION GRID
════════════════════════════════════════ */
function initLocGrid(gridEl, onChange) {
  if (!gridEl) return;
  gridEl.querySelectorAll('.loc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      gridEl.querySelectorAll('.loc-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (onChange) onChange(btn.dataset.value);
    });
  });
}

function getLocGridValue(gridEl) {
  if (!gridEl) return 'greenhouse';
  return gridEl.querySelector('.loc-btn.active')?.dataset.value || 'greenhouse';
}

function setLocGridValue(gridEl, value) {
  if (!gridEl) return;
  gridEl.querySelectorAll('.loc-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.value === value);
  });
}

/* ════════════════════════════════════════
   POT SIZE TABS
════════════════════════════════════════ */
function initPotTabs(tabsEl) {
  if (!tabsEl) return;
  tabsEl.querySelectorAll('.pot-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      tabsEl.querySelectorAll('.pot-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const unit = tab.dataset.unit;
      ['cm', 'L', 'wh'].forEach(u => {
        const el = document.getElementById('pot-' + u);
        if (el) el.style.display = u === unit ? 'block' : 'none';
      });
    });
  });
}

function getPotValue() {
  const activeTab = document.querySelector('#pot-tabs .pot-tab.active');
  const unit = activeTab?.dataset.unit || 'cm';

  if (unit === 'cm') {
    const v = parseFloat(document.getElementById('p-pot-cm')?.value) || 0;
    return { unit, val: v, val2: null, disp: v ? v + 'სმ' : '' };
  }
  if (unit === 'L') {
    const v = parseFloat(document.getElementById('p-pot-L')?.value) || 0;
    return { unit, val: v, val2: null, disp: v ? v + 'ლ' : '' };
  }
  // wh
  const w = parseFloat(document.getElementById('p-pot-w')?.value) || 0;
  const h = parseFloat(document.getElementById('p-pot-h')?.value) || 0;
  return { unit, val: w, val2: h, disp: (w && h) ? `${w}×${h}სმ` : '' };
}

function setPotValue(pot) {
  if (!pot) return;
  const tabs = document.getElementById('pot-tabs');
  if (tabs) {
    tabs.querySelectorAll('.pot-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.unit === pot.unit);
    });
    ['cm', 'L', 'wh'].forEach(u => {
      const el = document.getElementById('pot-' + u);
      if (el) el.style.display = u === pot.unit ? 'block' : 'none';
    });
  }

  if (pot.unit === 'cm') {
    const el = document.getElementById('p-pot-cm');
    if (el) el.value = pot.val || '';
  } else if (pot.unit === 'L') {
    const el = document.getElementById('p-pot-L');
    if (el) el.value = pot.val || '';
  } else {
    const w = document.getElementById('p-pot-w');
    const h = document.getElementById('p-pot-h');
    if (w) w.value = pot.val || '';
    if (h) h.value = pot.val2 || '';
  }
}

/* ════════════════════════════════════════
   OPTIONAL TOGGLE
════════════════════════════════════════ */
function initOptToggle(toggleId, bodyId, arrowId) {
  const toggle = document.getElementById(toggleId);
  const body   = document.getElementById(bodyId);
  const arrow  = document.getElementById(arrowId);
  if (!toggle || !body) return;

  toggle.addEventListener('click', () => {
    const isOpen = body.classList.toggle('open');
    if (arrow) arrow.classList.toggle('open', isOpen);
  });
}

function openOptToggle(bodyId, arrowId) {
  document.getElementById(bodyId)?.classList.add('open');
  document.getElementById(arrowId)?.classList.add('open');
}

/* ════════════════════════════════════════
   SEGMENTED CONTROL
════════════════════════════════════════ */
function initSegGroup(containerEl, onChange) {
  if (!containerEl) return;
  containerEl.querySelectorAll('.seg').forEach(btn => {
    btn.addEventListener('click', () => {
      containerEl.querySelectorAll('.seg').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (onChange) onChange(btn.dataset.filter);
    });
  });
}

/* ════════════════════════════════════════
   TAG BUILDER
════════════════════════════════════════ */
function buildTag(text, cls) {
  return `<span class="tag ${cls}">${text}</span>`;
}

function buildBadge(text, cls) {
  return `<span class="badge ${cls}">${text}</span>`;
}

/* ════════════════════════════════════════
   SIDEBAR: OVERDUE BADGE
════════════════════════════════════════ */
function updateSidebarBadge() {
  const badge = document.getElementById('sb-badge');
  if (!badge) return;
  const n = countOverdue();
  badge.style.display = n > 0 ? 'inline' : 'none';
  badge.textContent   = n;
}

/* ════════════════════════════════════════
   STAT STRIP (index.html only)
════════════════════════════════════════ */
function updateStatStrip() {
  const plants = window.DB.plants;
  const fin    = calcFinance();

  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  set('ss-total',   plants.length);
  set('ss-growing', plants.filter(p => p.status === 'growing').length);
  set('ss-ready',   plants.filter(p => p.status === 'ready').length);

  const profitEl = document.getElementById('ss-profit');
  if (profitEl) {
    const p = fin.profit;
    profitEl.textContent = (p >= 0 ? '+' : '') + Math.abs(p).toFixed(0) + '₾';
    profitEl.className   = 'stat-n ' + (p >= 0 ? 'green' : 'red');
  }
}

/* ════════════════════════════════════════
   SCALE SELECT (sidebar)
════════════════════════════════════════ */
function initScaleSelect() {
  const sel = document.getElementById('sb-scale');
  if (!sel) return;
  const saved = localStorage.getItem(SCALE_KEY) || 'large';
  sel.value = saved;
  sel.addEventListener('change', () => {
    localStorage.setItem(SCALE_KEY, sel.value);
  });
}

/* ════════════════════════════════════════
   EXPORT / IMPORT BUTTONS (index.html)
════════════════════════════════════════ */
function initExportImport() {
  document.getElementById('btn-export')?.addEventListener('click', () => {
    dbExport();
    showToast('⬇️ ექსპ. წარმ.');
  });

  const importInput   = document.getElementById('btn-import');
  const importTrigger = document.getElementById('btn-import-trigger');

  importTrigger?.addEventListener('click', () => importInput?.click());

  importInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    dbImport(file, () => {
      showToast('✅ იმპ. OK');
      setTimeout(() => location.reload(), 600);
    });
    e.target.value = '';
  });
}
