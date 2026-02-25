export const generateId = () =>
  'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9);

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const today = () => new Date().toISOString().split('T')[0];

export function generateSheetRef(existingRefs = []) {
  let num = existingRefs.length + 1;
  let ref;
  do {
    ref = `F${String(num).padStart(3, '0')}`;
    num++;
  } while (existingRefs.includes(ref));
  return ref;
}
