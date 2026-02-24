export const DILUTION_OPTIONS = [
  { value: 1, label: '100%' },
  { value: 0.1, label: '10%' },
  { value: 0.01, label: '1%' },
  { value: 0.001, label: '0.1%' },
  { value: 0.0001, label: '0.01%' },
  { value: 0.00001, label: '0.001%' },
  { value: 0.000001, label: '0.0001%' },
];

export const INGREDIENT_TYPES = {
  support: { label: 'Support', color: '#e8f5e9' },
  aromatisant: { label: 'Aromatisant', color: '#fff3e0' },
};

export const CLASSIFICATIONS = {
  naturel: 'Naturel',
  synthetique: 'Synthétique',
};

export const MAX_TRIALS = 10;
export const TRIALS_PER_PAGE = 4;

export const DEFAULT_INGREDIENTS = [
  { id: 'mp-1', nom: 'Alcool éthylique 96°', type: 'support', classification: 'naturel', isExtrait: false, sourceExtrait: '', prix: 2.50, rgt: 'SUP001', densite: 0.789, tauxVanilline: 0, order: 0 },
  { id: 'mp-2', nom: 'Propylène glycol', type: 'support', classification: 'synthetique', isExtrait: false, sourceExtrait: '', prix: 3.20, rgt: 'SUP002', densite: 1.036, tauxVanilline: 0, order: 1 },
  { id: 'mp-3', nom: 'Extrait de vanille', type: 'aromatisant', classification: 'naturel', isExtrait: true, sourceExtrait: 'vanille', prix: 200.00, rgt: 'EXT001', densite: 0.920, tauxVanilline: 0.8, order: 2 },
  { id: 'mp-4', nom: 'Vanilline naturelle', type: 'aromatisant', classification: 'naturel', isExtrait: false, sourceExtrait: '', prix: 120.00, rgt: 'SAR001', densite: 1.056, tauxVanilline: 100, order: 3 },
  { id: 'mp-5', nom: 'HE Amande amère', type: 'aromatisant', classification: 'naturel', isExtrait: true, sourceExtrait: 'amande', prix: 250.00, rgt: 'EXT002', densite: 0.960, tauxVanilline: 0, order: 4 },
  { id: 'mp-6', nom: 'Benzaldéhyde naturel', type: 'aromatisant', classification: 'naturel', isExtrait: false, sourceExtrait: '', prix: 85.00, rgt: 'SAR002', densite: 1.044, tauxVanilline: 0, order: 5 },
  { id: 'mp-7', nom: 'Vanilline synthétique', type: 'aromatisant', classification: 'synthetique', isExtrait: false, sourceExtrait: '', prix: 25.00, rgt: 'SAS001', densite: 1.056, tauxVanilline: 100, order: 6 },
];

export const SENSORY_PRESETS = {
  vanilla: {
    label: 'Vanille',
    descriptors: [
      { name: 'Sucré', value: 8 },
      { name: 'Vanillé', value: 9 },
      { name: 'Crémeux', value: 7 },
      { name: 'Boisé', value: 4 },
      { name: 'Floral', value: 3 },
      { name: 'Épicé', value: 2 },
    ],
  },
  citrus: {
    label: 'Agrumes',
    descriptors: [
      { name: 'Acide', value: 8 },
      { name: 'Frais', value: 9 },
      { name: 'Pétillant', value: 7 },
      { name: 'Agrume', value: 9 },
      { name: 'Amer', value: 4 },
      { name: 'Zesté', value: 6 },
    ],
  },
  fruity: {
    label: 'Fruité',
    descriptors: [
      { name: 'Sucré', value: 7 },
      { name: 'Fruité', value: 9 },
      { name: 'Juteux', value: 8 },
      { name: 'Tropical', value: 6 },
      { name: 'Acide', value: 5 },
      { name: 'Mûr', value: 7 },
    ],
  },
  floral: {
    label: 'Floral',
    descriptors: [
      { name: 'Floral', value: 9 },
      { name: 'Délicat', value: 8 },
      { name: 'Parfumé', value: 7 },
      { name: 'Rose', value: 6 },
      { name: 'Jasmin', value: 5 },
      { name: 'Poudré', value: 4 },
    ],
  },
  spicy: {
    label: 'Épicé',
    descriptors: [
      { name: 'Épicé', value: 9 },
      { name: 'Piquant', value: 7 },
      { name: 'Chaud', value: 8 },
      { name: 'Boisé', value: 6 },
      { name: 'Terreux', value: 5 },
      { name: 'Fumé', value: 4 },
    ],
  },
};

export const DEFAULT_SENSORY_DESCRIPTORS = [
  { id: 'desc-1', name: 'Sucré' },
  { id: 'desc-2', name: 'Acide' },
  { id: 'desc-3', name: 'Amer' },
  { id: 'desc-4', name: 'Salé' },
  { id: 'desc-5', name: 'Umami' },
];

export const DEFAULT_RESPONSIBLES = [
  'Dr. Marie Dubois',
  'Dr. Jean Martin',
  'Sarah Chen',
  'Alexandre Rousseau',
  'Dr. Patricia Silva',
];
