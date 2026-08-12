import React from 'react';
import {
  LayoutDashboard,
  Clock,
  History,
  Users,
  Building,
  FileSpreadsheet,
  RotateCcw
} from 'lucide-react';

export type ActivePage = 'dashboard' | 'calculator' | 'history' | 'employees' | 'units' | 'reports';

interface SidebarProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  onResetData: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate, onResetData }) => {
  const menuItems = [
    { id: 'dashboard' as ActivePage, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calculator' as ActivePage, label: 'Calculadora de Jornada', icon: Clock },
    { id: 'history' as ActivePage, label: 'Histórico de Registros', icon: History },
    { id: 'employees' as ActivePage, label: 'Funcionários', icon: Users },
    { id: 'units' as ActivePage, label: 'Lojas & Unidades', icon: Building },
    { id: 'reports' as ActivePage, label: 'Relatórios & Exportação', icon: FileSpreadsheet },
  ];

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '20px 12px',
        flexShrink: 0
      }}
    >
      <div>
        <div style={{ padding: '0 12px 16px 12px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Menu Principal
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 700 : 600,
                  color: isActive ? 'var(--uniao-red)' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'var(--uniao-red-light)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={18} color={isActive ? 'var(--uniao-red)' : 'var(--text-secondary)'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', paddingLeft: '8px', paddingRight: '8px' }}>
        <button
          onClick={onResetData}
          className="btn btn-outline btn-sm"
          style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--text-muted)' }}
          title="Restaura os dados iniciais de demonstração"
        >
          <RotateCcw size={14} />
          <span>Restaurar Dados Demo</span>
        </button>

        <div style={{ marginTop: '16px', fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          v1.0.0 — União Supermercados<br />
          Regra de Negócio Oficial Excel
        </div>
      </div>
    </aside>
  );
};
