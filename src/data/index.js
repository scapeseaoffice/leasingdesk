/**
 * LeasingDesk — Data Configuration
 * ─────────────────────────────────────────────────────────────────────────────
 * This is the primary file to update when:
 *   • Adding a new team member          → AM_CONFIG
 *   • Updating leasing numbers          → AM_CONFIG (or BOOKINGS for full records)
 *   • Adding/editing sample bookings    → BOOKINGS
 *   • Updating the pipeline             → PIPELINE_DATA
 *   • Editing reminders                 → REMINDERS_INIT
 *
 * HOW TO ADD A NEW TEAM MEMBER
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. Copy the template block at the bottom of AM_CONFIG
 * 2. Add their bookings to BOOKINGS[newKey]
 * 3. Add their pipeline students to PIPELINE_DATA[newKey]
 * 4. Add their reminders to REMINDERS_INIT[newKey]
 * That's it — they appear in the AM switcher automatically.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Date reference (update to keep reminders relative to today) ─────────────
export const TODAY = new Date().toISOString().split('T')[0]

// ── Helper functions ─────────────────────────────────────────────────────────
export const ACCENT_COLORS = ['#f5a623','#4e9bff','#3ecf8e','#E8553D','#b57bee','#ff8c42','#29c4d0','#e879f9']

export const avatarColor  = (s = '') => ACCENT_COLORS[s.charCodeAt(0) % ACCENT_COLORS.length]
export const initials     = (n = '') => n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
export const relativeTime = (iso) => {
  if (!iso) return ''
  const m = Math.floor((Date.now() - new Date(iso)) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
export const formatMoney  = (n) => n >= 1e6 ? `$${(n / 1e6).toFixed(1)}Ma : `$${(n / 1e3).toFixed(0)}K`
export const formatDate   = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}
export const greeting = (name) => {
  const first = name.split(' ')[0]
  const h = new Date().getHours()
  if (h < 12) return `Morning, ${first}.`
  if (h < 17) return `Afternoon, ${first}.`
  return `Evening, ${first}.`
}

export const DOC_ICONS = { xlsx: '📊', docx: '📄', pdf: '📕', pptx: '📽️' }
export const DOC_COLORS = {
  xlsx: 'rgba(62,207,142,.15)',
  docx: 'rgba(78,155,255,.15)',
  pdf: 'rgba(255,90,101,.12)',
}

// ── Shared SharePoint doc shortcuts ─────────────────────────────────────────
const SHARED_DOCS = [
  {
    name: 'Scape_SEA_Outreach_Tracker.xlsx',
    type: 'xlsx',
    folder: 'SEA Working Documents',
    url: 'https://thescapegroup.sharepoint.com/sites/Sales/Shared%20Documents/7.%20Offshore%20Team/3.%20South%20East%20Asia/4.%20Working%20Documents/Scape_SEA_Outreach_Tracker.xlsx',
  },
  {
    name: 'Agency Agreements 2026-27.xlsx',
    type: 'xlsx',
    folder: 'Agent Agreement Documents',
    url: 'https://thescapegroup.sharepoint.com/sites/Sales/Shared%20Documents/7.%20Offshore%20Team/1.%20Agent%20Agreement%20Documents/2026-27/Agency%20Agreements%20Master%20List.xlsx',
  },
]

// ═════════════════════════════════════════════════════════════════════════════
// AM CONFIG
// Update totalBookings, contractValue, inRoom, held, tentative, history
// each time a new StarRez export is run.
// ═════════════════════════════════════════════════════════════════════════════
export const AM_CONFIG = {

  nicole: {
    name: 'Nicole Sim',
    region: 'SEA · Broad Market',
    initials: 'NS',
    color: '#f5a623',
    // ── StarRez totals (update from export) ──
    totalBookings: 1786,
    contractValue: 26104095,
    inRoom: 293,
    held: 21,
    tentative: 2,
    history: 1470,
    // ── Top partners (name, StarRez agent code, booking count, type) ──
    topPartners: [
      { name: 'University Living',  code: 'UNIVERSITYLIVING', count: 908, type: 'Aggregator'       },
      { name: 'Casita',             code: 'CASITA',           count: 262, type: 'Aggregator'       },
      { name: 'AUG',                code: 'AUG',              count: 121, type: 'Education Agent'  },
      { name: 'Austlink Education', code: 'AUSTLINK',         count: 37,  type: 'Education Agent'  },
      { name: 'GEA SEA',            code: 'GEASEA',           count: 28,  type: 'Education Agent'  },
      { name: 'AECC Global',        code: 'AECC',             count: 24,  type: 'Education Agent'  },
    ],
    // ── Top properties by booking count ──
    topProperties: [
      { name: 'Melbourne Central', count: 133 },
      { name: 'Swanston',          count: 131 },
      { name: 'Sydney Central',    count: 121 },
      { name: 'Queensberry',       count: 92  },
      { name: 'Peel',              count: 88  },
      { name: 'Darling Square',    count: 87  },
      { name: 'Adelaide Central',  count: 79  },
      { name: 'Darling House',     count: 76  },
    ],
    docs: [
      ...SHARED_DOCS,
      {
        name: 'Agency Agreements 2025-26.xlsx',
        type: 'xlsx',
        folder: 'Agent Agreement Documents',
        url: 'https://thescapegroup.sharepoint.com/sites/Sales/Shared%20Documents/7.%20Offshore%20Team/1.%20Agent%20Agreement%20Documents/2025-26/Agency%20Agreements%20Master%20List.xlsx',
      },
    ],
  },

  minxuan: {
    name: 'Minxuan Kong',
    region: 'Singapore',
    initials: 'MK',
    color: '#4e9bff',
    totalBookings: 79,
    contractValue: 1860731,
    inRoom: 41,
    held: 2,
    tentative: 0,
    history: 36,
    topPartners: [
      { name: 'Overseas Academic Link', code: 'OALSG',     count: 37, type: 'Education Agent' },
      { name: 'OAL (direct)',           code: 'OESG',      count: 18, type: 'Education Agent' },
      { name: 'theRightU',              code: 'TRUSG',     count: 16, type: 'Education Agent' },
      { name: 'JACK Study Abroad',      code: 'JACKSTUDY', count: 8,  type: 'Education Agent' },
    ],
    topProperties: [
      { name: 'Victoria Street',     count: 16 },
      { name: 'Swanston',            count: 12 },
      { name: 'Darling House',       count: 11 },
      { name: 'St Lucia',            count: 5  },
      { name: 'Kensington',          count: 4  },
      { name: 'Cornell Place',       count: 4  },
      { name: 'Adelaide University', count: 3  },
      { name: 'Darling Square',      count: 3  },
    ],
    docs: SHARED_DOCS,
  },

  /**
   * ── Ngoc Hoang · Vietnam ────────────────────────────────────────────────
   * StarRez data pending — update once API access is confirmed.
   * Partner codes below are provisional; confirm with Ngoc on onboarding.
   */
  ngoc: {
    name: 'Ngoc Hoang',
    region: 'Vietnam',
    initials: 'NH',
    color: '#3ecf8e',
    totalBookings: 0,
    contractValue: 0,
    inRoom: 0,
    held: 0,
    tentative: 0,
    history: 0,
    note: '⚡ StarRez data pending — update once API access is confirmed.',
    topPartners: [
      { name: 'IDP Vietnam',          code: 'IDPVN',  count: 0, type: 'Education Agent' },
      { name: 'Study Group Vietnam',  code: 'SGVN',   count: 0, type: 'Education Agent' },
      { name: 'EduPath Vietnam',      code: 'EDUVN',  count: 0, type: 'Education Agent' },
      { name: 'VietPath Education',   code: 'VPEDU',  count: 0, type: 'Education Agent' },
    ],
    topProperties: [
      { name: 'Melbourne Central', count: 0 },
      { name: 'Sydney Central',    count: 0 },
      { name: 'Swanston',          count: 0 },
      { name: 'Peel',              count: 0 },
    ],
    docs: SHARED_DOCS,
  },

  /* ── TEMPLATE — copy to add a new team member ────────────────────────────
  newkey: {
    name: 'First Last',
    region: 'Country / Market',
    initials: 'FL',
    color: '#b57bee',          // pick a unique colour from ACCENT_COLORS
    totalBookings: 0,
    contractValue: 0,
    inRoom: 0,
    held: 0,
    tentative: 0,
    history: 0,
    note: '⚡ StarRez data pending.',
    topPartners: [
      { name: 'Partner Name', code: 'AGENTCODE', count: 0, type: 'Education Agent' },
    ],
    topProperties: [
      { name: 'Property Name', count: 0 },
    ],
    docs: SHARED_DOCS,
  },
  ─────────────────────────────────────────────────────────────────────────── */
}

