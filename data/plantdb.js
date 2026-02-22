/* ════════════════════════════════════════
   PLANTDB.JS — Plant Database & Constants
   PlantPro Business Edition
════════════════════════════════════════ */

/* ── PLANT TYPE COLORS (Yellow App style) ── */
const PLANT_TYPES = {
  flower: {
    label:  'ყვავილი',
    icon:   '🌸',
    bg:     '#F2A7B0',
    bgLt:   '#FEF2F4',
  },
  fruit: {
    label:  'ხეხილი',
    icon:   '🍎',
    bg:     '#F5C07A',
    bgLt:   '#FEF8EE',
  },
  cactus: {
    label:  'კაქტუსი',
    icon:   '🌵',
    bg:     '#8FC98F',
    bgLt:   '#EEF8EE',
  },
  indoor: {
    label:  'Indoor',
    icon:   '🪴',
    bg:     '#A8C4E0',
    bgLt:   '#EEF4FD',
  },
};

/* ── PLANT STATUS ── */
const PLANT_STATUS = {
  growing: { label: '🌱 ზრდაში',    cls: 'tag-growing' },
  ready:   { label: '✅ მზადა',      cls: 'tag-ready'   },
  sold:    { label: '💰 გაყიდული',  cls: 'tag-sold'    },
};

/* ── TASK TYPES ── */
const TASK_TYPES = {
  pruning:   { label: '✂️ გასხვლა',   bgCls: 'rgba(192,57,43,.10)'  },
  repot:     { label: '🪴 გადარგვა',  bgCls: 'rgba(37,99,235,.10)'  },
  fertilize: { label: '🌿 სასუქი',    bgCls: 'rgba(61,90,69,.12)'   },
  spray:     { label: '💧 შეწავლა',   bgCls: 'rgba(61,90,69,.15)'   },
  water:     { label: '🚿 მორწყვა',   bgCls: 'rgba(37,99,235,.10)'  },
  other:     { label: '📝 სხვა',      bgCls: 'rgba(90,90,90,.08)'   },
};

/* ── TREATMENT TYPES ── */
const TREAT_TYPES = {
  fertilize:   { label: '🌿 სასუქი',      icon: '🌿' },
  spray:       { label: '💧 შეწავლა',     icon: '💧' },
  disease:     { label: '🦠 დაავადება',   icon: '🦠' },
  repot:       { label: '🪴 გადარგვა',    icon: '🪴' },
  pruning:     { label: '✂️ გასხვლა',     icon: '✂️' },
  observation: { label: '👁️ დაკვირვება', icon: '👁️' },
};

/* ── SUPPLY CATEGORIES ── */
const SUPPLY_CATS = {
  pot:        { icon: '🪣', label: 'ქოთანი',    group: 'pot'        },
  soil:       { icon: '🌍', label: 'მიწა/სუბ.', group: 'substrate'  },
  perlite:    { icon: '⚪', label: 'პერლიტი',   group: 'substrate'  },
  peat:       { icon: '🟤', label: 'ტორფი',     group: 'substrate'  },
  bark:       { icon: '🪵', label: 'ქერქი',     group: 'substrate'  },
  fertilizer: { icon: '🌿', label: 'სასუქი',    group: 'fertilizer' },
  pesticide:  { icon: '💊', label: 'ინსექტ.',   group: 'pesticide'  },
  fungicide:  { icon: '🔴', label: 'ფუნგ.',     group: 'pesticide'  },
  other:      { icon: '📦', label: 'სხვა',      group: 'other'      },
};

const SUPPLY_DEFAULT_UNITS = {
  pot:        'ც',
  soil:       'L',
  perlite:    'L',
  peat:       'L',
  bark:       'L',
  fertilizer: 'კგ',
  pesticide:  'მლ',
  fungicide:  'გ',
  other:      'ც',
};

/* ── SALES PLATFORMS ── */
const SALE_PLATFORMS = {
  local:     { icon: '🏪', label: 'ადგ. ბაზარი' },
  instagram: { icon: '📷', label: 'Instagram'    },
  facebook:  { icon: '📘', label: 'Facebook'     },
  word:      { icon: '👥', label: 'სიტყვ.'       },
  other:     { icon: '📦', label: 'სხვა'         },
};

