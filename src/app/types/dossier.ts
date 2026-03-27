export type StatutDossier = "EN_ATTENTE" | "EN_COURS" | "ACCEPTE" | "REFUSE" | "SUSPENDU";

export type TypeDemande = "COUVERTURE_FACULTATIVE" | "PLACEMENT_REAS" | "COTATION";

export type ResultatDecision = "ACCEPTE" | "REFUSE" | "A_VALIDER";

export type StatutRespect = "EN_COURS" | "RESPECTE" | "DEPASSE";

export type Role = "SOUSCRIPTEUR" | "VALIDATEUR";

export interface Dossier {
  id: string;
  reference: string;
  statut: StatutDossier;
  typeDemande: TypeDemande;
  dateDepot: string;
  montantDemande: number;
  dureeMois: number;
  antecedantSinistre: boolean;
  description: string;
}

export interface Score {
  id: string;
  valeur: number;
  calculeLe: string;
  reglesAppliques: string[];
  dossierId: string;
}

export interface Decision {
  id: string;
  resultat: ResultatDecision;
  motif: string;
  decideLe: string;
  validePar: string;
  dossierId: string;
}

export interface EngagementDelai {
  id: string;
  delaiContractuelJours: number;
  dateLimite: string;
  statutRespect: StatutRespect;
  dossierId: string;
}

export interface User {
  id: string;
  email: string;
  motDePasse: string;
  role: Role;
  creeLe: string;
}
