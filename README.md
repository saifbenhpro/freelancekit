# 💸 FreelanceKit — Générateur de devis

![Version](https://img.shields.io/badge/version-0.9.0-blue)
![NestJS](https://img.shields.io/badge/NestJS-11-red)
![React](https://img.shields.io/badge/React-18-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748)
![MUI](https://img.shields.io/badge/MUI-7-0081CB)

Application web fullstack permettant aux freelances de créer, gérer et partager des devis professionnels.

---

## ✨ Fonctionnalités

- **Authentification** — Register / Login avec JWT (7 jours)
- **Gestion clients** — CRUD complet, recherche par SIRET via API gouvernementale, auto-remplissage des informations entreprise
- **Devis** — Création avec lignes dynamiques, unités, remises par ligne, numérotation automatique (`DEVIS-YYYY-XXXX`)
- **Drag & drop** — Réorganisation des lignes de devis à la souris
- **Suivi statuts** — Brouillon → Envoyé → Accepté / Refusé
- **Dashboard** — Suivi par client avec accordéons, CA accepté, devis en attente
- **Export PDF** — Génération client-side avec `@react-pdf/renderer`, template A4 propre
- **Partage public** — Lien unique par devis (`/preview/:shareToken`), accessible sans compte
- **Profil freelance** — SIRET, société, téléphone, adresse

---

## 🛠 Stack technique

| Couche | Technologie |
|--------|-------------|
| Backend | NestJS 11 + TypeScript |
| Base de données | MySQL 8 + Prisma 6 |
| Auth | JWT + bcrypt + Passport |
| Frontend | React 18 + Vite + TypeScript |
| UI | Material UI (MUI) v7 |
| Formulaires | React Hook Form + Zod |
| PDF | @react-pdf/renderer v4 |
| Drag & drop | @dnd-kit |
| HTTP | Axios |

---

## 📁 Structure

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

## 🐳 Lancer avec Docker (recommandé)

```bash
cp .env.example .env
docker compose up --build
```

- Frontend → **http://localhost**
- Backend → **http://localhost:3001**
- MySQL → `localhost:3307`

La migration Prisma est appliquée automatiquement au démarrage du backend.

---

## 🚀 Lancer en local (sans Docker)

### Prérequis

- Node.js 20+
- MySQL 8

### Backend

```bash
cd backend
cp .env.example .env
# Remplir DATABASE_URL et JWT_SECRET dans .env
npm install
npx prisma migrate dev
npm run start:dev
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
# Remplir VITE_API_URL=http://localhost:3001/api
npm install
npm run dev
```

L'app est accessible sur **http://localhost:5173**

---

## 🌍 Variables d'environnement

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

## 📦 API endpoints

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

## 🗂 Versioning

| Tag | Contenu |
|-----|---------|
| `v0.1.0` | Auth backend (register/login/JWT) |
| `v0.2.0` | Clients & Quotes CRUD backend |
| `v0.3.0` | Frontend setup + Auth + Dashboard + Clients |
| `v0.4.0` | Éditeur de devis |
| `v0.5.0` | Partage public + preview |
| `v0.6.0` | Génération PDF |
| `v0.7.0` | Profil + SIRET autocomplete + dashboard client |
| `v0.8.0` | UI Polish |
| `v0.9.0` | Éditeur enrichi (DnD, unités, remises) |

---

## 📄 Licence

MIT
