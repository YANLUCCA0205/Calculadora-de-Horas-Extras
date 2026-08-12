import React from 'react';
import { TimesheetRecord, Unit } from '../types';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import {
  FileCheck,
  TrendingUp,
  TrendingDown,
  Scale,
  Clock,
  ArrowRight,
  Building,
  PlusCircle
} from 'lucide-react';

interface DashboardPageProps {
  records: TimesheetRecord[];
  units: Unit[];
  selectedUnitId: string;
  onNavigateToCalculator: () => void;
  onNavigateToHistory: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  records,
  units,
  selectedUnitId,
  onNavigateToCalculator,
  onNavigateToHistory
}) => {
  // Filtrar registros por unidade se selecionada
  const filteredRecords = selectedUnitId === 'ALL'
    ? records
    : records.filter((r) => r.unitId === selectedUnitId);

  // Cálculos consolidados
  const totalAnalyzed = filteredRecords.length;

  const totalExtraMinutes = filteredRecords.reduce(
    (acc, r) => acc + (r.calculation.balanceMinutes > 0 ? r.calculation.balanceMinutes : 0),
    0
  );

  const totalDebitMinutes = filteredRecords.reduce(
    (acc, r) => acc + (r.calculation.balanceMinutes < 0 ? Math.abs(r.calculation.balanceMinutes) : 0),
    0
  );

  const netBalanceMinutes = totalExtraMinutes - totalDebitMinutes;

  const formatHoursMinutes = (totalMins: number) => {
    const abs = Math.abs(totalMins);
    const h = Math.floor(abs / 60).toString().padStart(2, '0');
    const m = (abs % 60).toString().padStart(2, '0');
    return `${h}h ${m}m`;
  };

  const countExtra = filteredRecords.filter((r) => r.calculation.situation === 'HORA EXTRA').length;
  const countDebit = filteredRecords.filter((r) => r.calculation.situation === 'DÉBITO DE HORAS').length;
  const countEqual = filteredRecords.filter((r) => r.calculation.situation === 'CUMPRIDA').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Welcome Banner */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--uniao-blue)' }}>
            Painel Executivo de Controle de Jornada
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            União Supermercados — Visão geral da apuração de ponto, banco de horas e saldo das unidades.
          </p>
        </div>

        <button onClick={onNavigateToCalculator} className="btn btn-primary">
          <PlusCircle size={18} />
          <span>Nova Apuração de Ponto</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <StatCard
          title="Total de Apurações"
          value={totalAnalyzed}
          subtitle="Registros no período"
          icon={<FileCheck size={24} />}
          variant="neutral"
        />
        <StatCard
          title="Total Horas Extras"
          value={`+${formatHoursMinutes(totalExtraMinutes)}`}
          subtitle={`${countExtra} apurações com saldo positivo`}
          icon={<TrendingUp size={24} />}
          variant="success"
        />
        <StatCard
          title="Total Horas Débito"
          value={`-${formatHoursMinutes(totalDebitMinutes)}`}
          subtitle={`${countDebit} apurações com saldo negativo`}
          icon={<TrendingDown size={24} />}
          variant="danger"
        />
        <StatCard
          title="Saldo Líquido Geral"
          value={`${netBalanceMinutes >= 0 ? '+' : '-'}${formatHoursMinutes(netBalanceMinutes)}`}
          subtitle={netBalanceMinutes >= 0 ? 'Crédito acumulado' : 'Débito acumulado'}
          icon={<Scale size={24} />}
          variant={netBalanceMinutes >= 0 ? 'info' : 'danger'}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Distribuição por Situação */}
        <div className="card-panel">
          <div className="card-title">Distribuição por Situação</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 600 }}>
                <span>Horas Extras (+):</span>
                <strong>{countExtra} ({totalAnalyzed > 0 ? Math.round((countExtra / totalAnalyzed) * 100) : 0}%)</strong>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--bg-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${totalAnalyzed > 0 ? (countExtra / totalAnalyzed) * 100 : 0}%`, height: '100%', background: '#16A34A' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 600 }}>
                <span>Débito de Horas (-):</span>
                <strong>{countDebit} ({totalAnalyzed > 0 ? Math.round((countDebit / totalAnalyzed) * 100) : 0}%)</strong>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--bg-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${totalAnalyzed > 0 ? (countDebit / totalAnalyzed) * 100 : 0}%`, height: '100%', background: '#DC2626' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px', fontWeight: 600 }}>
                <span>Jornada Cumprida (0):</span>
                <strong>{countEqual} ({totalAnalyzed > 0 ? Math.round((countEqual / totalAnalyzed) * 100) : 0}%)</strong>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--bg-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${totalAnalyzed > 0 ? (countEqual / totalAnalyzed) * 100 : 0}%`, height: '100%', background: '#0284C7' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Resumo das Unidades */}
        <div className="card-panel">
          <div className="card-title">Resumo por Unidade</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {units.map((unit) => {
              const unitRecs = records.filter((r) => r.unitId === unit.id);
              const extraMins = unitRecs.reduce((acc, r) => acc + (r.calculation.balanceMinutes > 0 ? r.calculation.balanceMinutes : 0), 0);
              const debitMins = unitRecs.reduce((acc, r) => acc + (r.calculation.balanceMinutes < 0 ? Math.abs(r.calculation.balanceMinutes) : 0), 0);

              return (
                <div
                  key={unit.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Building size={18} color="var(--uniao-blue)" />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{unit.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{unitRecs.length} apurações</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                    <div style={{ color: '#16A34A', fontWeight: 700 }}>+{formatHoursMinutes(extraMins)}</div>
                    <div style={{ color: '#DC2626', fontWeight: 700 }}>-{formatHoursMinutes(debitMins)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabela de Apurações Recentes */}
      <div className="card-panel">
        <div className="card-title" style={{ justifyContent: 'space-between' }}>
          <span>Últimas Apurações Realizadas</span>
          <button onClick={onNavigateToHistory} className="btn btn-outline btn-sm">
            <span>Ver Todo Histórico</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Funcionário</th>
                <th>Matrícula</th>
                <th>Unidade</th>
                <th>Jornada</th>
                <th>Trabalhado</th>
                <th>Saldo</th>
                <th>Situação</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.slice(0, 5).map((r) => (
                <tr key={r.id}>
                  <td>{r.date}</td>
                  <td><strong>{r.employeeName}</strong></td>
                  <td>{r.employeeRegistration}</td>
                  <td>{r.unitName}</td>
                  <td>{r.calculation.formattedTarget}</td>
                  <td>{r.calculation.formattedWorked}</td>
                  <td style={{ fontWeight: 800, fontFamily: 'monospace' }}>{r.calculation.formattedBalance}</td>
                  <td><StatusBadge situation={r.calculation.situation} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