// ═════════════════════════════════════════════════════════════════════════════
// BOOKINGS
// Replace with live StarRez API response once token is available.
// Each record: id, student, partner, property, status, checkin, room, contract
// status values: "inroom" | "held" | "tentative" | "history"
// ═════════════════════════════════════════════════════════════════════════════
export const BOOKINGS = {
  nicole: [
    { id: 'SZ-28841', student: 'Thanh Nguyen',    partner: 'University Living',  property: 'Melbourne Central', status: 'inroom',    checkin: '2026-02-17', room: 'Studio+',         contract: 18200 },
    { id: 'SZ-28190', student: 'Arya Santoso',    partner: 'University Living',  property: 'Swanston',          status: 'inroom',    checkin: '2026-02-20', room: 'Classic Ensuite', contract: 14950 },
    { id: 'SZ-27633', student: 'Priya Ramasamy',  partner: 'Casita',             property: 'Sydney Central',    status: 'inroom',    checkin: '2026-02-24', room: 'Classic Ensuite', contract: 16100 },
    { id: 'SZ-29012', student: 'Wei Chen',        partner: 'University Living',  property: 'Queensberry',       status: 'inroom',    checkin: '2026-03-03', room: 'Studio',          contract: 17500 },
    { id: 'SZ-29100', student: 'Nayla Putri',     partner: 'AUG',                property: 'Peel',              status: 'inroom',    checkin: '2026-03-10', room: 'Classic Ensuite', contract: 13800 },
    { id: 'SZ-28504', student: 'Jia Hui Lim',     partner: 'University Living',  property: 'Darling Square',    status: 'inroom',    checkin: '2026-02-14', room: 'Studio+',         contract: 19200 },
    { id: 'SZ-28720', student: 'Bintang Wibowo',  partner: 'Casita',             property: 'Adelaide Central',  status: 'inroom',    checkin: '2026-02-28', room: 'Classic Ensuite', contract: 12400 },
    { id: 'SZ-27990', student: 'Siti Aisyah',     partner: 'University Living',  property: 'Darling House',     status: 'inroom',    checkin: '2026-02-17', room: 'Studio',          contract: 17800 },
    { id: 'SZ-29401', student: 'Rizal Halim',     partner: 'AUG',                property: 'Melbourne Central', status: 'held',      checkin: '2026-07-07', room: 'Studio+',         contract: 18900 },
    { id: 'SZ-29388', student: 'Camille Nguyen',  partner: 'AECC Global',        property: 'Sydney Central',    status: 'held',      checkin: '2026-07-14', room: 'Classic Ensuite', contract: 16500 },
    { id: 'SZ-29450', student: 'Aditya Kumar',    partner: 'University Living',  property: 'Swanston',          status: 'held',      checkin: '2026-07-21', room: 'Studio',          contract: 17200 },
    { id: 'SZ-29512', student: 'Farhan Aziz',     partner: 'Casita',             property: 'Queensberry',       status: 'tentative', checkin: '2026-07-07', room: 'Classic Ensuite', contract: 14600 },
    { id: 'SZ-29601', student: 'Mei Ling Tan',    partner: 'GEA SEA',            property: 'Darling Square',    status: 'tentative', checkin: '2026-07-14', room: 'Studio+',         contract: 19100 },
    { id: 'SZ-25001', student: 'Rahul Sharma',    partner: 'University Living',  property: 'Melbourne Central', status: 'history',   checkin: '2025-07-21', room: 'Classic Ensuite', contract: 14200 },
    { id: 'SZ-25188', student: 'Putri Handayani', partner: 'Austlink Education', property: 'Adelaide Central',  status: 'history',   checkin: '2025-02-17', room: 'Studio',          contract: 11900 },
    { id: 'SZ-24770', student: 'Zara Abdullah',   partner: 'University Living',  property: 'Peel',              status: 'history',   checkin: '2025-02-24', room: 'Classic Ensuite', contract: 13600 },
    { id: 'SZ-26302', student: 'Hao Ming Wu',     partner: 'Casita',             property: 'Swanston',          status: 'history',   checkin: '2025-07-14', room: 'Studio+',         contract: 18400 },
    { id: 'SZ-26890', student: 'Isabel Santos',   partner: 'AUG',                property: 'Darling House',     status: 'history',   checkin: '2025-07-21', room: 'Studio',          contract: 17000 },
    { id: 'SZ-27100', student: 'Kevin Tran',      partner: 'University Living',  property: 'Sydney Central',    status: 'history',   checkin: '2025-07-28', room: 'Classic Ensuite', contract: 15900 },
    { id: 'SZ-27340', student: 'Nurul Huda',      partner: 'AECC Global',        property: 'Queensberry',       status: 'history',   checkin: '2025-02-10', room: 'Studio',          contract: 16600 },
  ],
  minxuan: [
    { id: 'SZ-29200', student: 'Jing Yi Tan',   partner: 'Overseas Academic Link', property: 'Victoria Street',     status: 'inroom',  checkin: '2026-02-17', room: 'Classic Ensuite', contract: 15800 },
    { id: 'SZ-29210', student: 'Kai Wen Loh',   partner: 'OAL (direct)',           property: 'Swanston',            status: 'inroom',  checkin: '2026-02-20', room: 'Studio',          contract: 17200 },
    { id: 'SZ-29225', student: 'Xu Ming Chen',  partner: 'theRightU',              property: 'Darling House',       status: 'inroom',  checkin: '2026-02-24', room: 'Studio+',         contract: 18400 },
    { id: 'SZ-29240', student: 'Hui En Goh',    partner: 'Overseas Academic Link', property: 'Victoria Street',     status: 'inroom',  checkin: '2026-03-03', room: 'Classic Ensuite', contract: 15600 },
    { id: 'SZ-29255', student: 'Zhi Xuan Lee',  partner: 'JACK Study Abroad',      property: 'St Lucia',            status: 'inroom',  checkin: '2026-02-28', room: 'Studio',          contract: 13200 },
    { id: 'SZ-29410', student: 'Pei Ling Wong', partner: 'Overseas Academic Link', property: 'Kensington',          status: 'held',    checkin: '2026-07-07', room: 'Classic Ensuite', contract: 14800 },
    { id: 'SZ-29430', student: 'Ming Jie Ng',   partner: 'theRightU',              property: 'Cornell Place',       status: 'held',    checkin: '2026-07-14', room: 'Studio+',         contract: 19300 },
    { id: 'SZ-26100', student: 'Shu Ting Lim',  partner: 'Overseas Academic Link', property: 'Darling House',       status: 'history', checkin: '2025-07-21', room: 'Classic Ensuite', contract: 16100 },
    { id: 'SZ-26220', student: 'Rong Xin Koh',  partner: 'OAL (direct)',           property: 'Adelaide University', status: 'history', checkin: '2025-02-17', room: 'Studio',          contract: 11800 },
    { id: 'SZ-26490', student: 'Xiao Wei Chua', partner: 'theRightU',              property: 'Swanston',            status: 'history', checkin: '2025-07-28', room: 'Studio+',         contract: 18100 },
  ],
  ngoc: [], // Populated once StarRez access is confirmed for Ngoc
}

