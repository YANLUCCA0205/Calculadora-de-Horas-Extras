import React, { useState } from 'react';
import { Unit } from '../types';
import { Building, Plus, MapPin, CheckCircle, XCircle } from 'lucide-react';

interface UnitsPageProps {
  units: Unit[];
  onAddUnit: (unit: Omit<Unit, 'id'>) => void;
  onToggleUnitStatus: (id: string) => void;
}

export const UnitsPage: React.FC<UnitsPageProps> = ({
  units,
  onAddUnit,
  onToggleUnitStatus
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [city, setCity] = useState<string>('Conceição das Alagoas - MG');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    onAddUnit({
      name,
      code,
      address,
      city,
      active: true
    });

    setName('');
    setCode('');
    setAddress('');
    setShowModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="card-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Building size={22} color="var(--uniao-blue)" />
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--uniao-blue)' }}>
              Unidades & Lojas — União Supermercados
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Lojas físicas cadastradas no sistema para separação e filtro de apurações de jornada.
          </p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={18} />
          <span>Cadastrar Nova Loja</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {units.map((unit) => (
          <div key={unit.id} className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="badge-status cumprida" style={{ fontSize: '0.7rem', marginBottom: '6px' }}>
                  {unit.code}
                </span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--uniao-blue)' }}>{unit.name}</h3>
              </div>
              <button
                onClick={() => onToggleUnitStatus(unit.id)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
                title="Alternar Status Ativo/Inativo"
              >
                {unit.active ? <CheckCircle color="#16A34A" size={20} /> : <XCircle color="#DC2626" size={20} />}
              </button>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
              <MapPin size={16} color="var(--uniao-red)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div>{unit.address}</div>
                <strong style={{ color: 'var(--text-primary)' }}>{unit.city}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add Unit */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
          <form onSubmit={handleSubmit} className="card-panel" style={{ width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--uniao-blue)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              Cadastrar Nova Loja
            </div>

            <div className="form-group">
              <label className="form-label">Nome da Loja</label>
              <input type="text" placeholder="Ex: Loja 04 — Bairro Novo" value={name} onChange={(e) => setName(e.target.value)} className="form-input" required />
            </div>

            <div className="form-group">
              <label className="form-label">Código Interno</label>
              <input type="text" placeholder="LOJA-04" value={code} onChange={(e) => setCode(e.target.value)} className="form-input" required />
            </div>

            <div className="form-group">
              <label className="form-label">Endereço Completo</label>
              <input type="text" placeholder="Av. Principal, 100" value={address} onChange={(e) => setAddress(e.target.value)} className="form-input" required />
            </div>

            <div className="form-group">
              <label className="form-label">Cidade / Estado</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="form-input" required />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline" style={{ flex: 1 }}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                Salvar Loja
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
