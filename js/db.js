/* ════════════════════════════════════════
   DB.JS — Data Layer · localStorage
   PlantPro Business Edition
════════════════════════════════════════ */

const DB_KEY   = 'plantpro_v1';
const SCALE_KEY = 'plantpro_scale';

/* ── DEFAULT STRUCTURE ── */
const DEFAULT_DB = {
  plants:     [],
  tasks:      [],
  supplies:   [],
  treatments: [],
  sales:      [],
};

/* ── LOAD ── */
function dbLoad() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return structuredClone(DEFAULT_DB);
    const parsed = JSON.parse(raw);
    // Ensure all keys exist (forward compat)
    return { ...DEFAULT_DB, ...parsed };
  } catch (e) {
    console.warn('[PlantPro] dbLoad error:', e);
    return structuredClone(DEFAULT_DB);
  }
}

/* ── SAVE ── */
function dbSave() {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(window.DB));
  } catch (e) {
    console.warn('[PlantPro] dbSave error:', e);
  }
}

/* ── GENERATE ID ── */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* ── DATE HELPERS ── */
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('ka-GE', {
    day: 'numeric', month: 'short',
  });
}

function daysDiff(dateStr) {
  if (!dateStr) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((new Date(dateStr + 'T00:00:00') - now) / 86400000);
}

/* ── FORMAT MONEY ── */
function fmtMoney(n) {
  if (n == null || isNaN(n)) return '—';
  return n.toFixed(2) + '₾';
}

/* ── EXPORT ── */
function dbExport() {
  const blob = new Blob(
    [JSON.stringify(window.DB, null, 2)],
    { type: 'application/json' }
  );
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'plantpro_' + todayStr() + '.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

/* ── IMPORT ── */
function dbImport(file, onDone) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target.result);
      window.DB = { ...DEFAULT_DB, ...parsed };
      dbSave();
      if (onDone) onDone();
    } catch {
      alert('ფაილი არასწორია ❌');
    }
  };
  reader.readAsText(file);
}

/* ── PLANT HELPERS ── */
function getPlant(id) {
  return window.DB.plants.find(p => p.id === id) || null;
}

function savePlant(plant) {
  const idx = window.DB.plants.findIndex(p => p.id === plant.id);
  if (idx >= 0) {
    window.DB.plants[idx] = plant;
  } else {
    window.DB.plants.unshift(plant);
  }
  dbSave();
}

function deletePlant(id) {
  window.DB.plants = window.DB.plants.filter(p => p.id !== id);
  dbSave();
}

/* ── TASK HELPERS ── */
function saveTask(task) {
  const idx = window.DB.tasks.findIndex(t => t.id === task.id);
  if (idx >= 0) {
    window.DB.tasks[idx] = task;
  } else {
    window.DB.tasks.push(task);
  }
  dbSave();
}

function deleteTask(id) {
  window.DB.tasks = window.DB.tasks.filter(t => t.id !== id);
  dbSave();
}

function toggleTask(id) {
  const task = window.DB.tasks.find(t => t.id === id);
  if (task) {
    task.done = !task.done;
    dbSave();
  }
}

/* ── SUPPLY HELPERS ── */
function saveSupply(supply) {
  const idx = window.DB.supplies.findIndex(s => s.id === supply.id);
  if (idx >= 0) {
    window.DB.supplies[idx] = supply;
  } else {
    window.DB.supplies.unshift(supply);
  }
  dbSave();
}

function deleteSupply(id) {
  window.DB.supplies = window.DB.supplies.filter(s => s.id !== id);
  dbSave();
}

/* ── TREATMENT HELPERS ── */
function saveTreatment(treat) {
  const idx = window.DB.treatments.findIndex(t => t.id === treat.id);
  if (idx >= 0) {
    window.DB.treatments[idx] = treat;
  } else {
    window.DB.treatments.push(treat);
  }
  dbSave();
}

function deleteTreatment(id) {
  window.DB.treatments = window.DB.treatments.filter(t => t.id !== id);
  dbSave();
}

/* ── SALE HELPERS ── */
function saveSale(sale) {
  const idx = window.DB.sales.findIndex(s => s.id === sale.id);
  if (idx >= 0) {
    window.DB.sales[idx] = sale;
  } else {
    window.DB.sales.unshift(sale);
  }
  dbSave();
}

function deleteSale(id) {
  window.DB.sales = window.DB.sales.filter(s => s.id !== id);
  dbSave();
}

/* ── FINANCE CALCULATIONS ── */
function calcFinance() {
  const plantCost = window.DB.plants.reduce((s, p) => s + (p.totalCost || 0), 0);
  const supplyCost = window.DB.supplies.reduce((s, x) => s + (x.totalPrice || 0), 0);
  const totalCost = plantCost + supplyCost;

  const revenue = window.DB.sales.reduce((s, x) => s + (x.totalPrice || 0), 0);
  const profit = revenue - totalCost;
  const roi = totalCost > 0 ? ((profit / totalCost) * 100) : 0;

  const inventoryValue = window.DB.plants
    .filter(p => p.status !== 'sold')
    .reduce((s, p) => s + (p.totalSale || 0), 0);

  return { totalCost, revenue, profit, roi, inventoryValue };
}

/* ── OVERDUE TASK COUNT ── */
function countOverdue() {
  return window.DB.tasks.filter(t =>
    !t.done && t.dueDate && daysDiff(t.dueDate) < 0
  ).length;
}

/* ── FILL PLANT SELECTS ── */
function fillPlantSelect(selectEl, emptyLabel = '— შეარჩიე —') {
  if (!selectEl) return;
  const currentVal = selectEl.value;
  selectEl.innerHTML = `<option value="">${emptyLabel}</option>`;
  window.DB.plants.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.name + (p.species ? ` (${p.species})` : '');
    selectEl.appendChild(opt);
  });
  if (currentVal) selectEl.value = currentVal;
}

/* ── INIT ── */
window.DB = dbLoad();
