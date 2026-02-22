/* ════════════════════════════════════════
   PLANTS.JS — Plants CRUD · Grid · Autocomplete · Detail
   PlantPro Business Edition
════════════════════════════════════════ */

/* ── STATE ── */
let plantFilter = 'all';
let plantSearch = '';
let detailPlantId = null;

/* ════════════════════════════════════════
   RENDER GRID
════════════════════════════════════════ */
function renderPlants() {
  const grid = document.getElementById('plant-grid');
  if (!grid) return;

  let list = [...window.DB.plants];

  // Filter by status
  if (plantFilter !== 'all') {
    list = list.filter(p => p.status === plantFilter);
  }

  // Filter by search
  if (plantSearch.trim()) {
    const q = plantSearch.toLowerCase();
    list = list.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.species || '').toLowerCase().includes(q) ||
      (p.locTxt || '').toLowerCase().includes(q)
    );
  }

  // Update sub label
  const sub = document.getElementById('plants-sub');
  if (sub) sub.textContent = list.length + ' მცენარე';

  if (!list.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🪴</div>
        <div class="empty-state-title">მცენარე ვერ მოიძებნა</div>
        <div class="empty-state-sub">სცადე სხვა ფილტრი ან დაამატე ახალი</div>
      </div>`;
    return;
  }

  grid.innerHTML = list.map((p, i) => plantCardHTML(p, i)).join('');

  // Attach click handlers
  grid.querySelectorAll('.plant-card').forEach(card => {
    card.addEventListener('click', () => {
      openDetailPanel(card.dataset.id);
    });
  });
}

/* ── SINGLE CARD HTML ── */
function plantCardHTML(p, i) {
  const tc  = PLANT_TYPES[p.type] || PLANT_TYPES.flower;
  const st  = PLANT_STATUS[p.status] || PLANT_STATUS.growing;
  const hasPrice = p.totalSale || p.totalCost;

  const tags = [
    buildTag(st.label, st.cls),
    p.qty > 1  ? buildTag('×' + p.qty, 'tag-default') : '',
    p.potDisp  ? buildTag('🪣 ' + p.potDisp, 'tag-default') : '',
    p.locTxt   ? buildTag('📍 ' + p.locTxt, 'tag-default') : '',
  ].filter(Boolean).join('');

  const footer = hasPrice ? `
    <div class="plant-card-footer">
      <div>
        <div class="plant-card-price">${p.totalSale ? fmtMoney(p.totalSale) : ''}</div>
        <div class="plant-card-cost">${p.totalCost ? '💸 ' + fmtMoney(p.totalCost) : ''}</div>
      </div>
      <div class="plant-card-arrow">›</div>
    </div>` : '';

  return `
    <div class="plant-card" data-id="${p.id}" style="animation-delay:${i * 0.04}s">
      <div class="plant-card-top" style="background:${tc.bg}">
        <div class="plant-card-icon">${tc.icon}</div>
      </div>
      <div class="plant-card-body">
        <div class="plant-card-name">${p.name}</div>
        <div class="plant-card-lat">${p.species || '—'}</div>
        <div class="plant-card-tags">${tags}</div>
      </div>
      ${footer}
    </div>`;
}

/* ════════════════════════════════════════
   AUTOCOMPLETE
════════════════════════════════════════ */
function initAutocomplete() {
  const input = document.getElementById('p-name');
  const list  = document.getElementById('p-autocomplete');
  if (!input || !list) return;

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { list.classList.remove('active'); return; }

    const matches = PLANT_DB.filter(p =>
      p.ka.toLowerCase().includes(q) ||
      p.lat.toLowerCase().includes(q)
    ).slice(0, 6);

    if (!matches.length) { list.classList.remove('active'); return; }

    list.innerHTML = matches.map(p => `
      <div class="autocomplete-item" data-ka="${p.ka}" data-lat="${p.lat}" data-type="${p.type}">
        <span class="autocomplete-item-ico">${PLANT_TYPES[p.type]?.icon || '🌿'}</span>
        <div>
          <div class="autocomplete-item-name">${p.ka}</div>
          <div class="autocomplete-item-lat">${p.lat}</div>
        </div>
      </div>`).join('');

    list.classList.add('active');

    list.querySelectorAll('.autocomplete-item').forEach(item => {
      item.addEventListener('click', () => {
        input.value = item.dataset.ka;
        document.getElementById('p-species').value = item.dataset.lat;

        // Set type
        const typeGrid = document.getElementById('p-type-grid');
        setTypeGridValue(typeGrid, item.dataset.type);

        list.classList.remove('active');

        // Open optional section
        openOptToggle('opt-body-plant', 'opt-arrow-plant');
      });
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !list.contains(e.target)) {
      list.classList.remove('active');
    }
  });
}

/* ════════════════════════════════════════
   SAVE PLANT
════════════════════════════════════════ */
function bindSavePlant() {
  document.getElementById('btn-save-plant')?.addEventListener('click', () => {
    const id   = document.getElementById('p-id').value;
    const name = document.getElementById('p-name').value.trim();
    if (!name) { showToast('❌ სახელი სავალდ.', true); return; }

    const qty    = parseInt(document.getElementById('p-qty').value) || 1;
    const cost   = parseFloat(document.getElementById('p-cost').value) || 0;
    const sale   = parseFloat(document.getElementById('p-sale').value) || 0;
    const pot    = getPotValue();
    const typeGrid   = document.getElementById('p-type-grid');
    const originGrid = document.getElementById('p-origin-grid');
    const locGrid    = document.getElementById('p-loc-grid');

    const existingPlant = id ? getPlant(id) : null;

    const plant = {
      id:         id || uid(),
      name,
      species:    document.getElementById('p-species').value.trim(),
      type:       getTypeGridValue(typeGrid) || 'flower',
      origin:     getTypeGridValue(originGrid) || 'bought',
      status:     existingPlant?.status || 'growing',
      qty,
      potUnit:    pot.unit,
      potVal:     pot.val,
      potVal2:    pot.val2,
      potDisp:    pot.disp,
      locType:    getLocGridValue(locGrid),
      locTxt:     document.getElementById('p-loc-txt').value.trim(),
      plantDate:  document.getElementById('p-date').value,
      cost,
      salePrice:  sale,
      totalCost:  +(cost * qty).toFixed(2),
      totalSale:  +(sale * qty).toFixed(2),
      notes:      document.getElementById('p-notes').value.trim(),
      updatedAt:  new Date().toISOString(),
    };

    savePlant(plant);
    closeSheet();
    resetPlantForm();
    renderPlants();
    updateStatStrip();
    showToast('✅ ' + name + ' შენახ.');
  });
}

/* ── RESET FORM ── */
function resetPlantForm() {
  ['p-id','p-name','p-species','p-loc-txt','p-notes','p-cost','p-sale',
   'p-pot-cm','p-pot-L','p-pot-w','p-pot-h'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('p-qty').value  = '1';
  document.getElementById('p-date').value = todayStr();

  // Reset type grids
  setTypeGridValue(document.getElementById('p-type-grid'),   'flower');
  setTypeGridValue(document.getElementById('p-origin-grid'), 'bought');
  setLocGridValue(document.getElementById('p-loc-grid'),     'greenhouse');

  // Reset pot
  setPotValue({ unit: 'cm', val: '', val2: null, disp: '' });

  // Close optional
  document.getElementById('opt-body-plant')?.classList.remove('open');
  document.getElementById('opt-arrow-plant')?.classList.remove('open');

  // Close autocomplete
  document.getElementById('p-autocomplete')?.classList.remove('active');

  // Reset title
  const title = document.getElementById('sheet-plant-title');
  if (title) title.textContent = '🪴 მცენარის დამატება';
}

/* ── PRICE TOTALS LIVE CALC ── */
function bindPriceTotals() {
  const calc = () => {
    const qty  = parseInt(document.getElementById('p-qty')?.value) || 1;
    const cost = parseFloat(document.getElementById('p-cost')?.value) || 0;
    const sale = parseFloat(document.getElementById('p-sale')?.value) || 0;

    const row = document.getElementById('p-totals');
    if (!row) return;

    if (cost || sale) {
      row.style.display = 'grid';
      const tc = document.getElementById('p-total-cost');
      const ts = document.getElementById('p-total-sale');
      if (tc) tc.textContent = cost ? fmtMoney(cost * qty) : '—';
      if (ts) ts.textContent = sale ? fmtMoney(sale * qty) : '—';
    } else {
      row.style.display = 'none';
    }
  };

  ['p-qty', 'p-cost', 'p-sale'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', calc);
  });
}

/* ════════════════════════════════════════
   DETAIL PANEL
════════════════════════════════════════ */
function openDetailPanel(id) {
  const p = getPlant(id);
  if (!p) return;
  detailPlantId = id;

  const tc = PLANT_TYPES[p.type] || PLANT_TYPES.flower;
  const st = PLANT_STATUS[p.status] || PLANT_STATUS.growing;

  // Hero
  document.getElementById('d-icon').textContent   = tc.icon;
  document.getElementById('d-name').textContent   = p.name;
  document.getElementById('d-lat').textContent    = p.species || '—';
  document.getElementById('detail-hero').style.background =
    `linear-gradient(160deg, ${tc.bg}38 0%, var(--cream) 100%)`;

  // Tags
  const tags = [
    buildTag(st.label, st.cls),
    p.qty > 1  ? buildTag('×' + p.qty, 'tag-default') : '',
    p.potDisp  ? buildTag('🪣 ' + p.potDisp, 'tag-default') : '',
    p.locTxt   ? buildTag('📍 ' + p.locTxt, 'tag-default') : '',
    p.plantDate ? buildTag('📅 ' + fmtDate(p.plantDate), 'tag-default') : '',
  ].filter(Boolean).join('');
  document.getElementById('d-tags').innerHTML = tags;

  // Finance tiles
  const profit = (p.totalSale || 0) - (p.totalCost || 0);
  const roi    = p.totalCost > 0 ? ((profit / p.totalCost) * 100).toFixed(0) : null;

  document.getElementById('d-cost').textContent = p.totalCost ? fmtMoney(p.totalCost) : '—';
  document.getElementById('d-sale').textContent = p.totalSale ? fmtMoney(p.totalSale) : '—';

  const profEl = document.getElementById('d-profit');
  if (profEl) {
    profEl.textContent = (p.totalSale || p.totalCost)
      ? (profit >= 0 ? '+' : '') + fmtMoney(Math.abs(profit))
      : '—';
    profEl.className = 'detail-tile-value ' + (profit >= 0 ? 'green' : 'red');
  }

  const roiEl = document.getElementById('d-roi');
  if (roiEl) {
    roiEl.textContent = roi != null ? (roi >= 0 ? '+' : '') + roi + '%' : '—';
    roiEl.className   = 'detail-tile-value ' + (roi >= 0 ? 'green' : 'red');
  }

  // Diseases
  const pdbEntry = PLANT_DB.find(x => x.ka === p.name);
  const dxEl = document.getElementById('d-diseases');
  if (dxEl) {
    dxEl.innerHTML = pdbEntry?.diseases?.length
      ? pdbEntry.diseases.map(d => `
        <div class="detail-disease-item" onclick="quickTreat('${p.id}', \`${d.replace(/`/g,'')}\`)">
          <div class="detail-disease-name">${d.split('—')[0].trim()}</div>
          ${d.includes('—') ? `<div class="detail-disease-treat">💊 ${d.split('—')[1].trim()}</div>` : ''}
        </div>`).join('')
      : '<p style="padding:0 24px 12px;font-size:13px;color:var(--ink-3)">ინფ. არ არის</p>';
  }

  // Recent treatments
  const treats = window.DB.treatments
    .filter(t => t.plantId === id)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, 5);

  const treatEl = document.getElementById('d-treatments');
  if (treatEl) {
    treatEl.innerHTML = treats.length
      ? treats.map(t => `
        <div class="detail-treat-row">
          <span style="color:var(--ink-2)">${TREAT_TYPES[t.type]?.label || t.type}${t.product ? ' · ' + t.product : ''}</span>
          <span style="color:var(--ink-3)">${fmtDate(t.date)}</span>
        </div>`).join('')
      : '<p style="font-size:13px;color:var(--ink-3);padding:8px 0">ჩანაწ. ა.</p>';
  }

  openDetail();
}

function quickTreat(plantId, symptom) {
  closeDetail();
  setTimeout(() => {
    openSheet('sheet-treat');
    fillPlantSelect(document.getElementById('tr-plant'));
    document.getElementById('tr-plant').value   = plantId;
    document.getElementById('tr-type').value    = 'disease';
    document.getElementById('tr-symptoms').value = symptom;
  }, 200);
}

/* ── DETAIL ACTIONS ── */
function bindDetailActions() {
  document.getElementById('detail-back')?.addEventListener('click', closeDetail);

  document.getElementById('detail-edit')?.addEventListener('click', () => {
    const p = getPlant(detailPlantId);
    if (!p) return;
    closeDetail();
    setTimeout(() => {
      // Populate form
      document.getElementById('p-id').value       = p.id;
      document.getElementById('p-name').value     = p.name;
      document.getElementById('p-species').value  = p.species || '';
      document.getElementById('p-qty').value      = p.qty || 1;
      document.getElementById('p-cost').value     = p.cost || '';
      document.getElementById('p-sale').value     = p.salePrice || '';
      document.getElementById('p-date').value     = p.plantDate || '';
      document.getElementById('p-loc-txt').value  = p.locTxt || '';
      document.getElementById('p-notes').value    = p.notes || '';

      setTypeGridValue(document.getElementById('p-type-grid'),   p.type   || 'flower');
      setTypeGridValue(document.getElementById('p-origin-grid'), p.origin || 'bought');
      setLocGridValue(document.getElementById('p-loc-grid'),     p.locType || 'greenhouse');
      setPotValue({ unit: p.potUnit || 'cm', val: p.potVal, val2: p.potVal2 });

      openOptToggle('opt-body-plant', 'opt-arrow-plant');

      const title = document.getElementById('sheet-plant-title');
      if (title) title.textContent = '✏️ ' + p.name + ' — რედ.';

      openSheet('sheet-plant');
    }, 200);
  });

  document.getElementById('d-act-treat')?.addEventListener('click', () => {
    closeDetail();
    setTimeout(() => {
      openSheet('sheet-treat');
      fillPlantSelect(document.getElementById('tr-plant'));
      document.getElementById('tr-plant').value = detailPlantId;
    }, 200);
  });

  document.getElementById('d-act-task')?.addEventListener('click', () => {
    closeDetail();
    setTimeout(() => {
      openSheet('sheet-task');
      fillPlantSelect(document.getElementById('t-plant'), 'ყველა / სხვა');
      document.getElementById('t-plant').value = detailPlantId;
    }, 200);
  });

  document.getElementById('d-act-sale')?.addEventListener('click', () => {
    closeDetail();
    setTimeout(() => {
      openSheet('sheet-sale');
      fillPlantSelect(document.getElementById('sa-plant'));
      document.getElementById('sa-plant').value = detailPlantId;
    }, 200);
  });

  document.getElementById('d-act-delete')?.addEventListener('click', () => {
    const p = getPlant(detailPlantId);
    if (!p || !confirm(`"${p.name}" — წავშალო?`)) return;
    deletePlant(detailPlantId);
    closeDetail();
    renderPlants();
    updateStatStrip();
    updateSidebarBadge();
    showToast('🗑️ წაიშალა');
  });
}

/* ════════════════════════════════════════
   FILTER + SEARCH
════════════════════════════════════════ */
function bindFilters() {
  const segGroup = document.querySelector('#v-plants .seg-group, .seg-group');
  initSegGroup(segGroup, (val) => {
    plantFilter = val;
    renderPlants();
  });

  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      plantSearch = searchInput.value;
      renderPlants();
    });
  }
}

/* ════════════════════════════════════════
   INIT (called from init.js on index.html)
════════════════════════════════════════ */
function initPlants() {
  // FAB + sidebar plus button
  document.getElementById('btn-add-plant')?.addEventListener('click', () => {
    resetPlantForm();
    openSheet('sheet-plant');
  });
  document.getElementById('fab-btn')?.addEventListener('click', () => {
    resetPlantForm();
    openSheet('sheet-plant');
  });
  document.getElementById('sb-plus-plant')?.addEventListener('click', (e) => {
    e.stopPropagation();
    resetPlantForm();
    openSheet('sheet-plant');
  });

  // Sheet close
  document.getElementById('sheet-plant-close')?.addEventListener('click', closeSheet);

  // Form controls
  initTypeGrid(document.getElementById('p-type-grid'));
  initTypeGrid(document.getElementById('p-origin-grid'));
  initLocGrid(document.getElementById('p-loc-grid'));
  initPotTabs(document.getElementById('pot-tabs'));
  initOptToggle('opt-toggle-plant', 'opt-body-plant', 'opt-arrow-plant');
  initAutocomplete();
  bindPriceTotals();
  bindSavePlant();
  bindDetailActions();
  bindFilters();

  // Render
  renderPlants();
  updateStatStrip();
  updateSidebarBadge();
}
