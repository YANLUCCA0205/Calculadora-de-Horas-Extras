import { TimesheetRecord } from '../types';

/**
 * Exporta uma lista de registros de jornada para um arquivo CSV formatado em UTF-8 com BOM
 * para visualização perfeita no Excel.
 */
export function exportToCSV(records: TimesheetRecord[], filename: string = 'relatorio_jornadas_uniao.csv') {
  if (!records || records.length === 0) return;

  const headers = [
    'Data',
    'Matrícula',
    'Funcionário',
    'Unidade',
    'Modelo Batidas',
    'Jornada Prevista',
    'Entrada 1',
    'Saída 1',
    'Entrada 2',
    'Saída 2',
    'Entrada 3',
    'Saída 3',
    'Horas Trabalhadas',
    'Saldo',
    'Situação',
    'Observações'
  ];

  const rows = records.map(r => [
    r.date,
    `"${r.employeeRegistration}"`,
    `"${r.employeeName}"`,
    `"${r.unitName}"`,
    `${r.punchesModel} Batidas`,
    r.calculation.formattedTarget,
    r.punches.e1 || '',
    r.punches.s1 || '',
    r.punches.e2 || '',
    r.punches.s2 || '',
    r.punches.e3 || '',
    r.punches.s3 || '',
    r.calculation.formattedWorked,
    r.calculation.formattedBalance,
    r.calculation.situation,
    `"${(r.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(row => row.join(';'))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Abre janela de impressão/PDF formatada profissionalmente com papel timbrado da marca União Supermercados.
 */
export function exportToPrintPDF(records: TimesheetRecord[], title: string = 'Relatório de Conferência de Jornadas') {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const dateNow = new Date().toLocaleDateString('pt-BR');

  const totalExtraMinutes = records.reduce((acc, r) => acc + (r.calculation.balanceMinutes > 0 ? r.calculation.balanceMinutes : 0), 0);
  const totalDebitMinutes = records.reduce((acc, r) => acc + (r.calculation.balanceMinutes < 0 ? Math.abs(r.calculation.balanceMinutes) : 0), 0);
  
  const totalExtraHHMM = `${Math.floor(totalExtraMinutes / 60).toString().padStart(2, '0')}:${(totalExtraMinutes % 60).toString().padStart(2, '0')}`;
  const totalDebitHHMM = `${Math.floor(totalDebitMinutes / 60).toString().padStart(2, '0')}:${(totalDebitMinutes % 60).toString().padStart(2, '0')}`;

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <title>${title} — União Supermercados</title>

      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; font-family: 'Montserrat', sans-serif; margin: 0; padding: 0; }
        body { padding: 24px; color: #0F172A; background: #FFF; font-size: 12px; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #E52E2D; padding-bottom: 16px; margin-bottom: 20px; }
        .header-logo { display: flex; align-items: center; gap: 16px; }
        .header-logo img { height: 48px; object-fit: contain; }
        .brand-title { font-size: 20px; font-weight: 800; color: #1E3A8A; text-transform: uppercase; }
        .brand-sub { font-size: 11px; color: #64748B; font-weight: 600; }
        .meta-info { text-align: right; font-size: 11px; color: #475569; }
        
        .title-bar { background: #1E3A8A; color: white; padding: 10px 16px; font-size: 14px; font-weight: 700; border-radius: 6px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
        
        .summary-cards { display: flex; gap: 16px; margin-bottom: 20px; }
        .card { flex: 1; border: 1px solid #E2E8F0; padding: 12px; border-radius: 6px; background: #F8FAFC; }
        .card-label { font-size: 10px; text-transform: uppercase; color: #64748B; font-weight: 700; }
        .card-val { font-size: 16px; font-weight: 800; margin-top: 4px; }
        .card-val.extra { color: #16A34A; }
        .card-val.debit { color: #DC2626; }

        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        th, td { border: 1px solid #CBD5E1; padding: 8px 10px; text-align: left; font-size: 11px; }
        th { background: #F1F5F9; color: #1E293B; font-weight: 700; text-transform: uppercase; font-size: 10px; }
        tr:nth-child(even) { background: #F8FAFC; }
        .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-weight: 700; font-size: 10px; }
        .badge-extra { background: #DCFCE7; color: #15803D; }
        .badge-debit { background: #FEE2E2; color: #B91C1C; }
        .badge-equal { background: #E0F2FE; color: #0369A1; }

        .footer { border-top: 1px solid #E2E8F0; padding-top: 12px; margin-top: 40px; display: flex; justify-content: space-between; font-size: 10px; color: #94A3B8; }
        
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="header-logo">
          <img src="/assets/logo_uniao.png" alt="União Supermercados" />
          <div>
            <div class="brand-title">União Supermercados</div>
            <div class="brand-sub">Sistema Interno de Controle e Apuração de Jornadas</div>
          </div>
        </div>
        <div class="meta-info">
          <div>Emissão: <strong>${dateNow}</strong></div>
          <div>Registros analisados: <strong>${records.length}</strong></div>
        </div>
      </div>

      <div class="title-bar">
        <span>${title}</span>
        <button class="no-print" onclick="window.print()" style="background: #E52E2D; color: white; border: none; padding: 6px 14px; font-weight: 700; border-radius: 4px; cursor: pointer;">Imprimir / Salvar PDF</button>
      </div>

      <div class="summary-cards">
        <div class="card">
          <div class="card-label">Total de Registros</div>
          <div class="card-val">${records.length}</div>
        </div>
        <div class="card">
          <div class="card-label">Total Horas Extras</div>
          <div class="card-val extra">+${totalExtraHHMM}</div>
        </div>
        <div class="card">
          <div class="card-label">Total Débitos de Horas</div>
          <div class="card-val debit">-${totalDebitHHMM}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Funcionário</th>
            <th>Matrícula</th>
            <th>Unidade</th>
            <th>Previsto</th>
            <th>Trabalhado</th>
            <th>Batidas</th>
            <th>Saldo</th>
            <th>Situação</th>
          </tr>
        </thead>
        <tbody>
          ${records.map(r => {
            let badgeClass = 'badge-equal';
            if (r.calculation.situation === 'HORA EXTRA') badgeClass = 'badge-extra';
            if (r.calculation.situation === 'DÉBITO DE HORAS') badgeClass = 'badge-debit';
            
            const punchesStr = [
              r.punches.e1, r.punches.s1, r.punches.e2, r.punches.s2, r.punches.e3, r.punches.s3
            ].filter(Boolean).join(' | ');

            return `
              <tr>
                <td>${r.date}</td>
                <td><strong>${r.employeeName}</strong></td>
                <td>${r.employeeRegistration}</td>
                <td>${r.unitName}</td>
                <td>${r.calculation.formattedTarget}</td>
                <td>${r.calculation.formattedWorked}</td>
                <td style="font-family: monospace; font-size: 10px;">${punchesStr}</td>
                <td><strong>${r.calculation.formattedBalance}</strong></td>
                <td><span class="badge ${badgeClass}">${r.calculation.situation}</span></td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <div class="footer">
        <div>União Supermercados — Sistema Interno de Gestão de Jornadas (Conferência de RH)</div>
        <div>Página 1 de 1</div>
      </div>

      <script>
        window.onload = function() {
          // Auto trigger print prompt
          setTimeout(function() { window.print(); }, 500);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
