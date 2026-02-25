import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { generateId, today } from '../utils/helpers';
import { loadSheet, saveSheet, updateSheetMeta, loadSheetsIndex } from '../utils/persistence';
import { DEFAULT_INGREDIENTS, DEFAULT_SENSORY_DESCRIPTORS, DEFAULT_RESPONSIBLES, MAX_TRIALS } from '../data/constants';
import { calculateQSP } from '../utils/calculations';

const StateContext = createContext(null);
const ActionsContext = createContext(null);

function createEmptyTrial(num) {
  return {
    name: `Essai ${num}`,
    targetMass: 100,
    data: {},
    weighedStates: {},
    notes: { sensorielles: '', techniques: '', commentaires: '' },
    sensoryProfile: [],
  };
}

function buildInitialState() {
  const trials = {};
  for (let i = 1; i <= 5; i++) {
    trials[i] = createEmptyTrial(i);
  }

  const emptyRow = () => ({
    id: generateId(),
    nom: '', type: 'support', classification: 'naturel',
    isExtrait: false, sourceExtrait: '',
    prix: 0, rgt: '', densite: 1.0, tauxVanilline: 0,
  });
  const defaultIngredients = DEFAULT_INGREDIENTS.length > 0
    ? [...DEFAULT_INGREDIENTS]
    : Array.from({ length: 6 }, (_, i) => ({ ...emptyRow(), order: i }));

  return {
    projectInfo: {
      reference: '',
      date: today(),
      responsible: '',
      client: '',
      dosage: '',
      application: '',
    },
    ingredients: defaultIngredients,
    trials,
    activeTrialCount: 5,
    qspIngredientId: defaultIngredients[0]?.id || null,
    sensoryDescriptors: [...DEFAULT_SENSORY_DESCRIPTORS],
    existingReferences: [],
    projectResponsibles: [...DEFAULT_RESPONSIBLES],
    ui: {
      currentTrialPage: 0,
      selectedTrial: 1,
      weighingMode: false,
      pricingMode: 'sale_price',
      pricingFactor: 2.5,
      notification: null,
    },
  };
}

const DILUTIONS = [1, 0.1, 0.01, 0.001, 0.0001, 0.00001, 0.000001];

function autoAdjustDilution(mass, currentDilution) {
  if (mass <= 0 || mass >= 0.03) return { mass, dilution: currentDilution };
  let newMass = mass;
  let newDilution = currentDilution;
  const dilIdx = DILUTIONS.indexOf(currentDilution);
  if (dilIdx < 0) return { mass, dilution: currentDilution };

  let idx = dilIdx;
  while (newMass < 0.03 && idx < DILUTIONS.length - 1) {
    newMass *= 10;
    idx++;
    newDilution = DILUTIONS[idx];
  }
  return { mass: newMass, dilution: newDilution };
}

