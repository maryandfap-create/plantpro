/* ════════════════════════════════════════
   CALENDAR.JS — Tasks CRUD · Render · Overdue
   PlantPro Business Edition
════════════════════════════════════════ */

let calFilter = 'all';

function renderTasks() {
  const all = [...window.DB.tasks].sort((a, b) =>
    (a.dueDate || '').localeCompare(b.dueDate || '')
  );
  const filtered = calFilter === 'all'
    ? all
    : all.filter(t => t.type === calFilter);

  const overdue = filtered.filter(t =>
    !t.done && t.dueDate && daysDiff(t.dueDate) < 0
  );

  const ovLbl  = document.getElementById('overdue-label');
  const ovList = document.getElementById('overdue-list');
  const allList = document.getElementById('task-list');

  if (ovLbl) ovLbl.style.display = overdue.length ? 'block' : 'none';
  if (ovList) ovList.innerHTML   = overdue.map(taskRowHTML).join('');

  if (allList) {
    if (!filtered.length) {
      allList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📅</div>
          <div class="empty-state-title">დავ. ა.</div>
          <div class="empty-state-sub">დაამატე პირველი დავალება</div>
        </div>`;
    } else {
      allList.innerHTML = filtered.map(taskRowHTML).join('');
    }
  }

  // Bind checkboxes and deletes
  document.querySelectorAll('.task-checkbox').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleTask(el.dataset.id);
      renderTasks();
      updateSidebarBadge();
    });
  });
  document.querySelectorAll('.task-delete').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteTask(el.dataset.id);
      renderTasks();
      updateSidebarBadge();
    });
  });
}

function taskRowHTML(t) {
  const plant = getPlant(t.plantId);
  const tt    = TASK_TYPES[t.type] || TASK_TYPES.other;
  const d     = daysDiff(t.dueDate);
  const ico   = { pruning:'✂️',repot:'🪴',fertilize:'🌿',spray:'💧',water:'🚿',other:'📝' }[t.type] || '📝';

  let badge = '';
  if (t.done) {
    badge = buildBadge('✓ შეს.', 'badge-green');
  } else if (d != null) {
    if (d < 0)     badge = buildBadge('⚠️ ' + Math.abs(d) + 'დ', 'badge-red');
    else if (d === 0) badge = buildBadge('დღეს', 'badge-gold');
    else           badge = buildBadge(d + ' დ.', 'badge-gray');
  }

  return `
    <div class="list-item" style="opacity:${t.done ? '.52' : '1'}">
      <div class="checkbox ${t.done ? 'done' : ''} task-checkbox" data-id="${t.id}">${t.done ? '✓' : ''}</div>
      <div class="list-item-icon" style="background:${tt.bgCls}">${ico}</div>
      <div class="list-item-body">
        <div class="list-item-title">${tt.label}${plant ? ' — ' + plant.name : ''}</div>
        <div class="list-item-sub">
          <span>📅 ${fmtDate(t.dueDate)}</span>
          ${t.product ? `<span>🧪 ${t.product}</span>` : ''}
          ${t.recur !== 'none' ? `<span>🔄 ${t.recur}</span>` : ''}
        </div>
        ${t.notes ? `<div class="list-item-note">${t.notes}</div>` : ''}
      </div>
      <div class="list-item-right">
        ${badge}
        <button class="btn-delete task-delete" data-id="${t.id}">🗑️</button>
      </div>
    </div>`;
}

function bindSaveTask() {
  document.getElementById('btn-save-task')?.addEventListener('click', () => {
    const date = document.getElementById('t-date').value;
    if (!date) { showToast('❌ ვადა სავ.', true); return; }

    const typeGrid = document.getElementById('task-type-grid');
    const task = {
      id:       document.getElementById('t-id').value || uid(),
      type:     getTypeGridValue(typeGrid) || 'other',
      plantId:  document.getElementById('t-plant').value,
      dueDate:  date,
      recur:    document.getElementById('t-recur').value,
      product:  document.getElementById('t-product').value.trim(),
      notes:    document.getElementById('t-notes').value.trim(),
      done:     false,
      createdAt: new Date().toISOString(),
    };

    saveTask(task);
    closeSheet();
    resetTaskForm();
    renderTasks();
    updateSidebarBadge();
    showToast('✅ დავ. შენ.');
  });
}

function resetTaskForm() {
  ['t-id','t-product','t-notes'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('t-date').value   = todayStr();
  document.getElementById('t-recur').value  = 'none';
  document.getElementById('t-plant').value  = '';
  setTypeGridValue(document.getElementById('task-type-grid'), 'other');
}

function initCalendar() {
  document.getElementById('btn-add-task')?.addEventListener('click', () => {
    resetTaskForm();
    fillPlantSelect(document.getElementById('t-plant'), 'ყველა / სხვა');
    openSheet('sheet-task');
  });
  document.getElementById('fab-btn')?.addEventListener('click', () => {
    resetTaskForm();
    fillPlantSelect(document.getElementById('t-plant'), 'ყველა / სხვა');
    openSheet('sheet-task');
  });
  document.getElementById('sheet-task-close')?.addEventListener('click', closeSheet);

  initTypeGrid(document.getElementById('task-type-grid'));

  const segGroup = document.querySelector('.seg-group');
  initSegGroup(segGroup, (val) => {
    calFilter = val;
    renderTasks();
  });

  bindSaveTask();
  renderTasks();
  updateSidebarBadge();
}
