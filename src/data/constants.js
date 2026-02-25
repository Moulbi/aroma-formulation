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
export const TRIALS_PER_PAGE = 5;

export const DEFAULT_INGREDIENTS = [];

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
