import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useDossiers } from "~/hooks/useDossiers";
import type { TypeDemande } from "~/types/dossier";

const TYPES_DEMANDE: TypeDemande[] = [
  "COUVERTURE_FACULTATIVE",
  "PLACEMENT_REAS",
  "COTATION",
];

interface FormData {
  type: TypeDemande | "";
  montant: string;
  duree: string;
  antecedentSinistre: boolean;
  description: string;
}

interface FormErrors {
  type?: string;
  montant?: string;
  duree?: string;
  description?: string;
}

function validerFormulaire(data: FormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.type) {
    errors.type = "Le type de demande est obligatoire";
  }

  const montant = Number(data.montant);
  if (!data.montant || isNaN(montant) || montant <= 0) {
    errors.montant = "Le montant doit être un nombre positif";
  }

  const duree = Number(data.duree);
  if (!data.duree || isNaN(duree) || !Number.isInteger(duree) || duree < 1 || duree > 60) {
    errors.duree = "La durée doit être un entier entre 1 et 60";
  }

  if (data.description.length > 500) {
    errors.description = "La description ne doit pas dépasser 500 caractères";
  }

  return errors;
}

export default function NouveauDossierPage() {
  const { ajouterDossier } = useDossiers();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>({
    type: "",
    montant: "",
    duree: "",
    antecedentSinistre: false,
    description: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [soumis, setSoumis] = useState(false);
  const [enCours, setEnCours] = useState(false);

  const montant = Number(form.montant) || 0;
  const duree = Number(form.duree) || 0;

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Effacer l'erreur du champ modifié
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationErrors = validerFormulaire(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setEnCours(true);

    // Simulation d'appel POST /api/dossiers
    await new Promise((resolve) => setTimeout(resolve, 800));

    const dossierId = `d${Date.now()}`;
    const now = new Date().toISOString();

    ajouterDossier({
      id: dossierId,
      reference: `DOS-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      statut: "EN_ATTENTE",
      typeDemande: form.type as TypeDemande,
      dateDepot: now.split("T")[0],
      montantDemande: montant,
      dureeMois: duree,
      antecedantSinistre: form.antecedentSinistre,
      description: form.description,
    });

    setEnCours(false);
    setSoumis(true);
  }

  if (soumis) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="border rounded-lg p-8">
          <h2 className="text-xl font-bold text-green-600 mb-2">Demande soumise avec succès</h2>
          <p className="text-muted-foreground mb-4">
            Votre dossier a été créé et est en attente de scoring.
          </p>
          <Link to="/dossiers" className="text-primary underline">
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Link to="/dossiers" className="text-primary underline mb-4 inline-block">
        ← Retour à la liste
      </Link>

      <h1 className="text-2xl font-bold mb-6">Nouvelle demande de couverture</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Type de demande */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium mb-1">
            Type de demande *
          </label>
          <select
            id="type"
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 bg-background"
          >
            <option value="">— Sélectionner —</option>
            {TYPES_DEMANDE.map((t) => (
              <option key={t} value={t}>
                {t.replace(/_/g, " ")}
              </option>
            ))}
          </select>
          {errors.type && <p className="text-red-600 text-sm mt-1">{errors.type}</p>}
        </div>

        {/* Montant */}
        <div>
          <label htmlFor="montant" className="block text-sm font-medium mb-1">
            Montant demandé (€) *
          </label>
          <input
            id="montant"
            name="montant"
            type="number"
            min="0"
            step="1000"
            value={form.montant}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 bg-background"
            placeholder="Ex : 300000"
          />
          {errors.montant && <p className="text-red-600 text-sm mt-1">{errors.montant}</p>}
        </div>

        {/* Durée */}
        <div>
          <label htmlFor="duree" className="block text-sm font-medium mb-1">
            Durée (mois) *
          </label>
          <input
            id="duree"
            name="duree"
            type="number"
            min="1"
            max="60"
            value={form.duree}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 bg-background"
            placeholder="Ex : 12"
          />
          {errors.duree && <p className="text-red-600 text-sm mt-1">{errors.duree}</p>}
        </div>

        {/* Antécédent de sinistre */}
        <div className="flex items-center gap-2">
          <input
            id="antecedentSinistre"
            name="antecedentSinistre"
            type="checkbox"
            checked={form.antecedentSinistre}
            onChange={handleChange}
            className="h-4 w-4"
          />
          <label htmlFor="antecedentSinistre" className="text-sm font-medium">
            Antécédent de sinistre
          </label>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            maxLength={500}
            rows={3}
            className="w-full border rounded-lg px-3 py-2 bg-background resize-none"
            placeholder="Décrivez votre demande (max 500 caractères)"
          />
          <p className="text-xs text-muted-foreground text-right">
            {form.description.length} / 500
          </p>
          {errors.description && (
            <p className="text-red-600 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        {/* Bouton soumettre */}
        <button
          type="submit"
          disabled={enCours}
          className="w-full bg-primary text-primary-foreground rounded-lg py-2 font-medium hover:bg-primary/90 transition disabled:opacity-50"
        >
          {enCours ? "Envoi en cours..." : "Soumettre la demande"}
        </button>
      </form>
    </div>
  );
}
