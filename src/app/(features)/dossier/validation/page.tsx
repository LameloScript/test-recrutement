import { Link } from "react-router";
import { useDossiers } from "~/hooks/useDossiers";
import { statutColor, scoreColor, typeLabel } from "~/utils/statut";

export default function ValidationPage() {
  const { dossiers, getScore, loading, error } = useDossiers();

  const dossiersAValider = dossiers.filter(
    (d) => d.statut === "EN_ATTENTE" || d.statut === "EN_COURS" || d.statut === "SUSPENDU"
  );

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
      <h1 className="text-2xl font-bold mb-2">Validation</h1>
      <p className="text-muted-foreground mb-6">
        Dossiers en attente de validation ({dossiersAValider.length})
      </p>

      <div className="space-y-3">
        {dossiersAValider.map((dossier) => {
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

        {dossiersAValider.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            Aucun dossier en attente de validation.
          </p>
        )}
      </div>
    </div>
  );
}
