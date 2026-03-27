import { createContext, useContext, useState, useEffect } from "react";
import type { Dossier, Score, Decision, EngagementDelai } from "~/types/dossier";
import { calculerScore, statutFromScore } from "~/utils/scoring";
import mockData from "~/mocks/dossiers.json";

interface DossiersState {
  dossiers: Dossier[];
  scores: Score[];
  decisions: Decision[];
  engagementDelais: EngagementDelai[];
  loading: boolean;
  error: string | null;
  ajouterDossier: (dossier: Dossier) => void;
  scorerDossier: (dossierId: string) => void;
  validerDossier: (dossierId: string, resultat: "ACCEPTE" | "REFUSE", motif: string, validePar: string) => void;
  suspendreDossier: (dossierId: string, motif: string) => void;
  getScore: (dossierId: string) => Score | undefined;
  getDecision: (dossierId: string) => Decision | undefined;
  getEngagement: (dossierId: string) => EngagementDelai | undefined;
}

const DossiersContext = createContext<DossiersState | null>(null);

export { DossiersContext };

/**
 * Provider qui charge les données mock et expose les fonctions
 * pour lire et ajouter des dossiers.
 */
export function useDossiersProvider(): DossiersState {
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [engagementDelais, setEngagementDelais] = useState<EngagementDelai[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setDossiers(mockData.dossiers as Dossier[]);
        setScores(mockData.scores as Score[]);
        setDecisions(mockData.decisions as Decision[]);
        setEngagementDelais(mockData.engagementDelais as EngagementDelai[]);
      } catch {
        setError("Erreur lors du chargement des dossiers");
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  function ajouterDossier(dossier: Dossier) {
    setDossiers((prev) => [dossier, ...prev]);
  }

  /**
   * Calcule le score d'un dossier et met à jour son statut :
   * >= 60 → ACCEPTE, 40–59 → EN_COURS (à valider), < 40 → REFUSE
   */
  function scorerDossier(dossierId: string) {
    const dossier = dossiers.find((d) => d.id === dossierId);
    if (!dossier) return;

    const valeur = calculerScore({
      montant: dossier.montantDemande,
      duree: dossier.dureeMois,
      antecedentSinistre: dossier.antecedantSinistre,
    });
    const resultat = statutFromScore(valeur);

    const now = new Date().toISOString();
    const score: Score = {
      id: `s${Date.now()}`,
      valeur,
      calculeLe: now,
      reglesAppliques: [
        "BASE_100",
        dossier.montantDemande > 500_000 ? "MONTANT_SUP_500K" : "MONTANT_OK",
        dossier.dureeMois > 12 ? "DUREE_SUP_12" : "DUREE_OK",
        dossier.antecedantSinistre ? "SINISTRE_OUI" : "SINISTRE_OK",
      ],
      dossierId,
    };
    setScores((prev) => [score, ...prev]);

    // Mettre à jour le statut selon le score
    const nouveauStatut = resultat === "ACCEPTE" ? "ACCEPTE" as const
      : resultat === "REFUSE" ? "REFUSE" as const
      : "EN_COURS" as const;

    setDossiers((prev) =>
      prev.map((d) => d.id === dossierId ? { ...d, statut: nouveauStatut } : d)
    );
  }

  /**
   * Valide un dossier : crée une Décision, met à jour le statut du dossier,
   * et simule l'envoi au système CORE Assurance (log console).
   */
  function validerDossier(dossierId: string, resultat: "ACCEPTE" | "REFUSE", motif: string, validePar: string) {
    const now = new Date().toISOString();

    // Créer la décision
    const decision: Decision = {
      id: `dec${Date.now()}`,
      resultat,
      motif,
      decideLe: now,
      validePar,
      dossierId,
    };
    setDecisions((prev) => [decision, ...prev]);

    // Mettre à jour le statut du dossier
    setDossiers((prev) =>
      prev.map((d) => d.id === dossierId ? { ...d, statut: resultat === "ACCEPTE" ? "ACCEPTE" as const : "REFUSE" as const } : d)
    );

    // Simulation envoi au CORE Assurance
    console.log(`[CORE Assurance] Notification envoyée :`, {
      type: "DECISION_SOUSCRIPTION",
      dossierId,
      resultat,
      motif,
      validePar,
      date: now,
    });
  }

  function suspendreDossier(dossierId: string, motif: string) {
    setDossiers((prev) =>
      prev.map((d) => d.id === dossierId ? { ...d, statut: "SUSPENDU" as const } : d)
    );

    console.log(`[CORE Assurance] Dossier suspendu :`, {
      type: "SUSPENSION_DOSSIER",
      dossierId,
      motif,
      date: new Date().toISOString(),
    });
  }

  function getScore(dossierId: string) {
    return scores.find((s) => s.dossierId === dossierId);
  }

  function getDecision(dossierId: string) {
    return decisions.find((d) => d.dossierId === dossierId);
  }

  function getEngagement(dossierId: string) {
    return engagementDelais.find((e) => e.dossierId === dossierId);
  }

  return { dossiers, scores, decisions, engagementDelais, loading, error, ajouterDossier, scorerDossier, validerDossier, suspendreDossier, getScore, getDecision, getEngagement };
}

/**
 * Hook pour consommer le contexte des dossiers dans n'importe quel composant.
 */
export function useDossiers(): DossiersState {
  const ctx = useContext(DossiersContext);
  if (!ctx) throw new Error("useDossiers doit être utilisé dans un DossiersProvider");
  return ctx;
}
