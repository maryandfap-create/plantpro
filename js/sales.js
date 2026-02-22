/* ════════════════════════════════════════
   SALES.JS
════════════════════════════════════════ */

function renderSales() {
  const list = [...window.DB.sales]
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const total = list.reduce((s, x) => s + (x.totalPrice || 0), 0);
  const sub   = document.getElementById('sales-sub');
  if (sub) sub.textContent = `${list.length} გ. · ${total.toFixed(2)}₾`;

  const el = document.getElementById('sales-list');
  if (!el) return;

  if (!list.length) {
    el.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📦</div>
        <div class="empty-state-title">გაყიდვა ა.</div>
        <div class="empty-state-sub">პირველი გაყიდვა ჩაწერე</div>
      </div>`;
    return;
  }

  el.innerHTML = list.map(saleRowHTML).join('');

  el.querySelectorAll('.sale-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteSale(btn.dataset.id);
      renderSales();
    });
  });
}

function saleRowHTML(s) {
  const plant = getPlant(s.plantId);
  const plat  = SALE_PLATFORMS[s.platform] || { icon: '📦', label: 'სხვა' };

  return `
    <div class="list-item">
      <div class="list-item-icon" style="background:var(--sage-bg)">${plat.icon}</div>
      <div class="list-item-body">
        <div class="list-item-title">${plant ? plant.name : '—'}${s.qty > 1 ? ' ×' + s.qty : ''}</div>
        <div class="list-item-sub">
          <span>📅 ${fmtDate(s.date)}</span>
          <span>${plat.label}</span>
          ${s.buyer ? `<span>👤 ${s.buyer}</span>` : ''}
        </div>
      </div>
      <div class="list-item-right">
        <div style="font-size:17px;font-weight:700;color:var(--forest)">
          ${s.totalPrice ? fmtMoney(s.totalPrice) : '—'}
        </div>
        <button class="btn-delete sale-delete" data-id="${s.id}">🗑️</button>
      </div>
    </div>`;
}

function bindSaveSale() {
  // Live total
  const calcTotal = () => {
    const qty   = parseInt(document.getElementById('sa-qty')?.value) || 1;
    const price = parseFloat(document.getElementById('sa-price')?.value) || 0;
    const el    = document.getElementById('sa-total');
    if (el) el.textContent = price ? fmtMoney(qty * price) : '—';
  };
  document.getElementById('sa-qty')?.addEventListener('input', calcTotal);
  document.getElementById('sa-price')?.addEventListener('input', calcTotal);

  document.getElementById('btn-save-sale')?.addEventListener('click', () => {
    const plantId = document.getElementById('sa-plant').value;
    if (!plantId) { showToast('❌ მცენ. სავ.', true); return; }

    const qty   = parseInt(document.getElementById('sa-qty').value) || 1;
    const price = parseFloat(document.getElementById('sa-price').value) || 0;

    const sale = {
      id:         document.getElementById('sa-id').value || uid(),
      plantId,
      qty,
      price,
      totalPrice: +(qty * price).toFixed(2),
      platform:   document.getElementById('sa-platform').value,
      date:       document.getElementById('sa-date').value,
      buyer:      document.getElementById('sa-buyer').value.trim(),
    };

    // Decrement plant stock
    const plant = getPlant(plantId);
    if (plant) {
      plant.qty = Math.max(0, plant.qty - qty);
      if (plant.qty === 0) plant.status = 'sold';
      savePlant(plant);
    }

    saveSale(sale);
    closeSheet();
    resetSaleForm();
    renderSales();
    showToast('✅ გ. შენ.');
  });
}

function resetSaleForm() {
  ['sa-id','sa-price','sa-buyer'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  document.getElementById('sa-qty').value      = '1';
  document.getElementById('sa-date').value     = todayStr();
  document.getElementById('sa-plant').value    = '';
  document.getElementById('sa-platform').value = 'local';
  document.getElementById('sa-total').textContent = '—';
}

function initSales() {
  document.getElementById('btn-add-sale')?.addEventListener('click', () => {
    resetSaleForm();
    fillPlantSelect(document.getElementById('sa-plant'));
    openSheet('sheet-sale');
  });
  document.getElementById('fab-btn')?.addEventListener('click', () => {
    resetSaleForm();
    fillPlantSelect(document.getElementById('sa-plant'));
    openSheet('sheet-sale');
  });
  document.getElementById('sheet-sale-close')?.addEventListener('click', closeSheet);

  bindSaveSale();
  renderSales();
  updateSidebarBadge();
}
