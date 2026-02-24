const STORAGE_KEY = 'aroma-formulation';

export const saveToStorage = (state) => {
  try {
    const { ui, ...persistable } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
  } catch (e) {
    console.warn('Erreur sauvegarde localStorage:', e);
  }
};

export const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearStorage = () => {
  localStorage.removeItem(STORAGE_KEY);
};
