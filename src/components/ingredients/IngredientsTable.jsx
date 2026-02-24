import React, { useState, useMemo, useCallback } from 'react';
import { useFormulation } from '../../contexts/FormulationContext';
import { Plus, Settings, Trash2, Scale, Check, ChevronLeft, ChevronRight, Copy, PlusCircle } from 'lucide-react';
import { DILUTION_OPTIONS, TRIALS_PER_PAGE } from '../../data/constants';
import { calculateQSP } from '../../utils/calculations';
import IngredientForm from './IngredientForm';

function getDilutionClass(dilution) {
  if (dilution >= 1) return 'd-100';
  if (dilution >= 0.1) return 'd-10';
  if (dilution >= 0.01) return 'd-1';
  if (dilution >= 0.001) return 'd-01';
  if (dilution >= 0.0001) return 'd-001';
  if (dilution >= 0.00001) return 'd-0001';
  return 'd-00001';
}

export default function IngredientsTable() {
  const { state, actions } = useFormulation();
  const { ingredients, trials, activeTrialCount, qspIngredientId, ui } = state;
  const { selectedTrial, currentTrialPage } = ui;

  const [showForm, setShowForm] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);

  const currentTrial = trials[selectedTrial];

  // Visible trials for current page
  const visibleTrials = useMemo(() => {
    const start = currentTrialPage * TRIALS_PER_PAGE + 1;
    const end = Math.min(start + TRIALS_PER_PAGE - 1, activeTrialCount);
    const result = [];
    for (let i = start; i <= end; i++) result.push(i);
    return result;
  }, [currentTrialPage, activeTrialCount]);

  const maxPages = Math.ceil(activeTrialCount / TRIALS_PER_PAGE);

  // QSP calculation for selected trial
  const qspValue = useMemo(() => {
    if (!currentTrial || !qspIngredientId) return 0;
    return calculateQSP(currentTrial.data, ingredients, qspIngredientId, currentTrial.targetMass);
  }, [currentTrial, ingredients, qspIngredientId]);

  const handleSaveIngredient = useCallback((data) => {
    if (editingIngredient) {
      actions.updateIngredient({ ...data, id: editingIngredient.id });
    } else {
      actions.addIngredient(data);
    }
    setEditingIngredient(null);
  }, [editingIngredient, actions]);

  const handleMassChange = useCallback((trialNum, ingredientId, value) => {
    const mass = parseFloat(value) || 0;
    actions.setIngredientMass(trialNum, ingredientId, mass);
  }, [actions]);

  const handleDilutionChange = useCallback((trialNum, ingredientId, value) => {
    actions.setIngredientDilution(trialNum, ingredientId, parseFloat(value));
  }, [actions]);

  const handleCopyTrial = useCallback((fromNum) => {
    const toNum = fromNum + 1;
    if (toNum > activeTrialCount) {
      // Add a new trial first
      actions.addTrial();
      setTimeout(() => actions.copyTrial(fromNum, toNum), 0);
    } else {
      actions.copyTrial(fromNum, toNum);
    }
    actions.notify('success', `${trials[fromNum]?.name || `Essai ${fromNum}`} copié`);
  }, [activeTrialCount, actions, trials]);

  return (
    <>
      {/* Toolbar */}
      <div className="toolbar">
        <button className="btn btn-primary btn-sm" onClick={() => { setEditingIngredient(null); setShowForm(true); }}>
          <Plus size={14} /> Ajouter MP
        </button>
        <button className="btn btn-outline btn-sm" onClick={actions.addTrial} disabled={activeTrialCount >= 10}>
          <PlusCircle size={14} /> Ajouter essai
        </button>

        <div className="toolbar-spacer" />

        {/* Trial pagination */}
        <div className="trial-pagination">
          <button className="btn-icon" onClick={() => actions.setTrialPage(currentTrialPage - 1)} disabled={currentTrialPage === 0}>
            <ChevronLeft size={16} />
          </button>
          <span>Essais {visibleTrials[0]}-{visibleTrials[visibleTrials.length - 1]} / {activeTrialCount}</span>
          <button className="btn-icon" onClick={() => actions.setTrialPage(currentTrialPage + 1)} disabled={currentTrialPage >= maxPages - 1}>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Target mass */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
          <label>Masse cible:</label>
          <input
            type="number"
            className="form-input"
            style={{ width: 80 }}
            value={currentTrial?.targetMass ?? 100}
            onChange={e => actions.setTrialTargetMass(selectedTrial, parseFloat(e.target.value) || 100)}
            min={1}
            max={10000}
          />
          <span>g</span>
        </div>
      </div>

      {/* Table */}
      <div className="formulation-table-wrapper">
        <table className="formulation-table">
          <thead>
            <tr>
              <th className="mp-cell">Matière première</th>
              <th className="rgt-cell">RGT</th>
              {visibleTrials.map(num => (
                <th
                  key={num}
                  className={`trial-header ${num === selectedTrial ? 'active' : ''}`}
                  onClick={() => actions.selectTrial(num)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                    <span
                      style={{ cursor: 'text' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        const newName = prompt(`Nom de l'essai ${num} :`, trials[num]?.name || `Essai ${num}`);
                        if (newName?.trim()) actions.setTrialName(num, newName.trim());
                      }}
                    >
                      {trials[num]?.name || `Essai ${num}`}
                    </span>
                    <button
                      className="btn-icon"
                      style={{ color: 'inherit', padding: '0.1rem' }}
                      onClick={(e) => { e.stopPropagation(); handleCopyTrial(num); }}
                      title="Copier vers essai suivant"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ingredients.map((ing) => {
              const isQsp = ing.id === qspIngredientId;
              const isWeighed = currentTrial?.weighedStates?.[ing.id];

              return (
                <tr
                  key={ing.id}
                  className={`ingredient-row ${ing.type} ${isQsp ? 'qsp' : ''} ${isWeighed ? 'row-weighed' : ''}`}
                >
                  {/* MP cell */}
                  <td className="mp-cell">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ flex: 1, fontSize: '0.85rem' }}>{ing.nom}</span>
                      <button
                        className={`btn-icon ${isQsp ? '' : ''}`}
                        style={isQsp ? { color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.7rem', padding: '0.15rem 0.35rem', background: 'var(--color-primary-light)', borderRadius: '4px' } : { fontSize: '0.65rem', padding: '0.15rem 0.35rem', opacity: 0.5 }}
                        onClick={() => actions.setQSPIngredient(isQsp ? null : ing.id)}
                        title={isQsp ? 'Retirer QSP' : 'Définir comme QSP'}
                      >
                        QSP
                      </button>
                      <button className="btn-icon" onClick={() => { setEditingIngredient(ing); setShowForm(true); }} title="Modifier">
                        <Settings size={14} />
                      </button>
                      <button className="btn-icon" onClick={() => actions.deleteIngredient(ing.id)} title="Supprimer" style={{ color: 'var(--color-danger)' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>

                  {/* RGT */}
                  <td className="rgt-cell">{ing.rgt || '-'}</td>

                  {/* Trial cells */}
                  {visibleTrials.map(trialNum => {
                    const trial = trials[trialNum];
                    const cellData = trial?.data?.[ing.id] || { mass: 0, dilution: 1 };
                    const isActive = trialNum === selectedTrial;
                    const isQspCell = isQsp;
                    const trialWeighed = trial?.weighedStates?.[ing.id];

                    // For QSP, show calculated value for selected trial
                    const displayMass = isQspCell && isActive
                      ? qspValue
                      : (cellData.mass || '');

                    return (
                      <td key={trialNum} className={`trial-cell ${isActive ? 'active' : ''} ${isQspCell ? 'qsp-row' : ''}`}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem' }}>
                          <select
                            className={`dilution-select ${getDilutionClass(cellData.dilution ?? 1)}`}
                            value={cellData.dilution ?? 1}
                            onChange={e => handleDilutionChange(trialNum, ing.id, e.target.value)}
                            disabled={!isActive}
                          >
                            {DILUTION_OPTIONS.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                            <input
                              type="number"
                              className={`trial-input ${isQspCell ? 'qsp' : ''}`}
                              value={isQspCell && isActive ? qspValue.toFixed(3) : (cellData.mass || '')}
                              onChange={e => handleMassChange(trialNum, ing.id, e.target.value)}
                              readOnly={isQspCell}
                              disabled={!isActive && !isQspCell}
                              step="0.001"
                              min="0"
                              placeholder="0.000"
                            />
                            {isActive && (
                              <button
                                className={`weigh-btn ${trialWeighed ? 'weighed' : ''}`}
                                onClick={() => actions.toggleWeighed(trialNum, ing.id)}
                                title={trialWeighed ? 'Non pesé' : 'Marquer pesé'}
                              >
                                {trialWeighed ? <Check size={12} /> : <Scale size={12} />}
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <IngredientForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingIngredient(null); }}
        onSubmit={handleSaveIngredient}
        ingredient={editingIngredient}
      />
    </>
  );
}
