// ── KPI ──────────────────────────────────────────────────
export const kpiData = {
  totalTickets:    { value: 1284,      change: '+12.5%', trend: 'up',   note: 'vs last month'              },
  pendingUrgent:   { value: 42,        label: 'Critical', note: 'Requires immediate attention'             },
  avgResolution:   { value: '14.2 hrs',change: '−2.1 hrs',trend: 'down', note: 'Improving efficiency'     },
  activePersonnel: { value: 86,        change: '+3',      trend: 'up',   note: 'on duty today'             },
}

// ── Departments ───────────────────────────────────────────
export const departments = [
  { name: 'Social Services',  tickets: 42, capacity: 95, team: 'Distribution',  color: '#ef4444' },
  { name: 'Public Safety',    tickets: 18, capacity: 54, team: 'Night Watch',   color: '#3b82f6' },
  { name: 'Waste Management', tickets: 24, capacity: 82, team: 'Team A, B, D',  color: '#14b8a6' },
  { name: 'Infrastructure',   tickets: 8,  capacity: 30, team: 'Maintenance',   color: '#f59e0b' },
]

// ── Incidents ─────────────────────────────────────────────
export const incidents = [
  { id:'INC-001', title:'Flash Flood Warning – Zone 4',       time:'14 mins ago',  severity:'High',   status:'Urgent',      assignedTo:'Disaster Response Team', category:'Public Safety',    icon:'🏠' },
  { id:'INC-002', title:'Streetlight Outage – San Jose St.',  time:'2 hrs ago',    severity:'Medium', status:'In Progress', assignedTo:'Maintenance (Team C)',   category:'Infrastructure',   icon:'⚡' },
  { id:'INC-003', title:'Senior Wellness Program Enrollment', time:'Batch Update', severity:'Low',    status:'Resolved',    assignedTo:'Admin Office',           category:'Social Services',  icon:'🛡️' },
  { id:'INC-004', title:'Road Damage – Purok 3 Entrance',     time:'5 hrs ago',    severity:'High',   status:'Urgent',      assignedTo:'Public Works Team',      category:'Infrastructure',   icon:'🛣️' },
  { id:'INC-005', title:'Garbage Overflow – Market Area',     time:'1 day ago',    severity:'Medium', status:'In Progress', assignedTo:'Waste Team A',           category:'Waste Management', icon:'🗑️' },
  { id:'INC-006', title:'Drainage Clog – Zone 2',             time:'3 hrs ago',    severity:'Medium', status:'Pending',     assignedTo:'Unassigned',             category:'Infrastructure',   icon:'💧' },
]

// ── Monthly trends ────────────────────────────────────────
export const monthlyTrends = [
  { month:'Jul', tickets: 820, resolved: 790  },
  { month:'Aug', tickets: 940, resolved: 880  },
  { month:'Sep', tickets: 870, resolved: 840  },
  { month:'Oct', tickets:1100, resolved: 980  },
  { month:'Nov', tickets:1284, resolved:1100  },
]

// ── Category breakdown ────────────────────────────────────
export const categoryBreakdown = [
  { name:'Infrastructure',  value: 38, color:'#14b8a6' },
  { name:'Social Services', value: 28, color:'#3b82f6' },
  { name:'Waste Mgmt',      value: 20, color:'#f59e0b' },
  { name:'Public Safety',   value: 14, color:'#ef4444' },
]

// ── Resolution by dept ────────────────────────────────────
export const resolutionData = [
  { dept:'Infrastructure', avg: 18.4 },
  { dept:'Waste Mgmt',     avg: 12.1 },
  { dept:'Public Safety',  avg:  8.7 },
  { dept:'Social Svc',     avg: 22.0 },
]

// ── Heatmap zones ─────────────────────────────────────────
export const heatmapZones = [
  { zone:'A', label:'Zone 1 – Purok Norte',  count: 12, intensity: 2 },
  { zone:'B', label:'Zone 2 – Market Area',  count: 28, intensity: 4 },
  { zone:'C', label:'Zone 3 – Rizal St.',    count:  5, intensity: 1 },
  { zone:'D', label:'Zone 4 – Flood-prone',  count: 34, intensity: 5 },
  { zone:'E', label:'Zone 5 – Purok Sur',    count: 19, intensity: 3 },
  { zone:'F', label:'Zone 6 – San Jose',     count: 22, intensity: 3 },
  { zone:'G', label:'Zone 7 – East Side',    count:  7, intensity: 1 },
  { zone:'H', label:'Zone 8 – Gomez Ave.',   count: 31, intensity: 5 },
  { zone:'I', label:'Zone 9 – Block 4',      count: 10, intensity: 2 },
  { zone:'J', label:'Zone 10 – P. Burgos',   count: 25, intensity: 4 },
]

