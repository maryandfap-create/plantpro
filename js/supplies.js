/* ════════════════════════════════════════
   SUPPLIES.JS — Supplies CRUD · Render
   PlantPro Business Edition
════════════════════════════════════════ */

let supplyFilter = 'all';

function renderSupplies() {
  let list = [...window.DB.supplies];

  if (supplyFilter !== 'all') {
    list = list.filter(s => {
      const cat = SUPPLY_CATS[s.cat];
      return cat?.group === supplyFilter || s.cat === supplyFilter;
    });
  }

  list.sort((a, b) => (b.buyDate || '').localeCompare(a.buyDate || ''));

  const total = list.reduce((s, x) => s + (x.totalPrice || 0), 0);
  const sub = document.getElementById('supplies-sub');
  if (sub) sub.textContent = `${list.length} ჩანაწ. · ${total.toFixed(2)}₾`;

  const el = document.getElementById('supply-list');
  if (!el) return;

  if (!list.length) {
    el.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🛒</div>
        <div class="empty-state-title">მარაგი ცარიელია</div>
        <div class="empty-state-sub">დაამატე პირველი შესყიდვა</div>
      </div>`;
    return;
  }

  el.innerHTML = list.map(supplyRowHTML).join('');

  el.querySelectorAll('.supply-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteSupply(btn.dataset.id);
      renderSupplies();
      showToast('🗑️ წაიშ.');
    });
  });
}

function supplyRowHTML(s) {
  const cat = SUPPLY_CATS[s.cat] || { icon: '📦', label: 'სხვა' };
  const exp = s.expiry ? daysDiff(s.expiry) : null;

  let expStyle = '';
  if (exp != null) {
    if (exp < 0)      expStyle = 'color:var(--red)';
    else if (exp < 30) expStyle = 'color:var(--gold)';
  }

  return `
    <div class="list-item">
      <div class="list-item-icon" style="background:var(--sage-bg)">${cat.icon}</div>
      <div class="list-item-body">
        <div class="list-item-title">${s.name}</div>
        <div class="list-item-sub">
          <span>${s.qty} ${s.unit}</span>
          ${s.from    ? `<span>📍 ${s.from}</span>` : ''}
          ${s.buyDate ? `<span>📅 ${fmtDate(s.buyDate)}</span>` : ''}
          ${s.expiry  ? `<span style="${expStyle}">⏳ ${fmtDate(s.expiry)}</span>` : ''}
        </div>
        ${s.notes ? `<div class="list-item-note">${s.notes}</div>` : ''}
      </div>
      <div class="list-item-right">
        <div style="font-size:16px;font-weight:700;color:var(--forest)">
          ${s.totalPrice ? fmtMoney(s.totalPrice) : '—'}
        </div>
        <button class="btn-delete supply-delete" data-id="${s.id}">🗑️</button>
      </div>
    </div>`;
}

function bindSaveSupply() {
  // Live total
  const calcTotal = () => {
    const qty   = parseFloat(document.getElementById('s-qty')?.value) || 1;
    const price = parseFloat(document.getElementById('s-price')?.value) || 0;
    const el    = document.getElementById('s-total');
    if (el) el.textContent = price ? fmtMoney(qty * price) : '—';
  };
  document.getElementById('s-qty')?.addEventListener('input', calcTotal);
  document.getElementById('s-price')?.addEventListener('input', calcTotal);

  // Category → default unit
  document.getElementById('s-cat')?.addEventListener('change', (e) => {
    const defaultUnit = SUPPLY_DEFAULT_UNITS[e.target.value] || 'ც';
    const unitSel = document.getElementById('s-unit');
    if (unitSel) {
      for (let opt of unitSel.options) {
        if (opt.value === defaultUnit) { unitSel.value = defaultUnit; break; }
      }
    }
  });

  document.getElementById('btn-save-supply')?.addEventListener('click', () => {
    const name = document.getElementById('s-name').value.trim();
    if (!name) { showToast('❌ სახ. სავ.', true); return; }

    const qty   = parseFloat(document.getElementById('s-qty').value) || 1;
    const price = parseFloat(document.getElementById('s-price').value) || 0;
    const sourceGrid = document.getElementById('s-source-grid');

    const supply = {
      id:         document.getElementById('s-id').value || uid(),
      cat:        document.getElementById('s-cat').value,
      name,
      qty,
      unit:       document.getElementById('s-unit').value,
      price,
      totalPrice: +(qty * price).toFixed(2),
      source:     getTypeGridValue(sourceGrid) || 'self',
      from:       document.getElementById('s-from').value.trim(),
      buyDate:    document.getElementById('s-date').value,
      expiry:     document.getElementById('s-expiry').value,
      notes:      document.getElementById('s-notes').value.trim(),
    };

    saveSupply(supply);
    closeSheet();
    resetSupplyForm();
    renderSupplies();
    showToast('✅ ' + name + ' შენ.');
  });
}

function resetSupplyForm() {
  ['s-id','s-name','s-from','s-notes','s-price','s-expiry'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('s-qty').value  = '1';
  document.getElementById('s-date').value = todayStr();
  document.getElementById('s-total').textContent = '—';
  setTypeGridValue(document.getElementById('s-source-grid'), 'self');
}

function initSupplies() {
  document.getElementById('btn-add-supply')?.addEventListener('click', () => {
    resetSupplyForm();
    openSheet('sheet-supply');
  });
  document.getElementById('fab-btn')?.addEventListener('click', () => {
    resetSupplyForm();
    openSheet('sheet-supply');
  });
  document.getElementById('sheet-supply-close')?.addEventListener('click', closeSheet);

  initTypeGrid(document.getElementById('s-source-grid'));

  const segGroup = document.querySelector('.seg-group');
  initSegGroup(segGroup, (val) => {
    supplyFilter = val;
    renderSupplies();
  });

  bindSaveSupply();
  renderSupplies();
  updateSidebarBadge();
}
