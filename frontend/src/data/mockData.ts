import {
  MaintenanceTaskItem,
  ConflictItem,
  BlockWindowItem,
  TrainScheduleItem,
  AssetItem,
  MaintenancePlanInfo,
  ComparisonMetric
} from '../types/railblock';

export const SECTIONS = [
  // Western Railway (WR)
  'Churchgate – Mumbai Central Fast',
  'Mumbai Central – Bandra Fast',
  'Bandra – Borivali Fast',
  'Borivali – Virar Fast',
  'Virar – Dahanu Road Mainline',
  // Harbour Railway (CR Harbour Line)
  'CSMT – Vadala Road Harbour',
  'Vadala Road – Kurla Harbour',
  'Kurla – Vashi Harbour',
  'Vashi – Panvel Harbour',
  'Vadala Road – Andheri Harbour Branch',
  // Central Railway Mainline (CR Main)
  'Kalyan – Kasara Up',
  'Kalyan – Kasara Down',
  'Thane – Dombivli Fast',
  'Thane – Dombivli Slow',
  'Kasara – Igatpuri Ghat',
  'CSMT – Kurla Harbor'
];

export const MOCK_TASKS: MaintenanceTaskItem[] = [
  // --- Western Railway (WR) Tasks ---
  {
    id: 'TSK-WR-101',
    rank: 1,
    title: 'Emergency USFD Rail Flaw Detection & Weld Renewal (Down Fast Line)',
    description: 'IMR severe transverse internal flaw detected by ultrasonic testing trolley at KM 14/18 between Bandra and Khar. Immediate 20 km/h speed restriction in effect.',
    department: 'ENGINEERING',
    asset_id: 'TRK-WR-BND-01',
    section: 'Mumbai Central – Bandra Fast',
    duration_minutes: 180,
    criticality: 5,
    urgency: 5,
    overdue_days: 4,
    priority_score: 98.2,
    earliest_start: '2026-10-20 01:00',
    deadline: '2026-10-20 06:00',
    status: 'IN_PROGRESS',
    required_block_type: 'Traffic Block',
    breakdown: { criticality: 35, urgency: 35, overdue: 15, operational_impact: 13.2 },
    linked_defects: ['DEF-WR-104: Transverse rail head fissure', 'DEF-WR-107: Weld toe microcrack'],
    activity_log: [
      { timestamp: '19 Oct 18:20', actor: 'DEN (P-Way) Mumbai Central', message: 'Safety caution order imposed, emergency block requested' },
      { timestamp: '19 Oct 19:10', actor: 'Admin Controller', message: 'Assigned to P-Way Maintenance Gang #12 & Flash-Butt Rig' }
    ],
    assigned_slot: '20 Oct 01:30 - 04:30',
    assigned_reason: 'Assigned to Western Railway night fast line mega-block',
    assigned_crew: 'P-Way Maintenance Gang #12',
    assigned_equipment: 'Digital USFD Double Rail Ultrasonic Tester',
    supervisor: 'R. K. Sharma (SSE P-Way)',
    sector_status: 'IN_PROGRESS',
    co_requisite_sectors: ['SIGNAL_TELECOMMUNICATION'],
    safety_protocol: 'Banner flags at 600m, Detonators at 1200m, Caution order 20 km/h',
    speed_restriction: '20 km/h Caution Order Active'
  },
  {
    id: 'TSK-WR-102',
    rank: 2,
    title: '25kV Catenary Dropper & Contact Wire Height Profiling',
    description: 'High temperature catenary sag and dropper slackness identified under tower wagon inspection on Borivali–Virar 5th line.',
    department: 'TRACTION_DISTRIBUTION',
    asset_id: 'OHE-WR-BVI-12',
    section: 'Borivali – Virar Fast',
    duration_minutes: 150,
    criticality: 4,
    urgency: 4,
    overdue_days: 2,
    priority_score: 89.6,
    earliest_start: '2026-10-20 01:30',
    deadline: '2026-10-21 05:00',
    status: 'SCHEDULED',
    required_block_type: 'Power & Traffic Block',
    breakdown: { criticality: 28, urgency: 25, overdue: 18, operational_impact: 18.6 },
    linked_defects: ['DEF-WR-219: Contact wire dropper elongation > 4mm'],
    activity_log: [
      { timestamp: '19 Oct 11:00', actor: 'AEE (TRD) Borivali', message: 'Pantograph damage prevention protocol initiated' },
      { timestamp: '19 Oct 14:00', actor: 'Admin Controller', message: 'Tower Wagon TW-204 scheduled with Borivali TRD Crew' }
    ],
    assigned_slot: '20 Oct 02:00 - 04:30',
    assigned_reason: 'Night corridor window granted by Section Controller',
    assigned_crew: '8-Wheeler Tower Wagon Crew #108',
    assigned_equipment: '8-Wheeler DETW Diesel-Electric Tower Wagon #TW-204',
    supervisor: 'V. Patil (SSE TRD / OHE)',
    sector_status: 'PERMIT_ISSUED',
    safety_protocol: '25kV feeder isolated, discharge earth rods placed on both sides',
    power_isolation: '25kV Feeder BVI-V1 Isolated'
  },
  {
    id: 'TSK-WR-103',
    rank: 3,
    title: 'Borivali North Diamond Crossover 102A/B Point Machine Overhaul',
    description: 'Switch throw time exceeding 4.8 seconds on facing point lock. Internal motor slip clutch lubrication and lock bar testing.',
    department: 'SIGNAL_TELECOMMUNICATION',
    asset_id: 'PM-WR-BVI-102',
    section: 'Borivali – Virar Fast',
    duration_minutes: 90,
    criticality: 4,
    urgency: 3,
    overdue_days: 1,
    priority_score: 82.4,
    earliest_start: '2026-10-20 02:00',
    deadline: '2026-10-22 05:00',
    status: 'PENDING',
    required_block_type: 'Traffic & S&T Disconnection Block',
    breakdown: { criticality: 28, urgency: 20, overdue: 12, operational_impact: 22.4 },
    linked_defects: ['DEF-WR-301: Switch throw time 4.8s (limit 4.0s)'],
    activity_log: [{ timestamp: '19 Oct 10:05', actor: 'SSE (S&T) Borivali', message: 'Point failure log reviewed' }],
    assigned_crew: 'Point Machine Testing & Overhaul Team',
    assigned_equipment: 'Digital Point Machine Throw & Current Analyzer (DPT-90)',
    supervisor: 'K. Venkat (SSE Signal)',
    sector_status: 'ASSIGNED',
    co_requisite_sectors: ['ENGINEERING'],
    safety_protocol: 'SI-420 Disconnection Notice served to Station Master, point clamped and padlocked',
    signal_disconnection: 'Form SI-420 Signed & Logged'
  },

  // --- Harbour Railway (CR Harbour Line) Tasks ---
  {
    id: 'TSK-HR-201',
    rank: 4,
    title: 'Vashi Sea Creek Bridge No. 34 Structural Bearings & Track Anchor Inspection',
    description: 'Saline environment corrosion check on steel girder baseplates and expansion joints over Thane Creek tidal waters.',
    department: 'ENGINEERING',
    asset_id: 'BRG-HR-VSH-34',
    section: 'Kurla – Vashi Harbour',
    duration_minutes: 210,
    criticality: 5,
    urgency: 4,
    overdue_days: 6,
    priority_score: 94.7,
    earliest_start: '2026-10-20 01:15',
    deadline: '2026-10-21 05:00',
    status: 'SCHEDULED',
    required_block_type: 'Track & Structural Safety Block',
    breakdown: { criticality: 35, urgency: 28, overdue: 18, operational_impact: 13.7 },
    linked_defects: ['DEF-HR-88: Tidal spray corrosion on bridge girder no. 4', 'DEF-HR-91: Guard rail bolt loosening'],
    activity_log: [
      { timestamp: '19 Oct 16:40', actor: 'Executive Engineer Bridges (Harbour)', message: 'Mandatory pre-monsoon bridge rehabilitation requisition' },
      { timestamp: '19 Oct 19:30', actor: 'Admin Controller', message: 'Assigned to Harbour Bridge Structural Squad' }
    ],
    assigned_crew: 'Harbour Bridge Structural Rehabilitation Squad',
    assigned_equipment: 'Plasser BCM-14 Ballast Cleaning Machine',
    supervisor: 'M. Deshmukh (ADEN Bridges)',
    sector_status: 'ASSIGNED',
    safety_protocol: 'Speed limit 30 km/h, Tidal wave monitor active, Life jackets equipped'
  },
  {
    id: 'TSK-HR-202',
    rank: 5,
    title: 'Sandhurst Road Elevated Viaduct 25kV OHE Neutral Section Isolation',
    description: 'PTFE ceramic neutral section insulator cleaning and contact wire tension calibration on the elevated Harbour double-decker track.',
    department: 'TRACTION_DISTRIBUTION',
    asset_id: 'OHE-HR-SND-08',
    section: 'CSMT – Vadala Road Harbour',
    duration_minutes: 120,
    criticality: 4,
    urgency: 4,
    overdue_days: 3,
    priority_score: 88.5,
    earliest_start: '2026-10-20 01:30',
    deadline: '2026-10-21 05:00',
    status: 'PENDING',
    required_block_type: 'Power Block',
    breakdown: { criticality: 28, urgency: 28, overdue: 14, operational_impact: 18.5 },
    linked_defects: ['DEF-HR-120: Neutral section insulator pollution flashover risk'],
    activity_log: [{ timestamp: '19 Oct 12:30', actor: 'AEE (TRD) Harbour', message: 'Power block requisition submitted' }],
    assigned_crew: 'Emergency OHE Breakdown & Wire Tension Gang',
    assigned_equipment: 'Heavy Discharge Grounding Rod Set (25kV Rated)',
    supervisor: 'S. Ramanathan (AEE Traction)',
    sector_status: 'REQUISITIONED',
    safety_protocol: 'PTW required, 25kV Feeder de-energized, earthing rods locked'
  },
  {
    id: 'TSK-HR-203',
    rank: 6,
    title: 'Wadala Junction Electronic Interlocking Dual Route Standby Switchover Drill',
    description: 'High-density branch junction interlocking failover drill between Harbour Main (CSMT-Panvel) and Western Connection (Vadala-Goregaon).',
    department: 'SIGNAL_TELECOMMUNICATION',
    asset_id: 'SIG-HR-WDL-01',
    section: 'Vadala Road – Andheri Harbour Branch',
    duration_minutes: 75,
    criticality: 4,
    urgency: 3,
    overdue_days: 1,
    priority_score: 81.0,
    earliest_start: '2026-10-20 02:00',
    deadline: '2026-10-22 04:30',
    status: 'PENDING',
    required_block_type: 'S&T Disconnection Block',
    breakdown: { criticality: 28, urgency: 20, overdue: 10, operational_impact: 23.0 },
    linked_defects: ['DEF-HR-133: Standby CPU sync latency alarm'],
    activity_log: [{ timestamp: '19 Oct 09:40', actor: 'SSE (Signal) Wadala', message: 'Failover drill scheduled' }],
    assigned_crew: 'Electronic Interlocking (EI) Squad Alpha',
    assigned_equipment: 'Optical Time Domain Reflectometer (OTDR) Fiber Unit',
    supervisor: 'P. Banerjee (ASTE Suburban)',
    sector_status: 'PERMIT_ISSUED',
    safety_protocol: 'Station Master counter-signature on SI-420 memo'
  },
  {
    id: 'TSK-2043',
    rank: 1,
    title: 'Emergency Contact Wire Replacement',
    description: 'Catastrophic wear detected on 25kV contact wire near mast KYN-204/12. Sparking reported by loco pilot of Train 12127.',
    department: 'TRACTION_DISTRIBUTION',
    asset_id: 'OHE-KYN-118',
    section: 'Kalyan – Kasara Up',
    duration_minutes: 240,
    criticality: 5,
    urgency: 5,
    overdue_days: 14,
    priority_score: 96.8,
    earliest_start: '2026-10-20 01:00',
    deadline: '2026-10-21 05:00',
    status: 'IN_PROGRESS',
    required_block_type: 'Power & Traffic Block',
    breakdown: { criticality: 35, urgency: 30, overdue: 20, operational_impact: 11.8 },
    linked_defects: ['DEF-891: Contact wire groove wear > 3.2mm', 'DEF-894: Insulator flashover sign'],
    activity_log: [
      { timestamp: '19 Oct 14:30', actor: 'AEE (TRD) Kalyan', message: 'Urgent block requisition escalated' },
      { timestamp: '19 Oct 09:15', actor: 'Automated Diagnostic', message: 'OHE inspection car marked severity critical' },
      { timestamp: '19 Oct 19:40', actor: 'Admin Controller', message: 'Assigned to Kalyan Power House Crew with Tensioning Rig' }
    ],
    assigned_slot: '21 Oct 01:30 - 05:30',
    assigned_reason: 'Night mega window alignment; minimizes express train cancellations',
    assigned_crew: 'Traction Sub-Station & Feeder Crew',
    assigned_equipment: 'Hydraulic Contact Wire Tensioning Puller & Calibrator',
    supervisor: 'G. N. Chari (TPC In-Charge)',
    sector_status: 'IN_PROGRESS',
    co_requisite_sectors: ['ENGINEERING'],
    safety_protocol: 'Full 25kV Feeder Trip, Grounding jumpers placed, Section controller cautioned',
    power_isolation: 'KYN 25kV Up Main Isolated'
  },
  {
    id: 'TSK-2044',
    rank: 2,
    title: 'Ultrasonic Rail Flaw Detection (USFD) & Rail Renewal',
    description: 'Internal transverse fissure identified at weld point KM 48/16. Immediate 30 km/h caution order active.',
    department: 'ENGINEERING',
    asset_id: 'TRK-TNA-045',
    section: 'Thane – Dombivli Fast',
    duration_minutes: 180,
    criticality: 5,
    urgency: 4,
    overdue_days: 11,
    priority_score: 92.4,
    earliest_start: '2026-10-20 02:00',
    deadline: '2026-10-21 06:00',
    status: 'SCHEDULED',
    required_block_type: 'Traffic Block (Up Fast)',
    breakdown: { criticality: 35, urgency: 25, overdue: 18, operational_impact: 14.4 },
    linked_defects: ['DEF-772: Flaw echo detected at rail head depth 12mm'],
    activity_log: [
      { timestamp: '18 Oct 18:20', actor: 'DEN (Central) Mumbai', message: 'Approved 3-hour track possession' }
    ],
    assigned_slot: '20 Oct 02:15 - 05:15',
    assigned_reason: 'Non-peak suburban curfew window'
  },
  {
    id: 'TSK-1982',
    rank: 3,
    title: 'Electronic Interlocking Axle Counter Calibration',
    description: 'Intermittent track reset failures during heavy rain at Diva junction crossover.',
    department: 'SIGNAL_TELECOMMUNICATION',
    asset_id: 'SIG-DIVA-12',
    section: 'Thane – Dombivli Slow',
    duration_minutes: 120,
    criticality: 4,
    urgency: 4,
    overdue_days: 8,
    priority_score: 87.5,
    earliest_start: '2026-10-20 00:30',
    deadline: '2026-10-22 04:00',
    status: 'PENDING',
    required_block_type: 'Signaling Disconnection Block',
    breakdown: { criticality: 28, urgency: 24, overdue: 15, operational_impact: 20.5 },
    linked_defects: ['DEF-610: Head coil inductance jitter beyond 15% tolerance'],
    activity_log: [
      { timestamp: '19 Oct 11:00', actor: 'SSE (Signal) Thane', message: 'Disconnection notice issued to Station Master' }
    ]
  },
  {
    id: 'TSK-2019',
    rank: 4,
    title: 'Cantilever Overhaul & Dropper Recalibration',
    description: 'Dynamic pantograph oscillations noted at KM 62/4. Adjust droppers to maintain 5.5m stagger.',
    department: 'TRACTION_DISTRIBUTION',
    asset_id: 'OHE-TNA-202',
    section: 'Thane – Dombivli Fast',
    duration_minutes: 210,
    criticality: 4,
    urgency: 3,
    overdue_days: 6,
    priority_score: 81.2,
    earliest_start: '2026-10-21 01:00',
    deadline: '2026-10-23 05:00',
    status: 'SCHEDULED',
    required_block_type: 'Power Block',
    breakdown: { criticality: 26, urgency: 20, overdue: 14, operational_impact: 21.2 },
    linked_defects: ['DEF-540: Loose stay arm bracket on portal mast'],
    activity_log: [
      { timestamp: '17 Oct 16:00', actor: 'TRD Section Supervisor', message: 'Tower wagon arranged from Kalyan depot' }
    ],
    assigned_slot: '22 Oct 01:30 - 05:00',
    assigned_reason: 'Combined shadow block with track tamping'
  },
  {
    id: 'TSK-2051',
    rank: 5,
    title: 'Deep Screening & Track Tamping (CSM-09 Machine)',
    description: 'Ballast fouling index exceeds 42% in Kasara ghat section. Restores drainage and track geometry.',
    department: 'ENGINEERING',
    asset_id: 'TRK-KAS-089',
    section: 'Kasara – Igatpuri Ghat',
    duration_minutes: 300,
    criticality: 4,
    urgency: 3,
    overdue_days: 5,
    priority_score: 79.0,
    earliest_start: '2026-10-20 23:00',
    deadline: '2026-10-24 05:00',
    status: 'PENDING',
    required_block_type: 'Integrated Mega Block',
    breakdown: { criticality: 25, urgency: 18, overdue: 12, operational_impact: 24 },
    linked_defects: ['DEF-402: Ballast caking causing localized waterlogging'],
    activity_log: [
      { timestamp: '18 Oct 14:00', actor: 'PWI Kasara', message: 'Ballast train stabled at Kasara siding' }
    ]
  },
  {
    id: 'TSK-2035',
    rank: 6,
    title: 'Point Machine 114B Motor & Gearbox Overhaul',
    description: 'Switch detection contact chatter during route reversal at Kalyan yard neck.',
    department: 'SIGNAL_TELECOMMUNICATION',
    asset_id: 'PM-KYN-114B',
    section: 'Kalyan – Kasara Down',
    duration_minutes: 150,
    criticality: 4,
    urgency: 3,
    overdue_days: 4,
    priority_score: 75.6,
    earliest_start: '2026-10-21 00:00',
    deadline: '2026-10-24 04:00',
    status: 'IN_PROGRESS',
    required_block_type: 'Point Disconnection Block',
    breakdown: { criticality: 24, urgency: 18, overdue: 10, operational_impact: 23.6 },
    linked_defects: ['DEF-388: Lubricant oxidation in gear assembly'],
    activity_log: [
      { timestamp: '19 Oct 20:00', actor: 'SSE Point Machines', message: 'Shift maintenance crew dispatched' }
    ]
  },
  {
    id: 'TSK-2060',
    rank: 7,
    title: 'Substation Transformer 25kV Circuit Breaker Servicing',
    description: 'Routine SF6 gas pressure test and contact resistance measurement at Dombivli feeding post.',
    department: 'TRACTION_DISTRIBUTION',
    asset_id: 'TRD-DOM-FP1',
    section: 'Thane – Dombivli Slow',
    duration_minutes: 180,
    criticality: 3,
    urgency: 3,
    overdue_days: 3,
    priority_score: 71.4,
    earliest_start: '2026-10-22 01:00',
    deadline: '2026-10-25 05:00',
    status: 'SCHEDULED',
    required_block_type: 'Traction Substation Isolation',
    breakdown: { criticality: 20, urgency: 18, overdue: 8, operational_impact: 25.4 },
    linked_defects: [],
    activity_log: [
      { timestamp: '18 Oct 12:00', actor: 'Chief Traction Controller', message: 'Cross-feed arranged from Kalwa TSS' }
    ],
    assigned_slot: '23 Oct 01:00 - 04:00',
    assigned_reason: 'Alternative feed line verified with Kalwa TSS'
  },
  {
    id: 'TSK-2011',
    rank: 8,
    title: 'Harbor Line Optical Fiber Cable Splicing',
    description: 'Re-routing telecom trunk cable affected by road overbridge widening near Kurla.',
    department: 'SIGNAL_TELECOMMUNICATION',
    asset_id: 'CBL-KURLA-04',
    section: 'CSMT – Kurla Harbor',
    duration_minutes: 180,
    criticality: 3,
    urgency: 2,
    overdue_days: 2,
    priority_score: 68.9,
    earliest_start: '2026-10-22 00:30',
    deadline: '2026-10-26 04:30',
    status: 'PENDING',
    required_block_type: 'Trackside Non-Traffic Block',
    breakdown: { criticality: 18, urgency: 15, overdue: 6, operational_impact: 29.9 },
    linked_defects: ['DEF-290: Micro-bend optical attenuation 0.4 dB/km'],
    activity_log: [
      { timestamp: '19 Oct 15:45', actor: 'SSE Telecom Kurla', message: 'Fiber test kit calibrated' }
    ]
  }
];

