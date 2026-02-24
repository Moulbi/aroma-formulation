import React, { useMemo } from 'react';
import { useFormulation } from '../../contexts/FormulationContext';
import { calculateTrialCost, calculateSalePrice, calculateTargetCost } from '../../utils/calculations';
import { Euro, TrendingUp } from 'lucide-react';

export default function CostPanel() {
  const { state, actions } = useFormulation();
  const { trials, ingredients, ui } = state;
  const { selectedTrial, pricingMode, pricingFactor } = ui;
  const trial = trials[selectedTrial];

  const costs = useMemo(() => calculateTrialCost(trial?.data, ingredients), [trial?.data, ingredients]);
  const salePrice = useMemo(() => calculateSalePrice(costs.total, pricingFactor), [costs.total, pricingFactor]);

  return (
    <div className="panel">
      <div className="panel-title"><Euro size={14} /> Analyse des coûts — {trial?.name || `Essai ${selectedTrial}`}</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div>
          <div className="analysis-value">{costs.total.toFixed(2)}<span className="analysis-unit">EUR</span></div>
          <div className="analysis-label">Coût total</div>
        </div>
        <div>
          <div className="analysis-value" style={{ fontSize: '1rem', color: 'var(--color-success)' }}>{costs.support.toFixed(2)}<span className="analysis-unit">EUR</span></div>
          <div className="analysis-label">Supports</div>
        </div>
        <div>
          <div className="analysis-value" style={{ fontSize: '1rem', color: 'var(--color-warning)' }}>{costs.aromatic.toFixed(2)}<span className="analysis-unit">EUR</span></div>
          <div className="analysis-label">Aromatisants</div>
        </div>
      </div>

      {/* Pricing */}
      <div className="pricing-modes">
        <button className={`pricing-mode-btn ${pricingMode === 'sale_price' ? 'active' : ''}`} onClick={() => actions.setPricingMode('sale_price')}>
          Prix de vente
        </button>
        <button className={`pricing-mode-btn ${pricingMode === 'target_cost' ? 'active' : ''}`} onClick={() => actions.setPricingMode('target_cost')}>
          Coût cible
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
        <label>Coefficient :</label>
        <input
          type="number"
          className="form-input"
          style={{ width: 70 }}
          value={pricingFactor}
          onChange={e => actions.setPricingFactor(parseFloat(e.target.value) || 1)}
          step="0.1"
          min="1"
        />
      </div>

      {pricingMode === 'sale_price' ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={16} style={{ color: 'var(--color-primary)' }} />
          <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>{salePrice.toFixed(2)} EUR</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            (marge {((pricingFactor - 1) * 100).toFixed(0)}%)
          </span>
        </div>
      ) : (
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Coût cible : {costs.total > 0 ? (costs.total / pricingFactor).toFixed(2) : '0.00'} EUR
        </div>
      )}
    </div>
  );
}
