/**
 * Calcule le score de risque d'un dossier selon les règles métier :
 * - Score de base : 100
 * - Montant > 500 000 € : -30
 * - Durée > 12 mois : -20
 * - Antécédent de sinistre : -25
 * - Plancher à 0
 */
export function calculerScore(params: {
  montant: number;
  duree: number;
  antecedentSinistre: boolean;
}): number {
  let score = 100;

  if (params.montant > 500_000) score -= 30;
  if (params.duree > 12) score -= 20;
  if (params.antecedentSinistre) score -= 25;

  return Math.max(score, 0);
}

/**
 * Détermine le statut en fonction du score :
 * >= 60 → ACCEPTE, 40–59 → A_VALIDER, < 40 → REFUSE
 */
export function statutFromScore(score: number): "ACCEPTE" | "A_VALIDER" | "REFUSE" {
  if (score >= 60) return "ACCEPTE";
  if (score >= 40) return "A_VALIDER";
  return "REFUSE";
}
