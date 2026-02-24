import React, { useMemo } from 'react';
import { useFormulation } from '../../contexts/FormulationContext';
import { classifyFormula } from '../../utils/calculations';
import { Shield } from 'lucide-react';

export default function ClassificationBadge() {
  const { state } = useFormulation();
  const { trials, ingredients, ui } = state;
  const trial = trials[ui.selectedTrial];

  const classification = useMemo(
    () => classifyFormula(trial?.data, ingredients),
    [trial?.data, ingredients]
  );

  if (!classification.label) {
    return (
      <div className="panel">
        <div className="panel-title"><Shield size={14} /> Classification EU 1334/2008</div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Ajoutez des aromatisants pour voir la classification</div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-title"><Shield size={14} /> Classification EU 1334/2008</div>
      <div className={`classification-badge ${classification.cssClass}`} style={{ marginBottom: '0.5rem' }}>
        {classification.label}
      </div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{classification.details}</div>

      {classification.sources?.length > 0 && (
        <div style={{ marginTop: '0.75rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
            Répartition des sources :
          </div>
          {classification.sources.map((src, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
              <div style={{ flex: 1 }}>{src.source}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{src.percentage.toFixed(1)}%</div>
              <div style={{
                width: 60,
                height: 6,
                background: 'var(--bg-tertiary)',
                borderRadius: 3,
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${Math.max(src.percentage, 2)}%`,
                  height: '100%',
                  background: 'var(--color-primary)',
                  borderRadius: 3,
                }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
