/* ════════════════════════════════════════
   AI.JS — Claude API · Image Diagnosis
   PlantPro Business Edition
════════════════════════════════════════ */

const API_KEY_STORAGE = 'plantpro_api_key';
let _imageBase64 = null;

/* ════════════════════════════════════════
   API KEY
════════════════════════════════════════ */
function initApiKey() {
  const input = document.getElementById('api-key');
  if (!input) return;

  // Load saved key (show masked)
  const saved = localStorage.getItem(API_KEY_STORAGE);
  if (saved) input.value = '••••••••••••••••••';

  document.getElementById('btn-save-key')?.addEventListener('click', () => {
    const val = input.value.trim();
    if (!val || val.startsWith('•')) {
      showToast('❌ API key ჩაწერე', true);
      return;
    }
    localStorage.setItem(API_KEY_STORAGE, val);
    input.value = '••••••••••••••••••';
    showToast('✅ API key შენახ.');
  });

  document.getElementById('btn-clear-key')?.addEventListener('click', () => {
    localStorage.removeItem(API_KEY_STORAGE);
    input.value = '';
    showToast('🗑️ API key წაიშ.');
  });
}

/* ════════════════════════════════════════
   IMAGE DROP
════════════════════════════════════════ */
function initImageDrop() {
  const zone    = document.getElementById('drop-zone');
  const fileIn  = document.getElementById('image-input');
  const preview = document.getElementById('preview-img');
  const ph      = document.getElementById('drop-placeholder');
  const clearBtn = document.getElementById('btn-clear-img');
  if (!zone) return;

  // Drag over
  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('drag-over');
  });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) loadImage(file);
  });

  // File input
  fileIn?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) loadImage(file);
  });

  // Clear
  clearBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    _imageBase64   = null;
    preview.src    = '';
    preview.style.display = 'none';
    ph.style.display      = 'block';
    clearBtn.style.display = 'none';
    if (fileIn) fileIn.value = '';
  });
}

function loadImage(file) {
  const reader  = new FileReader();
  const preview = document.getElementById('preview-img');
  const ph      = document.getElementById('drop-placeholder');
  const clearBtn = document.getElementById('btn-clear-img');

  reader.onload = (e) => {
    const dataUrl  = e.target.result;
    _imageBase64   = dataUrl.split(',')[1];
    preview.src    = dataUrl;
    preview.style.display  = 'block';
    ph.style.display       = 'none';
    if (clearBtn) clearBtn.style.display = 'inline-flex';
  };
  reader.readAsDataURL(file);
}

/* ════════════════════════════════════════
   RUN AI DIAGNOSIS
════════════════════════════════════════ */
async function runAIDiagnosis() {
  const apiKey = localStorage.getItem(API_KEY_STORAGE);
  if (!apiKey) {
    showToast('❌ API key ა. — ჩაწერე', true);
    return;
  }

  const symptoms = document.getElementById('ai-symptoms')?.value.trim();
  if (!_imageBase64 && !symptoms) {
    showToast('❌ ფოტო ან სიმპტომი', true);
    return;
  }

  const btn = document.getElementById('btn-run-ai');
  if (btn) { btn.textContent = '⏳ ანალ...'; btn.disabled = true; }

  const resEl = document.getElementById('ai-response');
  if (resEl) { resEl.style.display = 'none'; resEl.textContent = ''; }

  // Build message content
  const content = [];

  if (_imageBase64) {
    content.push({
      type: 'image',
      source: {
        type:       'base64',
        media_type: 'image/jpeg',
        data:       _imageBase64,
      },
    });
  }

  // Context from selected plant
  const plantId   = document.getElementById('ai-plant')?.value;
  const plant     = plantId ? getPlant(plantId) : null;
  const plantCtx  = plant
    ? `მცენარე: ${plant.name}${plant.species ? ' (' + plant.species + ')' : ''}`
    : '';

  const prompt = `შენ ხარ გამოცდილი მცენარეთა დაავადებების ექსპერტი. პასუხი მოცემე ქართულ ენაზე.

${plantCtx}
${symptoms ? 'სიმპტომი: ' + symptoms : ''}

გთხოვ უპასუხო ამ სტრუქტურით:

🔍 **დიაგნოზი:**
(რა პრობლემაა — დაავადება, მავნებელი, ან კვებითი დეფიციტი)

⚠️ **სიმპტომები:**
(რა ნიშნები გამოვლინდება)

💊 **მკურნალობა:**
(კონკრეტული პრეპარატი, დოზა, გამოყენების მეთოდი)

🛡️ **პრევენცია:**
(როგორ ავიცილოთ მომავალში)

🌍 **ქართულ ბაზარზე:**
(სად შეიძინება — Agroshop, სოფ. მეურ. ბაზარი, სხვა)`;

  content.push({ type: 'text', text: prompt });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-opus-4-5',
        max_tokens: 1024,
        messages:   [{ role: 'user', content }],
      }),
    });

    const data = await response.json();

    if (data.error) {
      showToast('❌ ' + (data.error.message || 'API შეცდ.'), true);
      return;
    }

    const text = data.content
      ?.map(c => c.text || '')
      .join('')
      .trim() || 'პასუხი ვერ მოვიღე.';

    if (resEl) {
      // Simple markdown bold
      resEl.innerHTML = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
      resEl.style.display = 'block';
    }

    showToast('✅ ანალ. დასრ.');

  } catch (err) {
    showToast('❌ ' + err.message.slice(0, 48), true);
  } finally {
    if (btn) { btn.textContent = '🔍 AI ანალიზი'; btn.disabled = false; }
  }
}

/* ════════════════════════════════════════
   INIT
════════════════════════════════════════ */
function initAI() {
  initApiKey();
  initImageDrop();
  fillPlantSelect(document.getElementById('ai-plant'));
  document.getElementById('btn-run-ai')?.addEventListener('click', runAIDiagnosis);
  updateSidebarBadge();
}
