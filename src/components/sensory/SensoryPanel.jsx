import React from 'react';
import { useFormulation } from '../../contexts/FormulationContext';
import { SENSORY_PRESETS } from '../../data/constants';
import SensoryChart from './SensoryChart';
import { Radar, Plus, X, RotateCcw } from 'lucide-react';

export default function SensoryPanel() {
  const { state, actions } = useFormulation();
  const { trials, sensoryDescriptors, ui } = state;
  const { selectedTrial } = ui;
  const trial = trials[selectedTrial];

  const handleValueChange = (descriptorName, value) => {
    const num = Math.max(0, Math.min(10, parseInt(value) || 0));
    actions.setSensoryValue(selectedTrial, descriptorName, num);
  };

  const handleAddDescriptor = () => {
    const name = prompt('Nom du nouveau descripteur :');
    if (!name?.trim()) return;
    if (sensoryDescriptors.some(d => d.name.toLowerCase() === name.trim().toLowerCase())) {
      actions.notify('warning', 'Ce descripteur existe déjà');
      return;
    }
    actions.addDescriptor(name.trim());
    actions.notify('success', `Descripteur "${name.trim()}" ajouté`);
  };

  const handleApplyPreset = (presetKey) => {
    const preset = SENSORY_PRESETS[presetKey];
    if (!preset) return;
    actions.applySensoryPreset(selectedTrial, preset.descriptors);
    actions.notify('success', `Profil "${preset.label}" appliqué`);
  };

  const handleClear = () => {
    sensoryDescriptors.forEach(desc => {
      actions.setSensoryValue(selectedTrial, desc.name, 0);
    });
  };

  return (
    <div className="panel">
      <div className="panel-title"><Radar size={14} /> Profil sensoriel — {trial?.name || `Essai ${selectedTrial}`}</div>

      {/* Presets */}
      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
        {Object.entries(SENSORY_PRESETS).map(([key, preset]) => (
          <button key={key} className="btn btn-outline btn-sm" onClick={() => handleApplyPreset(key)}>
            {preset.label}
          </button>
        ))}
        <button className="btn btn-outline btn-sm" onClick={handleClear} title="Réinitialiser">
          <RotateCcw size={12} />
        </button>
      </div>

      <div className="sensory-section">
        {/* Chart */}
        <div>
          <SensoryChart />
        </div>

        {/* Descriptors list */}
        <div>
          {sensoryDescriptors.map(desc => {
            const profileEntry = trial?.sensoryProfile?.find(p => p.descriptor === desc.name);
            const value = profileEntry?.value ?? 0;

            return (
              <div key={desc.id} className="descriptor-item">
                <span className="descriptor-name">{desc.name}</span>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={value}
                  onChange={e => handleValueChange(desc.name, e.target.value)}
                />
                <button className="btn-icon" onClick={() => actions.removeDescriptor(desc.id)} title="Supprimer" style={{ color: 'var(--color-danger)' }}>
                  <X size={12} />
                </button>
              </div>
            );
          })}

          <button className="btn btn-outline btn-sm" onClick={handleAddDescriptor} style={{ marginTop: '0.5rem' }}>
            <Plus size={12} /> Ajouter descripteur
          </button>
        </div>
      </div>
    </div>
  );
}
