# Test de Recrutement - Plateforme de Reassurance

## Stack technique

- **Frontend** : React 19 + React Router 7 (SSR) + TypeScript
- **UI** : TailwindCSS 4 + shadcn/ui (Radix Nova)
- **Build** : Vite 7 + Bun
- **Donnees** : API mockee (fichier JSON local avec simulation de latence)

---

## Partie Commune - Analyse & Conception

### 1. Modelisation du workflow

```
Souscripteur                  Systeme                     Validateur           CORE Assurance
     |                           |                            |                      |
     |--- Depot du dossier ----->|                            |                      |
     |                           |-- [EN_ATTENTE]             |                      |
     |                           |                            |                      |
     |                           |-- Calcul du score -------->|                      |
     |                           |-- [EN_COURS]               |                      |
     |                           |                            |                      |
     |                           |   score >= 60 : ACCEPTE    |                      |
     |                           |   score 40-59 : A_VALIDER -|-> Validation manuelle|
     |                           |   score < 40  : REFUSE     |                      |
     |                           |                            |                      |
     |                           |<-- Decision finale --------|                      |
     |                           |-- [ACCEPTE / REFUSE]       |                      |
     |                           |                            |                      |
     |                           |-- Notification async ------|--------------------->|
     |                           |                            |                      |
     |<-- Retour statut --------|                            |                      |
```

**Etats du dossier** :
| Etat | Description |
|------|-------------|
| `EN_ATTENTE` | Dossier depose, en attente de scoring |
| `EN_COURS` | Scoring effectue, en cours de validation |
| `ACCEPTE` | Dossier accepte (score >= 60 ou validation manuelle) |
| `REFUSE` | Dossier refuse (score < 40 ou decision du validateur) |
| `SUSPENDU` | Dossier mis en attente pour complement d'information |

### 2. Identification des entites

**Dossier**
- `id` : UUID
- `reference` : string (ex: DOS-2025-001)
- `type` : enum (COUVERTURE_FACULTATIVE, PLACEMENT_REAS, COTATION)
- `statut` : enum (EN_ATTENTE, EN_COURS, ACCEPTE, REFUSE, SUSPENDU)
- `dateDePot` : date
- `montant` : number (euros)
- `duree` : number (mois)
- `antecedentSinistre` : boolean
- `description` : string

**Decision**
- `id` : UUID
- `dossierId` : UUID (FK)
- `resultat` : enum (ACCEPTE, REFUSE)
- `motif` : string
- `date` : datetime
- `validePar` : string (email de l'auteur)

**Score**
- `id` : UUID
- `dossierId` : UUID (FK)
- `valeur` : number (0-100)
- `calculeLe` : datetime
- `reglesAppliquees` : string[] (liste des regles ayant impacte le score)

**EngagementDelai**
- `id` : UUID
- `dossierId` : UUID (FK)
- `delaiContractuel` : number (jours)
- `dateLimite` : datetime
- `statutRespect` : enum (DANS_LES_DELAIS, EN_RETARD, DEPASSE)

### 3. Decoupage en services

| Service | Endpoint | Responsabilite |
|---------|----------|----------------|
| Dossier Service | `/api/dossiers` | CRUD des dossiers, gestion du cycle de vie |
| Scoring Service | `/api/dossiers/{id}/score` | Calcul et persistance du score de risque |
| Decision Service | `/api/dossiers/{id}/decision` | Enregistrement des decisions de souscription |
| Notification Service | (bus de messages) | Notification asynchrone vers CORE Assurance |

**Justification de la separation du scoring** : Le scoring est separe de la gestion des dossiers car les regles de calcul du risque evoluent independamment du cycle de vie du dossier. Cela permet de modifier ou enrichir les regles de scoring (ajout de criteres, changement de seuils) sans impacter la logique metier des dossiers.

---

## Partie 2B - Frontend React

### Exercice F1 - Tableau de bord des dossiers

**Fonctionnalites implementees** :
- Composant `DossierList` avec affichage de la reference, type, date de depot, statut (badge colore) et score
- Code couleur du score : vert (>= 60), orange (40-59), rouge (< 40)
- Filtre par statut (EN_ATTENTE, EN_COURS, ACCEPTE, REFUSE)
- Vue detail d'un dossier via page separee (`/dossiers/:id`)
- Gestion du chargement (loader) et des erreurs

**Choix techniques** :
- Donnees mockees dans `src/app/mocks/dossiers.json` avec simulation de latence (500ms) via un hook custom `useDossiers()`
- Routing avec React Router 7 (SSR)
- Composants UI bases sur shadcn/ui + TailwindCSS

### Exercice F2 - Formulaire de demande de couverture

**Fonctionnalites implementees** :
- Formulaire avec validation cote client (type de demande, montant, duree, antecedent sinistre, description)
- Messages d'erreur explicites sous chaque champ
- Calcul local du score estime avant soumission (memes regles que le backend)
- Appel POST simule vers `/api/dossiers` avec message de confirmation

**Regles de scoring (calcul local)** :
- Score de base : 100 points
- Montant > 500 000 EUR : -30 points
- Duree > 12 mois : -20 points
- Antecedent de sinistre : -25 points
- Plancher : 0

---

## Lancer le projet

### Installation

```bash
npm install
```

### Developpement

```bash
npm run dev
```

L'application est disponible sur `http://localhost:5173`.

### Build de production

```bash
npm run build
```

### Docker

```bash
docker build -t reassurance-app .
docker run -p 3000:3000 reassurance-app
```

---

## Structure du projet

```
src/app/
  routes.ts                          # Definition des routes
  root.tsx                           # Layout principal + error boundary
  routes/home.tsx                    # Page d'accueil
  app/(features)/dossier/
    list/page.tsx                    # F1 - Liste des dossiers
    (id)/page.tsx                    # F1 - Detail d'un dossier
  components/ui/button.tsx           # Composant Button (shadcn/ui)
  hooks/useDossiers.ts              # Hook de chargement des dossiers
  types/dossier.ts                  # Types TypeScript (Dossier, Statut, etc.)
  utils/
    scoring.ts                       # Logique de scoring
    statut.ts                        # Utilitaires d'affichage des statuts
  mocks/dossiers.json               # Donnees mockees
  lib/utils.ts                       # Utilitaire cn() pour classNames
```
