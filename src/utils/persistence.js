import { generateId, generateSheetRef } from './helpers';

const INDEX_KEY = 'aroma-sheets-index';
const SHEET_PREFIX = 'aroma-sheet-';
const OLD_KEY = 'aroma-formulation';

// === Index (liste des fiches) ===

export function loadSheetsIndex() {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSheetsIndex(index) {
  try {
    localStorage.setItem(INDEX_KEY, JSON.stringify(index));
  } catch (e) {
    console.warn('Erreur sauvegarde index:', e);
  }
}

// === Fiche individuelle ===

export function loadSheet(id) {
  try {
    const raw = localStorage.getItem(SHEET_PREFIX + id);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSheet(id, state) {
  try {
    const { ui, ...persistable } = state;
    localStorage.setItem(SHEET_PREFIX + id, JSON.stringify(persistable));
  } catch (e) {
    console.warn('Erreur sauvegarde fiche:', e);
  }
}

export function deleteSheet(id) {
  localStorage.removeItem(SHEET_PREFIX + id);
  const index = loadSheetsIndex().filter(s => s.id !== id);
  saveSheetsIndex(index);
}

export function duplicateSheet(id) {
  const data = loadSheet(id);
  if (!data) return null;
  const index = loadSheetsIndex();
  const original = index.find(s => s.id === id);
  const newId = generateId();
  const now = new Date().toISOString();
  const existingRefs = index.map(s => s.reference).filter(Boolean);
  const newRef = generateSheetRef(existingRefs);
  const newMeta = {
    ...original,
    id: newId,
    reference: newRef,
    name: (original?.name || 'Fiche') + ' (copie)',
    createdAt: now,
    updatedAt: now,
  };
  // Mettre à jour la référence dans les données copiées aussi
  if (data.projectInfo) {
    data = { ...data, projectInfo: { ...data.projectInfo, reference: newRef } };
  }
  saveSheet(newId, data);
  saveSheetsIndex([...index, newMeta]);
  return newId;
}

// === Mise à jour des métadonnées depuis le state ===

export function updateSheetMeta(id, state) {
  const index = loadSheetsIndex();
  const idx = index.findIndex(s => s.id === id);
  if (idx < 0) return;
  const info = state.projectInfo || {};
  index[idx] = {
    ...index[idx],
    // name est géré uniquement depuis la page d'accueil, on ne l'écrase pas
    reference: info.reference || index[idx].reference || '',
    responsible: info.responsible || '',
    client: info.client || '',
    application: info.application || '',
    updatedAt: new Date().toISOString(),
  };
  saveSheetsIndex(index);
}

// === Nettoyage des fiches vides ===

export function isSheetEmpty(id) {
  const data = loadSheet(id);
  if (!data) return true;
  // Une fiche est vide si aucun ingrédient n'a de nom renseigné
  // et aucun essai n'a de données
  const hasIngredients = (data.ingredients || []).some(ing => ing.nom && ing.nom.trim() !== '');
  const hasTrialData = Object.values(data.trials || {}).some(trial => {
    return Object.values(trial.data || {}).some(cell => cell.mass > 0);
  });
  const hasProjectInfo = data.projectInfo &&
    (data.projectInfo.client || data.projectInfo.responsible || data.projectInfo.dosage || data.projectInfo.application);
  return !hasIngredients && !hasTrialData && !hasProjectInfo;
}

export function cleanEmptySheet(id) {
  if (isSheetEmpty(id)) {
    deleteSheet(id);
    return true;
  }
  return false;
}

// === Migration depuis l'ancien format ===

export function migrateIfNeeded() {
  try {
    const old = localStorage.getItem(OLD_KEY);
    if (!old || loadSheetsIndex().length > 0) return;
    const data = JSON.parse(old);
    const id = generateId();
    const info = data.projectInfo || {};
    const meta = {
      id,
      name: info.reference || 'Fiche importée',
      reference: info.reference || '',
      responsible: info.responsible || '',
      client: info.client || '',
      application: info.application || '',
      createdAt: info.date || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveSheetsIndex([meta]);
    // Save without ui
    const { ui, ...persistable } = data;
    localStorage.setItem(SHEET_PREFIX + id, JSON.stringify(persistable));
    localStorage.removeItem(OLD_KEY);
  } catch (e) {
    console.warn('Erreur migration:', e);
  }
}

// === Compat (gardé pour ne rien casser pendant la transition) ===

export const saveToStorage = (state) => {
  try {
    const { ui, ...persistable } = state;
    localStorage.setItem(OLD_KEY, JSON.stringify(persistable));
  } catch (e) {
    console.warn('Erreur sauvegarde localStorage:', e);
  }
};

export const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(OLD_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearStorage = () => {
  localStorage.removeItem(OLD_KEY);
};