export const MOCK_CONFLICTS: ConflictItem[] = [
  {
    id: 'CONF-101',
    type: 'OVERLAP',
    severity: 'CRITICAL',
    title: 'Simultaneous Track Tamping vs OHE Re-cabling',
    description: 'TSK-2043 (OHE wire renewal) and TSK-2044 (USFD track renewal) both requested possession of Kalyan–Kasara Up line between 01:30 and 04:30 on 21 Oct.',
    involved_tasks: ['TSK-2043', 'TSK-2044'],
    section: 'Kalyan – Kasara Up',
    time: '21 Oct 01:30 – 04:30',
    timeline_clash: {
      taskA: 'TSK-2043 (TRD Wire Replacement 240m)',
      taskB: 'TSK-2044 (Track Tamping 180m)',
      timeSpan: '01:30 - 04:30 (3h overlap)'
    },
    cause_explanation: 'Heavy track machinery (CSM-09) cannot operate underneath live or grounding OHE ladder wagons within 500m due to clearance rules.',
    suggested_resolutions: [
      {
        id: 'RES-1',
        title: 'Combine into Integrated Joint Mega-Block',
        impact: 'Zero train cancellations; increases crew coordination efficiency +34%',
        details: 'Isolate track & OHE together. Schedule TRD crew for first 120m, followed immediately by Track machine.',
        isRecommended: true
      },
      {
        id: 'RES-2',
        title: 'Shift Track Renewal to Next Day Window (22 Oct 01:30)',
        impact: 'Adds 24h delay to Track Tamping; eliminates all site hazard clash',
        details: 'Grants OHE priority due to higher safety criticality score (96.8 vs 92.4).'
      },
      {
        id: 'RES-3',
        title: 'Divert Up Traffic to 3rd Line & Hold Tamping',
        impact: 'Minor 6 min freight delay; requires inter-station section controller bypass',
        details: 'Utilize bidirectional loop at Titwala for continuous slow running.'
      }
    ],
    status: 'ACTIVE'
  },
  {
    id: 'CONF-102',
    type: 'TIMETABLE_CLASH',
    severity: 'MAJOR',
    title: 'Clash with Train 12127 (Mumbai-Pune Intercity Exp)',
    description: 'Requested block window on Thane-Dombivli Fast overlaps with scheduled passing time of Intercity Express (06:40 IST).',
    involved_tasks: ['TSK-2019'],
    section: 'Thane – Dombivli Fast',
    time: '22 Oct 05:00 – 07:00',
    timeline_clash: {
      taskA: 'TSK-2019 (Cantilever Overhaul)',
      train: 'Train 12127 Mumbai-Pune Intercity (06:40)',
      timeSpan: 'Clash duration 20 min'
    },
    cause_explanation: 'Block window overrun into morning high-speed express corridor violates minimum 30-minute buffer clearance.',
    suggested_resolutions: [
      {
        id: 'RES-4',
        title: 'Advance Block Window by 45 Minutes (04:15 - 06:15)',
        impact: 'Clears line 25 min prior to Train 12127 passage; zero passenger delay',
        details: 'Shift crew call-time to 03:45 AM at Dombivli station.',
        isRecommended: true
      },
      {
        id: 'RES-5',
        title: 'Re-route Train 12127 via Slow Line (Thane to Kalyan)',
        impact: '+7 mins runtime for Intercity Express; maintains full maintenance duration',
        details: 'Path train through Platform 5 Thane into Slow Corridor.'
      }
    ],
    status: 'ACTIVE'
  },
  {
    id: 'CONF-103',
    type: 'DEADLINE_VIOLATION',
    severity: 'MAJOR',
    title: 'Mandatory Ultrasonic Testing Exceeds 15-Day Statutory Limit',
    description: 'Task TSK-2044 deadline is 21 Oct 06:00. Without expedited slot, speed restriction causes cumulative 180 min suburban delays.',
    involved_tasks: ['TSK-2044'],
    section: 'Thane – Dombivli Fast',
    time: '21 Oct 06:00 (Statutory Expiry)',
    timeline_clash: {
      taskA: 'TSK-2044 (USFD Rail Renewal)',
      timeSpan: 'Exceeds deadline by 18 hours if placed in normal draft queue'
    },
    cause_explanation: 'Railway Board safety circular 2024/CE-II requires USFD transverse flaw replacement within 72 hours of verification.',
    suggested_resolutions: [
      {
        id: 'RES-6',
        title: 'Grant Emergency Shadow Block 20 Oct Night',
        impact: 'Meets statutory requirement 16 hours ahead of deadline',
        details: 'Insert 180m slot during suburban maintenance curfew (01:45 - 04:45).',
        isRecommended: true
      }
    ],
    status: 'ACTIVE'
  },
  {
    id: 'CONF-104',
    type: 'OVERLAP',
    severity: 'MINOR',
    title: 'Point Machine Maintenance Concurrent with Signal Splicing',
    description: 'TSK-2035 and TSK-1982 draw from the same S&T technical supervisor roster in Kalyan division.',
    involved_tasks: ['TSK-2035', 'TSK-1982'],
    section: 'Kalyan – Kasara Down',
    time: '21 Oct 00:30 – 03:00',
    timeline_clash: {
      taskA: 'TSK-2035 (Point Machine 114B)',
      taskB: 'TSK-1982 (Axle Counter Calibration)',
      timeSpan: 'Roster contention 01:00 - 02:30'
    },
    cause_explanation: 'Maximum 1 specialized S&T supervisor licensed for Diva-Kalyan interlocking active on night shift.',
    suggested_resolutions: [
      {
        id: 'RES-7',
        title: 'Stagger Tasks into Split Shifts (00:00-02:00 then 02:30-04:30)',
        impact: 'Supervisor can oversee both tasks sequentially without extra headcount',
        details: 'Both locations are within 4 km via motorized railway trolley.',
        isRecommended: true
      }
    ],
    status: 'ACTIVE'
  },
  {
    id: 'CONF-105',
    type: 'TIMETABLE_CLASH',
    severity: 'CRITICAL',
    title: 'Kasara Ghat Freight Rake Path Conflict with Ballast Machine',
    description: 'Heavy container rake 59441 descending Kasara incline scheduled at 02:15 during planned CSM-09 tamping block.',
    involved_tasks: ['TSK-2051'],
    section: 'Kasara – Igatpuri Ghat',
    time: '21 Oct 01:30 – 04:30',
    timeline_clash: {
      taskA: 'TSK-2051 (Deep Screening Kasara Ghat)',
      train: 'Freight Rake 59441 Down (02:15)',
      timeSpan: 'Absolute block lock 02:00 - 03:00'
    },
    cause_explanation: 'Braking banker engines require clear runaway siding protection which is blocked during track ballast screening.',
    suggested_resolutions: [
      {
        id: 'RES-8',
        title: 'Regulate Freight Rake 59441 at Igatpuri Yard for 110 min',
        impact: 'Freight delay 110 min (non-priority cargo); guarantees flawless track safety',
        details: 'Hold train in siding line 4 at Igatpuri before ghat descent.',
        isRecommended: true
      }
    ],
    status: 'ACTIVE'
  },
  // --- Western Railway (WR) Conflicts ---
  {
    id: 'CONF-WR-201',
    type: 'TIMETABLE_CLASH',
    severity: 'CRITICAL',
    title: 'Bandra Down Fast Block Clashes with 12952 Mumbai Rajdhani Express',
    description: 'TSK-WR-101 emergency USFD weld renewal block window extends until 05:00, conflicting with scheduled arrival path of 12952 New Delhi–Mumbai Central Rajdhani Express (04:45 passing Bandra).',
    involved_tasks: ['TSK-WR-101'],
    section: 'Mumbai Central – Bandra Fast',
    time: '20 Oct 04:30 – 05:15',
    timeline_clash: {
      taskA: 'TSK-WR-101 (USFD Rail Renewal Down Fast)',
      train: '12952 Mumbai Rajdhani Express (04:45 passing)',
      timeSpan: 'Direct corridor conflict 04:35 - 05:00'
    },
    cause_explanation: 'Speed restriction safety collar requires continuous track occupancy until cold weld clamp tension reaches 45 kN.',
    suggested_resolutions: [
      {
        id: 'RES-WR-1',
        title: 'Divert 12952 Rajdhani to 5th Line at Borivali via Slow Flyover',
        impact: '+4 min runtime; maintains zero delay to suburban morning peak & complete safety weld',
        details: 'Route via Borivali Platform 6 into 5th Line straight to Mumbai Central terminal.',
        isRecommended: true
      },
      {
        id: 'RES-WR-2',
        title: 'Advance TSK-WR-101 Start Time to 00:30 IST',
        impact: 'Full clearance granted by 04:15 IST; zero passenger train regulation',
        details: 'Shift P-Way gang reporting to 23:45 at Bandra Marshalling Yard.'
      }
    ],
    status: 'ACTIVE'
  },
  {
    id: 'CONF-WR-202',
    type: 'OVERLAP',
    severity: 'MAJOR',
    title: 'Borivali Diamond Crossover Point Machine vs TRD OHE Dropper Block',
    description: 'TSK-WR-103 (Point Machine 102A overhaul) and TSK-WR-102 (OHE 25kV dropper profiling) overlap on Borivali North crossover ladder tracks.',
    involved_tasks: ['TSK-WR-102', 'TSK-WR-103'],
    section: 'Borivali – Virar Fast',
    time: '20 Oct 02:00 – 04:00',
    timeline_clash: {
      taskA: 'TSK-WR-102 (OHE Catenary Dropper Profiling)',
      taskB: 'TSK-WR-103 (Point Machine 102A/B)',
      timeSpan: 'Overlap 02:00 - 03:30 (90 min)'
    },
    cause_explanation: 'Tower wagon outriggers impede S&T technicians testing switch detection slide chairs simultaneously.',
    suggested_resolutions: [
      {
        id: 'RES-WR-3',
        title: 'Merge into Joint WR Traffic & S&T Disconnection Shadow Window',
        impact: 'Single unified block occupancy; saves 45 mins total line possession',
        details: 'TRD works overhead wire between 02:00-03:15, S&T calibrates point detection 03:15-04:00.',
        isRecommended: true
      }
    ],
    status: 'ACTIVE'
  },
  // --- Harbour Railway (HR) Conflicts ---
  {
    id: 'CONF-HR-301',
    type: 'TIMETABLE_CLASH',
    severity: 'CRITICAL',
    title: 'Vashi Sea Creek Bridge No. 34 Inspection vs First Morning EMU (98801)',
    description: 'TSK-HR-101 structural bearing inspection across Vashi bridge requires full track & power possession until 04:45, clashing with Panvel–CSMT first local 98801 scheduled across bridge at 04:32.',
    involved_tasks: ['TSK-HR-101'],
    section: 'Kurla – Vashi Harbour',
    time: '20 Oct 04:00 – 05:00',
    timeline_clash: {
      taskA: 'TSK-HR-101 (Vashi Bridge Structural Bearing Replacement)',
      train: 'Harbour EMU 98801 (Panvel to CSMT 04:32 passing)',
      timeSpan: 'Track occupied 04:15 - 04:45'
    },
    cause_explanation: 'Hydraulic jacking of bridge girders over sea channel strictly prohibits train movement within 2 adjacent spans.',
    suggested_resolutions: [
      {
        id: 'RES-HR-1',
        title: 'Short-Terminate EMU 98801 at Vashi & Run Connecting Shuttle from Mankhurd',
        impact: 'Maintains commuter flow with BEST road shuttle across Vashi Creek Bridge',
        details: 'Announce passenger advisory at Panvel, Belapur, Sanpada stations 12 hours prior.',
        isRecommended: true
      },
      {
        id: 'RES-HR-2',
        title: 'Accelerate Span 4 Jacking with Dual-Pump Hydraulics (Finish by 04:15)',
        impact: 'Permits 98801 to cross on schedule under 15 km/h pilot caution order',
        details: 'Deploy 2nd synchronized hydraulic pump unit from Kurla car shed.'
      }
    ],
    status: 'ACTIVE'
  },
  {
    id: 'CONF-HR-302',
    type: 'OVERLAP',
    severity: 'MAJOR',
    title: 'Sandhurst Viaduct Neutral Section Power Cut Affecting Wadala Branch Feeder',
    description: 'TSK-HR-102 (Sandhurst Road OHE neutral section) trips feed section that energizes Ravli junction to Vadala Road platform loop.',
    involved_tasks: ['TSK-HR-102'],
    section: 'CSMT – Vadala Road Harbour',
    time: '20 Oct 01:45 – 04:15',
    timeline_clash: {
      taskA: 'TSK-HR-102 (OHE Neutral Section Sandhurst)',
      taskB: 'Wadala Yard EMU Stabling Rake Feed',
      timeSpan: 'Feeder de-energized 02:00 - 04:00'
    },
    cause_explanation: 'Substation isolator switch 412 links both CSMT terminal lead and Vadala loop.',
    suggested_resolutions: [
      {
        id: 'RES-HR-3',
        title: 'Cross-Feed Wadala Loop from Kurla Traction Substation via Interrupter 22B',
        impact: 'Isolates Sandhurst worksite while keeping Vadala yard fully energized',
        details: 'Remote SCADA switching command to be executed by Chief Traction Power Controller.',
        isRecommended: true
      }
    ],
    status: 'ACTIVE'
  }
];