function reducer(state, action) {
  switch (action.type) {
    // === Project ===
    case 'SET_PROJECT_INFO':
      return { ...state, projectInfo: { ...state.projectInfo, ...action.payload } };

    // === Ingredients ===
    case 'ADD_INGREDIENT': {
      const newIng = { ...action.payload, id: generateId(), order: state.ingredients.length };
      return { ...state, ingredients: [...state.ingredients, newIng] };
    }
    case 'UPDATE_INGREDIENT':
      return {
        ...state,
        ingredients: state.ingredients.map(i => i.id === action.payload.id ? { ...i, ...action.payload } : i),
      };
    case 'DELETE_INGREDIENT': {
      const newIngredients = state.ingredients.filter(i => i.id !== action.payload);
      // Clean up trial data referencing this ingredient
      const newTrials = { ...state.trials };
      for (const [num, trial] of Object.entries(newTrials)) {
        const newData = { ...trial.data };
        delete newData[action.payload];
        const newWeighed = { ...trial.weighedStates };
        delete newWeighed[action.payload];
        newTrials[num] = { ...trial, data: newData, weighedStates: newWeighed };
      }
      return {
        ...state,
        ingredients: newIngredients,
        trials: newTrials,
        qspIngredientId: state.qspIngredientId === action.payload ? null : state.qspIngredientId,
      };
    }

    // === Trials ===
    case 'ADD_TRIAL': {
      const nextNum = state.activeTrialCount + 1;
      if (nextNum > MAX_TRIALS) return state;
      return {
        ...state,
        activeTrialCount: nextNum,
        trials: { ...state.trials, [nextNum]: createEmptyTrial(nextNum) },
      };
    }
    case 'SET_TRIAL_NAME': {
      const trial = state.trials[action.payload.trialNum];
      if (!trial) return state;
      return {
        ...state,
        trials: {
          ...state.trials,
          [action.payload.trialNum]: { ...trial, name: action.payload.name },
        },
      };
    }
    case 'SET_TRIAL_TARGET_MASS': {
      // Changement simple de masse cible (sans recalcul proportionnel)
      const trial = state.trials[action.payload.trialNum];
      if (!trial) return state;
      return {
        ...state,
        trials: {
          ...state.trials,
          [action.payload.trialNum]: { ...trial, targetMass: action.payload.mass },
        },
      };
    }
    case 'SCALE_TRIAL_TO_TARGET': {
      // Recalcul proportionnel des masses quand on change la masse cible
      const trial = state.trials[action.payload.trialNum];
      if (!trial) return state;
      const oldMass = trial.targetMass;
      const newMass = action.payload.mass;
      if (oldMass <= 0 || newMass <= 0 || oldMass === newMass) return state;
      const ratio = newMass / oldMass;
      const newData = {};
      for (const [ingId, cellData] of Object.entries(trial.data)) {
        if (ingId === state.qspIngredientId) {
          newData[ingId] = cellData; // QSP sera recalculé automatiquement
        } else {
          newData[ingId] = { ...cellData, mass: cellData.mass * ratio };
        }
      }
      return {
        ...state,
        trials: {
          ...state.trials,
          [action.payload.trialNum]: { ...trial, targetMass: newMass, data: newData },
        },
      };
    }
    case 'COPY_TRIAL': {
      const source = state.trials[action.payload.from];
      if (!source || action.payload.to > MAX_TRIALS) return state;
      const newTrials = { ...state.trials };
      newTrials[action.payload.to] = JSON.parse(JSON.stringify(source));
      newTrials[action.payload.to].name = state.trials[action.payload.to]?.name || `Essai ${action.payload.to}`;
      const newCount = Math.max(state.activeTrialCount, action.payload.to);
      return { ...state, trials: newTrials, activeTrialCount: newCount };
    }

    // === Trial cell data ===
    case 'SET_INGREDIENT_MASS': {
      const { trialNum, ingredientId, mass } = action.payload;
      const trial = state.trials[trialNum];
      if (!trial) return state;
      const cellData = trial.data[ingredientId] || { mass: 0, dilution: 1 };
      // Auto-ajuster la dilution si masse < 0.03 (sauf QSP)
      const isQsp = ingredientId === state.qspIngredientId;
      const adjusted = !isQsp ? autoAdjustDilution(mass, cellData.dilution ?? 1) : { mass, dilution: cellData.dilution ?? 1 };
      return {
        ...state,
        trials: {
          ...state.trials,
          [trialNum]: {
            ...trial,
            data: { ...trial.data, [ingredientId]: { ...cellData, mass: adjusted.mass, dilution: adjusted.dilution } },
          },
        },
      };
    }
    case 'SET_INGREDIENT_MASS_RAW': {
      const { trialNum, ingredientId, mass } = action.payload;
      const trial = state.trials[trialNum];
      if (!trial) return state;
      const cellData = trial.data[ingredientId] || { mass: 0, dilution: 1 };
      return {
        ...state,
        trials: {
          ...state.trials,
          [trialNum]: {
            ...trial,
            data: { ...trial.data, [ingredientId]: { ...cellData, mass } },
          },
        },
      };
    }
    case 'SET_INGREDIENT_DILUTION': {
      const { trialNum, ingredientId, dilution } = action.payload;
      const trial = state.trials[trialNum];
      if (!trial) return state;
      const cellData = trial.data[ingredientId] || { mass: 0, dilution: 1 };
      return {
        ...state,
        trials: {
          ...state.trials,
          [trialNum]: {
            ...trial,
            data: { ...trial.data, [ingredientId]: { ...cellData, dilution } },
          },
        },
      };
    }
    case 'SET_QSP_INGREDIENT': {
      const oldQspId = state.qspIngredientId;
      const newQspId = action.payload;
      // If changing from one QSP ingredient to another, freeze the calculated QSP value
      // into the old ingredient's mass for all trials
      if (oldQspId && oldQspId !== newQspId) {
        const newTrials = { ...state.trials };
        for (const [num, trial] of Object.entries(newTrials)) {
          const qspMass = calculateQSP(trial.data, state.ingredients, oldQspId, trial.targetMass);
          if (qspMass > 0) {
            const cellData = trial.data[oldQspId] || { mass: 0, dilution: 1 };
            newTrials[num] = {
              ...trial,
              data: { ...trial.data, [oldQspId]: { ...cellData, mass: qspMass } },
            };
          }
        }
        return { ...state, qspIngredientId: newQspId, trials: newTrials };
      }
      return { ...state, qspIngredientId: newQspId };
    }

    case 'TOGGLE_WEIGHED': {
      const { trialNum, ingredientId } = action.payload;
      const trial = state.trials[trialNum];
      if (!trial) return state;
      const current = trial.weighedStates[ingredientId] || false;
      return {
        ...state,
        trials: {
          ...state.trials,
          [trialNum]: {
            ...trial,
            weighedStates: { ...trial.weighedStates, [ingredientId]: !current },
          },
        },
      };
    }
    case 'RESET_WEIGHED': {
      const trial = state.trials[action.payload];
      if (!trial) return state;
      return {
        ...state,
        trials: {
          ...state.trials,
          [action.payload]: { ...trial, weighedStates: {} },
        },
      };
    }

    // === Notes ===
    case 'SET_TRIAL_NOTES': {
      const { trialNum, field, value } = action.payload;
      const trial = state.trials[trialNum];
      if (!trial) return state;
      return {
        ...state,
        trials: {
          ...state.trials,
          [trialNum]: {
            ...trial,
            notes: { ...trial.notes, [field]: value },
          },
        },
      };
    }

    // === Sensory ===
    case 'SET_SENSORY_VALUE': {
      const { trialNum, descriptorName, value } = action.payload;
      const trial = state.trials[trialNum];
      if (!trial) return state;
      const profile = [...(trial.sensoryProfile || [])];
      const idx = profile.findIndex(p => p.descriptor === descriptorName);
      if (idx >= 0) {
        profile[idx] = { ...profile[idx], value };
      } else {
        profile.push({ descriptor: descriptorName, value });
      }
      return {
        ...state,
        trials: {
          ...state.trials,
          [trialNum]: { ...trial, sensoryProfile: profile },
        },
      };
    }
    case 'ADD_DESCRIPTOR': {
      const newDesc = { id: generateId(), name: action.payload };
      return { ...state, sensoryDescriptors: [...state.sensoryDescriptors, newDesc] };
    }
    case 'REMOVE_DESCRIPTOR':
      return {
        ...state,
        sensoryDescriptors: state.sensoryDescriptors.filter(d => d.id !== action.payload),
      };
    case 'APPLY_SENSORY_PRESET': {
      const { trialNum, descriptors: presetDescriptors } = action.payload;
      // Update the global descriptors list to match preset names
      const newDescs = presetDescriptors.map(d => ({
        id: state.sensoryDescriptors.find(sd => sd.name === d.name)?.id || generateId(),
        name: d.name,
      }));
      // Update trial profile with preset values
      const trial = state.trials[trialNum];
      if (!trial) return state;
      const profile = presetDescriptors.map(d => ({ descriptor: d.name, value: d.value }));
      return {
        ...state,
        sensoryDescriptors: newDescs,
        trials: {
          ...state.trials,
          [trialNum]: { ...trial, sensoryProfile: profile },
        },
      };
    }

    // === References ===
    case 'ADD_REFERENCE':
      return { ...state, existingReferences: [...state.existingReferences, action.payload] };
    case 'ADD_RESPONSIBLE':
      return { ...state, projectResponsibles: [...state.projectResponsibles, action.payload] };

    // === UI ===
    case 'SET_TRIAL_PAGE':
      return { ...state, ui: { ...state.ui, currentTrialPage: action.payload } };
    case 'SELECT_TRIAL': {
      // Persister la valeur QSP calculée de l'ancien essai avant de changer
      const oldSelected = state.ui.selectedTrial;
      const qspId = state.qspIngredientId;
      let newTrials = state.trials;
      if (qspId && state.trials[oldSelected]) {
        const oldTrial = state.trials[oldSelected];
        const qspMass = calculateQSP(oldTrial.data, state.ingredients, qspId, oldTrial.targetMass);
        if (qspMass > 0) {
          const cellData = oldTrial.data[qspId] || { mass: 0, dilution: 1 };
          newTrials = {
            ...state.trials,
            [oldSelected]: {
              ...oldTrial,
              data: { ...oldTrial.data, [qspId]: { ...cellData, mass: qspMass } },
            },
          };
        }
      }
      return { ...state, ui: { ...state.ui, selectedTrial: action.payload }, trials: newTrials };
    }
    case 'TOGGLE_WEIGHING_MODE':
      return { ...state, ui: { ...state.ui, weighingMode: !state.ui.weighingMode } };
    case 'SET_PRICING_MODE':
      return { ...state, ui: { ...state.ui, pricingMode: action.payload } };
    case 'SET_PRICING_FACTOR':
      return { ...state, ui: { ...state.ui, pricingFactor: action.payload } };
    case 'NOTIFY':
      return { ...state, ui: { ...state.ui, notification: action.payload } };

    // === Data ===
    case 'INIT_DATA':
      return { ...action.payload, ui: buildInitialState().ui };
    case 'RESET_SHEET':
      return buildInitialState();

    default:
      return state;
  }
}