// ═════════════════════════════════════════════════════════════════════════════
// PIPELINE STAGES
// Order matters — left to right on the Kanban board.
// ═════════════════════════════════════════════════════════════════════════════
export const PIPELINE_STAGES = [
  { key: 'enquiry',    label: 'Enquiry',        color: '#8a9bbf' },
  { key: 'docs',       label: 'Documentation',  color: '#b57bee' },
  { key: 'allocated',  label: 'Room Allocated', color: '#4e9bff' },
  { key: 'prearrival', label: 'Pre-Arrival',    color: '#f5a623' },
  { key: 'checkedin',  label: 'Checked In',     color: '#3ecf8e' },
]

// ═════════════════════════════════════════════════════════════════════════════
// PIPELINE DATA
// Add students here as they enter the onboarding process.
// stage must match one of the PIPELINE_STAGES keys above.
// ═════════════════════════════════════════════════════════════════════════════
export const PIPELINE_DATA = {
  nicole: [
    { id: 'K001', name: 'Ahmad Faris',   flag: '🇲🇾', partner: 'University Living',  property: 'Melbourne Central', checkin: '2026-07-07', stage: 'prearrival' },
    { id: 'K002', name: 'Linh Pham',     flag: '🇻🇳', partner: 'Casita',             property: 'Sydney Central',    checkin: '2026-07-14', stage: 'allocated'  },
    { id: 'K003', name: 'Putri Sari',    flag: '🇮🇩', partner: 'AUG',                property: 'Swanston',          checkin: '2026-07-21', stage: 'docs'       },
    { id: 'K004', name: 'Priya Nair',    flag: '🇮🇳', partner: 'University Living',  property: 'Queensberry',       checkin: '2026-07-14', stage: 'enquiry'    },
    { id: 'K005', name: 'Yusuf Hassan',  flag: '🇲🇾', partner: 'GEA SEA',            property: 'Adelaide Central',  checkin: '2026-07-28', stage: 'docs'       },
    { id: 'K006', name: 'Thao Tran',     flag: '🇻🇳', partner: 'Casita',             property: 'Darling Square',    checkin: '2026-07-07', stage: 'prearrival' },
    { id: 'K007', name: 'Rina Dewi',     flag: '🇮🇩', partner: 'AECC Global',        property: 'Peel',              checkin: '2026-07-21', stage: 'allocated'  },
    { id: 'K008', name: 'Marcus Tan',    flag: '🇸🇬', partner: 'University Living',  property: 'Darling House',     checkin: '2026-08-04', stage: 'enquiry'    },
    { id: 'K009', name: 'Siti Rahimah',  flag: '🇲🇾', partner: 'Austlink Education', property: 'Melbourne Central', checkin: '2026-07-07', stage: 'checkedin'  },
    { id: 'K010', name: 'Bao Nguyen',    flag: '🇻🇳', partner: 'AUG',                property: 'Sydney Central',    checkin: '2026-07-14', stage: 'docs'       },
    { id: 'K011', name: 'Farah Khalid',  flag: '🇲🇾', partner: 'University Living',  property: 'Swanston',          checkin: '2026-07-28', stage: 'enquiry'    },
    { id: 'K012', name: 'Eka Putra',     flag: '🇮🇩', partner: 'Casita',             property: 'Queensberry',       checkin: '2026-07-07', stage: 'checkedin'  },
  ],
  minxuan: [
    { id: 'K101', name: 'Yan Ling Chua',  flag: '🇸🇬', partner: 'Overseas Academic Link', property: 'Victoria Street',     checkin: '2026-07-07', stage: 'prearrival' },
    { id: 'K102', name: 'Wei Jun Tan',    flag: '🇸🇬', partner: 'theRightU',              property: 'Swanston',            checkin: '2026-07-14', stage: 'allocated'  },
    { id: 'K103', name: 'Zhen Xiu Lee',   flag: '🇸🇬', partner: 'OAL (direct)',           property: 'Darling House',       checkin: '2026-07-21', stage: 'docs'       },
    { id: 'K104', name: 'Jia Min Ng',     flag: '🇸🇬', partner: 'Overseas Academic Link', property: 'Kensington',          checkin: '2026-07-14', stage: 'enquiry'    },
    { id: 'K105', name: 'Hui Xuan Lim',   flag: '🇸🇬', partner: 'JACK Study Abroad',      property: 'Cornell Place',       checkin: '2026-07-28', stage: 'docs'       },
    { id: 'K106', name: 'Rui Xiang Goh',  flag: '🇸🇬', partner: 'theRightU',              property: 'Adelaide University', checkin: '2026-07-07', stage: 'checkedin'  },
  ],
  ngoc: [
    { id: 'K201', name: 'Minh Tuan Nguyen', flag: '🇻🇳', partner: 'IDP Vietnam',       property: 'Melbourne Central', checkin: '2026-07-07', stage: 'enquiry' },
    { id: 'K202', name: 'Thu Ha Tran',      flag: '🇻🇳', partner: 'Study Group Vietnam',property: 'Sydney Central',    checkin: '2026-07-14', stage: 'enquiry' },
    { id: 'K203', name: 'Duc Anh Le',       flag: '🇻🇳', partner: 'EduPath Vietnam',    property: 'Swanston',          checkin: '2026-07-21', stage: 'docs'    },
  ],
}

