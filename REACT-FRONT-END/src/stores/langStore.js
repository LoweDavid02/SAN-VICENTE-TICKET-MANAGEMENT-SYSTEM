/**
 * Language store — EN / TL toggle.
 *
 * FIX: The `t()` function was previously stored inside Zustand which caused
 * components NOT to re-render when lang changed (function reference stayed same).
 *
 * Solution: Store only `lang` as reactive state. Export `useT()` hook that
 * subscribes to `lang` and returns a fresh translation function — this
 * guarantees React re-renders every component that calls useT() when lang changes.
 */

import { create } from 'zustand';

// ── Full translation dictionary ────────────────────────────────────────────
export const TRANSLATIONS = {
  en: {
    // ── Navigation ──────────────────────────────────────────────────────
    dashboard:        'Dashboard',
    analytics:        'Analytics',
    personnel:        'Personnel',
    requests:         'Requests',
    settings:         'Settings',
    faqs:             'FAQs',
    myDashboard:      'My Dashboard',
    submitRequest:    'Submit Request',
    myHistory:        'My History',
    myTasks:          'My Tasks',
    history:          'History',
    newReport:        'New Report',

    // ── Common actions ───────────────────────────────────────────────────
    signOut:          'Sign out',
    signIn:           'Sign in',
    profile:          'My Profile',
    welcome:          'Welcome back',
    loading:          'Loading…',
    save:             'Save Changes',
    cancel:           'Cancel',
    edit:             'Edit Profile',
    refresh:          'Refresh',
    search:           'Search',
    export:           'Export CSV',
    close:            'Close',
    confirm:          'Confirm',
    add:              'Add',
    assign:           'Assign',
    reassign:         'Reassign',
    update:           'Update',
    submit:           'Submit',
    back:             'Back',
    continue:         'Continue',
    done:             'Done',
    retry:            'Retry',

    // ── Ticket fields ────────────────────────────────────────────────────
    status:           'Status',
    severity:         'Severity',
    category:         'Category',
    location:         'Location',
    assignedTo:       'Assigned To',
    submitted:        'Submitted',
    updated:          'Last Updated',
    description:      'Description',
    updateStatus:     'Update Status',
    fieldNote:        'Field Note',
    evidence:         'Evidence',
    statusHistory:    'Status History',
    ticketDetail:     'Ticket Detail',
    reportedBy:       'Reported by',
    unassigned:       'Unassigned',
    noTickets:        'No tickets yet.',
    noTasks:          'No tasks match this filter.',
    noRequests:       'No requests match your filters.',

    // ── Status labels ────────────────────────────────────────────────────
    pending:          'Pending',
    underReview:      'Under Review',
    inProgress:       'In Progress',
    completed:        'Completed',
    rejected:         'Rejected',
    urgent:           'Urgent',

    // ── Severity labels ──────────────────────────────────────────────────
    high:             'High',
    medium:           'Medium',
    low:              'Low',

    // ── Portal names ─────────────────────────────────────────────────────
    adminPortal:      'Admin Portal',
    residentPortal:   'Resident Portal',
    personnelPortal:  'Personnel Portal',
    systemOversight:  'System Oversight',
    barangaySanVicente: 'Barangay San Vicente',
    fieldOperations:  'Field Operations',

    // ── Sign out modal ───────────────────────────────────────────────────
    signOutTitle:     'Sign out',
    signOutBody:      'Are you sure you want to sign out? Your active session will be terminated.',
    staySignedIn:     'Stay signed in',

    // ── Profile page ─────────────────────────────────────────────────────
    fullName:         'Full Name',
    email:            'Email Address',
    phone:            'Phone Number',
    address:          'Address',
    bio:              'Bio',
    memberSince:      'Member Since',
    accountDetails:   'Account Details',
    personalInfo:     'Personal Information',
    accountSecurity:  'Account Security',
    portal:           'Portal',
    barangay:         'Barangay',
    verified:         'Verified',

    // ── Submit request wizard ────────────────────────────────────────────
    whatIsIssue:      "What's the issue?",
    describeIssue:    'Describe the issue',
    locationSev:      'Location & Severity',
    reviewSubmit:     'Review & Submit',
    submitBtn:        'Submit Request',
    submitAnother:    'Submit Another',
    viewDashboard:    'View Dashboard',
    requestSubmitted: 'Request Submitted',
    trackingNumber:   'Your tracking number',
    uploadEvidence:   'Click to upload or drag & drop',
    uploadHint:       'PNG, JPG, WEBP, PDF · Max 10 MB each',
    addMore:          'Add more',
    sufficientDetail: '✓ Sufficient detail',
    minChars:         'chars minimum',

    // ── Dashboard ────────────────────────────────────────────────────────
    totalTickets:     'Total Tickets',
    pendingUrgent:    'Pending Urgent Issues',
    activePersonnel:  'Active Personnel',
    issueHeatmap:     'Issue Heatmap',
    deptWorkload:     'Department Workload',
    incidentLog:      'Priority Incident Log',
    incidentDensity:  'Incident Density',
    activeRequests:   'Active Requests',
    resolved:         'Resolved',
    avgResponse:      'Avg. Response',
    myActiveRequests: 'My Active Requests',
    resolutionProgress: 'Resolution progress',
    noRequestsYet:    'No requests yet.',
    submitFirst:      'Submit your first request',
    viewAllHistory:   'View all history',
    activeTasks:      'Active Tasks',
    viewAll:          'View All',
    viewCompleted:    'View completed',
    allCompleted:     'All tasks completed! Great work.',
    todayProgress:    "Today's Progress",
    onDuty:           'On Duty',
    allSystems:       '● All Systems Operational',

    // ── Notifications ────────────────────────────────────────────────────
    notifications:    'Notifications',
    markAllRead:      'Mark all read',
    newRequest:       'New request submitted',
    statusUpdated:    'Status updated',
    viewAll_notif:    'View all notifications →',

    // ── Settings ─────────────────────────────────────────────────────────
    systemInfo:       'System Information',
    quickLinks:       'Quick Links',
    notifPrefs:       'Notification Preferences',
    notifPrefsDesc:   'Control how and when you receive alerts from the system.',
    savePrefs:        'Save Preferences',
    prefsSaved:       'Preferences saved',
    prefsUpdated:     'Your notification preferences have been updated successfully.',

    // ── FAQ ──────────────────────────────────────────────────────────────
    faqTitle:         'Frequently Asked Questions',
    faqSearch:        'Search questions…',
    stillHaveQ:       'Still have questions?',
    contactOffice:    'Contact the Barangay San Vicente office directly.',
    noResults:        'No results found for',

    // ── Personnel page ───────────────────────────────────────────────────
    staffRegistered:  'staff members registered',
    addPersonnel:     'Add Personnel',
    editPersonnel:    'Edit Personnel',
    assignTicket:     'Assign Ticket',
    noUnassigned:     'No unassigned requests at this time.',
    selectMember:     'Select a personnel member to view details.',
    memberCount:      'member',
    members:          'members',
    noResults_p:      'No results found.',
    activeTickets:    'Active Tickets',
    rating:           'Rating',
    level:            'Level',
    department:       'Department',
    role:             'Role / Position',
    memberSince_p:    'Member Since',

    // ── History ──────────────────────────────────────────────────────────
    requestHistory:   'Request History',
    requestHistorySub:'All your submitted service requests and their current status',
    active:           'Active',
    allRequests:      'All Requests',
    records:          'records',

    // ── Language toggle ──────────────────────────────────────────────────
    switchToFilipino: 'Switch to Filipino',
    switchToEnglish:  'Switch to English',
    language:         'Language',
  },

  tl: {
    // ── Navigation ──────────────────────────────────────────────────────
    dashboard:        'Dashboard',
    analytics:        'Analytics',
    personnel:        'Mga Tauhan',
    requests:         'Mga Kahilingan',
    settings:         'Mga Setting',
    faqs:             'Mga Tanong',
    myDashboard:      'Aking Dashboard',
    submitRequest:    'Mag-submit ng Kahilingan',
    myHistory:        'Aking Kasaysayan',
    myTasks:          'Aking mga Gawain',
    history:          'Kasaysayan',
    newReport:        'Bagong Ulat',

    // ── Common actions ───────────────────────────────────────────────────
    signOut:          'Mag-sign out',
    signIn:           'Mag-sign in',
    profile:          'Aking Profile',
    welcome:          'Maligayang pagbabalik',
    loading:          'Naglo-load…',
    save:             'I-save ang Pagbabago',
    cancel:           'Kanselahin',
    edit:             'I-edit ang Profile',
    refresh:          'I-refresh',
    search:           'Maghanap',
    export:           'I-export CSV',
    close:            'Isara',
    confirm:          'Kumpirmahin',
    add:              'Idagdag',
    assign:           'Italaga',
    reassign:         'Muling Italaga',
    update:           'I-update',
    submit:           'Isumite',
    back:             'Bumalik',
    continue:         'Magpatuloy',
    done:             'Tapos na',
    retry:            'Subukan muli',

    // ── Ticket fields ────────────────────────────────────────────────────
    status:           'Katayuan',
    severity:         'Kalubhaan',
    category:         'Kategorya',
    location:         'Lokasyon',
    assignedTo:       'Itinalaga Kay',
    submitted:        'Isinumite',
    updated:          'Huling Na-update',
    description:      'Paglalarawan',
    updateStatus:     'I-update ang Katayuan',
    fieldNote:        'Tala sa Larangan',
    evidence:         'Katibayan',
    statusHistory:    'Kasaysayan ng Katayuan',
    ticketDetail:     'Detalye ng Ticket',
    reportedBy:       'Iniulat ni',
    unassigned:       'Walang Itinalaga',
    noTickets:        'Wala pang mga ticket.',
    noTasks:          'Walang gawain na tumutugma sa filter.',
    noRequests:       'Walang kahilingan na tumutugma sa iyong mga filter.',

    // ── Status labels ────────────────────────────────────────────────────
    pending:          'Nakabinbin',
    underReview:      'Sinusuri',
    inProgress:       'Isinasagawa',
    completed:        'Natapos',
    rejected:         'Tinanggihan',
    urgent:           'Kagyat',

    // ── Severity labels ──────────────────────────────────────────────────
    high:             'Mataas',
    medium:           'Katamtaman',
    low:              'Mababa',

    // ── Portal names ─────────────────────────────────────────────────────
    adminPortal:      'Admin Portal',
    residentPortal:   'Portal ng Residente',
    personnelPortal:  'Portal ng Tauhan',
    systemOversight:  'Pangangasiwa ng Sistema',
    barangaySanVicente: 'Barangay San Vicente',
    fieldOperations:  'Mga Operasyon sa Larangan',

    // ── Sign out modal ───────────────────────────────────────────────────
    signOutTitle:     'Mag-sign out',
    signOutBody:      'Sigurado ka bang gusto mong mag-sign out? Ang iyong aktibong sesyon ay matatapos.',
    staySignedIn:     'Manatiling naka-sign in',

    // ── Profile page ─────────────────────────────────────────────────────
    fullName:         'Buong Pangalan',
    email:            'Email Address',
    phone:            'Numero ng Telepono',
    address:          'Tirahan',
    bio:              'Maikling Paglalarawan',
    memberSince:      'Miyembro Mula',
    accountDetails:   'Mga Detalye ng Account',
    personalInfo:     'Personal na Impormasyon',
    accountSecurity:  'Seguridad ng Account',
    portal:           'Portal',
    barangay:         'Barangay',
    verified:         'Napatunayan',

    // ── Submit request wizard ────────────────────────────────────────────
    whatIsIssue:      'Ano ang problema?',
    describeIssue:    'Ilarawan ang problema',
    locationSev:      'Lokasyon at Kalubhaan',
    reviewSubmit:     'Suriin at Isumite',
    submitBtn:        'Isumite ang Kahilingan',
    submitAnother:    'Mag-submit pa',
    viewDashboard:    'Tingnan ang Dashboard',
    requestSubmitted: 'Naisumite ang Kahilingan',
    trackingNumber:   'Ang iyong tracking number',
    uploadEvidence:   'Mag-click para mag-upload o i-drag & drop',
    uploadHint:       'PNG, JPG, WEBP, PDF · Max 10 MB bawat isa',
    addMore:          'Magdagdag pa',
    sufficientDetail: '✓ Sapat na ang detalye',
    minChars:         'karakter ang minimum',

    // ── Dashboard ────────────────────────────────────────────────────────
    totalTickets:     'Kabuuang Ticket',
    pendingUrgent:    'Mga Kagyat na Nakabinbin',
    activePersonnel:  'Aktibong Tauhan',
    issueHeatmap:     'Mapa ng mga Isyu',
    deptWorkload:     'Workload ng Departamento',
    incidentLog:      'Log ng Mga Insidente',
    incidentDensity:  'Densidad ng Insidente',
    activeRequests:   'Aktibong Kahilingan',
    resolved:         'Nalutas',
    avgResponse:      'Avg. Tugon',
    myActiveRequests: 'Aking mga Aktibong Kahilingan',
    resolutionProgress: 'Progreso ng resolusyon',
    noRequestsYet:    'Wala pang mga kahilingan.',
    submitFirst:      'Isumite ang iyong unang kahilingan',
    viewAllHistory:   'Tingnan ang lahat ng kasaysayan',
    activeTasks:      'Mga Aktibong Gawain',
    viewAll:          'Tingnan Lahat',
    viewCompleted:    'Tingnan ang natapos',
    allCompleted:     'Lahat ng gawain ay natapos na! Magaling!',
    todayProgress:    'Progreso Ngayon',
    onDuty:           'Nasa Serbisyo',
    allSystems:       '● Lahat ng Sistema ay Gumagana',

    // ── Notifications ────────────────────────────────────────────────────
    notifications:    'Mga Abiso',
    markAllRead:      'Markahan lahat bilang nabasa',
    newRequest:       'Bagong kahilingan na isinumite',
    statusUpdated:    'Na-update ang katayuan',
    viewAll_notif:    'Tingnan ang lahat ng abiso →',

    // ── Settings ─────────────────────────────────────────────────────────
    systemInfo:       'Impormasyon ng Sistema',
    quickLinks:       'Mabilis na mga Link',
    notifPrefs:       'Mga Kagustuhan sa Abiso',
    notifPrefsDesc:   'Kontrolin kung paano at kailan ka makakatanggap ng mga alerto mula sa sistema.',
    savePrefs:        'I-save ang Mga Kagustuhan',
    prefsSaved:       'Nai-save ang mga kagustuhan',
    prefsUpdated:     'Matagumpay na na-update ang iyong mga kagustuhan sa abiso.',

    // ── FAQ ──────────────────────────────────────────────────────────────
    faqTitle:         'Mga Madalas na Itanong',
    faqSearch:        'Maghanap ng mga tanong…',
    stillHaveQ:       'May mga katanungan pa rin?',
    contactOffice:    'Makipag-ugnayan sa tanggapan ng Barangay San Vicente.',
    noResults:        'Walang nahanap para sa',

    // ── Personnel page ───────────────────────────────────────────────────
    staffRegistered:  'miyembro ng kawani ang nairehistro',
    addPersonnel:     'Magdagdag ng Tauhan',
    editPersonnel:    'I-edit ang Tauhan',
    assignTicket:     'Italaga ang Ticket',
    noUnassigned:     'Walang mga kahilingang hindi pa naitatalaga sa kasalukuyan.',
    selectMember:     'Pumili ng miyembro ng tauhan para makita ang mga detalye.',
    memberCount:      'miyembro',
    members:          'mga miyembro',
    noResults_p:      'Walang nahanap.',
    activeTickets:    'Mga Aktibong Ticket',
    rating:           'Rating',
    level:            'Antas',
    department:       'Departamento',
    role:             'Papel / Posisyon',
    memberSince_p:    'Miyembro Mula',

    // ── History ──────────────────────────────────────────────────────────
    requestHistory:   'Kasaysayan ng Kahilingan',
    requestHistorySub:'Lahat ng iyong mga isinumiteng kahilingan at ang kanilang kasalukuyang katayuan',
    active:           'Aktibo',
    allRequests:      'Lahat ng Kahilingan',
    records:          'mga rekord',

    // ── Language toggle ──────────────────────────────────────────────────
    switchToFilipino: 'Lumipat sa Filipino',
    switchToEnglish:  'Lumipat sa Ingles',
    language:         'Wika',
  },
};

// ── Zustand store — only stores `lang` as reactive state ──────────────────
const useLangStore = create((set) => ({
  lang: localStorage.getItem('app_lang') || 'en',
  setLang: (lang) => {
    localStorage.setItem('app_lang', lang);
    set({ lang });
  },
}));

export default useLangStore;

/**
 * useT() — the correct way to use translations.
 *
 * This hook subscribes to `lang` state changes, so every component
 * that calls useT() will re-render when the language is toggled.
 *
 * Usage:
 *   const { t, lang } = useT();
 *   <button>{t('signOut')}</button>
 */
export function useT() {
  const { lang, setLang } = useLangStore();
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const t = (key) => dict[key] ?? TRANSLATIONS.en[key] ?? key;

  return { t, lang, setLang };
}

// Backwards-compatible alias
export const useLang = useT;
