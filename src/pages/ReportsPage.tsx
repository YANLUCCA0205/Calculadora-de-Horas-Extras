import React, { useState } from 'react';
import { TimesheetRecord, Unit } from '../types';
import { exportToCSV, exportToPrintPDF } from '../services/reportExporter';
import { FileSpreadsheet, Download, Printer, Filter, Calendar } from 'lucide-react';

interface ReportsPageProps {
  records: TimesheetRecord[];
  units: Unit[];
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ records, units }) => {
  const [selectedUnit, setSelectedUnit] = useState<string>('ALL');
  const [selectedSituation, setSelectedSituation] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const filteredRecords = records.filter((r) => {
    if (selectedUnit !== 'ALL' && r.unitId !== selectedUnit) return false;
    if (selectedSituation !== 'ALL' && r.calculation.situation !== selectedSituation) return false;
    if (startDate && r.date < startDate) return false;
    if (endDate && r.date > endDate) return false;
    return true;
  });

  const handleExportCSV = () => {
    exportToCSV(filteredRecords, `relatorio_jornada_uniao_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handlePrintPDF = () => {
    exportToPrintPDF(filteredRecords, 'Relatório Gerencial de Apuração de Horas');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="card-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <FileSpreadsheet size={22} color="var(--uniao-blue)" />
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--uniao-blue)' }}>
              Relatórios & Exportação para Conferência
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Gere relatórios impressos ou exporte arquivos em CSV/Excel para fechamento de folha de pagamento e banco de horas.
          </p>
        </div>
      </div>

      {/* Opções de Filtro */}
      <div className="card-panel">
        <div className="card-title" style={{ fontSize: '1rem' }}>
          <Filter size={18} />
          <span>Filtros do Relatório</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Loja / Unidade</label>
            <select value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)} className="form-select">
              <option value="ALL">Todas as Lojas</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Situação do Ponto</label>
            <select value={selectedSituation} onChange={(e) => setSelectedSituation(e.target.value)} className="form-select">
              <option value="ALL">Todas as Situações</option>
              <option value="HORA EXTRA">Apenas Horas Extras (+)</option>
              <option value="DÉBITO DE HORAS">Apenas Débitos (-)</option>
              <option value="CUMPRIDA">Apenas Jornada Cumprida (0)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Data Inicial</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={16} color="var(--text-muted)" />
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="form-input" style={{ width: '100%' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Data Final</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={16} color="var(--text-muted)" />
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="form-input" style={{ width: '100%' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
          <button onClick={handleExportCSV} className="btn btn-primary" style={{ flex: 1 }}>
            <Download size={18} />
            <span>Exportar CSV (Compatível com Excel)</span>
          </button>

          <button onClick={handlePrintPDF} className="btn btn-secondary" style={{ flex: 1 }}>
            <Printer size={18} />
            <span>Imprimir / Gerar PDF com Timbrado</span>
          </button>
        </div>
      </div>

      {/* Resumo da Seleção */}
      <div className="card-panel">
        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--uniao-blue)', marginBottom: '12px' }}>
          Resumo do Relatório Selecionado ({filteredRecords.length} registros)
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Ao exportar ou imprimir, serão incluídos os detalhes completos de batidas (E1, S1, E2, S2, E3, S3), jornada prevista, horas trabalhadas e saldo final apurado.
        </div>
      </div>
    </div>
  );
};
