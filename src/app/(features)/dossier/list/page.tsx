import { Link } from "react-router";
import { useDossiers } from "~/hooks/useDossiers";
import { statutColor, scoreColor, typeLabel } from "~/utils/statut";
import type { StatutDossier } from "~/types/dossier";

const STATUTS: StatutDossier[] = ["EN_ATTENTE", "EN_COURS", "ACCEPTE", "REFUSE"];

export default function DashboardPage() {
  const { dossiers, getScore, loading, error } = useDossiers();

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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>

      {/* Compteurs par statut */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {STATUTS.map((statut) => {
          const count = dossiers.filter((d) => d.statut === statut).length;
          return (
            <div key={statut} className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">{statut.replace("_", " ")}</p>
              <p className="text-3xl font-bold mt-1">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Dossiers récents */}
      <h2 className="text-lg font-semibold mb-3">Dossiers récents</h2>
      <div className="space-y-3">
        {dossiers.slice(0, 5).map((dossier) => {
          const score = getScore(dossier.id);
          return (
            <Link
              key={dossier.id}
              to={`/dossiers/${dossier.id}`}
              className="block border rounded-lg p-4 hover:bg-muted/50 transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{dossier.reference}</p>
                  <p className="text-sm text-muted-foreground">
                    {typeLabel(dossier.typeDemande)} — {dossier.dateDepot}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {score && (
                    <span className={`text-lg font-bold ${scoreColor(score.valeur)}`}>
                      {score.valeur}
                    </span>
                  )}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${statutColor(dossier.statut)}`}
                  >
                    {dossier.statut.replace("_", " ")}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
