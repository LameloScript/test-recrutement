import { useState, useMemo } from "react";
import { Link } from "react-router";
import { useDossiers } from "~/hooks/useDossiers";
import { statutColor, scoreColor, typeLabel } from "~/utils/statut";
import type { StatutDossier } from "~/types/dossier";

const STATUTS: StatutDossier[] = ["EN_ATTENTE", "EN_COURS", "ACCEPTE", "REFUSE"];

type TriOption = "date_desc" | "date_asc" | "score_desc" | "score_asc";

export default function DossierListePage() {
  const { dossiers, getScore, loading, error } = useDossiers();
  const [filtreStatut, setFiltreStatut] = useState<StatutDossier | "TOUS">("TOUS");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [scoreMin, setScoreMin] = useState("");
  const [recherche, setRecherche] = useState("");
  const [tri, setTri] = useState<TriOption>("date_desc");

  const dossiersFiltres = useMemo(() => {
    const filtered = dossiers.filter((d) => {
      if (filtreStatut !== "TOUS" && d.statut !== filtreStatut) return false;
      if (dateDebut && d.dateDepot < dateDebut) return false;
      if (dateFin && d.dateDepot > dateFin) return false;
      if (scoreMin) {
        const s = getScore(d.id)?.valeur ?? 0;
        if (s < Number(scoreMin)) return false;
      }
      if (recherche) {
        const q = recherche.toLowerCase();
        if (!d.reference.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      switch (tri) {
        case "date_asc":
          return a.dateDepot.localeCompare(b.dateDepot);
        case "date_desc":
          return b.dateDepot.localeCompare(a.dateDepot);
        case "score_desc":
          return (getScore(b.id)?.valeur ?? 0) - (getScore(a.id)?.valeur ?? 0);
        case "score_asc":
          return (getScore(a.id)?.valeur ?? 0) - (getScore(b.id)?.valeur ?? 0);
      }
    });
  }, [dossiers, filtreStatut, dateDebut, dateFin, scoreMin, recherche, tri, getScore]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground text-lg">Chargement des dossiers...</p>
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
      <h1 className="text-2xl font-bold mb-6">Liste des Dossiers</h1>

      {/* Filtre par statut */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFiltreStatut("TOUS")}
          className={`px-3 py-1 rounded-full text-sm font-medium border transition ${
            filtreStatut === "TOUS"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          Tous
        </button>
        {STATUTS.map((statut) => (
          <button
            key={statut}
            onClick={() => setFiltreStatut(statut)}
            className={`px-3 py-1 rounded-full text-sm font-medium border transition ${
              filtreStatut === statut
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            {statut.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Recherche par référence */}
      <div className="mb-4">
        <input
          type="text"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher par référence (ex: DOS-2025-001)"
          className="w-full border rounded-lg px-3 py-2 text-sm bg-background"
        />
      </div>

      {/* Filtres avancés */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="text-sm text-muted-foreground">Du</span>
        <input
          type="date"
          value={dateDebut}
          onChange={(e) => setDateDebut(e.target.value)}
          className="border rounded-lg px-3 py-1 text-sm bg-background"
        />
        <span className="text-sm text-muted-foreground">au</span>
        <input
          type="date"
          value={dateFin}
          onChange={(e) => setDateFin(e.target.value)}
          className="border rounded-lg px-3 py-1 text-sm bg-background"
        />
        <span className="text-sm text-muted-foreground ml-2">Score min</span>
        <input
          type="number"
          min="0"
          max="100"
          value={scoreMin}
          onChange={(e) => setScoreMin(e.target.value)}
          placeholder="0"
          className="border rounded-lg px-3 py-1 text-sm bg-background w-20"
        />
        <span className="text-sm text-muted-foreground ml-2">Trier par</span>
        <select
          value={tri}
          onChange={(e) => setTri(e.target.value as TriOption)}
          className="border rounded-lg px-3 py-1 text-sm bg-background"
        >
          <option value="date_desc">Date (récent)</option>
          <option value="date_asc">Date (ancien)</option>
          <option value="score_desc">Score (haut)</option>
          <option value="score_asc">Score (bas)</option>
        </select>
        {(dateDebut || dateFin || scoreMin || recherche) && (
          <button
            onClick={() => { setDateDebut(""); setDateFin(""); setScoreMin(""); setRecherche(""); }}
            className="text-sm text-muted-foreground underline hover:text-foreground"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Liste */}
      <div className="space-y-3">
        {dossiersFiltres.map((dossier) => {
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

        {dossiersFiltres.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            Aucun dossier trouvé pour ce filtre.
          </p>
        )}
      </div>
    </div>
  );
}
