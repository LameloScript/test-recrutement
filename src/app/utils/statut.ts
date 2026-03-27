import type { StatutDossier } from "~/types/dossier";

/** Couleur Tailwind du badge selon le statut */
export function statutColor(statut: StatutDossier): string {
  switch (statut) {
    case "ACCEPTE":
      return "bg-green-100 text-green-800";
    case "REFUSE":
      return "bg-red-100 text-red-800";
    case "EN_COURS":
      return "bg-blue-100 text-blue-800";
    case "EN_ATTENTE":
      return "bg-yellow-100 text-yellow-800";
    case "SUSPENDU":
      return "bg-gray-100 text-gray-800";
  }
}

/** Couleur du score : vert >= 60, orange 40–59, rouge < 40 */
export function scoreColor(score: number): string {
  if (score >= 60) return "text-green-600";
  if (score >= 40) return "text-orange-500";
  return "text-red-600";
}

/** Label lisible pour le type de demande */
export function typeLabel(type: string): string {
  switch (type) {
    case "COUVERTURE_FACULTATIVE":
      return "Couverture facultative";
    case "PLACEMENT_REAS":
      return "Placement réassurance";
    case "COTATION":
      return "Cotation";
    default:
      return type;
  }
}