// ── Personnel ─────────────────────────────────────────────
export const personnel = [
  { id:'P001', name:'Cpt. Ramon Dela Cruz',  role:'Barangay Captain',       dept:'Admin',            status:'Active',   tickets:0, level:4, avatar:'RC', joined:'Jan 2020', rating:4.9 },
  { id:'P002', name:'Engr. Elias Santos',    role:'Field Engineer',         dept:'Infrastructure',   status:'Active',   tickets:6, level:3, avatar:'ES', joined:'Mar 2021', rating:4.8 },
  { id:'P003', name:'Rosa Cruz',             role:'Sanitation Officer',     dept:'Waste Management', status:'Active',   tickets:3, level:2, avatar:'RC', joined:'Jun 2021', rating:4.5 },
  { id:'P004', name:'Ben Reyes',             role:'Road Crew Lead',         dept:'Infrastructure',   status:'Active',   tickets:4, level:2, avatar:'BR', joined:'Sep 2021', rating:4.2 },
  { id:'P005', name:'Maria Dela Torre',      role:'Social Worker',          dept:'Social Services',  status:'Off Duty', tickets:1, level:2, avatar:'MD', joined:'Dec 2021', rating:4.6 },
  { id:'P006', name:'Luis Bautista',         role:'Waste Coordinator',      dept:'Waste Management', status:'Active',   tickets:5, level:2, avatar:'LB', joined:'Feb 2022', rating:3.9 },
  { id:'P007', name:'Ana Fernandez',         role:'Health Officer',         dept:'Social Services',  status:'Active',   tickets:8, level:3, avatar:'AF', joined:'Apr 2022', rating:4.7 },
  { id:'P008', name:'Sgt. Pedro Villanueva', role:'Night Watch Lead',       dept:'Public Safety',    status:'Active',   tickets:2, level:3, avatar:'PV', joined:'Jul 2022', rating:4.4 },
  { id:'P009', name:'Lyn Ocampo',            role:'Admin Officer',          dept:'Admin',            status:'Active',   tickets:0, level:2, avatar:'LO', joined:'Nov 2022', rating:4.3 },
  { id:'P010', name:'Jun Magpayo',           role:'Disaster Response Lead', dept:'Public Safety',    status:'On Call',  tickets:4, level:3, avatar:'JM', joined:'Jan 2023', rating:4.6 },
]

// ── Requests ──────────────────────────────────────────────
export const requests = [
  { id:'REQ-2025-0041', title:'Broken streetlight – Rizal St.',       category:'Infrastructure',   severity:'High',   status:'In Progress',  resident:'Juan dela Cruz',    submitted:'Apr 10, 2025', updated:'Apr 13, 2:30 PM', assigned:'Engr. Elias Santos'      },
  { id:'REQ-2025-0040', title:'Clogged drainage – P. Burgos',         category:'Infrastructure',   severity:'High',   status:'Under Review', resident:'Maria Santos',      submitted:'Apr 9, 2025',  updated:'Apr 12, 9:00 AM', assigned:'Ben Reyes'               },
  { id:'REQ-2025-0039', title:'Pothole – Gomez Ave.',                  category:'Infrastructure',   severity:'Medium', status:'In Progress',  resident:'Pedro Ramos',       submitted:'Apr 8, 2025',  updated:'Apr 11, 4:15 PM', assigned:'Ben Reyes'               },
  { id:'REQ-2025-0038', title:'Garbage overflow – Block 4',            category:'Waste Management', severity:'Medium', status:'Pending',      resident:'Lisa Reyes',        submitted:'Apr 7, 2025',  updated:'Apr 10, 7:00 AM', assigned:'Unassigned'              },
  { id:'REQ-2025-0037', title:'Flash flood risk – Zone 4',             category:'Public Safety',    severity:'High',   status:'Urgent',       resident:'Community Report',  submitted:'Apr 14, 2025', updated:'Apr 14, 8:14 AM', assigned:'Disaster Response Team'  },
  { id:'REQ-2025-0036', title:'Senior wellness enrollment – Batch 5',  category:'Social Services',  severity:'Low',    status:'Resolved',     resident:'Admin Office',      submitted:'Apr 6, 2025',  updated:'Apr 11, 2:00 PM', assigned:'Ana Fernandez'           },
  { id:'REQ-2025-0035', title:'Noise complaint – Purok 2',             category:'Public Safety',    severity:'Low',    status:'Pending',      resident:'Nora Bautista',     submitted:'Apr 5, 2025',  updated:'Apr 5, 6:00 PM',  assigned:'Unassigned'              },
  { id:'REQ-2025-0034', title:'Road damage – Purok 3 entrance',        category:'Infrastructure',   severity:'High',   status:'Urgent',       resident:'Barangay Watch',    submitted:'Apr 4, 2025',  updated:'Apr 14, 7:50 AM', assigned:'Engr. Elias Santos'      },
]
