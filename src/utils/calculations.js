/**
 * Calcule le QSP (Quantum Satis Pour) - la masse du solvant de remplissage
 * pour atteindre la masse cible.
 */
export function calculateQSP(trialData, ingredients, qspIngredientId, targetMass) {
  if (!trialData || !qspIngredientId) return 0;

  let totalOthers = 0;
  for (const [ingId, cellData] of Object.entries(trialData)) {
    if (ingId !== qspIngredientId && cellData.mass > 0) {
      totalOthers += cellData.mass;
    }
  }
  return Math.max(0, targetMass - totalOthers);
}

/**
 * Calcule le coût total d'un essai et la répartition support/aromatisant.
 * Prend en compte la masse QSP calculée pour l'ingrédient QSP.
 */
export function calculateTrialCost(trialData, ingredients, qspIngredientId, targetMass) {
  if (!trialData) return { total: 0, support: 0, aromatic: 0 };

  // Calculer la masse QSP si nécessaire
  const qspMass = qspIngredientId ? calculateQSP(trialData, ingredients, qspIngredientId, targetMass) : 0;

  let total = 0;
  let support = 0;
  let aromatic = 0;

  for (const ing of ingredients) {
    const cellData = trialData[ing.id];
    const isQsp = ing.id === qspIngredientId;

    // Masse = QSP calculé ou masse saisie
    const mass = isQsp ? qspMass : (cellData?.mass || 0);
    if (mass <= 0) continue;

    const dilution = cellData?.dilution ?? 1;
    // Coût = prix(€/kg) * dilution * masse(g) / 1000
    const cost = ing.prix * dilution * (mass / 1000);
    total += cost;

    if (ing.type === 'support') support += cost;
    else if (ing.type === 'aromatisant') aromatic += cost;
  }

  return { total, support, aromatic };
}

/**
 * Prix de vente calculé = coût * facteur
 */
export function calculateSalePrice(cost, factor) {
  return cost * factor;
}

/**
 * Coût cible = prix vente cible / facteur
 */
export function calculateTargetCost(targetSalePrice, factor) {
  if (!targetSalePrice || !factor) return 0;
  return targetSalePrice / factor;
}

/**
 * Densité du mélange (moyenne pondérée par la masse).
 * Prend en compte la masse QSP calculée.
 */
export function calculateDensity(trialData, ingredients, qspIngredientId, targetMass) {
  if (!trialData) return 0;

  const qspMass = qspIngredientId ? calculateQSP(trialData, ingredients, qspIngredientId, targetMass) : 0;

  let totalMass = 0;
  let weightedSum = 0;

  for (const ing of ingredients) {
    const cellData = trialData[ing.id];
    const isQsp = ing.id === qspIngredientId;
    const mass = isQsp ? qspMass : (cellData?.mass || 0);
    if (mass <= 0 || !ing.densite) continue;

    totalMass += mass;
    weightedSum += mass * ing.densite;
  }

  return totalMass > 0 ? weightedSum / totalMass : 0;
}

/**
 * Profil vanilline : pourcentage, fold, équivalent gousses.
 * Référence : gousse de vanille = 1.6% vanilline.
 * Prend en compte la masse QSP calculée.
 */
export function calculateVanillinProfile(trialData, ingredients, qspIngredientId, targetMass) {
  if (!trialData) return { percentage: 0, fold: 0, beansEquiv: 0 };

  const VANILLIN_REF = 1.6;
  const qspMass = qspIngredientId ? calculateQSP(trialData, ingredients, qspIngredientId, targetMass) : 0;

  let totalEffectiveMass = 0;
  let weightedVanillinSum = 0;

  for (const ing of ingredients) {
    const cellData = trialData[ing.id];
    const isQsp = ing.id === qspIngredientId;
    const mass = isQsp ? qspMass : (cellData?.mass || 0);
    if (mass <= 0) continue;

    const dilution = cellData?.dilution ?? 1;
    const effectiveMass = mass * dilution;

    if (effectiveMass > 0) {
      totalEffectiveMass += effectiveMass;
      weightedVanillinSum += effectiveMass * (ing.tauxVanilline || 0);
    }
  }

  const percentage = totalEffectiveMass > 0 ? weightedVanillinSum / totalEffectiveMass : 0;
  const fold = percentage / VANILLIN_REF;
  const beansEquiv = fold * 100; // g de gousses par kg de formule

  return { percentage, fold, beansEquiv };
}

