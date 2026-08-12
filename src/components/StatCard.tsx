import React, { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  variant?: 'neutral' | 'success' | 'danger' | 'info';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  variant = 'neutral'
}) => {
  let accentBg = '#EFF6FF';
  let accentColor = '#1E3A8A';

  if (variant === 'success') {
    accentBg = '#DCFCE7';
    accentColor = '#15803D';
  } else if (variant === 'danger') {
    accentBg = '#FEE2E2';
    accentColor = '#B91C1C';
  } else if (variant === 'info') {
    accentBg = '#E0F2FE';
    accentColor = '#0369A1';
  }

  return (
    <div className="card-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '12px',
          backgroundColor: accentBg,
          color: accentColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
          {title}
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
          {value}
        </div>
        {subtitle && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};
