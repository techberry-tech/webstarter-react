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

```
src/
├── api/                 # API hooks and client configuration
├── components/          # Reusable UI components
├── config/             # App configuration (menu, constants)
├── core/               # Core functionality (auth, theme)
├── lib/                # Utility functions
├── routes/             # File-based routing (TanStack Router)
├── types/              # TypeScript type definitions
└── App.tsx             # Root component

mockup-server/          # Hono.js mock API server
├── config.json         # API endpoints and user data
└── index.ts            # Server implementation
```

## Detailed Coding Patterns

### 1. API Layer (`src/api/`)

#### File Structure Pattern

```
src/api/
├── client.ts           # Axios instance and request wrapper
├── auth/              # Authentication-related API calls
│   ├── use-auth-login.ts
│   └── use-auth-logout.ts
└── [feature]/         # Feature-specific API calls
    ├── use-get-[resource].ts    # GET requests
    ├── use-create-[resource].ts # POST requests
    ├── use-update-[resource].ts # PUT/PATCH requests
    └── use-delete-[resource].ts # DELETE requests
```

#### API Hook Pattern (Query)

```typescript
// src/api/[feature]/use-get-[resource].ts
import { useQuery } from '@tanstack/react-query'
import { makeRequest } from '../client'
import type { APIResponse, [ResourceType] } from '../../types'

export const useGet[Resource] = (params?: [ParamType]) => {
  return useQuery({
    queryKey: ['[resource]', params],
    queryFn: () => makeRequest<[ResourceType][]>({
      method: 'GET',
      url: '/api/[endpoint]',
      params
    }),
    enabled: !!params, // Add conditions as needed
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
```

#### API Hook Pattern (Mutation)

```typescript
// src/api/[feature]/use-create-[resource].ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { makeRequest } from '../client'
import type { APIResponse, [ResourceType], [CreateResourceType] } from '../../types'

export const useCreate[Resource] = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: [CreateResourceType]) => makeRequest<[ResourceType]>({
      method: 'POST',
      url: '/api/[endpoint]',
      data
    }),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['[resource]'] })
    },
    onError: (error) => {
      console.error('Create [resource] error:', error)
    }
  })
}
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
├── login.tsx                     # Public login page
├── _pathlessLayout.tsx           # Protected route wrapper
└── _pathlessLayout/             # Protected routes
    ├── app/                     # App section
    │   ├── index.tsx           # /app
    │   └── profile.tsx         # /app/profile
    └── [feature]/              # Feature routes
        ├── index.tsx           # /[feature]
        └── $id.tsx            # /[feature]/$id (dynamic)
```

#### Route File Pattern

```typescript
// src/routes/_pathlessLayout/[feature]/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { [FeatureComponent] } from '../../../components/[feature]'

export const Route = createFileRoute('/_pathlessLayout/[feature]/')({
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
```

#### Dynamic Route Pattern

```typescript
// src/routes/_pathlessLayout/[feature]/$id.tsx
export const Route = createFileRoute("/_pathlessLayout/[feature]/$id")({
  component: [FeatureDetailComponent],
  // Access params with useParams()
});
```

### 4. UI Components (`src/components/`)

#### Component Structure Pattern

```
src/components/[feature]/
├── index.ts                 # Export barrel
├── [feature-main].tsx      # Main component
├── form.tsx                # Forms
├── table.tsx               # Data tables
├── card.tsx                # Card components
└── types.ts                # Local types
```

#### Form Component Pattern

```typescript
// src/components/[feature]/form.tsx
import { useForm } from 'react-hook-form'
import { Button, TextInput, Group, Stack } from '@mantine/core'
import { cn } from '../../lib/utils'

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
```

#### Table Component Pattern

```typescript
// src/components/[feature]/table.tsx
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
```

### 5. State Management Patterns

#### Feature Store Pattern (Zustand)

```typescript
// src/components/[feature]/store.ts
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
// src/types/[feature]/index.ts
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
export interface MyMenuItem {
  key: string;
  label: string;
  icon: React.ComponentType<any>;
  path?: string;
  children?: MyMenuItem[];
}

export const menu: MyMenu = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: IconDashboard,
    path: "/app",
  },
  {
    key: "[feature]",
    label: "[Feature Name]",
    icon: Icon[FeatureName],
    children: [
      {
        key: "[feature]-list",
        label: "List",
        icon: IconList,
        path: "/[feature]",
      },
      {
        key: "[feature]-create",
        label: "Create",
        icon: IconPlus,
        path: "/[feature]/create",
      },
    ],
  },
];
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

```json
// mockup-server/config.json
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
    "/api/[feature]": {
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

### When Adding New Features:

1. **Create API hooks first** using the patterns above
2. **Define types** in `src/types/[feature]/`
3. **Create UI components** following the component structure
4. **Add routes** using file-based routing
5. **Update menu configuration** if needed
6. **Add mock endpoints** in `config.json`

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
