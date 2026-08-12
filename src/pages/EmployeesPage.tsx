import React, { useState } from 'react';
import { Employee, Unit, WorkloadType } from '../types';
import { Users, UserPlus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface EmployeesPageProps {
  employees: Employee[];
  units: Unit[];
  onAddEmployee: (emp: Omit<Employee, 'id'>) => void;
  onUpdateEmployee: (emp: Employee) => void;
  onDeleteEmployee: (id: string) => void;
}

export const EmployeesPage: React.FC<EmployeesPageProps> = ({
  employees,
  units,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [name, setName] = useState<string>('');
  const [registration, setRegistration] = useState<string>('');
  const [sector, setSector] = useState<string>('Operacional / Caixa');
  const [unitId, setUnitId] = useState<string>(units[0]?.id || 'u-01');
  const [defaultWorkload, setDefaultWorkload] = useState<WorkloadType>('8h00');

  const handleOpenAdd = () => {
    setEditingEmployee(null);
    setName('');
    setRegistration(`UNI-${Math.floor(1000 + Math.random() * 9000)}`);
    setSector('Caixa / Operações');
    setUnitId(units[0]?.id || 'u-01');
    setDefaultWorkload('8h00');
    setShowModal(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setName(emp.name);
    setRegistration(emp.registration);
    setSector(emp.sector);
    setUnitId(emp.unitId);
    setDefaultWorkload(emp.defaultWorkload);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !registration.trim()) return;

    if (editingEmployee) {
      onUpdateEmployee({
        ...editingEmployee,
        name,
        registration,
        sector,
        unitId,
        defaultWorkload
      });
    } else {
      onAddEmployee({
        name,
        registration,
        sector,
        unitId,
        defaultWorkload,
        active: true
      });
    }

    setShowModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="card-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Users size={22} color="var(--uniao-blue)" />
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--uniao-blue)' }}>
              Cadastro de Funcionários
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Gerenciamento de colaboradores, setores, lojas vinculadas e jornadas de trabalho padrão.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary">
          <UserPlus size={18} />
          <span>Cadastrar Novo Funcionário</span>
        </button>
      </div>

      <div className="card-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Matrícula</th>
                <th>Nome do Colaborador</th>
                <th>Setor / Função</th>
                <th>Loja / Unidade</th>
                <th>Jornada Padrão</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => {
                const unit = units.find((u) => u.id === emp.unitId);
                return (
                  <tr key={emp.id}>
                    <td><strong style={{ fontFamily: 'monospace' }}>{emp.registration}</strong></td>
                    <td><strong>{emp.name}</strong></td>
                    <td>{emp.sector}</td>
                    <td>{unit?.name || 'Não Vinculada'}</td>
                    <td>
                      <span className="badge-status cumprida" style={{ fontSize: '0.7rem' }}>
                        {emp.defaultWorkload}
                      </span>
                    </td>
                    <td>
                      {emp.active ? (
                        <span style={{ color: '#16A34A', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 700 }}>
                          <CheckCircle size={14} /> Ativo
                        </span>
                      ) : (
                        <span style={{ color: '#DC2626', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 700 }}>
                          <XCircle size={14} /> Inativo
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <button onClick={() => handleOpenEdit(emp)} className="btn btn-outline btn-sm">
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => onDeleteEmployee(emp.id)}
                          className="btn btn-outline btn-sm"
                          style={{ color: 'var(--uniao-red)', borderColor: 'rgba(229, 46, 45, 0.2)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
          <form onSubmit={handleSubmit} className="card-panel" style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--uniao-blue)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              {editingEmployee ? 'Editar Funcionário' : 'Novo Funcionário'}
            </div>

            <div className="form-group">
              <label className="form-label">Nome Completo</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="form-input" required />
            </div>

            <div className="form-group">
              <label className="form-label">Matrícula</label>
              <input type="text" value={registration} onChange={(e) => setRegistration(e.target.value)} className="form-input" required />
            </div>

            <div className="form-group">
              <label className="form-label">Setor / Departamento</label>
              <select value={sector} onChange={(e) => setSector(e.target.value)} className="form-select">
                <option value="Caixa / Operações">Caixa / Operações</option>
                <option value="Hortifrúti">Hortifrúti</option>
                <option value="Açougue">Açougue</option>
                <option value="Padaria">Padaria</option>
                <option value="Mercearia / Reposição">Mercearia / Reposição</option>
                <option value="Depósito / Logística">Depósito / Logística</option>
                <option value="Administrativo / RH">Administrativo / RH</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Loja / Unidade Alocada</label>
              <select value={unitId} onChange={(e) => setUnitId(e.target.value)} className="form-select">
                {units.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Jornada Padrão</label>
              <select value={defaultWorkload} onChange={(e) => setDefaultWorkload(e.target.value as WorkloadType)} className="form-select">
                <option value="8h00">8h00 Diárias (44h/sem)</option>
                <option value="7h20">7h20 Diárias (44h/sem em 6 dias)</option>
                <option value="custom">Personalizada</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline" style={{ flex: 1 }}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                Salvar Funcionário
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
