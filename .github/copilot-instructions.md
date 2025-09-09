# Copilot Instructions for webstarter-react

This comprehensive guide helps AI coding agents work productively in the `webstarter-react` codebase. It provides detailed architecture patterns, code examples, and conventions.

## Project Structure & Technology Stack

### Core Technologies

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7 with HMR and TypeScript support
- **Routing**: TanStack Router v1 with file-based routing
- **State Management**: Zustand for global state
- **Data Fetching**: React Query (TanStack Query) with Axios
- **UI Framework**: Mantine UI v7 + Tailwind CSS v3
- **Icons**: Tabler Icons React
- **Forms**: React Hook Form with Mantine integration
- **Authentication**: JWT tokens via HTTP-only cookies
- **Mock API**: Hono.js server with JSON configuration

### Directory Structure

This project follows a **multi-application architecture** where each application (like `flight-booking`, `accounting`) contains its own features and components.

```
src/
├── api/                 # API hooks organized by application
│   ├── client.ts       # Shared API client
│   ├── auth/           # Authentication APIs
│   ├── flight-booking/ # Flight booking app APIs
│   └── accounting/     # Accounting app APIs
├── components/          # UI components organized by application
│   ├── layout/         # Shared layout components
│   ├── flight-booking/ # Flight booking app components
│   └── accounting/     # Accounting app components
├── config/             # App configuration (menu, constants)
├── core/               # Core functionality (auth, theme, router)
├── lib/                # Utility functions
├── routes/             # File-based routing organized by application
│   ├── __root.tsx      # Root layout
│   ├── index.tsx       # Home page
│   ├── _pathlessLayout.tsx # Protected route wrapper
│   └── _pathlessLayout/    # Protected routes by application
│       ├── flight-booking/ # Flight booking app routes
│       └── accounting/     # Accounting app routes
├── types/              # TypeScript types organized by application
│   ├── flight-booking/ # Flight booking app types
│   └── accounting/     # Accounting app types
└── App.tsx             # Root component

mockup-server/          # Hono.js mock API server
├── config.json         # API endpoints and user data
└── index.ts            # Server implementation
```

### Multi-Application Architecture

The project is structured around **applications** rather than individual features:

- **Applications**: Major functional areas (e.g., `flight-booking`, `accounting`)
- **Features**: Specific functionality within an application (e.g., search flights, manage users)
- **Menu Structure**: Defined in `src/config/menu.ts` showing application hierarchy

**Important**: When AI agents work with this codebase, they should think in terms of:

1. **Application Name** - The top-level domain (flight-booking, accounting)
2. **Feature Name** - The specific functionality within that application (search-flight, users)

This means file paths follow the pattern: `[applicationName]/[featureName]` not just `[featureName]`.

## Detailed Coding Patterns

### 1. API Layer (`src/api/`)

#### File Structure Pattern

```
src/api/
├── client.ts                    # Axios instance and request wrapper
├── auth/                       # Authentication-related API calls
│   ├── use-auth-login.ts
│   ├── use-auth-logout.ts
│   └── use-auth-status.ts
└── [applicationName]/          # Application-specific API calls
    ├── use-get-[resource].ts   # GET requests
    ├── use-create-[resource].ts # POST requests
    ├── use-update-[resource].ts # PUT/PATCH requests
    └── use-delete-[resource].ts # DELETE requests

# Examples:
# src/api/flight-booking/use-search-flight.ts
# src/api/accounting/use-get-users.ts
```

#### API Hook Pattern (Query)

```typescript
// src/api/[applicationName]/use-get-[resource].ts
import { useQuery } from '@tanstack/react-query'
import { makeRequest } from '../client'
import type { APIResponse } from '@/types/api'
import type { [ResourceType] } from '@/types/[applicationName]'

export const useGet[Resource] = (params?: [ParamType]) => {
  return useQuery({
    queryKey: ['[applicationName]', '[resource]', params],
    queryFn: () => makeRequest<[ResourceType][]>({
      method: 'GET',
      url: '/api/[applicationName]/[endpoint]',
      params
    }),
    enabled: !!params, // Add conditions as needed
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Example: src/api/flight-booking/use-search-flight.ts
// Example: src/api/accounting/use-get-users.ts
```

#### API Hook Pattern (Mutation)

```typescript
// src/api/[applicationName]/use-create-[resource].ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { makeRequest } from '../client'
import type { APIResponse } from '@/types/api'
import type { [ResourceType], [CreateResourceType] } from '@/types/[applicationName]'

export const useCreate[Resource] = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: [CreateResourceType]) => makeRequest<[ResourceType]>({
      method: 'POST',
      url: '/api/[applicationName]/[endpoint]',
      data
    }),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['[applicationName]', '[resource]'] })
    },
    onError: (error) => {
      console.error('Create [resource] error:', error)
    }
  })
}

// Example: src/api/flight-booking/use-search-flight.ts (mutation)
// Example: src/api/accounting/use-create-user.ts
```