// ═════════════════════════════════════════════════════════════════════════════
// REMINDERS
// due format: YYYY-MM-DD
// recurrence: "One-off" | "Daily" | "Weekly" | "Monthly" | "Quarterly" | "Semester" | "Annual"
// priority:   "high" | "medium" | "low"
// ═════════════════════════════════════════════════════════════════════════════
const rem = (id, title, partner, due, recurrence, priority, done = false) =>
  ({ id, title, partner, due, recurrence, priority, done })

export const REMINDERS_INIT = {
  nicole: [
    rem(1, 'Commission reconciliation — University Living',    'University Living',   '2026-04-18', 'Monthly',   'high'),
    rem(2, 'Group block confirmation — AUG July intake',       'AUG',                 '2026-04-18', 'One-off',   'high'),
    rem(3, 'Send updated rate card to Casita',                 'Casita',              '2026-04-21', 'Quarterly', 'medium'),
    rem(4, 'Follow up: AECC Global agreement countersignature','AECC Global',         '2026-04-22', 'One-off',   'medium'),
    rem(5, 'Review SEA Outreach Tracker — Tier 1 contacts',   'Internal',            '2026-04-25', 'Weekly',    'low'),
    rem(6, 'Confirm July rooms — GEA SEA (28 students)',       'GEA SEA',             '2026-04-28', 'One-off',   'medium'),
    rem(7, 'Semester 2 rate briefing to all SEA partners',    'Internal',            '2026-05-05', 'Semester',  'low'),
    rem(8, 'Agreement renewal check — Austlink Education',    'Austlink Education',  '2026-05-12', 'Annual',    'low'),
    rem(9, 'Update held leasing notes in StarRez',            'Internal',            '2026-04-17', 'Weekly',    'low', true),
  ],
  minxuan: [
    rem(1, 'Weekly check-in — Overseas Academic Link',         'OAL',                '2026-04-18', 'Weekly',    'high'),
    rem(2, 'Confirm room allocation — Wei Jun Tan (theRightU)','theRightU',           '2026-04-21', 'One-off',   'high'),
    rem(3, 'Follow up: JACK Study Abroad — Sem 2 enquiries',  'JACK Study Abroad',   '2026-04-23', 'One-off',   'medium'),
    rem(4, 'Send Kensington info pack to OAL',                'OAL',                 '2026-04-25', 'One-off',   'medium'),
    rem(5, 'Review Singapore pipeline — Q2 targets',          'Internal',            '2026-04-28', 'Monthly',   'low'),
    rem(6, 'Agreement renewal — theRightU',                   'theRightU',           '2026-05-10', 'Annual',    'low'),
  ],
  ngoc: [
    rem(1, 'Onboarding call — IDP Vietnam introduction',       'IDP Vietnam',         '2026-04-18', 'One-off',   'high'),
    rem(2, 'Request StarRez credentials from IT',              'Internal',            '2026-04-18', 'One-off',   'high'),
    rem(3, 'Review Vietnam market briefing doc',               'Internal',            '2026-04-21', 'One-off',   'medium'),
    rem(4, 'Set up Study Group Vietnam partner meeting',       'Study Group Vietnam', '2026-04-25', 'One-off',   'medium'),
    rem(5, 'Complete Scape leasing training module',           'Internal',            '2026-04-28', 'One-off',   'low'),
  ],
}
