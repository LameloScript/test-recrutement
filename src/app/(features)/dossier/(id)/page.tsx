import { useState } from "react";
import { Link, useParams } from "react-router";
import { useDossiers } from "~/hooks/useDossiers";
import { statutColor, scoreColor, typeLabel } from "~/utils/statut";
import { statutFromScore } from "~/utils/scoring";

export default function DossierDetailPage() {
  const { id } = useParams();
  const { dossiers, getScore, getDecision, getEngagement, scorerDossier, validerDossier, suspendreDossier, loading, error } = useDossiers();
  const [motif, setMotif] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [notifie, setNotifie] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground text-lg">Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    );
  }

  const dossier = dossiers.find((d) => d.id === id);

  if (!dossier) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Link to="/dossiers" className="text-primary underline mb-4 inline-block">
          &larr; Retour à la liste
        </Link>
        <p className="text-red-600 text-lg">Dossier non trouvé (id: {id})</p>
      </div>
    );
  }

  const score = getScore(dossier.id);
  const decision = getDecision(dossier.id);
  const engagement = getEngagement(dossier.id);
  const enAttente = dossier.statut === "EN_ATTENTE";
  const peutValider = dossier.statut === "EN_COURS";

  async function handleScoring() {
    setEnCours(true);
    await new Promise((r) => setTimeout(r, 500));
    scorerDossier(dossier!.id);
    setEnCours(false);
  }

  async function handleDecision(resultat: "ACCEPTE" | "REFUSE") {
    setEnCours(true);
    await new Promise((r) => setTimeout(r, 500));
    validerDossier(
      dossier!.id,
      resultat,
      motif || (resultat === "ACCEPTE" ? "Score suffisant" : "Score insuffisant"),
      "validateur@compagnie.ci"
    );
    setEnCours(false);
    setNotifie(true);
  }

  async function handleSuspendre() {
    setEnCours(true);
    await new Promise((r) => setTimeout(r, 500));
    suspendreDossier(dossier!.id, motif || "Complément d'information requis");
    setEnCours(false);
    setNotifie(true);
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link to="/dossiers/liste" className="text-primary underline mb-4 inline-block">
        &larr; Retour à la liste
      </Link>

      <div className="border rounded-lg p-6 mt-2">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{dossier.reference}</h1>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${statutColor(dossier.statut)}`}
          >
            {dossier.statut.replace("_", " ")}
          </span>
        </div>

        {/* Informations du dossier */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Type de demande</p>
            <p className="font-medium">{typeLabel(dossier.typeDemande)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Date de dépôt</p>
            <p className="font-medium">{dossier.dateDepot}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Montant demandé</p>
            <p className="font-medium">{dossier.montantDemande.toLocaleString("fr-FR")} €</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Durée</p>
            <p className="font-medium">{dossier.dureeMois} mois</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Antécédent de sinistre</p>
            <p className="font-medium">{dossier.antecedantSinistre ? "Oui" : "Non"}</p>
          </div>
          {score && (
            <div>
              <p className="text-sm text-muted-foreground">Score de risque</p>
              <p className={`text-xl font-bold ${scoreColor(score.valeur)}`}>
                {score.valeur} / 100
                <span className="text-sm font-normal ml-2">({statutFromScore(score.valeur)})</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Calculé le {new Date(score.calculeLe).toLocaleDateString("fr-FR")}
              </p>
            </div>
          )}
        </div>

        <div className="mt-6">
          <p className="text-sm text-muted-foreground">Description</p>
          <p className="mt-1">{dossier.description}</p>
        </div>

        {/* Scoring — visible si dossier EN_ATTENTE (pas encore scoré) */}
        {enAttente && !score && (
          <div className="mt-6 border-t pt-4">
            <h2 className="font-semibold mb-3">Scoring</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Ce dossier n'a pas encore été scoré. Lancez le calcul du score de risque.
            </p>
            <button
              onClick={handleScoring}
              disabled={enCours}
              className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50"
            >
              {enCours ? "Calcul en cours..." : "Calculer le score"}
            </button>
          </div>
        )}

        {/* Bloc validation — visible si EN_COURS et pas encore de décision */}
        {peutValider && !decision && (
          <div className="mt-6 border-t pt-4">
            <h2 className="font-semibold mb-3">Validation</h2>

            {notifie ? (
              <p className="text-green-600 font-medium">
                Décision envoyée au CORE Assurance.
              </p>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Motif de la décision (optionnel)"
                  value={motif}
                  onChange={(e) => setMotif(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm mb-3 bg-background"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDecision("ACCEPTE")}
                    disabled={enCours}
                    className="flex-1 bg-green-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {enCours ? "Envoi..." : "Accepter"}
                  </button>
                  <button
                    onClick={() => handleDecision("REFUSE")}
                    disabled={enCours}
                    className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {enCours ? "Envoi..." : "Refuser"}
                  </button>
                  <button
                    onClick={handleSuspendre}
                    disabled={enCours}
                    className="flex-1 bg-gray-500 text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-600 transition disabled:opacity-50"
                  >
                    {enCours ? "Envoi..." : "Suspendre"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Décision existante */}
        {decision && (
          <div className="mt-6 border-t pt-4">
            <h2 className="font-semibold mb-3">Décision</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Résultat</p>
                <p className="font-medium">{decision.resultat}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Motif</p>
                <p className="font-medium">{decision.motif}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Validé par</p>
                <p className="font-medium">{decision.validePar}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date de décision</p>
                <p className="font-medium">
                  {new Date(decision.decideLe).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Engagement de délai */}
        {engagement && (
          <div className="mt-6 border-t pt-4">
            <h2 className="font-semibold mb-3">Engagement de délai</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Délai contractuel</p>
                <p className="font-medium">{engagement.delaiContractuelJours} jours</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date limite</p>
                <p className="font-medium">{engagement.dateLimite}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Statut</p>
                <p className="font-medium">{engagement.statutRespect.replace("_", " ")}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
