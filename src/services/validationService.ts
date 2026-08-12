import { PunchesData, PunchesModel } from '../types';
import { timeToMinutes } from './workloadCalculator';

export interface ValidationNotice {
  type: 'error' | 'warning';
  message: string;
}

export function validatePunchesChronology(model: PunchesModel, punches: PunchesData): ValidationNotice[] {
  const notices: ValidationNotice[] = [];

  const e1 = timeToMinutes(punches.e1);
  const s1 = timeToMinutes(punches.s1);
  const e2 = timeToMinutes(punches.e2);
  const s2 = timeToMinutes(punches.s2);
  const e3 = timeToMinutes(punches.e3 || '');
  const s3 = timeToMinutes(punches.s3 || '');

  // Validação Entrada 1 e Saída 1
  if (e1 !== null && s1 !== null) {
    if (s1 <= e1 && (e1 - s1) < 12 * 60) {
      // Se a saída for menor que a entrada sem ser um turno noturno óbvio
      notices.push({
        type: 'warning',
        message: 'Saída 1 é anterior ou igual à Entrada 1. Verifique se o horário está correto.'
      });
    }
  }

  // Validação Intervalo de Almoço (Saída 1 -> Entrada 2)
  if (s1 !== null && e2 !== null) {
    let breakMins = e2 - s1;
    if (breakMins < 0) breakMins += 24 * 60;

    if (breakMins < 15) {
      notices.push({
        type: 'warning',
        message: `Intervalo entre Saída 1 e Entrada 2 muito curto (${breakMins} minutos).`
      });
    } else if (breakMins > 240) {
      notices.push({
        type: 'warning',
        message: `Intervalo entre Saída 1 e Entrada 2 atipicamente longo (${Math.floor(breakMins / 60)}h ${breakMins % 60}m).`
      });
    }
  }

  // Validação Entrada 2 e Saída 2
  if (e2 !== null && s2 !== null) {
    if (s2 <= e2 && (e2 - s2) < 12 * 60) {
      notices.push({
        type: 'warning',
        message: 'Saída 2 é anterior ou igual à Entrada 2.'
      });
    }
  }

  // Validação Modo 6 Batidas
  if (model === 6) {
    if (s2 !== null && e3 !== null) {
      let break2Mins = e3 - s2;
      if (break2Mins < 0) break2Mins += 24 * 60;
      if (break2Mins < 10) {
        notices.push({
          type: 'warning',
          message: `Segundo intervalo entre Saída 2 e Entrada 3 muito curto (${break2Mins} minutos).`
        });
      }
    }

    if (e3 !== null && s3 !== null) {
      if (s3 <= e3 && (e3 - s3) < 12 * 60) {
        notices.push({
          type: 'warning',
          message: 'Saída 3 é anterior ou igual à Entrada 3.'
        });
      }
    }
  }

  return notices;
}
