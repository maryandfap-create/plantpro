/* ════════════════════════════════════════
   TREATMENTS.JS
════════════════════════════════════════ */

function renderTreatments() {
  const list = [...window.DB.treatments]
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const el = document.getElementById('treatment-list');
  if (!el) return;

  if (!list.length) {
    el.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔬</div>
        <div class="empty-state-title">ჩანაწერი ა.</div>
        <div class="empty-state-sub">მოვლის პირველი ჩანაწერი დაამატე</div>
      </div>`;
    return;
  }

  el.innerHTML = list.map(treatRowHTML).join('');

  el.querySelectorAll('.treat-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteTreatment(btn.dataset.id);
      renderTreatments();
    });
  });
}

function treatRowHTML(t) {
  const plant = getPlant(t.plantId);
  const tt    = TREAT_TYPES[t.type] || { label: t.type, icon: '📝' };

  return `
    <div class="list-item" style="align-items:flex-start">
      <div class="list-item-icon" style="background:var(--sage-bg)">${tt.icon}</div>
      <div class="list-item-body">
        <div class="list-item-title">${plant ? plant.name : '—'} · ${tt.label}</div>
        <div class="list-item-sub">
          <span>📅 ${fmtDate(t.date)}</span>
          ${t.product ? `<span>🧪 ${t.product}</span>` : ''}
          ${t.amount  ? `<span>💊 ${t.amount}</span>` : ''}
        </div>
        ${t.symptoms ? `<div class="list-item-note" style="color:var(--red)">${t.symptoms}</div>` : ''}
        ${t.notes    ? `<div class="list-item-note">${t.notes}</div>` : ''}
        ${t.nextDate ? `<div class="list-item-note" style="color:var(--gold)">⏰ შ/ვ: ${fmtDate(t.nextDate)}</div>` : ''}
      </div>
      <button class="btn-delete treat-delete" data-id="${t.id}">🗑️</button>
    </div>`;
}

function bindSaveTreat() {
  // Disease hints on plant select
  document.getElementById('tr-plant')?.addEventListener('change', (e) => {
    const plant = getPlant(e.target.value);
    const hintSec   = document.getElementById('dx-hint-section');
    const hintChips = document.getElementById('dx-hint-chips');
    if (!plant || !hintSec || !hintChips) return;

    const pdb = PLANT_DB.find(x => x.ka === plant.name);
    if (pdb?.diseases?.length) {
      hintChips.innerHTML = pdb.diseases.map(d => `
        <span class="disease-chip" data-symptom="${d.replace(/"/g,'&quot;')}">${d.split('—')[0].trim()}</span>
      `).join('');
      hintSec.style.display = 'block';

      hintChips.querySelectorAll('.disease-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          document.getElementById('tr-symptoms').value = chip.dataset.symptom;
          document.getElementById('tr-type').value     = 'disease';
        });
      });
    } else {
      hintSec.style.display = 'none';
    }
  });

  document.getElementById('btn-save-treat')?.addEventListener('click', () => {
    const plantId = document.getElementById('tr-plant').value;
    if (!plantId) { showToast('❌ მცენ. სავ.', true); return; }
    const date = document.getElementById('tr-date').value;
    if (!date) { showToast('❌ თარ. სავ.', true); return; }

    const treat = {
      id:        document.getElementById('tr-id').value || uid(),
      plantId,
      type:      document.getElementById('tr-type').value,
      date,
      product:   document.getElementById('tr-product').value.trim(),
      amount:    document.getElementById('tr-amount').value.trim(),
      potVal:    document.getElementById('tr-pot-val').value,
      potUnit:   document.getElementById('tr-pot-unit').value,
      symptoms:  document.getElementById('tr-symptoms').value.trim(),
      notes:     document.getElementById('tr-notes').value.trim(),
      nextDate:  document.getElementById('tr-next-date').value,
    };

    saveTreatment(treat);
    closeSheet();
    resetTreatForm();
    renderTreatments();
    showToast('✅ მოვლა შენ.');
  });
}

function resetTreatForm() {
  ['tr-id','tr-product','tr-amount','tr-pot-val','tr-symptoms','tr-notes','tr-next-date']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  document.getElementById('tr-date').value  = todayStr();
  document.getElementById('tr-plant').value = '';
  document.getElementById('tr-type').value  = 'fertilize';
  document.getElementById('dx-hint-section').style.display = 'none';
}

function initTreatments() {
  document.getElementById('btn-add-treat')?.addEventListener('click', () => {
    resetTreatForm();
    fillPlantSelect(document.getElementById('tr-plant'));
    openSheet('sheet-treat');
  });
  document.getElementById('fab-btn')?.addEventListener('click', () => {
    resetTreatForm();
    fillPlantSelect(document.getElementById('tr-plant'));
    openSheet('sheet-treat');
  });
  document.getElementById('sheet-treat-close')?.addEventListener('click', closeSheet);

  bindSaveTreat();
  renderTreatments();
  updateSidebarBadge();
}