export const MOCK_ASSETS: AssetItem[] = [
  // Western Railway Assets
  {
    id: 'TRK-WR-BND-01',
    name: '60kg UIC Down Fast Mainline Section (Bandra – Khar)',
    type: 'Track',
    department: 'ENGINEERING',
    section: 'Mumbai Central – Bandra Fast',
    km_marker: 'KM 14/18',
    health_status: 'Critical',
    open_defects: 2,
    last_maintained: '2026-08-10',
    next_due: '2026-10-20',
    availability_sparkline: [98, 97, 95, 90, 85, 78, 70]
  },
  {
    id: 'OHE-WR-BVI-12',
    name: '25kV Regulated Catenary & Dropper Sector (Borivali Yard)',
    type: 'OHE',
    department: 'TRACTION_DISTRIBUTION',
    section: 'Borivali – Virar Fast',
    km_marker: 'KM 33/40',
    health_status: 'Degraded',
    open_defects: 1,
    last_maintained: '2026-09-05',
    next_due: '2026-10-21',
    availability_sparkline: [99, 98, 95, 93, 89, 87, 85]
  },
  {
    id: 'PM-WR-BVI-102',
    name: 'Borivali North Diamond Crossover 102A/B Point Machine',
    type: 'Point Machine',
    department: 'SIGNAL_TELECOMMUNICATION',
    section: 'Borivali – Virar Fast',
    km_marker: 'KM 34/12',
    health_status: 'Degraded',
    open_defects: 1,
    last_maintained: '2026-09-12',
    next_due: '2026-10-22',
    availability_sparkline: [97, 96, 94, 92, 91, 88, 86]
  },
  // Harbour Railway Assets
  {
    id: 'BRG-HR-VSH-34',
    name: 'Vashi Sea Creek Bridge No. 34 Structural Bearings & Track',
    type: 'Track',
    department: 'ENGINEERING',
    section: 'Kurla – Vashi Harbour',
    km_marker: 'KM 28/50',
    health_status: 'Critical',
    open_defects: 2,
    last_maintained: '2026-07-22',
    next_due: '2026-10-20',
    availability_sparkline: [96, 95, 91, 88, 84, 79, 72]
  },
  {
    id: 'OHE-HR-SND-08',
    name: 'Sandhurst Road Elevated Viaduct 25kV Neutral Section Mast',
    type: 'OHE',
    department: 'TRACTION_DISTRIBUTION',
    section: 'CSMT – Vadala Road Harbour',
    km_marker: 'KM 02/14',
    health_status: 'Degraded',
    open_defects: 1,
    last_maintained: '2026-09-01',
    next_due: '2026-10-21',
    availability_sparkline: [99, 98, 96, 94, 91, 89, 87]
  },
  {
    id: 'SIG-HR-WDL-01',
    name: 'Wadala Junction Dual-Route Electronic Interlocking Server Rack',
    type: 'Signal',
    department: 'SIGNAL_TELECOMMUNICATION',
    section: 'Vadala Road – Andheri Harbour Branch',
    km_marker: 'KM 09/20',
    health_status: 'Good',
    open_defects: 0,
    last_maintained: '2026-09-25',
    next_due: '2026-10-25',
    availability_sparkline: [99, 99, 98, 98, 98, 97, 97]
  },
  {
    id: 'OHE-KYN-118',
    name: '25kV Overhead Contact & Catenary Mast 118',
    type: 'OHE',
    department: 'TRACTION_DISTRIBUTION',
    section: 'Kalyan – Kasara Up',
    km_marker: 'KM 54/12',
    health_status: 'Critical',
    open_defects: 2,
    last_maintained: '2026-08-14',
    next_due: '2026-10-20',
    availability_sparkline: [98, 97, 95, 91, 88, 82, 74]
  },
  {
    id: 'TRK-TNA-045',
    name: '60kg UIC Continuously Welded Rail KM 48',
    type: 'Track',
    department: 'ENGINEERING',
    section: 'Thane – Dombivli Fast',
    km_marker: 'KM 48/16',
    health_status: 'Critical',
    open_defects: 1,
    last_maintained: '2026-07-29',
    next_due: '2026-10-21',
    availability_sparkline: [99, 99, 96, 94, 90, 85, 79]
  },
  {
    id: 'SIG-DIVA-12',
    name: 'Digital Axle Counter Multi-Section (Diva Jct)',
    type: 'Signal',
    department: 'SIGNAL_TELECOMMUNICATION',
    section: 'Thane – Dombivli Slow',
    km_marker: 'KM 42/04',
    health_status: 'Degraded',
    open_defects: 2,
    last_maintained: '2026-09-02',
    next_due: '2026-10-22',
    availability_sparkline: [96, 97, 94, 92, 90, 89, 87]
  },
  {
    id: 'PM-KYN-114B',
    name: 'Siemens Electric Point Machine 114B',
    type: 'Point Machine',
    department: 'SIGNAL_TELECOMMUNICATION',
    section: 'Kalyan – Kasara Down',
    km_marker: 'KM 53/28',
    health_status: 'Degraded',
    open_defects: 1,
    last_maintained: '2026-09-18',
    next_due: '2026-10-24',
    availability_sparkline: [98, 97, 96, 95, 93, 91, 90]
  },
  {
    id: 'TRK-KAS-089',
    name: 'Ghat Incline 1:37 Curve Rail & Sleepers',
    type: 'Track',
    department: 'ENGINEERING',
    section: 'Kasara – Igatpuri Ghat',
    km_marker: 'KM 122/08',
    health_status: 'Degraded',
    open_defects: 3,
    last_maintained: '2026-08-01',
    next_due: '2026-10-24',
    availability_sparkline: [95, 94, 92, 90, 88, 86, 84]
  },
  {
    id: 'TRD-DOM-FP1',
    name: '25kV Vacuum Circuit Breaker - Dombivli FP',
    type: 'OHE',
    department: 'TRACTION_DISTRIBUTION',
    section: 'Thane – Dombivli Slow',
    km_marker: 'KM 46/10',
    health_status: 'Good',
    open_defects: 0,
    last_maintained: '2026-09-28',
    next_due: '2026-10-25',
    availability_sparkline: [99, 99, 99, 98, 98, 98, 98]
  },
  {
    id: 'CBL-KURLA-04',
    name: '24-Core Armored Optical Fiber Cable Trunk',
    type: 'Cable',
    department: 'SIGNAL_TELECOMMUNICATION',
    section: 'CSMT – Kurla Harbor',
    km_marker: 'KM 15/02',
    health_status: 'Good',
    open_defects: 1,
    last_maintained: '2026-08-20',
    next_due: '2026-10-26',
    availability_sparkline: [97, 97, 97, 96, 96, 95, 95]
  }
];

