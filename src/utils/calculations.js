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
 */
export function calculateTrialCost(trialData, ingredients) {
  if (!trialData) return { total: 0, support: 0, aromatic: 0 };

  let total = 0;
  let support = 0;
  let aromatic = 0;

  for (const [ingId, cellData] of Object.entries(trialData)) {
    const ing = ingredients.find(i => i.id === ingId);
    if (!ing || !cellData.mass || cellData.mass <= 0) continue;

    const dilution = cellData.dilution ?? 1;
    // Coût = prix(€/kg) * dilution * masse(g) / 1000
    const cost = ing.prix * dilution * (cellData.mass / 1000);
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
 */
export function calculateDensity(trialData, ingredients) {
  if (!trialData) return 0;

  let totalMass = 0;
  let weightedSum = 0;

  for (const [ingId, cellData] of Object.entries(trialData)) {
    const ing = ingredients.find(i => i.id === ingId);
    if (!ing || !cellData.mass || cellData.mass <= 0 || !ing.densite) continue;

    totalMass += cellData.mass;
    weightedSum += cellData.mass * ing.densite;
  }

  return totalMass > 0 ? weightedSum / totalMass : 0;
}

/**
 * Profil vanilline : pourcentage, fold, équivalent gousses.
 * Référence : gousse de vanille = 1.6% vanilline.
 */
export function calculateVanillinProfile(trialData, ingredients) {
  if (!trialData) return { percentage: 0, fold: 0, beansEquiv: 0 };

  const VANILLIN_REF = 1.6; // % vanilline dans gousse de référence
  let totalEffectiveMass = 0;
  let weightedVanillinSum = 0;

  for (const [ingId, cellData] of Object.entries(trialData)) {
    const ing = ingredients.find(i => i.id === ingId);
    if (!ing || !cellData.mass || cellData.mass <= 0) continue;

    const dilution = cellData.dilution ?? 1;
    const effectiveMass = cellData.mass * dilution;

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
    return {
      label: `Extrait de ${extraits[0].ing.sourceExtrait}`,
      cssClass: 'extrait',
      details: 'Extrait unique',
      sources: analyzeSources(aromatisants),
    };
  }

  const sources = analyzeSources(aromatisants);
  if (sources.length > 0) {
    const dominant = sources[0];
    if (dominant.percentage >= 95) {
      return {
        label: `Arôme naturel de ${dominant.source}`,
        cssClass: 'arome-naturel-de-x',
        details: `≥95% issu de ${dominant.source}`,
        sources,
      };
    }
    return {
      label: `Arôme naturel de ${dominant.source} avec autres arômes naturels`,
      cssClass: 'arome-naturel-de-x-avec-autres',
      details: `${dominant.percentage.toFixed(1)}% issu de ${dominant.source}`,
      sources,
    };
  }

  return {
    label: 'Arôme naturel',
    cssClass: 'arome-naturel',
    details: "Mélange d'arômes naturels",
    sources: [],
  };
}

function analyzeSources(aromatisants) {
  const totalQty = aromatisants.reduce((sum, a) => sum + a.quantity, 0);
  if (totalQty === 0) return [];

  const sourcesMap = new Map();
  for (const { ing, quantity } of aromatisants) {
    const src = (ing.sourceExtrait || '').trim().toLowerCase();
    if (!src) continue;
    if (!sourcesMap.has(src)) {
      sourcesMap.set(src, { source: ing.sourceExtrait.trim(), quantity: 0, fromExtrait: false });
    }
    const entry = sourcesMap.get(src);
    entry.quantity += quantity;
    if (ing.isExtrait) entry.fromExtrait = true;
  }

  return Array.from(sourcesMap.values())
    .map(s => ({ ...s, percentage: (s.quantity / totalQty) * 100 }))
    .sort((a, b) => b.percentage - a.percentage);
}