/**
 * Retourne "de X" ou "d'X" selon si X commence par une voyelle/h muet.
 */
function deSource(source) {
  const s = source.trim();
  if (/^[aeiouhyàâéèêëïîôùûüæœ]/i.test(s)) return `d'${s}`;
  return `de ${s}`;
}

/**
 * Classification EU 1334/2008 de la formule.
 * Retourne { label, cssClass, details }
 */
export function classifyFormula(trialData, ingredients) {
  if (!trialData) return { label: '', cssClass: '', details: '' };

  const aromatisants = [];
  let hasSynthetique = false;

  for (const [ingId, cellData] of Object.entries(trialData)) {
    const ing = ingredients.find(i => i.id === ingId);
    if (!ing || !cellData.mass || cellData.mass <= 0) continue;
    if (ing.type !== 'aromatisant') continue;

    const dilution = cellData.dilution ?? 1;
    const effectiveQty = cellData.mass * dilution;

    if (ing.classification === 'synthetique') hasSynthetique = true;
    aromatisants.push({ ing, quantity: effectiveQty });
  }

  if (aromatisants.length === 0) {
    return { label: '', cssClass: '', details: 'Aucun aromatisant', sources: [] };
  }

  if (hasSynthetique) {
    return {
      label: 'Arôme',
      cssClass: 'arome',
      details: 'Contient des substances aromatisantes synthétiques',
      sources: analyzeSources(aromatisants),
    };
  }

  const extraits = aromatisants.filter(a => a.ing.isExtrait);

  if (extraits.length === 0) {
    return {
      label: 'Arôme naturel',
      cssClass: 'arome-naturel',
      details: 'Substances aromatisantes naturelles uniquement',
      sources: analyzeSources(aromatisants),
    };
  }

  if (extraits.length === 1 && aromatisants.length === 1) {
    const src = extraits[0].ing.sourceExtrait;
    const de = deSource(src);
    return {
      label: `Arôme naturel ${de} (extrait ${de})`,
      cssClass: 'arome-naturel-de-x',
      details: `Extrait unique ${de}`,
      sources: analyzeSources(aromatisants),
    };
  }

  const sources = analyzeSources(aromatisants);
  // For labeling, only consider named sources (not "Autres substances")
  const namedSources = sources.filter(s => !s.isUnsourced);

  if (namedSources.length > 0) {
    const dominant = namedSources[0];
    const de = deSource(dominant.source);
    if (dominant.percentage >= 95) {
      return {
        label: `Arôme naturel ${de}`,
        cssClass: 'arome-naturel-de-x',
        details: `≥95% issu ${de}`,
        sources,
      };
    }
    return {
      label: `Arôme naturel ${de} avec autres arômes naturels`,
      cssClass: 'arome-naturel-de-x-avec-autres',
      details: `${dominant.percentage.toFixed(1)}% issu ${de}`,
      sources,
    };
  }

  return {
    label: 'Arôme naturel',
    cssClass: 'arome-naturel',
    details: "Mélange d'arômes naturels",
    sources,
  };
}

function analyzeSources(aromatisants) {
  const totalQty = aromatisants.reduce((sum, a) => sum + a.quantity, 0);
  if (totalQty === 0) return [];

  const sourcesMap = new Map();
  let unsourcedQty = 0;

  for (const { ing, quantity } of aromatisants) {
    const src = (ing.sourceExtrait || '').trim().toLowerCase();
    if (!src) {
      unsourcedQty += quantity;
      continue;
    }
    if (!sourcesMap.has(src)) {
      sourcesMap.set(src, { source: ing.sourceExtrait.trim(), quantity: 0, fromExtrait: false });
    }
    const entry = sourcesMap.get(src);
    entry.quantity += quantity;
    if (ing.isExtrait) entry.fromExtrait = true;
  }

  const results = Array.from(sourcesMap.values())
    .map(s => ({ ...s, percentage: (s.quantity / totalQty) * 100 }))
    .sort((a, b) => b.percentage - a.percentage);

  if (unsourcedQty > 0) {
    results.push({
      source: 'Autres substances',
      quantity: unsourcedQty,
      percentage: (unsourcedQty / totalQty) * 100,
      fromExtrait: false,
      isUnsourced: true,
    });
  }

  return results;
}
