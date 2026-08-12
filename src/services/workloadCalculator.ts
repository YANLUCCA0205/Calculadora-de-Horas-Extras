import { WorkloadType, PunchesModel, PunchesData, CalculationResult, SituationType } from '../types';

/**
 * Converte string de horário "HH:MM" para total de minutos desde a meia-noite.
 */
export function timeToMinutes(timeStr: string): number | null {
  if (!timeStr || !timeStr.trim()) return null;
  const parts = timeStr.trim().split(':');
  if (parts.length !== 2) return null;
  
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  
  if (isNaN(hours) || isNaN(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  
  return hours * 60 + minutes;
}

/**
 * Converte minutos (sem sinal) para o formato "HH:MM".
 * Exemplo: 510 -> "08:30"
 */
export function minutesToHHMM(totalMinutes: number): string {
  const absMins = Math.abs(Math.round(totalMinutes));
  const hours = Math.floor(absMins / 60);
  const minutes = absMins % 60;
  
  const hh = hours.toString().padStart(2, '0');
  const mm = minutes.toString().padStart(2, '0');
  
  return `${hh}:${mm}`;
}

/**
 * Converte minutos de saldo para representação "+HH:MM", "-HH:MM" ou "00:00".
 */
export function formatBalance(balanceMinutes: number): string {
  const rounded = Math.round(balanceMinutes);
  if (rounded === 0) return '00:00';
  
  const formatted = minutesToHHMM(rounded);
  return rounded > 0 ? `+${formatted}` : `-${formatted}`;
}

/**
 * Retorna a quantidade de minutos da jornada prevista.
 */
export function getTargetMinutes(workloadType: WorkloadType, customWorkload?: string): number {
  if (workloadType === '8h00') {
    return 8 * 60; // 480 minutos
  }
  if (workloadType === '7h20') {
    return 7 * 60 + 20; // 440 minutos
  }
  if (workloadType === 'custom' && customWorkload) {
    const mins = timeToMinutes(customWorkload);
    if (mins !== null) return mins;
  }
  return 8 * 60;
}

/**
 * Calcula a diferença entre entrada e saída em minutos.
 */
export function calculateInterval(startStr: string, endStr: string): { minutes: number; isValid: boolean } {
  const startMins = timeToMinutes(startStr);
  const endMins = timeToMinutes(endStr);

  if (startMins === null || endMins === null) {
    return { minutes: 0, isValid: false };
  }

  let diff = endMins - startMins;
  if (diff < 0) {
    diff += 24 * 60; // Virada de turno
  }

  return { minutes: diff, isValid: true };
}

/**
 * Realiza o cálculo da jornada de trabalho (4 ou 6 batidas)
 * e determina o saldo (Hora Extra, Débito ou Jornada Completa).
 */
export function calculateTimesheet(
  model: PunchesModel,
  workloadType: WorkloadType,
  punches: PunchesData,
  customWorkload?: string
): CalculationResult {
  const targetMinutes = getTargetMinutes(workloadType, customWorkload);
  const formattedTarget = minutesToHHMM(targetMinutes);

  let p1Minutes = 0;
  let p2Minutes = 0;
  let p3Minutes = 0;

  // Se não houver pelo menos o primeiro par
  if (!punches.e1 || !punches.s1) {
    return {
      totalWorkedMinutes: 0,
      targetWorkedMinutes: targetMinutes,
      balanceMinutes: -targetMinutes,
      formattedWorked: '00:00',
      formattedTarget,
      formattedBalance: `-${formattedTarget}`,
      situation: 'DÉBITO DE HORAS',
      period1Minutes: 0,
      period2Minutes: 0,
      period3Minutes: 0,
      isValid: false,
      validationError: 'Preencha os horários para calcular'
    };
  }

  const p1 = calculateInterval(punches.e1, punches.s1);
  if (p1.isValid) p1Minutes = p1.minutes;

  if (punches.e2 && punches.s2) {
    const p2 = calculateInterval(punches.e2, punches.s2);
    if (p2.isValid) p2Minutes = p2.minutes;
  }

  if (model === 6 && punches.e3 && punches.s3) {
    const p3 = calculateInterval(punches.e3, punches.s3);
    if (p3.isValid) p3Minutes = p3.minutes;
  }

  const totalWorked = p1Minutes + p2Minutes + p3Minutes;
  const balance = totalWorked - targetMinutes;

  let situation: SituationType = 'JORNADA COMPLETA';
  if (balance > 0) {
    situation = 'HORA EXTRA';
  } else if (balance < 0) {
    situation = 'DÉBITO DE HORAS';
  }

  return {
    totalWorkedMinutes: totalWorked,
    targetWorkedMinutes: targetMinutes,
    balanceMinutes: balance,
    formattedWorked: minutesToHHMM(totalWorked),
    formattedTarget,
    formattedBalance: formatBalance(balance),
    situation,
    period1Minutes: p1Minutes,
    period2Minutes: p2Minutes,
    period3Minutes: p3Minutes,
    isValid: true
  };
}
