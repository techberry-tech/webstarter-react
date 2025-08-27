# Copilot Instructions for webstarter-react

This guide helps AI coding agents work productively in the `webstarter-react` codebase. It summarizes architecture, workflows, and conventions unique to this project.

## Architecture Overview

- **Frontend**: React 19 + TypeScript, built with Vite 7
- **Routing**: TanStack Router with file-based routing (`src/routes/`)
- **State Management**: Zustand (see `src/core/auth/store.ts`)
- **API Layer**: Axios client (`src/api/client.ts`), React Query for data fetching
- **UI**: Mantine UI, Tailwind CSS, Tabler Icons
- **Authentication**: JWT via HTTP-only cookies, managed in `src/api/auth/` and `src/core/auth/`
- **Mock Server**: Hono.js (`mockup-server/`), config in `mockup-server/config.json`

## Coding Patterns by Module

### API Layer (`src/api/`)

- Each feature has its own hook (e.g., `useSearchFlight`, `useGetCityList`) using React Query for data fetching/mutation.
- All requests use `makeRequest` from `client.ts` for error handling, JWT validation, and redirects on 401.
- API responses use discriminated unions (`APIResponse<T>`).
- Example: See `flight-booking/search-flight.ts` for mutation pattern, and `auth/use-auth-login.ts` for login mutation.

### Auth (`src/core/auth/`)

- Auth state managed by Zustand (`store.ts`), with `user` and `isAuthenticated()` helpers.
- Protected routes use `ProtectedRoutes` to wrap layouts, redirecting on auth failure.
- Hooks: `useAuthStatus` checks login status and updates Zustand; `useAuthLogin` and `useAuthLogout` handle login/logout mutations.

### Routing (`src/routes/`)

- File-based: Each route is a file exporting a `Route` via `createFileRoute`.
- Protected routes are nested under `_pathlessLayout`, which wraps with `MainLayout`.
- Root route and not-found handling in `__root.tsx`.
- Use TanStack Router hooks (`useNavigate`, `Navigate`).

### UI Components (`src/components/`)

- All UI uses Mantine components, styled with Tailwind via `className`.
- Forms use `react-hook-form` and Mantine form components (see `search-flight/form.tsx`).
- Data tables use Mantine's `Table` (see `search-flight/table.tsx`).
- Custom 404 page in `404/404.tsx`.

### Menu System (`src/config/menu.ts`)

- Two-level menu (`MyMenu`, `MyMenuItem`), icons from Tabler.
- Selected menu managed by Zustand (`main-layout-store.ts`).
- MainLayout renders menu items, highlights active route.

### Theming (`src/core/theme/theme.ts`)

- Mantine theme config via `createTheme`, passed to `MantineProvider` in `App.tsx`.

### Utilities (`src/lib/utils.ts`)

- Use `cn()` for merging Tailwind and Mantine classes.

### Types (`src/types/`)

- Types grouped by feature (e.g., `flight-booking/index.ts`).

### Mock Server (`mockup-server/`)

- Endpoints and users in `config.json`.
- Start with `npm run dev:mockup-server`.

## Example Workflow

- Add a Feature: Create API hook in `src/api/feature/`, types in `src/types/feature/`, route in `src/routes/`, UI in `src/components/feature/`.
- Add a Page: Create route file, add to menu, wrap in layout if protected.
- Handle Auth: Use hooks and Zustand store, redirect on failure.

## Developer Workflows

- **Start both frontend and mock server**: `npm run dev`
- **Start only frontend**: `npm run dev:vite-react`
- **Start only mock server**: `npm run dev:mockup-server`
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Preview production build**: `npm run preview`

## Integration Points

- **API Proxy**: Vite proxy in `vite.config.ts` routes `/api` and `/ic` to mock server
- **Authentication**: JWT managed via HTTP-only cookies, validated on each API call
- **Route Tree**: Auto-generated in `src/routeTree.gen.ts` when dev server runs

## Examples

- **Add a Page**: Create `src/routes/_pathlessLayout/app/page.tsx` and export a route with `createFileRoute`. Add to menu in `src/config/menu.ts`.
- **API Hook**: See `src/api/flight-booking/search-flight.ts` for a typical pattern.
- **Protected Route**: Wrap with `ProtectedRoutes` for authentication enforcement.

## Notes

- Always use TypeScript for new files
- Follow the directory structure for new features
- Update `README.md` and this file for new conventions

---

If any section is unclear or missing, please provide feedback to improve these instructions.
