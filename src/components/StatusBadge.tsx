import React from 'react';
import { SituationType } from '../types';
import { TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react';

interface StatusBadgeProps {
  situation: SituationType;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ situation }) => {
  if (situation === 'HORA EXTRA') {
    return (
      <span className="badge-status extra">
        <TrendingUp size={16} />
        <span>HORA EXTRA</span>
      </span>
    );
  }

  if (situation === 'DÉBITO DE HORAS') {
    return (
      <span className="badge-status debit">
        <TrendingDown size={16} />
        <span>DÉBITO DE HORAS</span>
      </span>
    );
  }

  return (
    <span className="badge-status cumprida">
      <CheckCircle2 size={16} />
      <span>JORNADA COMPLETA</span>
    </span>
  );
};
