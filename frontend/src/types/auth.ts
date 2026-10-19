export type UserRole = 'ADMIN' | 'USER';

export interface UserProfile {
  email: string;
  name: string;
  role: UserRole;
  designation: string;
  division: string;
}

export interface RegulatedTrainItem {
  id: string;
  train_number: string;
  name: string;
  type: 'Express' | 'Local' | 'Freight';
  lineId: 'central' | 'western' | 'harbour';
  section: string;
  current_location: string;
  scheduled_passing: string;
  impact_status: 'HELD_BACK' | 'DIVERTED' | 'RESCHEDULED' | 'SPEED_CAUTION';
  impact_badge: string;
  delay_minutes: number;
  reason: string;
  linked_task_id?: string;
  responsible_sector: 'ENGINEERING' | 'TRACTION_DISTRIBUTION' | 'SIGNAL_TELECOMMUNICATION';
  passenger_advisory: string;
}
