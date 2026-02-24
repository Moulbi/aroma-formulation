/**
 * Base de données des matières premières connues.
 * Interface async pour futur remplacement par appel API.
 */

const INGREDIENT_DATABASE = [
  // === SUPPORTS ===
  { nom: 'Alcool éthylique 96°', type: 'support', classification: 'naturel', isExtrait: false, sourceExtrait: '', prix: 2.50, rgt: 'SUP001', densite: 0.789, tauxVanilline: 0 },
  { nom: 'Propylène glycol', type: 'support', classification: 'synthetique', isExtrait: false, sourceExtrait: '', prix: 3.20, rgt: 'SUP002', densite: 1.036, tauxVanilline: 0 },
  { nom: 'Glycérine végétale', type: 'support', classification: 'naturel', isExtrait: false, sourceExtrait: '', prix: 4.00, rgt: 'SUP003', densite: 1.261, tauxVanilline: 0 },
  { nom: 'Triacétine (E1518)', type: 'support', classification: 'synthetique', isExtrait: false, sourceExtrait: '', prix: 5.50, rgt: 'SUP004', densite: 1.160, tauxVanilline: 0 },
  { nom: 'Eau déminéralisée', type: 'support', classification: 'naturel', isExtrait: false, sourceExtrait: '', prix: 0.10, rgt: 'SUP005', densite: 1.000, tauxVanilline: 0 },
  { nom: 'Huile MCT', type: 'support', classification: 'naturel', isExtrait: false, sourceExtrait: '', prix: 8.00, rgt: 'SUP006', densite: 0.950, tauxVanilline: 0 },
  { nom: 'Maltodextrine', type: 'support', classification: 'naturel', isExtrait: false, sourceExtrait: '', prix: 3.00, rgt: 'SUP007', densite: 0.600, tauxVanilline: 0 },
  { nom: 'Huile de tournesol', type: 'support', classification: 'naturel', isExtrait: false, sourceExtrait: '', prix: 2.80, rgt: 'SUP008', densite: 0.920, tauxVanilline: 0 },

  // === EXTRAITS NATURELS ===
  { nom: 'Extrait de vanille', type: 'aromatisant', classification: 'naturel', isExtrait: true, sourceExtrait: 'vanille', prix: 200.00, rgt: 'EXT001', densite: 0.920, tauxVanilline: 0.8 },
  { nom: 'HE Amande amère', type: 'aromatisant', classification: 'naturel', isExtrait: true, sourceExtrait: 'amande', prix: 250.00, rgt: 'EXT002', densite: 0.960, tauxVanilline: 0 },
  { nom: 'Extrait de café', type: 'aromatisant', classification: 'naturel', isExtrait: true, sourceExtrait: 'café', prix: 180.00, rgt: 'EXT003', densite: 0.980, tauxVanilline: 0 },
  { nom: 'Oléorésine de vanille', type: 'aromatisant', classification: 'naturel', isExtrait: true, sourceExtrait: 'vanille', prix: 350.00, rgt: 'EXT004', densite: 0.950, tauxVanilline: 2.5 },
  { nom: 'HE Citron zeste', type: 'aromatisant', classification: 'naturel', isExtrait: true, sourceExtrait: 'citron', prix: 45.00, rgt: 'EXT005', densite: 0.850, tauxVanilline: 0 },
  { nom: 'HE Orange douce', type: 'aromatisant', classification: 'naturel', isExtrait: true, sourceExtrait: 'orange', prix: 30.00, rgt: 'EXT006', densite: 0.842, tauxVanilline: 0 },
  { nom: 'Extrait de fraise', type: 'aromatisant', classification: 'naturel', isExtrait: true, sourceExtrait: 'fraise', prix: 220.00, rgt: 'EXT007', densite: 0.940, tauxVanilline: 0 },
  { nom: 'Extrait de framboise', type: 'aromatisant', classification: 'naturel', isExtrait: true, sourceExtrait: 'framboise', prix: 280.00, rgt: 'EXT008', densite: 0.935, tauxVanilline: 0 },
  { nom: 'Extrait de cacao', type: 'aromatisant', classification: 'naturel', isExtrait: true, sourceExtrait: 'cacao', prix: 160.00, rgt: 'EXT009', densite: 0.960, tauxVanilline: 0.1 },
  { nom: 'HE Menthe poivrée', type: 'aromatisant', classification: 'naturel', isExtrait: true, sourceExtrait: 'menthe', prix: 55.00, rgt: 'EXT010', densite: 0.900, tauxVanilline: 0 },
  { nom: 'HE Cannelle de Ceylan', type: 'aromatisant', classification: 'naturel', isExtrait: true, sourceExtrait: 'cannelle', prix: 120.00, rgt: 'EXT011', densite: 1.030, tauxVanilline: 0 },
  { nom: 'Extrait de caramel', type: 'aromatisant', classification: 'naturel', isExtrait: true, sourceExtrait: 'caramel', prix: 90.00, rgt: 'EXT012', densite: 1.050, tauxVanilline: 0 },
  { nom: 'HE Bergamote', type: 'aromatisant', classification: 'naturel', isExtrait: true, sourceExtrait: 'bergamote', prix: 75.00, rgt: 'EXT013', densite: 0.880, tauxVanilline: 0 },
  { nom: 'Extrait de noisette', type: 'aromatisant', classification: 'naturel', isExtrait: true, sourceExtrait: 'noisette', prix: 190.00, rgt: 'EXT014', densite: 0.945, tauxVanilline: 0 },
  { nom: 'Extrait de noix de coco', type: 'aromatisant', classification: 'naturel', isExtrait: true, sourceExtrait: 'noix de coco', prix: 140.00, rgt: 'EXT015', densite: 0.930, tauxVanilline: 0 },

  // === SUBSTANCES AROMATISANTES NATURELLES ===
  { nom: 'Vanilline naturelle', type: 'aromatisant', classification: 'naturel', isExtrait: false, sourceExtrait: '', prix: 120.00, rgt: 'SAR001', densite: 1.056, tauxVanilline: 100 },
  { nom: 'Benzaldéhyde naturel', type: 'aromatisant', classification: 'naturel', isExtrait: false, sourceExtrait: '', prix: 85.00, rgt: 'SAR002', densite: 1.044, tauxVanilline: 0 },
  { nom: 'Acétaldéhyde naturel', type: 'aromatisant', classification: 'naturel', isExtrait: false, sourceExtrait: '', prix: 95.00, rgt: 'SAR003', densite: 0.784, tauxVanilline: 0 },
  { nom: 'Éthyl vanilline naturelle', type: 'aromatisant', classification: 'naturel', isExtrait: false, sourceExtrait: '', prix: 150.00, rgt: 'SAR004', densite: 1.060, tauxVanilline: 100 },
  { nom: 'Gamma-décalactone naturel', type: 'aromatisant', classification: 'naturel', isExtrait: false, sourceExtrait: '', prix: 200.00, rgt: 'SAR005', densite: 0.970, tauxVanilline: 0 },
  { nom: 'Limonène naturel', type: 'aromatisant', classification: 'naturel', isExtrait: false, sourceExtrait: '', prix: 40.00, rgt: 'SAR006', densite: 0.842, tauxVanilline: 0 },
  { nom: 'Linalol naturel', type: 'aromatisant', classification: 'naturel', isExtrait: false, sourceExtrait: '', prix: 65.00, rgt: 'SAR007', densite: 0.860, tauxVanilline: 0 },
  { nom: 'Diacétyle naturel', type: 'aromatisant', classification: 'naturel', isExtrait: false, sourceExtrait: '', prix: 110.00, rgt: 'SAR008', densite: 0.981, tauxVanilline: 0 },

  // === SUBSTANCES AROMATISANTES SYNTHÉTIQUES ===
  { nom: 'Vanilline synthétique', type: 'aromatisant', classification: 'synthetique', isExtrait: false, sourceExtrait: '', prix: 25.00, rgt: 'SAS001', densite: 1.056, tauxVanilline: 100 },
  { nom: 'Éthyl vanilline synthétique', type: 'aromatisant', classification: 'synthetique', isExtrait: false, sourceExtrait: '', prix: 35.00, rgt: 'SAS002', densite: 1.060, tauxVanilline: 100 },
  { nom: 'Benzaldéhyde synthétique', type: 'aromatisant', classification: 'synthetique', isExtrait: false, sourceExtrait: '', prix: 15.00, rgt: 'SAS003', densite: 1.044, tauxVanilline: 0 },
  { nom: 'Gamma-décalactone synthétique', type: 'aromatisant', classification: 'synthetique', isExtrait: false, sourceExtrait: '', prix: 30.00, rgt: 'SAS004', densite: 0.970, tauxVanilline: 0 },
  { nom: 'Maltol', type: 'aromatisant', classification: 'synthetique', isExtrait: false, sourceExtrait: '', prix: 40.00, rgt: 'SAS005', densite: 1.100, tauxVanilline: 0 },
  { nom: 'Furaneol', type: 'aromatisant', classification: 'synthetique', isExtrait: false, sourceExtrait: '', prix: 55.00, rgt: 'SAS006', densite: 1.050, tauxVanilline: 0 },
];

/**
 * Recherche asynchrone dans la BDD d'ingrédients.
 * Peut être remplacée par un fetch() vers une API externe.
 */
export async function searchIngredients(query, { limit = 100, type } = {}) {
  const q = query.trim().toLowerCase();
  if (!q) return INGREDIENT_DATABASE.slice(0, limit);

  let results = INGREDIENT_DATABASE.filter(ing => {
    const searchable = `${ing.nom} ${ing.rgt} ${ing.sourceExtrait} ${ing.type}`.toLowerCase();
    const tokens = q.split(/\s+/);
    return tokens.every(token => searchable.includes(token));
  });

  if (type) {
    results = results.filter(ing => ing.type === type);
  }

  return results.slice(0, limit);
}

export default INGREDIENT_DATABASE;
