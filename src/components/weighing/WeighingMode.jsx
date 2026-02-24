import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useFormulation } from '../../contexts/FormulationContext';
import { calculateQSP } from '../../utils/calculations';
import { Scale, Check, X, RotateCcw, ChevronLeft, ChevronRight, Pencil } from 'lucide-react';

function WeighingItem({ ing, isQsp, mass, dilution, isWeighed, selectedTrial, actions }) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const startEdit = (e) => {
    e.stopPropagation();
    if (isQsp) return;
    setEditValue(String(mass));
    setEditing(true);
  };

  const commitEdit = () => {
    if (!editing) return;
    const newMass = parseFloat(editValue) || 0;
    actions.setIngredientMass(selectedTrial, ing.id, newMass);
    setEditing(false);
  };

  const handleInputChange = (e) => {
    const v = e.target.value;
    if (v === '' || /^\d*\.?\d*$/.test(v)) {
      setEditValue(v);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.target.blur(); }
    if (e.key === 'Escape') setEditing(false);
  };

  const handleRowClick = () => {
    if (!editing) {
      actions.toggleWeighed(selectedTrial, ing.id);
    }
  };

  return (
    <div
      className={`weighing-item ${isWeighed ? 'weighed' : ''} ${isQsp ? 'qsp' : ''}`}
      onClick={handleRowClick}
    >
      <div className="weighing-item-check">
        {isWeighed ? <Check size={24} /> : <div className="weighing-item-circle" />}
      </div>

      <div className="weighing-item-info">
        <div className="weighing-item-name">
          {ing.nom || 'Sans nom'}
          {isQsp && <span className="weighing-qsp-badge">QSP</span>}
        </div>
        <div className="weighing-item-meta">
          {ing.type === 'support' ? 'Support' : 'Aromatisant'}
          {dilution < 1 && ` · Dil. ${(dilution * 100).toFixed(dilution >= 0.01 ? 0 : 2)}%`}
          {ing.rgt && ` · ${ing.rgt}`}
        </div>
      </div>

      <div className="weighing-item-mass-zone" onClick={startEdit}>
        {editing ? (
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            className="weighing-mass-input"
            value={editValue}
            onChange={handleInputChange}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            onClick={e => e.stopPropagation()}
            step="0.001"
            min="0"
          />
        ) : (
          <>
            <div className="weighing-item-mass">
              {mass.toFixed(3)}
              <span className="weighing-item-unit">g</span>
            </div>
            {!isQsp && (
              <Pencil size={14} className="weighing-edit-icon" />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function WeighingMode() {
  const { state, actions } = useFormulation();
  const { ingredients, trials, activeTrialCount, qspIngredientId, ui } = state;
  const { selectedTrial } = ui;
  const trial = trials[selectedTrial];

  const qspValue = useMemo(() => {
    if (!trial || !qspIngredientId) return 0;
    return calculateQSP(trial.data, ingredients, qspIngredientId, trial.targetMass);
  }, [trial, ingredients, qspIngredientId]);

  const activeIngredients = useMemo(() => {
    return ingredients.filter(ing => {
      const isQsp = ing.id === qspIngredientId;
      const cellData = trial?.data?.[ing.id] || { mass: 0 };
      const mass = isQsp ? qspValue : (cellData.mass || 0);
      return mass > 0 || isQsp;
    });
  }, [ingredients, trial, qspIngredientId, qspValue]);

  const weighedCount = useMemo(() => {
    if (!trial) return 0;
    return activeIngredients.filter(ing => trial.weighedStates?.[ing.id]).length;
  }, [trial, activeIngredients]);

  const totalVisible = activeIngredients.length;
  const progress = totalVisible > 0 ? (weighedCount / totalVisible) * 100 : 0;

  return (
    <div className="weighing-overlay">
      {/* Header */}
      <div className="weighing-header">
        <button className="btn btn-outline btn-sm weighing-close" onClick={actions.toggleWeighingMode}>
          <X size={18} /> Quitter
        </button>

        <div className="weighing-trial-nav">
          <button className="btn-icon" onClick={() => selectedTrial > 1 && actions.selectTrial(selectedTrial - 1)} disabled={selectedTrial <= 1}>
            <ChevronLeft size={20} />
          </button>
          <span className="weighing-trial-name">{trial?.name || `Essai ${selectedTrial}`}</span>
          <button className="btn-icon" onClick={() => selectedTrial < activeTrialCount && actions.selectTrial(selectedTrial + 1)} disabled={selectedTrial >= activeTrialCount}>
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="weighing-target">
          <Scale size={16} /> Cible : <strong>{trial?.targetMass || 100} g</strong>
        </div>
      </div>

      {/* Progress bar */}
      <div className="weighing-progress-bar">
        <div className="weighing-progress-fill" style={{ width: `${progress}%` }} />
        <span className="weighing-progress-text">{weighedCount} / {totalVisible} pesé{weighedCount > 1 ? 's' : ''}</span>
      </div>

      {/* Ingredient list */}
      <div className="weighing-list">
        {activeIngredients.map((ing) => {
          const isQsp = ing.id === qspIngredientId;
          const cellData = trial?.data?.[ing.id] || { mass: 0, dilution: 1 };
          const mass = isQsp ? qspValue : (cellData.mass || 0);
          const isWeighed = trial?.weighedStates?.[ing.id] || false;
          const dilution = cellData.dilution ?? 1;

          return (
            <WeighingItem
              key={ing.id}
              ing={ing}
              isQsp={isQsp}
              mass={mass}
              dilution={dilution}
              isWeighed={isWeighed}
              selectedTrial={selectedTrial}
              actions={actions}
            />
          );
        })}
      </div>

      {/* Footer */}
      <div className="weighing-footer">
        <button
          className="btn btn-outline btn-sm"
          onClick={() => actions.resetWeighed(selectedTrial)}
        >
          <RotateCcw size={14} /> Réinitialiser
        </button>

        {progress >= 100 && (
          <div className="weighing-complete">
            <Check size={18} /> Pesée terminée
          </div>
        )}
      </div>
    </div>
  );
}
