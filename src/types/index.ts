export type WorkloadType = '8h00' | '7h20' | 'custom';

export type PunchesModel = 4 | 6;

export type SituationType = 'HORA EXTRA' | 'DÉBITO DE HORAS' | 'JORNADA COMPLETA' | 'CUMPRIDA';

export interface PunchesData {
  e1: string;
  s1: string;
  e2: string;
  s2: string;
  e3?: string;
  s3?: string;
}

export interface CalculationResult {
  totalWorkedMinutes: number;
  targetWorkedMinutes: number;
  balanceMinutes: number;
  formattedWorked: string;
  formattedTarget: string;
  formattedBalance: string;
  situation: SituationType;
  period1Minutes: number;
  period2Minutes: number;
  period3Minutes: number;
  isValid: boolean;
  validationError?: string;
}

export interface Employee {
  id: string;
  registration: string;
  name: string;
  sector: string;
  unitId: string;
  defaultWorkload: WorkloadType;
  customWorkload?: string;
  active: boolean;
}

export interface Unit {
  id: string;
  code: string;
  name: string;
  address: string;
  city: string;
  active: boolean;
}

export interface TimesheetRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeRegistration: string;
  unitId: string;
  unitName: string;
  date: string;
  punchesModel: PunchesModel;
  workloadType: WorkloadType;
  customWorkload?: string;
  punches: PunchesData;
  calculation: CalculationResult;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
