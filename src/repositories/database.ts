import { Unit, Employee, TimesheetRecord } from '../types';
import { calculateTimesheet } from '../services/workloadCalculator';

const STORAGE_KEY_UNITS = 'uniao_jornada_units_v1';
const STORAGE_KEY_EMPLOYEES = 'uniao_jornada_employees_v1';
const STORAGE_KEY_RECORDS = 'uniao_jornada_records_v1';

export const DEFAULT_UNITS: Unit[] = [
  {
    id: 'u-01',
    code: 'LOJA-01',
    name: 'Loja 01 — Matriz',
    address: 'Av. Brasil, 740',
    city: 'Conceição das Alagoas - MG',
    active: true
  },
  {
    id: 'u-02',
    code: 'LOJA-02',
    name: 'Loja 02 — Centro',
    address: 'R. Presidente Vargas, 451',
    city: 'Conceição das Alagoas - MG',
    active: true
  },
  {
    id: 'u-03',
    code: 'LOJA-03',
    name: 'Loja 03 — Rodovia',
    address: 'Rod. BR 262 KM 876 N. 345',
    city: 'Campo Florido - MG',
    active: true
  }
];

export const DEFAULT_EMPLOYEES: Employee[] = [
  {
    id: 'e-1001',
    registration: 'UNI-1001',
    name: 'João Silva',
    sector: 'Caixa / Operações',
    unitId: 'u-01',
    defaultWorkload: '8h00',
    active: true
  },
  {
    id: 'e-1002',
    registration: 'UNI-1002',
    name: 'Maria Santos',
    sector: 'Hortifrúti',
    unitId: 'u-01',
    defaultWorkload: '7h20',
    active: true
  },
  {
    id: 'e-1003',
    registration: 'UNI-1003',
    name: 'Carlos Oliveira',
    sector: 'Açougue',
    unitId: 'u-02',
    defaultWorkload: '8h00',
    active: true
  },
  {
    id: 'e-1004',
    registration: 'UNI-1004',
    name: 'Ana Paula Costa',
    sector: 'Padaria',
    unitId: 'u-02',
    defaultWorkload: '7h20',
    active: true
  },
  {
    id: 'e-1005',
    registration: 'UNI-1005',
    name: 'Roberto Ferreira',
    sector: 'Depósito / Logística',
    unitId: 'u-03',
    defaultWorkload: '8h00',
    active: true
  },
  {
    id: 'e-1006',
    registration: 'UNI-1006',
    name: 'Juliana Mendes',
    sector: 'Reposição / Mercearia',
    unitId: 'u-03',
    defaultWorkload: '7h20',
    active: true
  }
];

function generateInitialRecords(): TimesheetRecord[] {
  const dateStr = new Date().toISOString().split('T')[0];

  // Casos de teste pré-carregados (Validação Caso 1 ao Caso 6)
  return [
    {
      id: 'rec-101',
      employeeId: 'e-1001',
      employeeName: 'João Silva',
      employeeRegistration: 'UNI-1001',
      unitId: 'u-01',
      unitName: 'Loja 01 — Matriz',
      date: dateStr,
      punchesModel: 4,
      workloadType: '8h00',
      punches: { e1: '08:00', s1: '12:00', e2: '13:00', s2: '17:45' },
      calculation: calculateTimesheet(4, '8h00', { e1: '08:00', s1: '12:00', e2: '13:00', s2: '17:45' }),
      notes: 'Caso de teste #2: 45 minutos de Hora Extra (8h00 previstos / 8h45 trabalhados)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'rec-102',
      employeeId: 'e-1002',
      employeeName: 'Maria Santos',
      employeeRegistration: 'UNI-1002',
      unitId: 'u-01',
      unitName: 'Loja 01 — Matriz',
      date: dateStr,
      punchesModel: 4,
      workloadType: '7h20',
      punches: { e1: '08:00', s1: '12:00', e2: '13:00', s2: '17:10' },
      calculation: calculateTimesheet(4, '7h20', { e1: '08:00', s1: '12:00', e2: '13:00', s2: '17:10' }),
      notes: 'Caso de teste #5: 50 minutos de Hora Extra na jornada de 7h20',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'rec-103',
      employeeId: 'e-1003',
      employeeName: 'Carlos Oliveira',
      employeeRegistration: 'UNI-1003',
      unitId: 'u-02',
      unitName: 'Loja 02 — Centro',
      date: dateStr,
      punchesModel: 4,
      workloadType: '8h00',
      punches: { e1: '08:00', s1: '12:00', e2: '13:00', s2: '16:30' },
      calculation: calculateTimesheet(4, '8h00', { e1: '08:00', s1: '12:00', e2: '13:00', s2: '16:30' }),
      notes: 'Caso de teste #3: 30 minutos de Débito de Horas',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'rec-104',
      employeeId: 'e-1004',
      employeeName: 'Ana Paula Costa',
      employeeRegistration: 'UNI-1004',
      unitId: 'u-02',
      unitName: 'Loja 02 — Centro',
      date: dateStr,
      punchesModel: 4,
      workloadType: '7h20',
      punches: { e1: '08:00', s1: '12:00', e2: '13:20', s2: '16:40' },
      calculation: calculateTimesheet(4, '7h20', { e1: '08:00', s1: '12:00', e2: '13:20', s2: '16:40' }),
      notes: 'Caso de teste #4: Jornada de 7h20 perfeitamente cumprida',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'rec-105',
      employeeId: 'e-1005',
      employeeName: 'Roberto Ferreira',
      employeeRegistration: 'UNI-1005',
      unitId: 'u-03',
      unitName: 'Loja 03 — Rodovia',
      date: dateStr,
      punchesModel: 6,
      workloadType: '8h00',
      punches: { e1: '06:40', s1: '09:00', e2: '10:00', s2: '11:30', e3: '13:00', s3: '16:10' },
      calculation: calculateTimesheet(6, '8h00', { e1: '06:40', s1: '09:00', e2: '10:00', s2: '11:30', e3: '13:00', s3: '16:10' }),
      notes: 'Caso de teste #6: Modelo de 6 batidas com 7h00 trabalhadas (1h de débito)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
}

// Inicializadores com fallback para LocalStorage
export function getStoredUnits(): Unit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_UNITS);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  saveStoredUnits(DEFAULT_UNITS);
  return DEFAULT_UNITS;
}

export function saveStoredUnits(units: Unit[]): void {
  localStorage.setItem(STORAGE_KEY_UNITS, JSON.stringify(units));
}

export function getStoredEmployees(): Employee[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EMPLOYEES);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  saveStoredEmployees(DEFAULT_EMPLOYEES);
  return DEFAULT_EMPLOYEES;
}

export function saveStoredEmployees(employees: Employee[]): void {
  localStorage.setItem(STORAGE_KEY_EMPLOYEES, JSON.stringify(employees));
}

export function getStoredRecords(): TimesheetRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECORDS);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  const initial = generateInitialRecords();
  saveStoredRecords(initial);
  return initial;
}

export function saveStoredRecords(records: TimesheetRecord[]): void {
  localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
}

export function resetDatabaseToDefaults(): void {
  localStorage.removeItem(STORAGE_KEY_UNITS);
  localStorage.removeItem(STORAGE_KEY_EMPLOYEES);
  localStorage.removeItem(STORAGE_KEY_RECORDS);
  getStoredUnits();
  getStoredEmployees();
  getStoredRecords();
}