export const MOCK_BLOCK_WINDOWS: BlockWindowItem[] = [
  // Western Railway Windows
  {
    id: 'BW-WR-01',
    section: 'Mumbai Central – Bandra Fast',
    start_time: '01:00',
    end_time: '04:30',
    date: '2026-10-20',
    type: 'NIGHT',
    capacity_minutes: 210,
    utilized_minutes: 180,
    allocated_tasks_count: 1
  },
  {
    id: 'BW-WR-02',
    section: 'Borivali – Virar Fast',
    start_time: '01:30',
    end_time: '05:00',
    date: '2026-10-20',
    type: 'NIGHT',
    capacity_minutes: 210,
    utilized_minutes: 150,
    allocated_tasks_count: 2
  },
  {
    id: 'BW-WR-03',
    section: 'Churchgate – Mumbai Central Fast',
    start_time: '10:35',
    end_time: '15:35',
    date: '2026-10-25',
    type: 'MEGA',
    capacity_minutes: 300,
    utilized_minutes: 270,
    allocated_tasks_count: 3
  },
  // Harbour Railway Windows
  {
    id: 'BW-HR-01',
    section: 'Kurla – Vashi Harbour',
    start_time: '01:15',
    end_time: '04:45',
    date: '2026-10-20',
    type: 'NIGHT',
    capacity_minutes: 210,
    utilized_minutes: 210,
    allocated_tasks_count: 1
  },
  {
    id: 'BW-HR-02',
    section: 'CSMT – Vadala Road Harbour',
    start_time: '01:30',
    end_time: '04:30',
    date: '2026-10-20',
    type: 'NIGHT',
    capacity_minutes: 180,
    utilized_minutes: 120,
    allocated_tasks_count: 1
  },
  {
    id: 'BW-HR-03',
    section: 'Vadala Road – Andheri Harbour Branch',
    start_time: '11:10',
    end_time: '16:10',
    date: '2026-10-25',
    type: 'MEGA',
    capacity_minutes: 300,
    utilized_minutes: 240,
    allocated_tasks_count: 2
  },
  // Central Railway Windows
  {
    id: 'BW-101',
    section: 'Kalyan – Kasara Up',
    start_time: '01:30',
    end_time: '05:30',
    date: '2026-10-20',
    type: 'NIGHT',
    capacity_minutes: 240,
    utilized_minutes: 240,
    allocated_tasks_count: 1
  },
  {
    id: 'BW-102',
    section: 'Thane – Dombivli Fast',
    start_time: '02:00',
    end_time: '05:00',
    date: '2026-10-20',
    type: 'NIGHT',
    capacity_minutes: 180,
    utilized_minutes: 180,
    allocated_tasks_count: 1
  },
  {
    id: 'BW-103',
    section: 'Kasara – Igatpuri Ghat',
    start_time: '11:00',
    end_time: '16:00',
    date: '2026-10-21',
    type: 'MEGA',
    capacity_minutes: 300,
    utilized_minutes: 240,
    allocated_tasks_count: 2
  },
  {
    id: 'BW-104',
    section: 'Thane – Dombivli Slow',
    start_time: '01:00',
    end_time: '04:00',
    date: '2026-10-22',
    type: 'NIGHT',
    capacity_minutes: 180,
    utilized_minutes: 120,
    allocated_tasks_count: 1
  },
  {
    id: 'BW-105',
    section: 'CSMT – Kurla Harbor',
    start_time: '10:30',
    end_time: '14:30',
    date: '2026-10-25',
    type: 'DAY',
    capacity_minutes: 240,
    utilized_minutes: 180,
    allocated_tasks_count: 1
  }
];

