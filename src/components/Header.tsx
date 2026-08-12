import React from 'react';
import { Building2, UserCheck, Calendar, Shield } from 'lucide-react';
import { Unit } from '../types';

interface HeaderProps {
  selectedUnitId: string;
  onSelectUnit: (unitId: string) => void;
  units: Unit[];
  userRole: 'ADMIN' | 'OPERATOR';
  onToggleUserRole: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedUnitId,
  onSelectUnit,
  units,
  userRole,
  onToggleUserRole
}) => {
  const currentDateStr = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header
      style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--border-color)',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: 'var(--shadow-sm)',
        position: 'sticky',
        top: 0,
        zIndex: 40
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <img
          src="/assets/logo_uniao.png"
          alt="União Supermercados"
          style={{ height: '42px', objectFit: 'contain' }}
        />
        <div style={{ borderLeft: '2px solid var(--border-color)', paddingLeft: '16px' }}>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--uniao-blue)', margin: 0, lineHeight: 1.2 }}>
            SISTEMA DE CONTROLE DE JORNADA
          </h1>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--uniao-red)' }}>
            União Supermercados — Gestão de Ponto & Banco de Horas
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        {/* Date Display */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            backgroundColor: 'var(--bg-subtle)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)'
          }}
        >
          <Calendar size={14} color="var(--uniao-blue)" />
          <span style={{ textTransform: 'capitalize' }}>{currentDateStr}</span>
        </div>

        {/* Unit Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Building2 size={16} color="var(--uniao-blue)" />
          <select
            value={selectedUnitId}
            onChange={(e) => onSelectUnit(e.target.value)}
            className="form-select"
            style={{ padding: '6px 12px', fontSize: '0.825rem', fontWeight: 600, cursor: 'pointer' }}
          >
            <option value="ALL">Todas as Lojas / Unidades</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        {/* Role Toggle Pill */}
        <button
          onClick={onToggleUserRole}
          className="btn btn-outline btn-sm"
          title="Clique para alternar permissão de teste (Admin vs Operacional)"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            borderColor: userRole === 'ADMIN' ? 'var(--uniao-blue)' : 'var(--border-color)',
            backgroundColor: userRole === 'ADMIN' ? 'var(--uniao-blue-light)' : 'transparent',
            color: userRole === 'ADMIN' ? 'var(--uniao-blue)' : 'var(--text-secondary)',
            fontWeight: 700
          }}
        >
          {userRole === 'ADMIN' ? <Shield size={14} /> : <UserCheck size={14} />}
          <span>Perfil: {userRole === 'ADMIN' ? 'Administrador RH' : 'Operacional'}</span>
        </button>
      </div>
    </header>
  );
};
