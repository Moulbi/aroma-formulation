import React, { useMemo } from 'react';
import { useFormulation } from '../../contexts/FormulationContext';
import { calculateDensity, calculateVanillinProfile } from '../../utils/calculations';
import { Beaker, Droplets } from 'lucide-react';

export default function TechnicalPanel() {
  const { state } = useFormulation();
  const { trials, ingredients, ui } = state;
  const trial = trials[ui.selectedTrial];

  const density = useMemo(() => calculateDensity(trial?.data, ingredients), [trial?.data, ingredients]);
  const vanillin = useMemo(() => calculateVanillinProfile(trial?.data, ingredients), [trial?.data, ingredients]);

  return (
    <div className="panel">
      <div className="panel-title"><Beaker size={14} /> Propriétés techniques — {trial?.name || `Essai ${ui.selectedTrial}`}</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Density */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
            <Droplets size={14} style={{ color: 'var(--color-info)' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Densité du mélange</span>
          </div>
          <div className="analysis-value" style={{ fontSize: '1.2rem' }}>
            {density > 0 ? density.toFixed(3) : '-'}
            <span className="analysis-unit">g/mL</span>
          </div>
        </div>

        {/* Vanillin */}
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            Profil vanilline
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Taux : </span>
              <strong>{vanillin.percentage > 0 ? vanillin.percentage.toFixed(2) + '%' : '-'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Fold : </span>
              <strong>{vanillin.fold > 0 ? vanillin.fold.toFixed(1) + 'x' : '-'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-secondary)' }}>Équiv. gousses : </span>
              <strong>{vanillin.beansEquiv > 0 ? vanillin.beansEquiv.toFixed(1) + ' g/kg' : '-'}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