export const MOCK_TRAINS: TrainScheduleItem[] = [
  // Western Railway Trains
  { train_number: '20901', name: 'Mumbai Central – Gandhinagar Vande Bharat', type: 'Express', section: 'Mumbai Central – Bandra Fast', scheduled_passing: '06:10', priority_class: 1 },
  { train_number: '12951', name: 'Mumbai Central – New Delhi Rajdhani Express', type: 'Express', section: 'Bandra – Borivali Fast', scheduled_passing: '17:00', priority_class: 1 },
  { train_number: '12009', name: 'Mumbai Central – Ahmedabad Shatabdi Express', type: 'Express', section: 'Borivali – Virar Fast', scheduled_passing: '06:45', priority_class: 1 },
  { train_number: '90451', name: 'Virar Fast 15-Car Suburban EMU Local', type: 'Local', section: 'Mumbai Central – Bandra Fast', scheduled_passing: '08:22', priority_class: 2 },
  { train_number: '90882', name: 'Borivali AC Fast Suburban EMU Local', type: 'Local', section: 'Bandra – Borivali Fast', scheduled_passing: '09:14', priority_class: 2 },
  // Harbour Railway Trains
  { train_number: '98001', name: 'CSMT – Panvel Slow Harbour Suburban Local', type: 'Local', section: 'Kurla – Vashi Harbour', scheduled_passing: '06:05', priority_class: 2 },
  { train_number: '98805', name: 'CSMT – Goregaon Harbour Suburban Local', type: 'Local', section: 'Vadala Road – Andheri Harbour Branch', scheduled_passing: '07:18', priority_class: 2 },
  { train_number: '98042', name: 'Panvel – CSMT Fast Harbour Suburban Local', type: 'Local', section: 'Vashi – Panvel Harbour', scheduled_passing: '08:40', priority_class: 2 },
  { train_number: 'CONCOR-77', name: 'JNPT Port Container Double-Stack Freight', type: 'Freight', section: 'Vashi – Panvel Harbour', scheduled_passing: '02:30', priority_class: 3 },
  // Central Railway Mainline Trains
  { train_number: '12127', name: 'Mumbai CSMT – Pune Intercity Express', type: 'Express', section: 'Thane – Dombivli Fast', scheduled_passing: '06:40', priority_class: 1 },
  { train_number: '11007', name: 'Deccan Express', type: 'Express', section: 'Kalyan – Kasara Up', scheduled_passing: '07:15', priority_class: 1 },
  { train_number: '12859', name: 'Gitanjali Superfast Express', type: 'Express', section: 'Kalyan – Kasara Up', scheduled_passing: '06:00', priority_class: 1 },
  { train_number: '12262', name: 'Howrah AC Duronto Express', type: 'Express', section: 'Kasara – Igatpuri Ghat', scheduled_passing: '05:45', priority_class: 1 },
  { train_number: '59441', name: 'JNPT Container Freight Express', type: 'Freight', section: 'Kasara – Igatpuri Ghat', scheduled_passing: '02:15', priority_class: 3 },
  { train_number: '96312', name: 'Kasara Fast Suburban Local', type: 'Local', section: 'Kalyan – Kasara Down', scheduled_passing: '07:32', priority_class: 2 },
  { train_number: '97014', name: 'Kalyan Slow Suburban Local', type: 'Local', section: 'Thane – Dombivli Slow', scheduled_passing: '06:12', priority_class: 2 }
];

