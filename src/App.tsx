import React, { useState } from 'react';
import { WorkloadType, PunchesModel, PunchesData, CalculationResult, SituationType } from './types';
import { calculateTimesheet, timeToMinutes, getTargetMinutes } from './services/workloadCalculator';
import { StatusBadge } from './components/StatusBadge';
import { Clock, RotateCcw, AlertCircle, Calculator } from 'lucide-react';

/**
 * Retorna o título da seção de saldo (substitui "SALDO APURADO" por "HORAS EXTRAS" ou "HORAS FALTAS")
 */
function getResultHeaderTitle(situation: SituationType): string {
  if (situation === 'HORA EXTRA') return 'HORAS EXTRAS';
  if (situation === 'DÉBITO DE HORAS') return 'HORAS FALTAS';
  return 'SALDO APURADO';
}

/**
 * Retorna o valor em texto por extenso (ex: "50 Minutos", "1 Hora", "1 Hora e 10 Minutos")
 */
function getResultValueText(balanceMinutes: number, situation: SituationType): string {
  if (situation === 'JORNADA COMPLETA' || Math.round(balanceMinutes) === 0) {
    return 'Jornada Completa';
  }
  const absMins = Math.abs(Math.round(balanceMinutes));
  const hours = Math.floor(absMins / 60);
  const mins = absMins % 60;

  let timeParts: string[] = [];
  if (hours > 0) {
    timeParts.push(`${hours} ${hours === 1 ? 'Hora' : 'Horas'}`);
  }
  if (mins > 0 || hours === 0) {
    timeParts.push(`${mins} Minutos`);
  }
  return timeParts.join(' e ');
}

