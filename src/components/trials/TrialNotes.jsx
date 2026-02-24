import React from 'react';
import { useFormulation } from '../../contexts/FormulationContext';
import { StickyNote } from 'lucide-react';

export default function TrialNotes() {
  const { state, actions } = useFormulation();
  const { trials, ui } = state;
  const { selectedTrial } = ui;
  const trial = trials[selectedTrial];
  const notes = trial?.notes || {};

  const handleChange = (field, value) => {
    actions.setTrialNotes(selectedTrial, field, value);
  };

  return (
    <div className="panel">
      <div className="panel-title"><StickyNote size={14} /> Notes — {trial?.name || `Essai ${selectedTrial}`}</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
        <div className="form-group">
          <label className="form-label">Notes sensorielles</label>
          <textarea
            className="form-input"
            rows={4}
            value={notes.sensorielles || ''}
            onChange={e => handleChange('sensorielles', e.target.value)}
            placeholder="Observations sensorielles..."
            style={{ resize: 'vertical' }}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Notes techniques</label>
          <textarea
            className="form-input"
            rows={4}
            value={notes.techniques || ''}
            onChange={e => handleChange('techniques', e.target.value)}
            placeholder="Observations techniques..."
            style={{ resize: 'vertical' }}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Commentaires</label>
          <textarea
            className="form-input"
            rows={4}
            value={notes.commentaires || ''}
            onChange={e => handleChange('commentaires', e.target.value)}
            placeholder="Commentaires généraux..."
            style={{ resize: 'vertical' }}
          />
        </div>
      </div>
    </div>
  );
}
