import React from 'react';
import { useFormulation } from '../../contexts/FormulationContext';
import { UserPlus } from 'lucide-react';

export default function Header() {
  const { state, actions } = useFormulation();
  const { projectInfo, projectResponsibles } = state;

  const update = (field, value) => actions.setProjectInfo({ [field]: value });

  const handleAddResponsible = () => {
    const name = prompt('Nom du nouveau responsable :');
    if (name?.trim()) {
      actions.addResponsible(name.trim());
      actions.setProjectInfo({ responsible: name.trim() });
    }
  };

  return (
    <div className="panel">
      <div className="panel-title">Informations du projet</div>
      <div className="header-grid">
        <div className="form-group">
          <label className="form-label">Date</label>
          <input
            type="date"
            className="form-input"
            value={projectInfo.date}
            onChange={e => update('date', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Référence</label>
          <input
            type="text"
            className="form-input"
            value={projectInfo.reference}
            onChange={e => update('reference', e.target.value)}
            placeholder="Ex: D4961AL"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Responsable</label>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <select
              className="form-select"
              value={projectInfo.responsible}
              onChange={e => update('responsible', e.target.value)}
            >
              <option value="">Sélectionner...</option>
              {projectResponsibles.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <button className="btn-icon" onClick={handleAddResponsible} title="Ajouter un responsable">
              <UserPlus size={16} />
            </button>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Client</label>
          <input
            type="text"
            className="form-input"
            value={projectInfo.client}
            onChange={e => update('client', e.target.value)}
            placeholder="Nom du client"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Dosage</label>
          <input
            type="text"
            className="form-input"
            value={projectInfo.dosage}
            onChange={e => update('dosage', e.target.value)}
            placeholder="Ex: 0.1%"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Application</label>
          <input
            type="text"
            className="form-input"
            value={projectInfo.application}
            onChange={e => update('application', e.target.value)}
            placeholder="Ex: Boisson gazeuse"
          />
        </div>
      </div>
    </div>
  );
}
