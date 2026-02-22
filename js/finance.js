/* ════════════════════════════════════════
   FINANCE.JS
════════════════════════════════════════ */

function renderFinance() {
  const fin = calcFinance();
  const p   = fin.profit;

  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  const profEl = document.getElementById('fin-profit');
  if (profEl) {
    profEl.textContent = (p >= 0 ? '+' : '') + Math.abs(p).toFixed(2) + '₾';
    profEl.style.color = p >= 0 ? '#fff' : '#FFD6D3';
  }

  set('fin-desc', `შემ. ${fin.revenue.toFixed(2)}₾ · ხ. ${fin.totalCost.toFixed(2)}₾`);
  set('fin-roi',  (fin.roi >= 0 ? '+' : '') + fin.roi.toFixed(0) + '%');
  set('fin-inv',  fin.inventoryValue.toFixed(2) + '₾');
  set('fc-cost',  fin.totalCost.toFixed(2) + '₾');
  set('fc-rev',   fin.revenue.toFixed(2) + '₾');
  set('fc-sales', window.DB.sales.length);
  set('fc-plants', window.DB.plants.filter(p => p.status !== 'sold').length);

  // Species breakdown
  const spMap = {};
  window.DB.plants.forEach(p => {
    if (!spMap[p.name]) spMap[p.name] = { cost: 0, sale: 0 };
    spMap[p.name].cost += p.totalCost || 0;
    spMap[p.name].sale += p.totalSale || 0;
  });

  const spArr = Object.entries(spMap)
    .map(([name, v]) => ({ name, profit: v.sale - v.cost }))
    .sort((a, b) => b.profit - a.profit);

  const maxAbs = Math.max(...spArr.map(x => Math.abs(x.profit)), 1);

  const spEl = document.getElementById('fin-species');
  if (spEl) {
    spEl.innerHTML = spArr.slice(0, 8).map(x => `
      <div class="list-item" style="flex-direction:column;align-items:stretch;gap:8px;cursor:default">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-weight:700;font-size:14px">${x.name}</span>
          <span style="font-weight:700;font-size:15px;color:${x.profit >= 0 ? 'var(--forest)' : 'var(--red)'}">
            ${x.profit >= 0 ? '+' : ''}${x.profit.toFixed(2)}₾
          </span>
        </div>
        <div style="height:5px;background:var(--cream-2);border-radius:3px;overflow:hidden">
          <div style="
            height:100%;
            width:${(Math.abs(x.profit)/maxAbs*100).toFixed(1)}%;
            background:${x.profit >= 0 ? 'var(--forest)' : 'var(--red)'};
            border-radius:3px;
            transition:width .6s ease
          "></div>
        </div>
      </div>`).join('')
      || '<div class="empty-state"><div class="empty-state-icon">📊</div><div class="empty-state-title">მონ. ა.</div></div>';
  }
}

function initFinance() {
  renderFinance();
  updateSidebarBadge();
}
