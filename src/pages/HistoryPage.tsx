import React, { useState, useMemo } from 'react';
import { TimesheetRecord, Unit, SituationType } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { exportToCSV, exportToPrintPDF } from '../services/reportExporter';
import {
  History,
  Search,
  Filter,
  Download,
  Printer,
  Trash2,
  Eye,
  FileText,
  X
} from 'lucide-react';

interface HistoryPageProps {
  records: TimesheetRecord[];
  units: Unit[];
  selectedUnitId: string;
  onDeleteRecord: (id: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  records,
  units,
  selectedUnitId,
  onDeleteRecord
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterUnit, setFilterUnit] = useState<string>(selectedUnitId);
  const [filterSituation, setFilterSituation] = useState<string>('ALL');
  const [filterWorkload, setFilterWorkload] = useState<string>('ALL');

  const [detailRecord, setDetailRecord] = useState<TimesheetRecord | null>(null);

  // Filtragem combinada
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Unidade
      if (filterUnit !== 'ALL' && r.unitId !== filterUnit) return false;

      // Situação
      if (filterSituation !== 'ALL' && r.calculation.situation !== filterSituation) return false;

      // Jornada
      if (filterWorkload !== 'ALL' && r.workloadType !== filterWorkload) return false;

      // Busca por nome ou matrícula
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const nameMatch = r.employeeName.toLowerCase().includes(term);
        const regMatch = r.employeeRegistration.toLowerCase().includes(term);
        const notesMatch = (r.notes || '').toLowerCase().includes(term);
        if (!nameMatch && !regMatch && !notesMatch) return false;
      }

      return true;
    });
  }, [records, filterUnit, filterSituation, filterWorkload, searchTerm]);

  const handleExportCSV = () => {
    exportToCSV(filteredRecords, `historico_jornadas_uniao_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handlePrintPDF = () => {
    exportToPrintPDF(filteredRecords, 'Relatório Geral de Apurações de Ponto');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div className="card-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <History size={22} color="var(--uniao-blue)" />
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--uniao-blue)' }}>
              Histórico de Apurações de Jornada
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Consulta completa e conferência dos cálculos salvos pelo setor responsável.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleExportCSV} className="btn btn-outline btn-sm">
            <Download size={14} />
            <span>Exportar CSV / Excel</span>
          </button>
          <button onClick={handlePrintPDF} className="btn btn-primary btn-sm">
            <Printer size={14} />
            <span>Imprimir / Salvar PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--uniao-blue)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Filter size={16} />
          <span>Filtros de Pesquisa e Auditoria</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {/* Busca por texto */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Pesquisar Funcionário / Matrícula</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Nome, matrícula ou obs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ width: '100%', paddingLeft: '32px' }}
              />
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {/* Unidade */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Loja / Unidade</label>
            <select value={filterUnit} onChange={(e) => setFilterUnit(e.target.value)} className="form-select">
              <option value="ALL">Todas as Unidades</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Situação */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Situação do Saldo</label>
            <select value={filterSituation} onChange={(e) => setFilterSituation(e.target.value)} className="form-select">
              <option value="ALL">Todas as Situações</option>
              <option value="HORA EXTRA">Apenas Horas Extras (+)</option>
              <option value="DÉBITO DE HORAS">Apenas Débitos (-)</option>
              <option value="CUMPRIDA">Apenas Jornada Cumprida (0)</option>
            </select>
          </div>

          {/* Jornada Padrão */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Jornada Prevista</label>
            <select value={filterWorkload} onChange={(e) => setFilterWorkload(e.target.value)} className="form-select">
              <option value="ALL">Todas as Jornadas</option>
              <option value="8h00">Jornada 8h00</option>
              <option value="7h20">Jornada 7h20</option>
              <option value="custom">Jornada Personalizada</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de Resultados */}
      <div className="card-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', backgroundColor: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Exibindo <strong>{filteredRecords.length}</strong> registro(s) encontrado(s)
          </div>
        </div>

        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Funcionário</th>
                <th>Matrícula</th>
                <th>Unidade</th>
                <th>Previsto</th>
                <th>Trabalhado</th>
                <th>Batidas (E1/S1/E2/S2...)</th>
                <th>Saldo</th>
                <th>Situação</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    Nenhum registro de jornada encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => {
                  const punchesStr = [
                    r.punches.e1, r.punches.s1, r.punches.e2, r.punches.s2, r.punches.e3, r.punches.s3
                  ].filter(Boolean).join(' | ');

                  return (
                    <tr key={r.id}>
                      <td>{r.date}</td>
                      <td><strong>{r.employeeName}</strong></td>
                      <td>{r.employeeRegistration}</td>
                      <td>{r.unitName}</td>
                      <td>{r.calculation.formattedTarget}</td>
                      <td>{r.calculation.formattedWorked}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{punchesStr}</td>
                      <td style={{ fontWeight: 800, fontFamily: 'monospace' }}>{r.calculation.formattedBalance}</td>
                      <td><StatusBadge situation={r.calculation.situation} /></td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            onClick={() => setDetailRecord(r)}
                            className="btn btn-outline btn-sm"
                            title="Ver Espelho Detalhado"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => onDeleteRecord(r.id)}
                            className="btn btn-outline btn-sm"
                            style={{ color: 'var(--uniao-red)', borderColor: 'rgba(229, 46, 45, 0.2)' }}
                            title="Excluir Registro"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalhes do Registro */}
      {detailRecord && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px'
          }}
        >
          <div
            className="card-panel"
            style={{
              width: '100%',
              maxWidth: '540px',
              backgroundColor: '#FFFFFF',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '1.1rem', color: 'var(--uniao-blue)' }}>
                <FileText size={20} />
                <span>Espelho de Ponto — {detailRecord.employeeName}</span>
              </div>
              <button onClick={() => setDetailRecord(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <X size={20} color="var(--text-muted)" />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.875rem' }}>
              <div><strong>Matrícula:</strong> {detailRecord.employeeRegistration}</div>
              <div><strong>Data:</strong> {detailRecord.date}</div>
              <div><strong>Unidade:</strong> {detailRecord.unitName}</div>
              <div><strong>Modelo:</strong> {detailRecord.punchesModel} Batidas</div>
              <div><strong>Jornada Prevista:</strong> {detailRecord.calculation.formattedTarget}</div>
              <div><strong>Horas Trabalhadas:</strong> {detailRecord.calculation.formattedWorked}</div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--uniao-blue)', marginBottom: '8px' }}>
                Horários Efetivamente Registrados:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem' }}>
                <div>Entrada 1: <strong>{detailRecord.punches.e1 || '-'}</strong></div>
                <div>Saída 1: <strong>{detailRecord.punches.s1 || '-'}</strong></div>
                <div>Entrada 2: <strong>{detailRecord.punches.e2 || '-'}</strong></div>
                <div>Saída 2: <strong>{detailRecord.punches.s2 || '-'}</strong></div>
                {detailRecord.punchesModel === 6 && (
                  <>
                    <div>Entrada 3: <strong>{detailRecord.punches.e3 || '-'}</strong></div>
                    <div>Saída 3: <strong>{detailRecord.punches.s3 || '-'}</strong></div>
                  </>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--uniao-blue-light)', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--uniao-blue)', textTransform: 'uppercase' }}>Saldo Apurado</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--uniao-blue)' }}>{detailRecord.calculation.formattedBalance}</div>
              </div>
              <StatusBadge situation={detailRecord.calculation.situation} />
            </div>

            {detailRecord.notes && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <strong>Observações:</strong> {detailRecord.notes}
              </div>
            )}

            <button onClick={() => setDetailRecord(null)} className="btn btn-secondary" style={{ width: '100%' }}>
              Fechar Espelho
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