#### API Client Configuration

```typescript
// Always use makeRequest wrapper for:
// - Automatic JWT token handling
// - Error response standardization
// - 401 redirect handling
// - Request/response logging in development
```

### 2. Authentication System (`src/core/auth/`)

#### Auth Store Pattern (Zustand)

```typescript
// src/core/auth/store.ts
interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
  isAuthenticated: () => !!get().user,
}));
```

#### Auth Status Hook Pattern

```typescript
// src/core/auth/use-auth-status.ts
export const useAuthStatus = () => {
  const { setUser, clearUser } = useAuthStore();

  return useQuery({
    queryKey: ["auth-status"],
    queryFn: () =>
      makeRequest<User>({
        method: "GET",
        url: "/api/auth/me",
      }),
    onSuccess: (response) => {
      if (response.success) {
        setUser(response.data);
      }
    },
    onError: () => {
      clearUser();
    },
    retry: false,
    staleTime: Infinity, // Only refetch manually
  });
};
```

#### Protected Route Pattern

```typescript
// Wrap layouts that need authentication
<ProtectedRoutes>
  <MainLayout />
</ProtectedRoutes>
```

### 3. Routing System (`src/routes/`)

#### File-Based Routing Structure

```
src/routes/
├── __root.tsx                    # Root layout
├── index.tsx                     # Home page (/)
├── login.tsx                     # Public login page (if exists)
├── _pathlessLayout.tsx           # Protected route wrapper
└── _pathlessLayout/             # Protected routes organized by application
    ├── landing.tsx              # Landing/dashboard page
    ├── flight-booking/          # Flight booking application routes
    │   └── search-flight.tsx    # /flight-booking/search-flight
    └── accounting/              # Accounting application routes
        └── users.tsx            # /accounting/users

# Route Pattern: /[applicationName]/[featureName]
# Examples:
# /flight-booking/search-flight
# /accounting/users

# Page Creation: Use {pageName}.tsx directly as the main route file
# Example: search-flight.tsx (not search-flight/index.tsx)
```

#### Route File Pattern

```typescript
// src/routes/_pathlessLayout/[applicationName]/[featureName].tsx
import { createFileRoute } from '@tanstack/router-router'
import { [FeatureComponent] } from '../../../components/[applicationName]/[featureName]/[feature-main]'

export const Route = createFileRoute('/_pathlessLayout/[applicationName]/[featureName]')({
  component: [FeatureComponent],
  // Optional: Add search params validation
  validateSearch: (search) => ({
    page: Number(search.page) || 1,
    limit: Number(search.limit) || 10,
  }),
  // Optional: Add loader for data fetching
  loader: ({ context }) => {
    // Pre-fetch data if needed
  },
})

// Examples:
// src/routes/_pathlessLayout/flight-booking/search-flight.tsx -> /flight-booking/search-flight
// src/routes/_pathlessLayout/accounting/users.tsx -> /accounting/users
```

#### Dynamic Route Pattern

```typescript
// src/routes/_pathlessLayout/[applicationName]/[featureName]/$id.tsx
export const Route = createFileRoute("/_pathlessLayout/[applicationName]/[featureName]/$id")({
  component: [FeatureDetailComponent],
  // Access params with useParams()
});

// Examples:
// src/routes/_pathlessLayout/flight-booking/bookings/$id.tsx -> /flight-booking/bookings/123
// src/routes/_pathlessLayout/accounting/users/$id.tsx -> /accounting/users/456
```

### 4. UI Components (`src/components/`)

#### Component Structure Pattern

```
src/components/[applicationName]/
├── [featureName]/              # Feature-specific components
│   ├── [feature-main].tsx      # Main component
│   ├── form.tsx                # Forms
│   ├── table.tsx               # Data tables
│   ├── card.tsx                # Card components
│   └── types.ts                # Local types

# Examples:
# src/components/flight-booking/search-flight/
# src/components/accounting/users/

# Note: Do NOT create index.ts files for global exports
# Import components directly from their individual files
```

#### Form Component Pattern

````typescript
// src/components/[applicationName]/[featureName]/form.tsx
import { useForm } from 'react-hook-form'
import { Button, TextInput, Group, Stack } from '@mantine/core'
import { cn } from '../../../lib/utils'

