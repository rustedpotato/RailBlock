import { Department, SectorCrew, SectorMachinery, SectorSupervisor } from '../types/railblock';

export interface SectorDefinition {
  id: Department;
  code: 'ENGG' | 'TRD' | 'S&T';
  shortName: string;
  name: string;
  tagline: string;
  description: string;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  iconName: string;
  primaryPermit: string;
  safetyProtocol: string;
  typicalBlockType: string;
}

export const SECTORS: Record<Department, SectorDefinition> = {
  ENGINEERING: {
    id: 'ENGINEERING',
    code: 'ENGG',
    shortName: 'Engg (Civil / Track)',
    name: 'Engineering (Permanent Way & Bridges)',
    tagline: 'Track Geometry, Rail Welding, Tamping & Turnout Maintenance',
    description:
      'Responsible for rails, sleepers, ballast packing, ultrasonic rail flaw detection (USFD), points and crossings, structural bridges, and deep screening track machines.',
    color: '#0070F3',
    badgeBg: 'rgba(0, 112, 243, 0.12)',
    badgeBorder: 'rgba(0, 112, 243, 0.35)',
    iconName: 'Construction',
    primaryPermit: 'Traffic Block (Line Block Permit)',
    safetyProtocol: 'Banner flags at 600m, Detonators at 1200m, Caution order 30 km/h',
    typicalBlockType: 'Traffic Block'
  },
  TRACTION_DISTRIBUTION: {
    id: 'TRACTION_DISTRIBUTION',
    code: 'TRD',
    shortName: 'TRD (Electrical / OHE)',
    name: 'Traction Distribution (Overhead 25kV Catenary)',
    tagline: 'Overhead Equipment (OHE), 25kV Feeders & Traction Substations',
    description:
      'Responsible for overhead catenary and contact wires, dropper tensioning, section insulators, neutral sections, return bonds, and traction sub-stations (TSS).',
    color: '#F5A623',
    badgeBg: 'rgba(245, 166, 35, 0.14)',
    badgeBorder: 'rgba(245, 166, 35, 0.40)',
    iconName: 'Zap',
    primaryPermit: 'Power & Traffic Block (PTW - Permit To Work)',
    safetyProtocol: '25kV feeder breaker isolated, discharge earth rods locked, TPC confirmation',
    typicalBlockType: 'Power & Traffic Block'
  },
  SIGNAL_TELECOMMUNICATION: {
    id: 'SIGNAL_TELECOMMUNICATION',
    code: 'S&T',
    shortName: 'Signal & Telecom (S&T)',
    name: 'Signal & Telecommunication (Interlocking & Detection)',
    tagline: 'Electronic Interlocking, Point Machines, Axle Counters & Signals',
    description:
      'Responsible for point machines, digital axle counters (SSDAC/HASDAC), electronic interlocking (EI), automatic signaling aspect lamps, track circuits, and optic fiber communication (OFC).',
    color: '#8E4EC6',
    badgeBg: 'rgba(142, 78, 198, 0.14)',
    badgeBorder: 'rgba(142, 78, 198, 0.40)',
    iconName: 'Radio',
    primaryPermit: 'S&T Disconnection Notice (Form S&T SI-420)',
    safetyProtocol: 'Form SI-420 served to Station Master, point clamped & padlocked, buzzer muted',
    typicalBlockType: 'Traffic & S&T Disconnection Block'
  }
};

export const SECTOR_CREWS: SectorCrew[] = [
  // Engineering (Engg) Crews
  { id: 'CRW-ENG-01', name: 'P-Way Maintenance Gang #12', base: 'Bandra Fast Depot', strength: 16, department: 'ENGINEERING', status: 'Available' },
  { id: 'CRW-ENG-02', name: 'USFD Testing & Flaw Detection Trolley Squad', base: 'Mumbai Central', strength: 5, department: 'ENGINEERING', status: 'On-Track' },
  { id: 'CRW-ENG-03', name: 'Flash-Butt Rail Welding Team #4', base: 'Borivali P-Way Yard', strength: 9, department: 'ENGINEERING', status: 'Available' },
  { id: 'CRW-ENG-04', name: 'Central Mainline Track Gang #08', base: 'Kalyan North Yard', strength: 18, department: 'ENGINEERING', status: 'Standby' },
  { id: 'CRW-ENG-05', name: 'Harbour Bridge Structural Rehabilitation Squad', base: 'Kurla Bridge Depot', strength: 12, department: 'ENGINEERING', status: 'Available' },

  // TRD (Traction Distribution) Crews
  { id: 'CRW-TRD-01', name: 'OHE Line Maintenance Gang WR-01', base: 'Churchgate Electric Car Shed', strength: 8, department: 'TRACTION_DISTRIBUTION', status: 'Available' },
  { id: 'CRW-TRD-02', name: '8-Wheeler Tower Wagon Crew #108', base: 'Borivali TRD Depot', strength: 6, department: 'TRACTION_DISTRIBUTION', status: 'On-Track' },
  { id: 'CRW-TRD-03', name: 'Traction Sub-Station & Feeder Crew', base: 'Kalyan Power House', strength: 7, department: 'TRACTION_DISTRIBUTION', status: 'Available' },
  { id: 'CRW-TRD-04', name: 'Emergency OHE Breakdown & Wire Tension Gang', base: 'CSMT Electric Depot', strength: 10, department: 'TRACTION_DISTRIBUTION', status: 'Standby' },

  // Signal & Telecom (S&T) Crews
  { id: 'CRW-SNT-01', name: 'Electronic Interlocking (EI) Squad Alpha', base: 'Churchgate Relay Room', strength: 5, department: 'SIGNAL_TELECOMMUNICATION', status: 'Available' },
  { id: 'CRW-SNT-02', name: 'Point Machine Testing & Overhaul Team', base: 'Dadar Junction S&T Yard', strength: 6, department: 'SIGNAL_TELECOMMUNICATION', status: 'On-Track' },
  { id: 'CRW-SNT-03', name: 'Digital Axle Counter (DAC) Calibration Squad', base: 'Thane Control Center', strength: 4, department: 'SIGNAL_TELECOMMUNICATION', status: 'Available' },
  { id: 'CRW-SNT-04', name: 'Automatic Signaling & Cable Jointers Team', base: 'Kurla Telecommunication Office', strength: 7, department: 'SIGNAL_TELECOMMUNICATION', status: 'Standby' }
];

