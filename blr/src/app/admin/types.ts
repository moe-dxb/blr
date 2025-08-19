
export interface WorkHours {
    monday: { start: string; end: string };
    tuesday: { start: string; end: string };
    wednesday: { start: string; end: string };
    thursday: { start: string; end: string };
    friday: { start: string; end: string };
}

export interface UserDocument {
    name: string;
    url: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  manager: string;
  department: string;
  workHours?: WorkHours;
  leaveBalance?: number;
  employeeNumber?: string;
  documents?: UserDocument[];
}