export function FormulationProvider({ sheetId, children }) {
  const [state, dispatch] = useReducer(reducer, null, () => {
    const saved = loadSheet(sheetId);
    if (saved) return { ...buildInitialState(), ...saved, ui: buildInitialState().ui };
    // Nouvelle fiche : injecter la référence auto depuis l'index
    const initial = buildInitialState();
    const index = loadSheetsIndex();
    const meta = index.find(s => s.id === sheetId);
    if (meta?.reference) {
      initial.projectInfo.reference = meta.reference;
    }
    return initial;
  });

  // Auto-save vers la fiche spécifique
  useEffect(() => {
    saveSheet(sheetId, state);
    updateSheetMeta(sheetId, state);
  }, [state, sheetId]);

  const actions = {
    setProjectInfo: useCallback((data) => dispatch({ type: 'SET_PROJECT_INFO', payload: data }), []),
    addIngredient: useCallback((data) => dispatch({ type: 'ADD_INGREDIENT', payload: data }), []),
    updateIngredient: useCallback((data) => dispatch({ type: 'UPDATE_INGREDIENT', payload: data }), []),
    deleteIngredient: useCallback((id) => dispatch({ type: 'DELETE_INGREDIENT', payload: id }), []),
    addTrial: useCallback(() => dispatch({ type: 'ADD_TRIAL' }), []),
    setTrialName: useCallback((trialNum, name) => dispatch({ type: 'SET_TRIAL_NAME', payload: { trialNum, name } }), []),
    setTrialTargetMass: useCallback((trialNum, mass) => dispatch({ type: 'SET_TRIAL_TARGET_MASS', payload: { trialNum, mass } }), []),
    scaleTrialToTarget: useCallback((trialNum, mass) => dispatch({ type: 'SCALE_TRIAL_TO_TARGET', payload: { trialNum, mass } }), []),
    copyTrial: useCallback((from, to) => dispatch({ type: 'COPY_TRIAL', payload: { from, to } }), []),
    setIngredientMass: useCallback((trialNum, ingredientId, mass) => dispatch({ type: 'SET_INGREDIENT_MASS', payload: { trialNum, ingredientId, mass } }), []),
    setIngredientMassRaw: useCallback((trialNum, ingredientId, mass) => dispatch({ type: 'SET_INGREDIENT_MASS_RAW', payload: { trialNum, ingredientId, mass } }), []),
    setIngredientDilution: useCallback((trialNum, ingredientId, dilution) => dispatch({ type: 'SET_INGREDIENT_DILUTION', payload: { trialNum, ingredientId, dilution } }), []),
    setQSPIngredient: useCallback((id) => dispatch({ type: 'SET_QSP_INGREDIENT', payload: id }), []),
    toggleWeighed: useCallback((trialNum, ingredientId) => dispatch({ type: 'TOGGLE_WEIGHED', payload: { trialNum, ingredientId } }), []),
    resetWeighed: useCallback((trialNum) => dispatch({ type: 'RESET_WEIGHED', payload: trialNum }), []),
    setTrialNotes: useCallback((trialNum, field, value) => dispatch({ type: 'SET_TRIAL_NOTES', payload: { trialNum, field, value } }), []),
    setSensoryValue: useCallback((trialNum, descriptorName, value) => dispatch({ type: 'SET_SENSORY_VALUE', payload: { trialNum, descriptorName, value } }), []),
    addDescriptor: useCallback((name) => dispatch({ type: 'ADD_DESCRIPTOR', payload: name }), []),
    removeDescriptor: useCallback((id) => dispatch({ type: 'REMOVE_DESCRIPTOR', payload: id }), []),
    applySensoryPreset: useCallback((trialNum, descriptors) => dispatch({ type: 'APPLY_SENSORY_PRESET', payload: { trialNum, descriptors } }), []),
    addReference: useCallback((ref) => dispatch({ type: 'ADD_REFERENCE', payload: ref }), []),
    addResponsible: useCallback((name) => dispatch({ type: 'ADD_RESPONSIBLE', payload: name }), []),
    setTrialPage: useCallback((page) => dispatch({ type: 'SET_TRIAL_PAGE', payload: page }), []),
    selectTrial: useCallback((num) => dispatch({ type: 'SELECT_TRIAL', payload: num }), []),
    toggleWeighingMode: useCallback(() => dispatch({ type: 'TOGGLE_WEIGHING_MODE' }), []),
    setPricingMode: useCallback((mode) => dispatch({ type: 'SET_PRICING_MODE', payload: mode }), []),
    setPricingFactor: useCallback((factor) => dispatch({ type: 'SET_PRICING_FACTOR', payload: factor }), []),
    notify: useCallback((type, message) => {
      if (!type) { dispatch({ type: 'NOTIFY', payload: null }); return; }
      dispatch({ type: 'NOTIFY', payload: { type, message } });
      setTimeout(() => dispatch({ type: 'NOTIFY', payload: null }), 3000);
    }, []),
    resetSheet: useCallback(() => dispatch({ type: 'RESET_SHEET' }), []),
  };

  return (
    <StateContext.Provider value={state}>
      <ActionsContext.Provider value={actions}>
        {children}
      </ActionsContext.Provider>
    </StateContext.Provider>
  );
}

export function useFormulation() {
  const state = useContext(StateContext);
  const actions = useContext(ActionsContext);
  if (!state || !actions) throw new Error('useFormulation must be used within FormulationProvider');
  return { state, actions };
}
