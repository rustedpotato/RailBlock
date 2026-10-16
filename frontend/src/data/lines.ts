export type LineId = 'all' | 'central' | 'western' | 'harbour';

export interface LineInfo {
  id: Exclude<LineId, 'all'>;
  name: string;
  short: string;
  zone: string;
  color: string; // brand colour used for dots, accents, badges
  sections: string[];
}

// Colours follow the familiar Mumbai suburban map convention:
// Central = red, Western = blue... adjusted to a softer premium palette.
export const LINES: LineInfo[] = [
  {
    id: 'central',
    name: 'Central Line',
    short: 'CR',
    zone: 'Central Railway · Main Line',
    color: '#E5484D',
    sections: [
      'Thane – Dombivli Fast',
      'Thane – Dombivli Slow',
      'Kalyan – Kasara Up',
      'Kalyan – Kasara Down',
      'Kasara – Igatpuri Ghat'
    ]
  },
  {
    id: 'western',
    name: 'Western Line',
    short: 'WR',
    zone: 'Western Railway · Churchgate – Dahanu',
    color: '#3E8BFF',
    sections: [
      'Churchgate – Mumbai Central Fast',
      'Mumbai Central – Bandra Fast',
      'Bandra – Borivali Fast',
      'Borivali – Virar Fast',
      'Virar – Dahanu Road Mainline'
    ]
  },
  {
    id: 'harbour',
    name: 'Harbour Line',
    short: 'HR',
    zone: 'Central Railway · Harbour & Trans-Harbour',
    color: '#30A46C',
    sections: [
      'CSMT – Vadala Road Harbour',
      'CSMT – Kurla Harbor',
      'Vadala Road – Kurla Harbour',
      'Kurla – Vashi Harbour',
      'Vashi – Panvel Harbour',
      'Vadala Road – Andheri Harbour Branch'
    ]
  }
];

const sectionToLine = new Map<string, LineInfo>();
LINES.forEach((l) => l.sections.forEach((s) => sectionToLine.set(s, l)));

export const getLineForSection = (section?: string): LineInfo | undefined =>
  section ? sectionToLine.get(section) : undefined;

export const getLine = (id: LineId): LineInfo | undefined => LINES.find((l) => l.id === id);