export const App: React.FC = () => {
  // Padrão: 7h20 diárias selecionado por padrão
  const [workloadType, setWorkloadType] = useState<WorkloadType>('7h20');
  const [customWorkload, setCustomWorkload] = useState<string>('07:20');
  const [punchesModel, setPunchesModel] = useState<PunchesModel>(4);

  // Campos por padrão completamente LIMPOS sem horário nenhum
  const [punches, setPunches] = useState<PunchesData>({
    e1: '',
    s1: '',
    e2: '',
    s2: '',
    e3: '',
    s3: ''
  });

  const [calculation, setCalculation] = useState<CalculationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePunchChange = (field: keyof PunchesData, value: string) => {
    setPunches((prev) => ({ ...prev, [field]: value }));
    if (calculation || errorMessage) {
      setCalculation(null);
      setErrorMessage(null);
    }
  };

  const handleModelChange = (model: PunchesModel) => {
    setPunchesModel(model);
    setCalculation(null);
    setErrorMessage(null);
  };

  const handleWorkloadChange = (type: WorkloadType) => {
    setWorkloadType(type);
    setCalculation(null);
    setErrorMessage(null);
  };

  const handleReset = () => {
    setPunches({ e1: '', s1: '', e2: '', s2: '', e3: '', s3: '' });
    setCalculation(null);
    setErrorMessage(null);
  };

  // Função de validação dos horários
  const validateAndCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const targetMins = getTargetMinutes(workloadType, customWorkload);

    if (workloadType === 'custom') {
      if (!customWorkload || timeToMinutes(customWorkload) === null) {
        setErrorMessage('Por favor, informe uma jornada personalizada válida no formato HH:MM (ex: 06:00).');
        setCalculation(null);
        return;
      }
    }

    const requiredFields: (keyof PunchesData)[] =
      punchesModel === 4
        ? ['e1', 's1', 'e2', 's2']
        : ['e1', 's1', 'e2', 's2', 'e3', 's3'];

    const labelsMap: Record<keyof PunchesData, string> = {
      e1: 'Entrada 1',
      s1: 'Saída 1',
      e2: 'Entrada 2',
      s2: 'Saída 2',
      e3: 'Entrada 3',
      s3: 'Saída 3'
    };

    // 1. Verificação de preenchimento completo
    const emptyFields = requiredFields.filter((field) => !punches[field] || !punches[field]?.trim());
    if (emptyFields.length > 0) {
      const names = emptyFields.map((f) => labelsMap[f]).join(', ');
      setErrorMessage(`Preencha todos os campos do modelo de ${punchesModel} batidas. Campo(s) pendente(s): ${names}.`);
      setCalculation(null);
      return;
    }

    // 2. Verificação de formato HH:MM
    for (const field of requiredFields) {
      const val = punches[field] || '';
      if (timeToMinutes(val) === null) {
        setErrorMessage(`O campo "${labelsMap[field]}" contém um horário inválido (${val}). Use o formato HH:MM (ex: 08:00).`);
        setCalculation(null);
        return;
      }
    }

    // 3. VALIDAÇÃO DE COERÊNCIA CRONOLÓGICA (Horários Ilógicos)
    const e1 = timeToMinutes(punches.e1 || '')!;
    const s1 = timeToMinutes(punches.s1 || '')!;
    const e2 = timeToMinutes(punches.e2 || '')!;
    const s2 = timeToMinutes(punches.s2 || '')!;
    const e3 = punchesModel === 6 ? timeToMinutes(punches.e3 || '') : null;
    const s3 = punchesModel === 6 ? timeToMinutes(punches.s3 || '') : null;

    if (s1 <= e1) {
      setErrorMessage(`Horário ilógico: a Saída 1 (${punches.s1}) deve ser posterior à Entrada 1 (${punches.e1}).`);
      setCalculation(null);
      return;
    }

    if (e2 <= s1) {
      setErrorMessage(`Horário ilógico: a Entrada 2 (${punches.e2}) não pode ser anterior ou igual à Saída 1 (${punches.s1}). Verifique a ordem cronológica dos horários.`);
      setCalculation(null);
      return;
    }

    if (s2 <= e2) {
      setErrorMessage(`Horário ilógico: a Saída 2 (${punches.s2}) deve ser posterior à Entrada 2 (${punches.e2}).`);
      setCalculation(null);
      return;
    }

    if (punchesModel === 6 && e3 !== null && s3 !== null) {
      if (e3 <= s2) {
        setErrorMessage(`Horário ilógico: a Entrada 3 (${punches.e3}) não pode ser anterior ou igual à Saída 2 (${punches.s2}).`);
        setCalculation(null);
        return;
      }
      if (s3 <= e3) {
        setErrorMessage(`Horário ilógico: a Saída 3 (${punches.s3}) deve ser posterior à Entrada 3 (${punches.e3}).`);
        setCalculation(null);
        return;
      }
    }

    // 4. VALIDAÇÃO LEGAL CLT (Art. 71): Máximo de 6 horas contínuas de trabalho sem intervalo
    const maxContinuousMinutes = 6 * 60; // 360 minutos = 6 horas

    const p1Minutes = s1 - e1;
    if (p1Minutes > maxContinuousMinutes) {
      const hours = Math.floor(p1Minutes / 60);
      const mins = p1Minutes % 60;
      const durationStr = `${hours}h${mins > 0 ? mins + 'm' : ''}`;
      setErrorMessage(`Infração CLT (Art. 71): O 1º período de trabalho (${punches.e1} às ${punches.s1} = ${durationStr}) ultrapassa o limite legal máximo de 6 horas contínuas sem intervalo para refeição/almoço.`);
      setCalculation(null);
      return;
    }

    const p2Minutes = s2 - e2;
    if (p2Minutes > maxContinuousMinutes) {
      const hours = Math.floor(p2Minutes / 60);
      const mins = p2Minutes % 60;
      const durationStr = `${hours}h${mins > 0 ? mins + 'm' : ''}`;
      setErrorMessage(`Infração CLT (Art. 71): O 2º período de trabalho (${punches.e2} às ${punches.s2} = ${durationStr}) ultrapassa o limite legal máximo de 6 horas contínuas sem intervalo para refeição/almoço.`);
      setCalculation(null);
      return;
    }

    if (punchesModel === 6 && e3 !== null && s3 !== null) {
      const p3Minutes = s3 - e3;
      if (p3Minutes > maxContinuousMinutes) {
        const hours = Math.floor(p3Minutes / 60);
        const mins = p3Minutes % 60;
        const durationStr = `${hours}h${mins > 0 ? mins + 'm' : ''}`;
        setErrorMessage(`Infração CLT (Art. 71): O 3º período de trabalho (${punches.e3} às ${punches.s3} = ${durationStr}) ultrapassa o limite legal máximo de 6 horas contínuas sem intervalo para refeição/almoço.`);
        setCalculation(null);
        return;
      }
    }

    // 5. VALIDAÇÃO LEGAL CLT (Art. 71 Caput): Intervalo Mínimo de Almoço de 1 hora (60 minutos) para jornadas > 6h
    if (targetMins > 6 * 60) {
      const mainLunchMinutes = e2 - s1;
      if (mainLunchMinutes < 60) {
        setErrorMessage(`Infração CLT (Art. 71): O intervalo de almoço/refeição entre a Saída 1 (${punches.s1}) e Entrada 2 (${punches.e2}) foi de apenas ${mainLunchMinutes} minutos. Para jornadas superiores a 6 horas, a lei exige no mínimo 1 hora (60 minutos) de intervalo.`);
        setCalculation(null);
        return;
      }
    }

    // 6. VALIDAÇÃO LEGAL CLT (Art. 59): Limite Máximo de 2 horas extras diárias (Jornada Máxima de 10h diárias)
    const totalWorkedMinutes = p1Minutes + p2Minutes + (punchesModel === 6 && e3 !== null && s3 !== null ? s3 - e3 : 0);
    const maxAllowedWork = targetMins + (2 * 60); // Meta + 2h extras max
    if (totalWorkedMinutes > maxAllowedWork) {
      const extraMinutes = totalWorkedMinutes - targetMins;
      const extraH = Math.floor(extraMinutes / 60);
      const extraM = extraMinutes % 60;
      setErrorMessage(`Alerta CLT (Art. 59): As horas extras apuradas (${extraH}h${extraM > 0 ? extraM + 'm' : ''}) ultrapassam o limite legal máximo de 2 horas extras por dia.`);
      setCalculation(null);
      return;
    }

    const res = calculateTimesheet(punchesModel, workloadType, punches, customWorkload);
    setCalculation(res);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 16px'
      }}
    >
      {/* Header com Logo Horizontal Pristino */}
      <header
        style={{
          width: '100%',
          maxWidth: '720px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginBottom: '24px'
        }}
      >
        <img
          src="/assets/logo_horizontal_oficial.png?v=3"
          alt="UNIÃO LOGO NOVO - HORIZONTAL COLORIDO"
          style={{ height: '75px', width: 'auto', maxWidth: '100%', objectFit: 'contain', marginBottom: '16px' }}
        />
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--uniao-blue)', margin: 0 }}>
          CALCULADORA DE JORNADA DE TRABALHO
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Ferramenta oficial do União Supermercados para cálculo de horas e saldo diário
        </p>
      </header>

      {/* Main Container da Calculadora */}
      <main
        style={{
          width: '100%',
          maxWidth: '720px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-md)',
          padding: '28px'
        }}
      >
        <form onSubmit={validateAndCalculate} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* 1. SELEÇÃO DA JORNADA */}
          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--uniao-blue)', display: 'block', marginBottom: '8px' }}>
              1. Jornada Prevista
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => handleWorkloadChange('7h20')}
                className={`btn ${workloadType === '7h20' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontWeight: 800, padding: '12px' }}
              >
                07:20
              </button>
              <button
                type="button"
                onClick={() => handleWorkloadChange('8h00')}
                className={`btn ${workloadType === '8h00' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontWeight: 800, padding: '12px' }}
              >
                08:00
              </button>
              <button
                type="button"
                onClick={() => handleWorkloadChange('custom')}
                className={`btn ${workloadType === 'custom' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontWeight: 800, padding: '12px' }}
              >
                Personalizada
              </button>
            </div>

            {workloadType === 'custom' && (
              <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Digite a jornada (HH:MM):
                </span>
                <input
                  type="text"
                  value={customWorkload}
                  onChange={(e) => setCustomWorkload(e.target.value)}
                  placeholder="06:00"
                  className="form-input form-input-time"
                  style={{ width: '110px' }}
                />
              </div>
            )}
          </div>

          {/* 2. SELEÇÃO DO MODELO DE BATIDAS */}
          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--uniao-blue)', display: 'block', marginBottom: '8px' }}>
              2. Modelo de Batidas de Ponto
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => handleModelChange(4)}
                className={`btn ${punchesModel === 4 ? 'btn-secondary' : 'btn-outline'}`}
                style={{ fontWeight: 800, padding: '12px' }}
              >
                4 BATIDAS
              </button>
              <button
                type="button"
                onClick={() => handleModelChange(6)}
                className={`btn ${punchesModel === 6 ? 'btn-secondary' : 'btn-outline'}`}
                style={{ fontWeight: 800, padding: '12px' }}
              >
                6 BATIDAS
              </button>
            </div>
          </div>

          {/* 3. CAMPOS DE PREENCHIMENTO DOS HORÁRIOS */}
          <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '20px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={18} color="var(--uniao-red)" />
                Informe os Horários do Dia ({punchesModel} batidas):
              </span>
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}
                title="Limpar todos os campos"
              >
                <RotateCcw size={12} /> Limpar
              </button>
            </div>

            {/* Modo 4 Batidas */}
            {punchesModel === 4 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Entrada 1</label>
                  <input
                    type="time"
                    value={punches.e1}
                    onChange={(e) => handlePunchChange('e1', e.target.value)}
                    className="form-input form-input-time"
                    placeholder="HH:MM"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Saída 1</label>
                  <input
                    type="time"
                    value={punches.s1}
                    onChange={(e) => handlePunchChange('s1', e.target.value)}
                    className="form-input form-input-time"
                    placeholder="HH:MM"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Entrada 2</label>
                  <input
                    type="time"
                    value={punches.e2}
                    onChange={(e) => handlePunchChange('e2', e.target.value)}
                    className="form-input form-input-time"
                    placeholder="HH:MM"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Saída 2</label>
                  <input
                    type="time"
                    value={punches.s2}
                    onChange={(e) => handlePunchChange('s2', e.target.value)}
                    className="form-input form-input-time"
                    placeholder="HH:MM"
                  />
                </div>
              </div>
            )}

            {/* Modo 6 Batidas */}
            {punchesModel === 6 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Entrada 1</label>
                  <input
                    type="time"
                    value={punches.e1}
                    onChange={(e) => handlePunchChange('e1', e.target.value)}
                    className="form-input form-input-time"
                    placeholder="HH:MM"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Saída 1</label>
                  <input
                    type="time"
                    value={punches.s1}
                    onChange={(e) => handlePunchChange('s1', e.target.value)}
                    className="form-input form-input-time"
                    placeholder="HH:MM"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Entrada 2</label>
                  <input
                    type="time"
                    value={punches.e2}
                    onChange={(e) => handlePunchChange('e2', e.target.value)}
                    className="form-input form-input-time"
                    placeholder="HH:MM"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Saída 2</label>
                  <input
                    type="time"
                    value={punches.s2}
                    onChange={(e) => handlePunchChange('s2', e.target.value)}
                    className="form-input form-input-time"
                    placeholder="HH:MM"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Entrada 3</label>
                  <input
                    type="time"
                    value={punches.e3 || ''}
                    onChange={(e) => handlePunchChange('e3', e.target.value)}
                    className="form-input form-input-time"
                    placeholder="HH:MM"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Saída 3</label>
                  <input
                    type="time"
                    value={punches.s3 || ''}
                    onChange={(e) => handlePunchChange('s3', e.target.value)}
                    className="form-input form-input-time"
                    placeholder="HH:MM"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Mensagem de Erro / Alerta */}
          {errorMessage && (
            <div
              style={{
                backgroundColor: '#FEE2E2',
                border: '1px solid #FCA5A5',
                color: '#991B1B',
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '0.875rem',
                fontWeight: 600
              }}
            >
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* BOTÃO DE CALCULAR HORAS */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '1.1rem',
              fontWeight: 800,
              letterSpacing: '0.05em',
              boxShadow: '0 4px 14px rgba(229, 46, 45, 0.3)',
              cursor: 'pointer'
            }}
          >
            <Calculator size={22} />
            <span>CALCULAR HORAS</span>
          </button>
        </form>

        {/* 4. PAINEL DE RESULTADO FORMATADO */}
        {calculation ? (
          <div
            style={{
              marginTop: '24px',
              backgroundColor:
                calculation.situation === 'HORA EXTRA'
                  ? '#F0FDF4'
                  : calculation.situation === 'DÉBITO DE HORAS'
                  ? '#FEF2F2'
                  : '#F0F9FF',
              border: `2px solid ${
                calculation.situation === 'HORA EXTRA'
                  ? '#86EFAC'
                  : calculation.situation === 'DÉBITO DE HORAS'
                  ? '#FCA5A5'
                  : '#7DD3FC'
              }`,
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                Resultado do Cálculo
              </span>
              <StatusBadge situation={calculation.situation} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ backgroundColor: '#FFFFFF', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Horas Trabalhadas
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--uniao-blue)' }}>
                  {calculation.formattedWorked}
                </div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Jornada Prevista
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {calculation.formattedTarget}
                </div>
              </div>
            </div>

            {/* SEÇÃO PRINCIPAL DE HORAS EXTRAS / HORAS FALTAS */}
            <div style={{ textAlign: 'center', paddingTop: '8px' }}>
              <div
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '4px',
                  color:
                    calculation.situation === 'HORA EXTRA'
                      ? '#15803D'
                      : calculation.situation === 'DÉBITO DE HORAS'
                      ? '#B91C1C'
                      : '#0369A1'
                }}
              >
                {getResultHeaderTitle(calculation.situation)}
              </div>
              <div
                style={{
                  fontSize: '2.4rem',
                  fontWeight: 800,
                  lineHeight: 1.2,
                  color:
                    calculation.situation === 'HORA EXTRA'
                      ? '#15803D'
                      : calculation.situation === 'DÉBITO DE HORAS'
                      ? '#B91C1C'
                      : '#0369A1'
                }}
              >
                {getResultValueText(calculation.balanceMinutes, calculation.situation)}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '6px', fontFamily: 'monospace', fontWeight: 700 }}>
                ({calculation.formattedBalance})
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              marginTop: '24px',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px dashed var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '24px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.875rem'
            }}
          >
            Preencha os horários acima no formato <strong>HH:MM</strong> e clique em <strong>CALCULAR HORAS</strong> para visualizar a apuração.
          </div>
        )}
      </main>

      <footer style={{ marginTop: '24px', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        União Supermercados — Ferramenta Interna de Cálculo de Jornadas
      </footer>
    </div>
  );
};
