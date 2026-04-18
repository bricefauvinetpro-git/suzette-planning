@AGENTS.md

# Suzette Planning — Documentation projet

## Stack technique

- **Next.js 16.2.4** App Router (pas de `src/`), **React 19**, **TypeScript 5**, **Tailwind CSS v4**
- **Supabase** (base de données PostgreSQL + Storage pour les documents)
- Tailwind v4 : `@import "tailwindcss"` dans `globals.css`, pas de `tailwind.config.js`

## Structure des fichiers

```
app/
  layout.tsx                  # Root layout : EstablishmentProvider + AppHeader
  page.tsx                    # Redirect → /planning
  planning/page.tsx           # Wrapper server → <WeeklyPlanningGrid />
  team/
    page.tsx                  # Liste des employés, filtrée par établissement
    [id]/
      page.tsx                # Wrapper async server → <EmployeeProfile id={id} />
      EmployeeProfile.tsx     # Fiche employé (tabs : info, contrat, temps, docs)
  configuration/
    page.tsx                  # Redirect → /configuration/etablissements
    layout.tsx                # Layout avec <ConfigSidebar />
    etablissements/page.tsx   # CRUD établissements

components/
  AppHeader.tsx               # Header client avec sélecteur d'établissement
  configuration/
    ConfigSidebar.tsx         # Sidebar de navigation configuration
  planning/
    WeeklyPlanningGrid.tsx    # Grille planning hebdomadaire (client)
    ShiftModal.tsx            # Modal création/édition de shift
    ShiftCard.tsx             # Carte affichage d'un shift
    EmployeeAvatar.tsx        # Avatar employé (initiales ou image)

lib/
  supabase.ts                 # Singleton lazy : getSupabase()
  establishment-context.tsx   # Context React + useEstablishment() hook
  week-utils.ts               # Utilitaires date/heure pour le planning
  utils.ts                    # Utilitaires partagés : initials()

types/
  index.ts                    # Tous les types TypeScript du domaine
```

## Tables Supabase et colonnes exactes

### `establishments`
| Colonne      | Type    |
|-------------|---------|
| id          | UUID PK |
| name        | TEXT    |
| address     | TEXT    |
| created_at  | TIMESTAMPTZ |

### `team_members`
| Colonne           | Type    |
|------------------|---------|
| id               | UUID PK |
| full_name        | TEXT    |
| role             | TEXT    |
| contract_type    | TEXT    |
| contract_hours   | INTEGER |
| color            | TEXT    |
| active           | BOOLEAN |
| avatar_url       | TEXT    |
| email            | TEXT    |
| phone            | TEXT    |
| birth_date       | DATE    |
| start_date       | DATE    |
| hourly_rate      | NUMERIC |
| availability     | JSONB   |
| establishment_id | UUID FK → establishments.id |
| created_at       | TIMESTAMPTZ |

### `shifts`
| Colonne       | Type    |
|--------------|---------|
| id           | UUID PK |
| employee_id  | UUID FK → team_members.id |
| date         | DATE    |
| start_time   | TIME    |
| end_time     | TIME    |
| label        | TEXT    |
| break_minutes| INTEGER |
| color        | TEXT    |
| notes        | TEXT    |
| created_at   | TIMESTAMPTZ |

### `employee_documents`
| Colonne      | Type    |
|-------------|---------|
| id          | UUID PK |
| employee_id | UUID FK → team_members.id |
| file_name   | TEXT    |
| file_type   | TEXT    |
| storage_path| TEXT    |
| created_at  | TIMESTAMPTZ |

## Décisions techniques importantes

### Client Supabase
Singleton lazy pour éviter l'erreur "supabaseUrl is required" au build SSR :
```typescript
// lib/supabase.ts
export function getSupabase(): SupabaseClient<any> { ... }
```
`SupabaseClient<any>` évite les conflits de types génériques avec INSERT/UPDATE.

### Context établissement
`EstablishmentProvider` wrappé dans le root layout. Persist la sélection dans
`localStorage` (clé : `suzette_establishment_id`). Hook : `useEstablishment()`.
Toutes les pages (planning, équipe) filtrent par `establishment_id`.

### Routes dynamiques Next.js 16
Les params sont `Promise` — obligatoire d'`await` :
```typescript
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}
```

### Pattern page server + composant client
Les pages dynamiques sont des thin wrappers server qui passent l'id à un
composant client `"use client"` (ex. `EmployeeProfile.tsx`).

### Gestion des erreurs
- `console.error` sur toutes les erreurs Supabase (jamais `console.log`)
- Erreurs de chargement affichées en bandeau rouge dans l'UI
- Erreurs de sauvegarde affichées inline dans les formulaires

### Stockage documents
Bucket Supabase Storage : `documents`. Chemin : `{employee_id}/{timestamp}_{filename}`.
Rollback Storage si l'INSERT en base échoue.

### RLS Supabase
Toutes les tables ont RLS activé. Les policies actuelles autorisent toutes les
opérations (USING (true)) — convient pour le développement.