interface [Feature]FormProps {
  onSubmit: (data: [FormDataType]) => void
  loading?: boolean
  initialValues?: Partial<[FormDataType]>
  className?: string
}

export const [Feature]Form = ({
  onSubmit,
  loading,
  initialValues,
  className
}: [Feature]FormProps) => {
  const form = useForm<[FormDataType]>({
    defaultValues: initialValues
  })

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={cn("space-y-4", className)}
    >
      <Stack gap="md">
        <TextInput
          label="Field Label"
          placeholder="Enter value"
          {...form.register('fieldName', {
            required: 'Field is required'
          })}
          error={form.formState.errors.fieldName?.message}
        />

        <Group justify="flex-end">
          <Button type="submit" loading={loading}>
            Submit
          </Button>
        </Group>
      </Stack>
    </form>
  )
}
```#### Table Component Pattern

```typescript
// src/components/[applicationName]/[featureName]/table.tsx
import { Table, Checkbox, ActionIcon, Group } from '@mantine/core'
import { IconEdit, IconTrash, IconEye } from '@tabler/icons-react'

interface [Feature]TableProps {
  data: [DataType][]
  onView?: (item: [DataType]) => void
  onEdit?: (item: [DataType]) => void
  onDelete?: (item: [DataType]) => void
  loading?: boolean
  className?: string
}