export const MOCK_COMPARE_METRICS: ComparisonMetric[] = [
  { metric: 'Tasks scheduled', baseline: '132', optimized: '173', change: '+31%', isPositive: true },
  { metric: 'Avoidable downtime', baseline: '94 h', optimized: '58 h', change: '-38%', isPositive: true },
  { metric: 'Block utilization', baseline: '64%', optimized: '82%', change: '+18 pts', isPositive: true },
  { metric: 'Overdue task-days', baseline: '211', optimized: '96', change: '-55%', isPositive: true },
  { metric: 'Conflicts', baseline: '14', optimized: '2', change: '-86%', isPositive: true },
  { metric: 'Asset availability', baseline: '93.1%', optimized: '96.4%', change: '+3.3 pts', isPositive: true }
];

export const MOCK_UNSCHEDULED_TASKS = [
  {
    task_id: 'TSK-2089',
    title: 'Portal Mast Footing Grouting',
    department: 'TRACTION_DISTRIBUTION' as const,
    reason: 'No block window of 4h available before deadline; conflicts with Train 12127 path',
    suggested_fix: 'Schedule as integrated shadow block on 24 Oct during Track Renewal window'
  },
  {
    task_id: 'TSK-2092',
    title: 'Switch Expansion Joint (SEJ) Oil Bath Refill',
    department: 'ENGINEERING' as const,
    reason: 'Concurrent crew limit (4 gangs) reached in Kalyan division during 21 Oct night',
    suggested_fix: 'Shift to Dombivli crew jurisdiction or defer to 22 Oct dawn window'
  },
  {
    task_id: 'TSK-2104',
    title: 'Level Crossing Interlocking Gate Overhaul',
    department: 'SIGNAL_TELECOMMUNICATION' as const,
    reason: 'Road traffic clearance not granted by local municipal authority for Sunday',
    suggested_fix: 'Apply for weekday mid-day curfew (11:00 - 13:00) with highway police'
  }
];

export const MOCK_PLANS: MaintenancePlanInfo[] = [
  {
    id: 'PLAN-W43-OPT',
    name: 'Mumbai Div W43 AI Optimized Plan (OR-Tools v2.4)',
    version_type: 'Approved',
    week: 'Week 43 · 19 – 25 Oct 2026',
    created_at: '2026-10-18 22:15',
    scheduled_count: 173,
    unscheduled_tasks: MOCK_UNSCHEDULED_TASKS
  },
  {
    id: 'PLAN-W43-DRAFT',
    name: 'Mumbai Div W43 Revision Candidate B',
    version_type: 'Draft',
    week: 'Week 43 · 19 – 25 Oct 2026',
    created_at: '2026-10-19 14:00',
    scheduled_count: 165,
    unscheduled_tasks: MOCK_UNSCHEDULED_TASKS
  },
  {
    id: 'PLAN-W42-ARCH',
    name: 'Mumbai Div W42 Executed Plan',
    version_type: 'Archived',
    week: 'Week 42 · 12 – 18 Oct 2026',
    created_at: '2026-10-11 18:00',
    scheduled_count: 148,
    unscheduled_tasks: []
  }
];
