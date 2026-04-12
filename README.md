# FreelanceKit — Générateur de devis

![NestJS](https://img.shields.io/badge/NestJS-11-red)
![React](https://img.shields.io/badge/React-19-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748)
![MUI](https://img.shields.io/badge/MUI-7-0081CB)

En tant que freelance, envoyer un devis propre ne devrait pas être une galère. FreelanceKit est une app fullstack pour créer, gérer et partager des devis en quelques clics — avec génération PDF, lien de partage public et suivi des statuts.

---

## Ce que ça fait

- **Compte sécurisé** — inscription / connexion avec JWT, session de 7 jours
- **Clients** — ajout rapide avec recherche SIRET (API gouvernementale), auto-remplissage des infos entreprise
- **Devis** — lignes dynamiques, unités, remises par ligne, numérotation automatique (`DEVIS-YYYY-XXXX`)
- **Drag & drop** — réorganise les lignes à la souris sans friction
- **Suivi** — Brouillon → Envoyé → Accepté / Refusé
- **Dashboard** — CA accepté, devis en attente, vue par client
- **Export PDF** — template A4 propre, généré côté client, aucun serveur tiers
- **Partage public** — un lien unique par devis, le client consulte sans créer de compte
- **Profil freelance** — SIRET, société, téléphone, adresse sur chaque devis

---

## Stack

| Couche | Technologie |
|--------|-------------|
| Backend | NestJS 11 + TypeScript |
| Base de données | MySQL 8 + Prisma 6 |
| Auth | JWT + bcrypt + Passport |
| Frontend | React 19 + Vite + TypeScript |
| UI | Material UI (MUI) v7 |
| Formulaires | React Hook Form + Zod |
| PDF | @react-pdf/renderer v4 |
| Drag & drop | @dnd-kit |
| HTTP | Axios |

---

## Structure du projet

```
freelancekit/
├── backend/                  # API NestJS
│   ├── src/
│   │   ├── auth/             # Register, Login, JWT Guard
│   │   ├── clients/          # CRUD clients
│   │   ├── quotes/           # CRUD devis + lignes + partage
│   │   ├── profile/          # Profil utilisateur
│   │   └── prisma/           # Service Prisma
│   └── prisma/
│       ├── schema.prisma     # Modèles User, Client, Quote, QuoteLine
│       └── migrations/
└── frontend/                 # App React
    └── src/
        ├── pages/
        │   ├── auth/         # Login, Register
        │   ├── dashboard/    # Tableau de bord
        │   ├── clients/      # Gestion clients
        │   ├── quotes/       # Éditeur + Preview publique
        │   └── profile/      # Profil freelance
        ├── components/       # Layout, PDF, DnD, SIRET autocomplete
        ├── contexts/         # AuthContext (JWT)
        ├── lib/              # Axios instance
        └── types/            # Interfaces TypeScript
```

---

## Lancer avec Docker (recommandé)

```bash
cp .env.example .env
docker compose up --build
```

- Frontend → **http://localhost**
- Backend → **http://localhost:3001**
- MySQL → `localhost:3307`

Les migrations Prisma sont appliquées automatiquement au démarrage.

---

## Lancer en local

### Prérequis

- Node.js 20+
- MySQL 8

### Backend

```bash
cd backend
cp .env.example .env
# Remplir DATABASE_URL et JWT_SECRET
npm install
npx prisma migrate dev
npm run start:dev
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
# VITE_API_URL=http://localhost:3001/api
npm install
npm run dev
```

App disponible sur **http://localhost:5173**

---

## Variables d'environnement

### Backend (`backend/.env`)

```env
DATABASE_URL="mysql://user:password@localhost:3306/freelancekit"
JWT_SECRET="votre_secret_jwt"
PORT=3001
```

### Frontend (`frontend/.env.local`)

```env
VITE_API_URL=http://localhost:3001/api
```

---

## API

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| POST | `/api/auth/register` | — | Créer un compte |
| POST | `/api/auth/login` | — | Se connecter |
| GET | `/api/profile` | JWT | Profil utilisateur |
| PATCH | `/api/profile` | JWT | Modifier le profil |
| GET | `/api/clients` | JWT | Liste des clients |
| POST | `/api/clients` | JWT | Créer un client |
| PATCH | `/api/clients/:id` | JWT | Modifier un client |
| DELETE | `/api/clients/:id` | JWT | Supprimer un client |
| GET | `/api/quotes` | JWT | Liste des devis |
| POST | `/api/quotes` | JWT | Créer un devis |
| PATCH | `/api/quotes/:id` | JWT | Modifier un devis |
| DELETE | `/api/quotes/:id` | JWT | Supprimer un devis |
| POST | `/api/quotes/:id/share-token` | JWT | Générer un lien de partage |
| GET | `/api/quotes/public/:shareToken` | — | Voir un devis partagé |

---

## Licence

MIT
