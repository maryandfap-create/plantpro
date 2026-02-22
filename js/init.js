/* ════════════════════════════════════════
   INIT.JS — Page Router · Global Init
   PlantPro Business Edition
════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── GLOBAL: scale select + export/import ── */
  initScaleSelect();
  initExportImport();

  /* ── DETECT CURRENT PAGE ── */
  const page = location.pathname.split('/').pop() || 'index.html';

  if (page === 'index.html' || page === '') {
    initPlants();
  }

  if (page === 'calendar.html') {
    initCalendar();
  }

  if (page === 'supplies.html') {
    initSupplies();
  }

  if (page === 'finance.html') {
    initFinance();
  }

  if (page === 'treatments.html') {
    initTreatments();
  }

  if (page === 'sales.html') {
    initSales();
  }

  if (page === 'ai.html') {
    initAI();
  }

  if (page === 'advisor.html') {
    updateSidebarBadge();
  }

});