export const SECTOR_MACHINERY: SectorMachinery[] = [
  // Engg Machines
  { id: 'MCH-ENG-01', name: 'Plasser CSM 08-32 Continuous Action Tamper', type: 'Track Tamping Machine', department: 'ENGINEERING', status: 'Ready' },
  { id: 'MCH-ENG-02', name: 'Plasser BCM-14 Ballast Cleaning Machine', type: 'Deep Screening Machine', department: 'ENGINEERING', status: 'Deployed' },
  { id: 'MCH-ENG-03', name: 'UNIMAT 08-4S Points & Crossing Tamper', type: 'Turnout Tamper', department: 'ENGINEERING', status: 'Ready' },
  { id: 'MCH-ENG-04', name: 'Digital USFD Double Rail Ultrasonic Tester', type: 'Flaw Detection Trolley', department: 'ENGINEERING', status: 'Deployed' },

  // TRD Machines
  { id: 'MCH-TRD-01', name: '8-Wheeler DETW Diesel-Electric Tower Wagon #TW-204', type: 'Tower Wagon', department: 'TRACTION_DISTRIBUTION', status: 'Deployed' },
  { id: 'MCH-TRD-02', name: '4-Wheeler RU Emergency Inspection Rail Car', type: 'OHE Inspection Car', department: 'TRACTION_DISTRIBUTION', status: 'Ready' },
  { id: 'MCH-TRD-03', name: 'Hydraulic Contact Wire Tensioning Puller & Calibrator', type: 'Wire Tension Rig', department: 'TRACTION_DISTRIBUTION', status: 'Ready' },
  { id: 'MCH-TRD-04', name: 'Heavy Discharge Grounding Rod Set (25kV Rated)', type: 'Earthing Equipment', department: 'TRACTION_DISTRIBUTION', status: 'Ready' },

  // S&T Machines
  { id: 'MCH-SNT-01', name: 'Digital Point Machine Throw & Current Analyzer (DPT-90)', type: 'Point Tester', department: 'SIGNAL_TELECOMMUNICATION', status: 'Deployed' },
  { id: 'MCH-SNT-02', name: 'High-Frequency Track Circuit (AFTC) Tuning Test Kit', type: 'Circuit Analyzer', department: 'SIGNAL_TELECOMMUNICATION', status: 'Ready' },
  { id: 'MCH-SNT-03', name: 'Optical Time Domain Reflectometer (OTDR) Fiber Unit', type: 'OFC Testing Kit', department: 'SIGNAL_TELECOMMUNICATION', status: 'Ready' },
  { id: 'MCH-SNT-04', name: 'SSDAC Axle Counter Simulator & Signal Test Bench', type: 'Axle Counter Tester', department: 'SIGNAL_TELECOMMUNICATION', status: 'Ready' }
];

export const SECTOR_SUPERVISORS: SectorSupervisor[] = [
  // Engg Supervisors
  { id: 'SUP-ENG-01', name: 'R. K. Sharma', role: 'Senior Section Engineer (P-Way Fast)', department: 'ENGINEERING', phone: '+91 93228 46915' },
  { id: 'SUP-ENG-02', name: 'M. Deshmukh', role: 'Assistant Divisional Engineer (ADEN Bridges)', department: 'ENGINEERING', phone: '+91 93228 46915' },
  { id: 'SUP-ENG-03', name: 'S. K. Verma', role: 'Track Inspection Officer (P-Way Main)', department: 'ENGINEERING', phone: '+91 93228 46915' },

  // TRD Supervisors
  { id: 'SUP-TRD-01', name: 'V. Patil', role: 'Senior Section Engineer (TRD / OHE)', department: 'TRACTION_DISTRIBUTION', phone: '+91 93228 46915' },
  { id: 'SUP-TRD-02', name: 'S. Ramanathan', role: 'Assistant Electrical Engineer (Traction Power)', department: 'TRACTION_DISTRIBUTION', phone: '+91 93228 46915' },
  { id: 'SUP-TRD-03', name: 'G. N. Chari', role: 'Traction Power Controller (TPC In-Charge)', department: 'TRACTION_DISTRIBUTION', phone: '+91 93228 46915' },

  // S&T Supervisors
  { id: 'SUP-SNT-01', name: 'K. Venkat', role: 'Senior Section Engineer (Signal Interlocking)', department: 'SIGNAL_TELECOMMUNICATION', phone: '+91 93228 46915' },
  { id: 'SUP-SNT-02', name: 'P. Banerjee', role: 'Assistant Signal & Telecom Engineer (ASTE Suburban)', department: 'SIGNAL_TELECOMMUNICATION', phone: '+91 93228 46915' },
  { id: 'SUP-SNT-03', name: 'A. R. Joshi', role: 'Chief Signal Inspector (Electronic Relay)', department: 'SIGNAL_TELECOMMUNICATION', phone: '+91 93228 46915' }
];
