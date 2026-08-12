import React, { useState, useEffect, useMemo } from 'react';
import { Employee, Unit, WorkloadType, PunchesModel, PunchesData, TimesheetRecord } from '../types';
import { calculateTimesheet } from '../services/workloadCalculator';
import { validatePunchesChronology, ValidationNotice } from '../services/validationService';
import { StatusBadge } from '../components/StatusBadge';
import { Clock, Save, User, Calendar, AlertCircle, CheckCircle2, Zap } from 'lucide-react';

interface CalculatorPageProps {
  employees: Employee[];
  units: Unit[];
  onSaveRecord: (record: Omit<TimesheetRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const CalculatorPage: React.FC<CalculatorPageProps> = ({
  employees,
  units,
  onSaveRecord
}) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(employees[0]?.id || '');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [workloadType, setWorkloadType] = useState<WorkloadType>('8h00');
  const [customWorkload, setCustomWorkload] = useState<string>('08:00');
  const [punchesModel, setPunchesModel] = useState<PunchesModel>(4);
  const [notes, setNotes] = useState<string>('');

  const [punches, setPunches] = useState<PunchesData>({
    e1: '08:00',
    s1: '12:00',
    e2: '13:00',
    s2: '17:45',
    e3: '',
    s3: ''
  });

  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Quando um funcionário é selecionado, puxar sua jornada padrão automaticamente
  useEffect(() => {
    if (selectedEmployeeId) {
      const emp = employees.find((e) => e.id === selectedEmployeeId);
      if (emp) {
        setWorkloadType(emp.defaultWorkload);
        if (emp.customWorkload) setCustomWorkload(emp.customWorkload);
      }
    }
  }, [selectedEmployeeId, employees]);

  // Cálculo em TEMPO REAL sempre que qualquer batida ou opção muda
  const calculation = useMemo(() => {
    return calculateTimesheet(punchesModel, workloadType, punches, customWorkload);
  }, [punchesModel, workloadType, punches, customWorkload]);

  // Validações cronológicas de alerta
  const validationNotices: ValidationNotice[] = useMemo(() => {
    return validatePunchesChronology(punchesModel, punches);
  }, [punchesModel, punches]);

  const handlePunchChange = (field: keyof PunchesData, value: string) => {
    setPunches((prev) => ({ ...prev, [field]: value }));
  };

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);
  const selectedUnit = units.find((u) => u.id === selectedEmployee?.unitId);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!calculation.isValid) return;

    onSaveRecord({
      employeeId: selectedEmployee?.id || 'manual',
      employeeName: selectedEmployee?.name || 'Funcionário Não Cadastrado',
      employeeRegistration: selectedEmployee?.registration || 'N/A',
      unitId: selectedUnit?.id || units[0]?.id || 'u-01',
      unitName: selectedUnit?.name || units[0]?.name || 'Loja 01 — Matriz',
      date,
      punchesModel,
      workloadType,
      customWorkload: workloadType === 'custom' ? customWorkload : undefined,
      punches,
      calculation,
      notes
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Carregar atalhos rápidos de preenchimento (Shift Presets)
  const applyPreset = (presetType: '8h_4b' | '7h20_4b' | '8h_6b') => {
    if (presetType === '8h_4b') {
      setWorkloadType('8h00');
      setPunchesModel(4);
      setPunches({ e1: '08:00', s1: '12:00', e2: '13:00', s2: '17:00', e3: '', s3: '' });
    } else if (presetType === '7h20_4b') {
      setWorkloadType('7h20');
      setPunchesModel(4);
      setPunches({ e1: '08:00', s1: '12:00', e2: '13:20', s2: '16:40', e3: '', s3: '' });
    } else if (presetType === '8h_6b') {
      setWorkloadType('8h00');
      setPunchesModel(6);
      setPunches({ e1: '06:40', s1: '09:00', e2: '10:00', s2: '11:30', e3: '13:00', s3: '16:10' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--uniao-blue) 0%, #1E293B 100%)',
          borderRadius: 'var(--radius-md)',
          padding: '24px',
          color: '#FFFFFF',
          boxShadow: 'var(--shadow-brand)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Clock size={24} color="var(--uniao-red)" />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Calculadora de Jornada em Tempo Real</h2>
          </div>
          <p style={{ fontSize: '0.875rem', opacity: 0.9, maxWidth: '650px' }}>
            Insira os horários de entrada e saída. O sistema calcula instantaneamente o tempo trabalhado e apura o saldo de horas extras ou débitos segundo a regra de negócio oficial do União Supermercados.
          </p>
        </div>

        {/* Quick Presets */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => applyPreset('8h_4b')}
            className="btn btn-sm"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFF', border: '1px solid rgba(255,255,255,0.3)' }}
          >
            <Zap size={14} color="var(--uniao-gold)" /> Exemplo 8h (4B)
          </button>
          <button
            onClick={() => applyPreset('7h20_4b')}
            className="btn btn-sm"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFF', border: '1px solid rgba(255,255,255,0.3)' }}
          >
            <Zap size={14} color="var(--uniao-gold)" /> Exemplo 7h20 (4B)
          </button>
          <button
            onClick={() => applyPreset('8h_6b')}
            className="btn btn-sm"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFF', border: '1px solid rgba(255,255,255,0.3)' }}
          >
            <Zap size={14} color="var(--uniao-gold)" /> Exemplo 6 Batidas
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* Painel do Formulário */}
        <form onSubmit={handleSave} className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card-title">
            <User size={20} color="var(--uniao-blue)" />
            <span>Dados da Apuração</span>
          </div>

          {/* Seleção do Funcionário */}
          <div className="form-group">
            <label className="form-label">Funcionário</label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="form-select"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.registration}) — {emp.sector}
                </option>
              ))}
            </select>
            {selectedUnit && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Vinculado a: <strong>{selectedUnit.name}</strong>
              </div>
            )}
          </div>

          {/* Seleção da Data */}
          <div className="form-group">
            <label className="form-label">Data da Apuração</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} color="var(--text-muted)" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="form-input"
                style={{ flex: 1 }}
                required
              />
            </div>
          </div>

          {/* Seleção da Jornada Padrão */}
          <div className="form-group">
            <label className="form-label">Jornada Prevista</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setWorkloadType('8h00')}
                className={`btn ${workloadType === '8h00' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.85rem' }}
              >
                8h00 Diárias
              </button>
              <button
                type="button"
                onClick={() => setWorkloadType('7h20')}
                className={`btn ${workloadType === '7h20' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.85rem' }}
              >
                7h20 Diárias
              </button>
              <button
                type="button"
                onClick={() => setWorkloadType('custom')}
                className={`btn ${workloadType === 'custom' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.85rem' }}
              >
                Personalizada
              </button>
            </div>

            {workloadType === 'custom' && (
              <div style={{ marginTop: '8px' }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Definir Carga Horária (HH:MM)</label>
                <input
                  type="text"
                  placeholder="06:00"
                  value={customWorkload}
                  onChange={(e) => setCustomWorkload(e.target.value)}
                  className="form-input form-input-time"
                  style={{ width: '120px' }}
                />
              </div>
            )}
          </div>

          {/* Alternância 4 vs 6 Batidas */}
          <div className="form-group">
            <label className="form-label">Modelo de Batidas de Ponto</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setPunchesModel(4)}
                className={`btn ${punchesModel === 4 ? 'btn-secondary' : 'btn-outline'}`}
                style={{ fontWeight: 700 }}
              >
                4 Batidas (2 Turnos)
              </button>
              <button
                type="button"
                onClick={() => setPunchesModel(6)}
                className={`btn ${punchesModel === 6 ? 'btn-secondary' : 'btn-outline'}`}
                style={{ fontWeight: 700 }}
              >
                6 Batidas (3 Turnos)
              </button>
            </div>
          </div>

          {/* Campos de Horários */}
          <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '12px', color: 'var(--uniao-blue)' }}>
              Registros de Batidas ({punchesModel} batidas)
            </div>

            {/* Período 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Entrada 1</label>
                <input
                  type="time"
                  value={punches.e1}
                  onChange={(e) => handlePunchChange('e1', e.target.value)}
                  className="form-input form-input-time"
                  style={{ width: '100%' }}
                  required
                />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Saída 1</label>
                <input
                  type="time"
                  value={punches.s1}
                  onChange={(e) => handlePunchChange('s1', e.target.value)}
                  className="form-input form-input-time"
                  style={{ width: '100%' }}
                  required
                />
              </div>
            </div>

            {/* Período 2 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: punchesModel === 6 ? '12px' : '0' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Entrada 2</label>
                <input
                  type="time"
                  value={punches.e2}
                  onChange={(e) => handlePunchChange('e2', e.target.value)}
                  className="form-input form-input-time"
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Saída 2</label>
                <input
                  type="time"
                  value={punches.s2}
                  onChange={(e) => handlePunchChange('s2', e.target.value)}
                  className="form-input form-input-time"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Período 3 (Exibido apenas no modo 6 batidas) */}
            {punchesModel === 6 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingTop: '12px', borderTop: '1px dashed var(--border-color)' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Entrada 3</label>
                  <input
                    type="time"
                    value={punches.e3 || ''}
                    onChange={(e) => handlePunchChange('e3', e.target.value)}
                    className="form-input form-input-time"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Saída 3</label>
                  <input
                    type="time"
                    value={punches.s3 || ''}
                    onChange={(e) => handlePunchChange('s3', e.target.value)}
                    className="form-input form-input-time"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Observações Opcionais */}
          <div className="form-group">
            <label className="form-label">Observações / Justificativa</label>
            <input
              type="text"
              placeholder="Ex: Autorizado pelo gerente da unidade"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Botão de Gravação */}
          <button
            type="submit"
            disabled={!calculation.isValid}
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '8px' }}
          >
            <Save size={18} />
            <span>Salvar Registro no Histórico</span>
          </button>

          {saveSuccess && (
            <div
              style={{
                backgroundColor: 'var(--status-extra-bg)',
                color: 'var(--status-extra-text)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <CheckCircle2 size={18} />
              <span>Registro salvo no histórico com sucesso!</span>
            </div>
          )}
        </form>

        {/* Painel do Resultado do Cálculo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card-panel" style={{ borderLeft: '4px solid var(--uniao-blue)' }}>
            <div className="card-title" style={{ justifyContent: 'space-between' }}>
              <span>Resultado da Apuração</span>
              <StatusBadge situation={calculation.situation} />
            </div>

            {/* Metric Displays */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', margin: '20px 0' }}>
              <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Horas Trabalhadas
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--uniao-blue)' }}>
                  {calculation.formattedWorked}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  ({calculation.totalWorkedMinutes} minutos totais)
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Jornada Prevista
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {calculation.formattedTarget}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  (Carga Horária Padrão)
                </div>
              </div>
            </div>

            {/* Saldo Result Banner */}
            <div
              style={{
                backgroundColor:
                  calculation.situation === 'HORA EXTRA'
                    ? 'var(--status-extra-bg)'
                    : calculation.situation === 'DÉBITO DE HORAS'
                    ? 'var(--status-debit-bg)'
                    : 'var(--status-equal-bg)',
                border: `2px solid ${
                  calculation.situation === 'HORA EXTRA'
                    ? 'var(--status-extra-border)'
                    : calculation.situation === 'DÉBITO DE HORAS'
                    ? 'var(--status-debit-border)'
                    : 'var(--status-equal-border)'
                }`,
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                Saldo Apurado do Dia
              </div>
              <div
                style={{
                  fontSize: '3rem',
                  fontWeight: 800,
                  color:
                    calculation.situation === 'HORA EXTRA'
                      ? 'var(--status-extra-text)'
                      : calculation.situation === 'DÉBITO DE HORAS'
                      ? 'var(--status-debit-text)'
                      : 'var(--status-equal-text)',
                  lineHeight: 1.1,
                  margin: '6px 0'
                }}
              >
                {calculation.formattedBalance}
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                {calculation.situation === 'HORA EXTRA' && `+${calculation.balanceMinutes} minutos de Hora Extra a compensar/pagar`}
                {calculation.situation === 'DÉBITO DE HORAS' && `${Math.abs(calculation.balanceMinutes)} minutos em Débito com a empresa`}
                {calculation.situation === 'CUMPRIDA' && `Jornada exatamente cumprida`}
              </div>
            </div>
          </div>

          {/* Breakdown por Período */}
          <div className="card-panel">
            <div className="card-title">Detalhamento dos Turnos</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontWeight: 600 }}>Turno 1 (Entrada 1 ➔ Saída 1):</span>
                <strong style={{ fontFamily: 'monospace' }}>{Math.floor(calculation.period1Minutes / 60)}h {calculation.period1Minutes % 60}m</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontWeight: 600 }}>Turno 2 (Entrada 2 ➔ Saída 2):</span>
                <strong style={{ fontFamily: 'monospace' }}>{Math.floor(calculation.period2Minutes / 60)}h {calculation.period2Minutes % 60}m</strong>
              </div>
              {punchesModel === 6 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontWeight: 600 }}>Turno 3 (Entrada 3 ➔ Saída 3):</span>
                  <strong style={{ fontFamily: 'monospace' }}>{Math.floor(calculation.period3Minutes / 60)}h {calculation.period3Minutes % 60}m</strong>
                </div>
              )}
            </div>
          </div>

          {/* Warnings & Sanity Validation Notices */}
          {validationNotices.length > 0 && (
            <div style={{ backgroundColor: '#FEF3C7', border: '1px solid #FCD34D', padding: '14px', borderRadius: 'var(--radius-md)', color: '#92400E' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, marginBottom: '6px' }}>
                <AlertCircle size={18} />
                <span>Alertas de Conferência:</span>
              </div>
              <ul style={{ paddingLeft: '20px', fontSize: '0.825rem' }}>
                {validationNotices.map((n, idx) => (
                  <li key={idx}>{n.message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