export const [Feature]Table = ({
  data,
  onView,
  onEdit,
  onDelete,
  loading,
  className
}: [Feature]TableProps) => {
  return (
    <Table className={cn("w-full", className)}>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>
            <Checkbox />
          </Table.Th>
          <Table.Th>Column Name</Table.Th>
          <Table.Th>Actions</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {data.map((item) => (
          <Table.Tr key={item.id}>
            <Table.Td>
              <Checkbox />
            </Table.Td>
            <Table.Td>{item.name}</Table.Td>
            <Table.Td>
              <Group gap="xs">
                {onView && (
                  <ActionIcon
                    variant="subtle"
                    onClick={() => onView(item)}
                  >
                    <IconEye size={16} />
                  </ActionIcon>
                )}
                {onEdit && (
                  <ActionIcon
                    variant="subtle"
                    onClick={() => onEdit(item)}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                )}
                {onDelete && (
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => onDelete(item)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                )}
              </Group>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  )
}
````

### 5. State Management Patterns

#### Feature Store Pattern (Zustand)

```typescript
// src/components/[applicationName]/[featureName]/store.ts
interface [Feature]State {
  // State properties
  selectedItems: string[]
  filters: [FilterType]

  // Actions
  setSelectedItems: (items: string[]) => void
  updateFilters: (filters: Partial<[FilterType]>) => void
  clearFilters: () => void
}

export const use[Feature]Store = create<[Feature]State>((set) => ({
  selectedItems: [],
  filters: {},

  setSelectedItems: (selectedItems) => set({ selectedItems }),
  updateFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),
  clearFilters: () => set({ filters: {} }),
}))
```

### 6. Type Definition Patterns

#### API Response Types

```typescript
// src/types/api.ts
export interface APIResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

#### Feature Types

```typescript
// src/types/[applicationName]/index.ts
export interface [Resource] {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface Create[Resource] {
  name: string
}

export interface Update[Resource] {
  id: string
  name?: string
}

export interface [Resource]Filters {
  search?: string
  status?: string
  dateFrom?: string
  dateTo?: string
}
```

### 7. Menu Configuration

#### Menu Definition Pattern

```typescript
// src/config/menu.ts
export interface MyMenu {
  title: string;
  items: MyMenuItem[];
}

export interface MyMenuItem {
  icon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<Icon>>;
  label: string;
  href: AnyRoutePath;
}

export const MENUS: MyMenu[] = [
  {
    title: "Flight Booking",
    items: [
      {
        icon: IconPlane,
        label: "Search Flights",
        href: "/flight-booking/search-flight",
      },
    ],
  },
  {
    title: "Accounting",
    items: [
      {
        icon: IconUsersGroup,
        label: "Users",
        href: "/accounting/users",
      },
    ],
  },
];

// Pattern: Each menu represents an application
// Each item within a menu represents a feature within that application
// URLs follow: /[applicationName]/[featureName]
```

## Development Workflows & Commands

### Available Scripts

```bash
# Development (both frontend + mock server)
npm run dev

# Frontend only
npm run dev:vite-react

# Mock server only
npm run dev:mockup-server

# Production build
npm run build

# Preview production build
npm run preview

# Linting
npm run lint
npm run lint:fix

# Type checking
npm run type-check
```

### Mock Server Configuration

**IMPORTANT**: The mockup server is READ-ONLY. Do not modify `mockup-server/config.json` or any files in the `mockup-server/` directory.

```json
// mockup-server/config.json (READ-ONLY)
{
  "users": [
    {
      "id": "1",
      "email": "admin@example.com",
      "password": "password123",
      "name": "Admin User",
      "role": "admin"
    }
  ],
  "endpoints": {
    "/api/[applicationName]/[feature]": {
      "GET": { "success": true, "data": [] },
      "POST": { "success": true, "data": {} }
    }
  }
}
```

## Integration Points

- **API Proxy**: Vite proxy in `vite.config.ts` routes `/api` and `/ic` to mock server
- **Authentication**: JWT managed via HTTP-only cookies, validated on each API call
- **Route Tree**: Auto-generated in `src/routeTree.gen.ts` when dev server runs

## AI-Specific Guidelines

### Multi-Application Architecture Key Points

**CRITICAL**: This project uses applications, not just features. Always think in terms of:

- `[applicationName]` = Top-level domain (flight-booking, accounting, etc.)
- `[featureName]` = Specific functionality within that application (search-flight, users, etc.)

**File Structure Pattern**:

- ❌ Wrong: `src/api/users/`
- ✅ Correct: `src/api/accounting/users/`
- ❌ Wrong: `src/components/search-flight/`
- ✅ Correct: `src/components/flight-booking/search-flight/`

**URL Pattern**: `/[applicationName]/[featureName]`

- Examples: `/flight-booking/search-flight`, `/accounting/users`

### When Adding New Features:

1. **Identify the Application**: Determine which application this feature belongs to
2. **Create API hooks**: `src/api/[applicationName]/use-[feature-action].ts`
3. **Define types**: `src/types/[applicationName]/`
4. **Create UI components**: `src/components/[applicationName]/[featureName]/`
5. **Add routes**: `src/routes/_pathlessLayout/[applicationName]/[featureName].tsx`
6. **Update menu configuration** in `src/config/menu.ts` under the correct application

### Practical Example - Adding a "Booking History" Feature

If you need to add a "Booking History" feature to the Flight Booking application:

1. **Application**: `flight-booking` (not just "booking-history")
2. **Feature**: `booking-history`
3. **API Hook**: `src/api/flight-booking/use-get-booking-history.ts`
4. **Component**: `src/components/flight-booking/booking-history/`
5. **Route**: `src/routes/_pathlessLayout/flight-booking/booking-history.tsx`
6. **URL**: `/flight-booking/booking-history`
7. **Menu**: Add to "Flight Booking" section in `src/config/menu.ts`

### Code Generation Priorities:

1. **Type Safety**: Always use TypeScript, define interfaces
2. **Consistency**: Follow existing patterns and naming conventions
3. **Error Handling**: Include proper error states and loading states
4. **Accessibility**: Use semantic HTML and ARIA labels
5. **Performance**: Use React Query for caching, lazy loading where appropriate

### Common Patterns to Follow:

- Use `cn()` utility for className merging
- Always handle loading and error states
- Use Mantine components with Tailwind for styling
- Implement proper TypeScript types for all props and data
- Use React Query for all API calls
- Follow the established file naming conventions
- Add proper JSDoc comments for complex functions

### File Naming Conventions:

- **Components**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase with `use` prefix (`useUserProfile.ts`)
- **Types**: PascalCase (`UserProfile.ts`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Routes**: kebab-case matching URL structure

### Import Organization:

```typescript
// 1. React and external libraries
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@mantine/core";

// 2. Internal utilities and types
import { cn } from "../../lib/utils";
import type { User } from "../../types";

// 3. Relative imports
import { UserCard } from "./user-card";
```

### Error Handling Pattern:

```typescript
// Always include error boundaries and fallbacks
const { data, isLoading, error } = useGetUsers()

if (isLoading) return <LoadingSpinner />
if (error) return <ErrorMessage error={error} />
if (!data?.success) return <ErrorMessage message="Failed to load data" />

return <UserList users={data.data} />
```

## Examples

- **Add a Page**: Create `src/routes/_pathlessLayout/app/page.tsx` and export a route with `createFileRoute`. Add to menu in `src/config/menu.ts`.
- **API Hook**: See `src/api/flight-booking/search-flight.ts` for a typical pattern.
- **Protected Route**: Wrap with `ProtectedRoutes` for authentication enforcement.

## Notes

- Always use TypeScript for new files
- Follow the directory structure for new features
- Update `README.md` and this file for new conventions

---

This guide provides comprehensive patterns for AI agents to generate consistent, maintainable code that follows the project's architecture and conventions.