/* ── PLANT DATABASE (27 სახეობა) ── */
const PLANT_DB = [
  {
    ka: 'ვარდი', lat: 'Rosa damascena', type: 'flower',
    diseases: [
      'Botrytis cinerea — ვინცლოზოლინი 1გ/ლ',
      'Diplocarpon rosae — სპილენძ. სიჩ.',
      'ფხვ. ობი — გოგ. 1გ/ლ',
      'ბუგ. / ასპ. — Bio-Insect.',
    ],
  },
  {
    ka: 'ჰორტენზია', lat: 'Hydrangea macrophylla', type: 'flower',
    diseases: [
      'ფხვ. ობი — გოგ. 1გ/ლ',
      'ქლოროზი (Fe) — FeEDTA',
      'ბუგ. — Aktara 0.5გ/ლ',
    ],
  },
  {
    ka: 'ბეგონია', lat: 'Begonia sp.', type: 'flower',
    diseases: [
      'ფხვ. ობი — გოგ.',
      'Botrytis — Rovral',
    ],
  },
  {
    ka: 'ლავანდა', lat: 'Lavandula angustifolia', type: 'flower',
    diseases: [
      'ფხვ. ობი — გოგ.',
      'ფ. სიდ. — ახ. სუბ.',
    ],
  },
  {
    ka: 'ჰიბისკუსი', lat: 'Hibiscus rosa-sinensis', type: 'flower',
    diseases: [
      'ობობ. ტ. — Vertimec',
      'ბუგ. — Imidacloprid',
    ],
  },
  {
    ka: 'პეონი', lat: 'Paeonia lactiflora', type: 'flower',
    diseases: [
      'Botrytis — Rovral',
      'ფ. სიდ. (Phytophthora) — Aliette',
    ],
  },
  {
    ka: 'სტრელიცია', lat: 'Strelitzia reginae', type: 'flower',
    diseases: [
      'ფ. სიდ. — გადარ. ახ.',
      'ბუგ. — Actara',
    ],
  },
  {
    ka: 'ლიმონი', lat: 'Citrus limon', type: 'fruit',
    diseases: [
      'ციტ. ბუგ. — Confidor',
      'ქლოროზი — ელ. კვება (Mg/Fe)',
      'Phytophthora — Aliette 0.2%',
      'კოვ. (scale) — ზეთ. ემ.',
    ],
  },
  {
    ka: 'მანდარინი', lat: 'Citrus reticulata', type: 'fruit',
    diseases: [
      'ბუგ. — Actara',
      'Phytophthora — Aliette',
      'ქლოროზი — FeEDTA',
    ],
  },
  {
    ka: 'ვაშლი', lat: 'Malus domestica', type: 'fruit',
    diseases: [
      'ქეჩი (scab) — Mancozeb',
      'ფხვ. ობი — გოგ.',
      'ცეცხ. (fireblight) — სპილ.',
    ],
  },
  {
    ka: 'მსხალი', lat: 'Pyrus communis', type: 'fruit',
    diseases: [
      'ქეჩი — Mancozeb',
      'ცეცხ. — სპილ.',
    ],
  },
  {
    ka: 'კაქტუსი', lat: 'Cactaceae sp.', type: 'cactus',
    diseases: [
      'ფ. სიდ. — ახ. სუბ. + გამხ.',
      'ბამბ. ბ. — ალკ. სპ. / ნიმ.',
    ],
  },
  {
    ka: 'ალოე', lat: 'Aloe vera', type: 'cactus',
    diseases: [
      'ფ. სიდ. (Fusarium) — გამხ. + ახ.',
    ],
  },
  {
    ka: 'ეჩევერია', lat: 'Echeveria sp.', type: 'cactus',
    diseases: [
      'ბამბ. ბ. — ალკ.',
      'ფ. სიდ. — გამხ.',
    ],
  },
  {
    ka: 'კრასულა', lat: 'Crassula ovata', type: 'cactus',
    diseases: [
      'ფ. სიდ. — ახ. სუბ.',
      'ფხვ. ობი — გოგ.',
    ],
  },
  {
    ka: 'ჰავორთია', lat: 'Haworthia fasciata', type: 'cactus',
    diseases: [
      'ფ. სიდ. — გამხ.',
    ],
  },
  {
    ka: 'ფიქუსი', lat: 'Ficus benjamina', type: 'indoor',
    diseases: [
      'ფ. ცვ. — ადაპ. ადგ. ც.',
      'ობობ. ტ. — ნიმ. ზ.',
      'ბალ. ბ. — Imidacloprid',
    ],
  },
  {
    ka: 'მონსტერა', lat: 'Monstera deliciosa', type: 'indoor',
    diseases: [
      'ყვ. ფ. (ჭარბ. წყ.) — ნაკლ. მორ.',
      'ობობ. ტ. — Vertimec',
    ],
  },
  {
    ka: 'სანსევიერია', lat: 'Sansevieria trifasciata', type: 'indoor',
    diseases: [
      'ფ. სიდ. (Fusarium) — გამხ. + ახ.',
    ],
  },
  {
    ka: 'პოთოსი', lat: 'Epipremnum aureum', type: 'indoor',
    diseases: [
      'ყვ. ფ. — ნაკლ. წყ.',
      'ობობ. ტ. — სველ. ჰ.',
    ],
  },
  {
    ka: 'ზამიოკულკასი', lat: 'Zamioculcas zamiifolia', type: 'indoor',
    diseases: [
      'ყვ. ფ. — ჭარბ. წყ.',
    ],
  },
  {
    ka: 'ანთურიუმი', lat: 'Anthurium andraeanum', type: 'indoor',
    diseases: [
      'ბ. ჭვ. (Xanthomonas) — სპილ.',
      'ობობ. ტ. — Vertimec',
    ],
  },
  {
    ka: 'სპათიფილუმი', lat: 'Spathiphyllum wallisii', type: 'indoor',
    diseases: [
      'ყვ. ფ. — ნაკლ. შუქ.',
      'ბუგ. — Actara',
    ],
  },
  {
    ka: 'ფალენოფსისი', lat: 'Phalaenopsis sp.', type: 'indoor',
    diseases: [
      'ფ. სიდ. — ახ. სუბ.',
      'ობობ. ტ. — ნიმ.',
    ],
  },
  {
    ka: 'დრაცენა', lat: 'Dracaena marginata', type: 'indoor',
    diseases: [
      'ფ. ბ. (Fluoride) — ნაკლ. F.',
      'ობობ. ტ. — Vertimec',
    ],
  },
  {
    ka: 'ქლოროფიტუმი', lat: 'Chlorophytum comosum', type: 'indoor',
    diseases: [
      'ყვ. ფ. — ჭარბ. მზ.',
    ],
  },
  {
    ka: 'კალათეა', lat: 'Calathea ornata', type: 'indoor',
    diseases: [
      'ობობ. ტ. — სველ. ჰ.',
      'ყვ. ფ. — ჭარბ. მზ.',
    ],
  },
];
