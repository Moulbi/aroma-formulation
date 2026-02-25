import React, { useMemo } from 'react';
import { useFormulation } from '../../contexts/FormulationContext';
import { calculateTrialCost } from '../../utils/calculations';
import { Euro, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

export default function CostPanel() {
  const { state, actions } = useFormulation();
  const { trials, ingredients, qspIngredientId, ui } = state;
  const { selectedTrial, pricingFactor } = ui;
  const trial = trials[selectedTrial];

  const costs = useMemo(
    () => calculateTrialCost(trial?.data, ingredients, qspIngredientId, trial?.targetMass),
    [trial?.data, ingredients, qspIngredientId, trial?.targetMass]
  );

  const targetMassKg = (trial?.targetMass || 0) / 1000;
  const costPerKg = targetMassKg > 0 ? costs.total / targetMassKg : 0;
  const supportPerKg = targetMassKg > 0 ? costs.support / targetMassKg : 0;
  const aromaticPerKg = targetMassKg > 0 ? costs.aromatic / targetMassKg : 0;

  // pricingFactor is now used as target sale price (€/kg)
  const targetPrice = pricingFactor || 0;
  const margin = targetPrice > 0 ? targetPrice - costPerKg : 0;
  const marginPct = targetPrice > 0 ? (margin / targetPrice) * 100 : 0;
  const isOverBudget = targetPrice > 0 && costPerKg > targetPrice;

  return (
    <div className="panel">
      <div className="panel-title"><Euro size={14} /> Analyse des coûts — {trial?.name || `Essai ${selectedTrial}`}</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div>
          <div className="analysis-value">{costPerKg.toFixed(2)}<span className="analysis-unit">€/kg</span></div>
          <div className="analysis-label">Coût de revient</div>
        </div>
        <div>
          <div className="analysis-value" style={{ fontSize: '1rem', color: 'var(--color-success)' }}>{supportPerKg.toFixed(2)}<span className="analysis-unit">€/kg</span></div>
          <div className="analysis-label">Supports</div>
        </div>
        <div>
          <div className="analysis-value" style={{ fontSize: '1rem', color: 'var(--color-warning)' }}>{aromaticPerKg.toFixed(2)}<span className="analysis-unit">€/kg</span></div>
          <div className="analysis-label">Aromatisants</div>
        </div>
      </div>

      <div className="cost-target-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Prix de vente cible :</label>
          <input
            type="number"
            className="form-input"
            style={{ width: 80 }}
            value={targetPrice}
            onChange={e => actions.setPricingFactor(parseFloat(e.target.value) || 0)}
            step="1"
            min="0"
          />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>€/kg</span>
        </div>

        {targetPrice > 0 && (
          <div className="cost-margin-display" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            background: isOverBudget ? 'var(--color-danger-light)' : 'var(--color-success-light)',
            border: `1px solid ${isOverBudget ? 'var(--color-danger)' : 'var(--color-success)'}`,
          }}>
            {isOverBudget
              ? <AlertTriangle size={16} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
              : <CheckCircle size={16} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
            }
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: isOverBudget ? 'var(--color-danger)' : 'var(--color-success)' }}>
                Marge : {margin >= 0 ? '+' : ''}{margin.toFixed(2)} €/kg ({marginPct >= 0 ? '+' : ''}{marginPct.toFixed(1)}%)
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {isOverBudget
                  ? `Dépassement de ${Math.abs(margin).toFixed(2)} €/kg`
                  : `${margin.toFixed(2)} €/kg de marge disponible`
                }
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
