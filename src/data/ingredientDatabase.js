/**
 * Base de données des matières premières — chargée depuis mp.csv.
 * Interface async pour futur remplacement par appel API.
 */

import csvText from './mp.csv?raw';

// Parse CSV (separator: ;)
function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  const results = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(';');
    const ref = (cols[0] || '').trim();
    const name = (cols[1] || '').trim();
    const cas = (cols[2] || '').trim();
    const price = parseFloat(cols[4]) || 0;
    const csvType = (cols[5] || '').trim().toLowerCase();
    const csvClassification = (cols[6] || '').trim().toLowerCase();

    // Skip empty rows or test data
    if (!ref && !name) continue;
    if (!name) continue;

    // Use CSV columns if provided, otherwise auto-detect
    const type = (csvType === 'support' || csvType === 'aromatisant') ? csvType : guessType(ref);
    const classification = (csvClassification === 'naturel' || csvClassification === 'synthetique') ? csvClassification : guessClassification(ref);

    results.push({
      nom: name,
      rgt: ref,
      cas: cas !== '-' ? cas : '',
      prix: price,
      type,
      classification,
      isExtrait: guessIsExtrait(name),
      sourceExtrait: guessSource(name),
      densite: 1.0,
      tauxVanilline: guessVanillin(name, ref),
    });
  }
  return results;
}

// Guess type from ref prefix (fallback when CSV column is empty)
function guessType(ref) {
  const r = ref.toUpperCase();
  // I = Ingrédient support (ILA, IPA, ILC...)
  if (r.startsWith('I')) return 'support';
  // BPA = support (sucre bio, café atomisé, etc.)
  if (r.startsWith('BPA')) return 'support';
  // Exceptions: specific refs that are supports
  if (r === 'NLA0073K') return 'support';
  // Default: aromatisant
  return 'aromatisant';
}

function guessClassification(ref) {
  const r = ref.toUpperCase();
  // S prefix = Synthétique (SLA, SPA, SLF, SPF, SLC, SSA, SSF)
  if (r.startsWith('S')) return 'synthetique';
  // N prefix = Naturel
  if (r.startsWith('N')) return 'naturel';
  // B prefix = Bio (naturel)
  if (r.startsWith('B')) return 'naturel';
  return 'naturel';
}

function guessIsExtrait(name) {
  const n = name.toLowerCase();
  return /extrait|extract|absolue?|absolu|resinoide|résinoïde|alcoolat|infusion|co2|oléorésine|oleoresine/.test(n);
}

function guessSource(name) {
  const n = name.toLowerCase();
  // Try to extract source from common patterns
  const patterns = [
    /extrait de\s+(.+?)(?:\s+\d|\s+co2|\s+bourbon|\s+bio|\s+concentr|\s+hydril|\s+grundo|\s+malac|\s+redo|\s+relac|\s+unilac|\s+hydrex|\s*$)/i,
    /extract(?:ion)?\s+(?:de\s+)?(.+?)(?:\s+\d|\s*$)/i,
    /absolue?\s+(?:de\s+)?(.+?)(?:\s+extra|\s*$)/i,
    /infusion\s+(?:de\s+)?(.+?)(?:\s+\d|\s*$)/i,
    /alcoolat\s+(?:de\s+)?(.+?)(?:\s+\d|\s*$)/i,
    /he\s+(.+?)(?:\s+\(|\s*$)/i,
    /essence\s+(?:de\s+)?(.+?)(?:\s+\(|\s+extra|\s*$)/i,
  ];
  for (const p of patterns) {
    const m = n.match(p);
    if (m) {
      let src = m[1].trim().replace(/\*$/, '').trim();
      if (src.length > 1 && src.length < 40) return src;
    }
  }
  return '';
}

function guessVanillin(name, ref) {
  const n = name.toLowerCase();
  if (n.includes('vanilline naturelle') || ref === 'NPA0189K') return 100;
  if (n.includes('vanilline') && !n.includes('ethyl')) return 0;
  if (n.includes('extrait de vanille') || n.includes('concentré de vanille')) return 0.8;
  return 0;
}

// Parse once at import
const DATABASE = parseCSV(csvText);

/**
 * Search ingredients by query (multi-word token matching on name + ref).
 * Returns up to `limit` results.
 */
export async function searchIngredients(query, { limit = 200, type } = {}) {
  let items = DATABASE;

  if (type) {
    items = items.filter(i => i.type === type);
  }

  if (query && query.trim()) {
    const tokens = query.trim().toLowerCase().split(/\s+/);
    items = items.filter(item => {
      const haystack = `${item.nom} ${item.rgt} ${item.cas}`.toLowerCase();
      return tokens.every(t => haystack.includes(t));
    });
  }

  return items.slice(0, limit);
}

export { DATABASE as INGREDIENT_DATABASE };
