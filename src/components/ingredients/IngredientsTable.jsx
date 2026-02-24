import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useFormulation } from '../../contexts/FormulationContext';
import { Plus, Trash2, Scale, Check, ChevronLeft, ChevronRight, Copy, PlusCircle } from 'lucide-react';
import { DILUTION_OPTIONS, TRIALS_PER_PAGE } from '../../data/constants';
import { calculateQSP } from '../../utils/calculations';
import SearchableSelect, { highlightMatch } from '../common/SearchableSelect';
import { searchIngredients } from '../../data/ingredientDatabase';

function MassInput({ value, onChange, readOnly, disabled, isQsp }) {
  const [local, setLocal] = useState('');
  const [focused, setFocused] = useState(false);

  const display = focused ? local : (value || '');

  const handleFocus = (e) => {
    setLocal(value ? String(value) : '');
    setFocused(true);
    e.target.select();
  };

  const handleChange = (e) => {
    const v = e.target.value;
    if (v === '' || /^\d*\.?\d*$/.test(v)) {
      setLocal(v);
    }
  };

  const handleBlur = () => {
    setFocused(false);
    const mass = parseFloat(local) || 0;
    onChange(mass);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') e.target.blur();
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      className={`trial-input ${isQsp ? 'qsp' : ''}`}
      value={isQsp ? (typeof value === 'number' ? value.toFixed(3) : value) : display}
      onChange={handleChange}
      onFocus={readOnly ? undefined : handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      readOnly={readOnly}
      disabled={disabled}
      placeholder="0.000"
    />
  );
}

function getDilutionClass(dilution) {
  if (dilution >= 1) return 'd-100';
  if (dilution >= 0.1) return 'd-10';
  if (dilution >= 0.01) return 'd-1';
  if (dilution >= 0.001) return 'd-01';
  if (dilution >= 0.0001) return 'd-001';
  if (dilution >= 0.00001) return 'd-0001';
  return 'd-00001';
}

function MPCell({ ing, isQsp, actions, onSelectFromBDD }) {
  const handleSelect = useCallback((item) => {
    onSelectFromBDD(ing.id, item);
  }, [ing.id, onSelectFromBDD]);

  const renderItem = useCallback((item, query) => (
    <div className="ss-item-content">
      <div className="ss-item-name">{highlightMatch(item.nom, query)}</div>
      <div className="ss-item-detail">
        <span className={`ss-tag ${item.type}`}>
          {item.type === 'support' ? 'Support' : 'Aromatisant'}
        </span>
        <span>{item.rgt}</span>
        <span>{item.prix}€/kg</span>
      </div>
    </div>
  ), []);

  return (
    <td className="mp-cell">
      <div className="mp-cell-inner">
        <div className="mp-cell-select">
          <SearchableSelect
            value={ing.nom}
            onChange={(text) => actions.updateIngredient({ ...ing, nom: text })}
            onSelect={handleSelect}
            searchFn={searchIngredients}
            renderItem={renderItem}
            placeholder="Rechercher MP..."
            allowCustom={true}
          />
        </div>
        <div className="mp-cell-actions">
          <button
            className={`qsp-btn ${isQsp ? 'active' : 'inactive'}`}
            onClick={() => actions.setQSPIngredient(isQsp ? null : ing.id)}
            title={isQsp ? 'Retirer QSP' : 'Définir comme QSP'}
          >
            QSP
          </button>
          <button
            className="btn-icon btn-icon-sm"
            onClick={() => actions.deleteIngredient(ing.id)}
            title="Supprimer"
            style={{ color: 'var(--color-danger)' }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </td>
  );
}

export default function IngredientsTable() {
  const { state, actions } = useFormulation();
  const { ingredients, trials, activeTrialCount, qspIngredientId, ui } = state;
  const { selectedTrial, currentTrialPage } = ui;

  const currentTrial = trials[selectedTrial];

  const visibleTrials = useMemo(() => {
    const start = currentTrialPage * TRIALS_PER_PAGE + 1;
    const end = Math.min(start + TRIALS_PER_PAGE - 1, activeTrialCount);
    const result = [];
    for (let i = start; i <= end; i++) result.push(i);
    return result;
  }, [currentTrialPage, activeTrialCount]);

  const maxPages = Math.ceil(activeTrialCount / TRIALS_PER_PAGE);

  const qspValue = useMemo(() => {
    if (!currentTrial || !qspIngredientId) return 0;
    return calculateQSP(currentTrial.data, ingredients, qspIngredientId, currentTrial.targetMass);
  }, [currentTrial, ingredients, qspIngredientId]);

  const handleMassCommit = useCallback((trialNum, ingredientId, mass) => {
    actions.setIngredientMass(trialNum, ingredientId, mass);
  }, [actions]);

  const handleDilutionChange = useCallback((trialNum, ingredientId, value) => {
    actions.setIngredientDilution(trialNum, ingredientId, parseFloat(value));
  }, [actions]);

  const [copyMenuOpen, setCopyMenuOpen] = useState(null);

  useEffect(() => {
    if (copyMenuOpen === null) return;
    const close = () => setCopyMenuOpen(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [copyMenuOpen]);

  const handleCopyFrom = useCallback((fromNum, toNum) => {
    actions.copyTrial(fromNum, toNum);
    actions.notify('success', `${trials[fromNum]?.name || `Essai ${fromNum}`} → ${trials[toNum]?.name || `Essai ${toNum}`}`);
    setCopyMenuOpen(null);
  }, [actions, trials]);

  // When a BDD ingredient is selected in a row, update all properties
  const handleSelectFromBDD = useCallback((ingredientId, item) => {
    actions.updateIngredient({
      id: ingredientId,
      nom: item.nom,
      type: item.type,
      classification: item.classification,
      isExtrait: item.isExtrait,
      sourceExtrait: item.sourceExtrait,
      prix: item.prix,
      rgt: item.rgt,
      densite: item.densite,
      tauxVanilline: item.tauxVanilline,
    });
  }, [actions]);

  // Add a new empty row
  const handleAddRow = useCallback(() => {
    actions.addIngredient({
      nom: '',
      type: 'support',
      classification: 'naturel',
      isExtrait: false,
      sourceExtrait: '',
      prix: 0,
      rgt: '',
      densite: 1.0,
      tauxVanilline: 0,
    });
  }, [actions]);

  return (
    <>
      {/* Toolbar */}
      <div className="toolbar">
        <button className="btn btn-primary btn-sm" onClick={handleAddRow}>
          <Plus size={14} /> Ajouter ligne
        </button>
        <button className="btn btn-outline btn-sm" onClick={actions.addTrial} disabled={activeTrialCount >= 10}>
          <PlusCircle size={14} /> Ajouter essai
        </button>

        <div className="toolbar-spacer" />

        <div className="trial-pagination">
          <button className="btn-icon" onClick={() => actions.setTrialPage(currentTrialPage - 1)} disabled={currentTrialPage === 0}>
            <ChevronLeft size={16} />
          </button>
          <span>Essais {visibleTrials[0]}-{visibleTrials[visibleTrials.length - 1]} / {activeTrialCount}</span>
          <button className="btn-icon" onClick={() => actions.setTrialPage(currentTrialPage + 1)} disabled={currentTrialPage >= maxPages - 1}>
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="target-mass-pill">
          <Scale size={16} />
          <label>Masse cible</label>
          <input
            type="number"
            className="target-mass-input"
            value={currentTrial?.targetMass ?? 100}
            onChange={e => actions.setTrialTargetMass(selectedTrial, parseFloat(e.target.value) || 100)}
            min={1}
            max={10000}
          />
          <span className="target-mass-unit">g</span>
        </div>
      </div>

      {/* Table */}
      <div className="formulation-table-wrapper">
        <table className="formulation-table">
          <thead>
            <tr>
              <th className="mp-header">Matière première</th>
              <th className="rgt-cell">RGT</th>
              {visibleTrials.map(num => (
                <th
                  key={num}
                  className={`trial-header ${num === selectedTrial ? 'active' : ''}`}
                  onClick={() => actions.selectTrial(num)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', position: 'relative' }}>
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
                      onClick={(e) => { e.stopPropagation(); setCopyMenuOpen(copyMenuOpen === num ? null : num); }}
                      title="Copier depuis un autre essai"
                    >
                      <Copy size={12} />
                    </button>
                    {copyMenuOpen === num && (
                      <div className="copy-menu" onClick={e => e.stopPropagation()}>
                        <div className="copy-menu-title">Copier depuis :</div>
                        {Array.from({ length: activeTrialCount }, (_, i) => i + 1)
                          .filter(n => n !== num)
                          .map(fromNum => (
                            <button
                              key={fromNum}
                              className="copy-menu-item"
                              onClick={() => handleCopyFrom(fromNum, num)}
                            >
                              {trials[fromNum]?.name || `Essai ${fromNum}`}
                            </button>
                          ))
                        }
                      </div>
                    )}
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
                  <MPCell
                    ing={ing}
                    isQsp={isQsp}
                    actions={actions}
                    onSelectFromBDD={handleSelectFromBDD}
                  />

                  <td className="rgt-cell">{ing.rgt || '-'}</td>

                  {visibleTrials.map(trialNum => {
                    const trial = trials[trialNum];
                    const cellData = trial?.data?.[ing.id] || { mass: 0, dilution: 1 };
                    const isActive = trialNum === selectedTrial;
                    const isQspCell = isQsp;
                    const trialWeighed = trial?.weighedStates?.[ing.id];

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
                            <MassInput
                              value={isQspCell && isActive ? qspValue : (cellData.mass || '')}
                              onChange={mass => handleMassCommit(trialNum, ing.id, mass)}
                              readOnly={isQspCell}
                              disabled={!isActive && !isQspCell}
                              isQsp={isQspCell && isActive}
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
    </>
  );
}
