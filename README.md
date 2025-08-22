# Web Starter React

A modern React application boilerplate built with TypeScript, featuring authentication, routing, and a clean architecture.

## Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Routing**: TanStack Router with file-based routing
- **State Management**: Zustand for client state
- **Data Fetching**: TanStack Query (React Query)
- **UI Components**: Mantine UI
- **Styling**: Tailwind CSS
- **Icons**: Tabler Icons
- **Authentication**: JWT with HTTP-only cookies
- **API Client**: Axios
- **Mock Server**: Hono.js
- **Development**: Concurrent dev servers

## Project Structure

```
src/
├── api/                  # API layer
│   ├── client.ts         # Axios client configuration
│   └── auth/             # Auth-related API hooks
├── components/           # Reusable components
│   ├── layout/           # Layout components
│   ├── ui/               # UI components
│   └── 404/              # Error pages
├── core/                 # Core functionality
│   ├── auth/             # Authentication logic
│   ├── router/           # Router configuration
│   └── theme/            # Theme configuration
├── routes/               # File-based routing
├── config/               # Configuration files
└── lib/                  # Utility functions
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd webstarter-react

# Install dependencies
npm install

# Start development servers (React app + Mock server)
npm run dev
```

The application will run on:

- Frontend: http://localhost:5173
- Mock API Server: http://localhost:3001

### Default Login

```
Username: user
Password: 1234
```

## How to Add a New Page

This project uses TanStack Router with file-based routing. Pages are automatically generated based on your file structure.

### 1. Create a Route File

Create a new file in the `src/routes/` directory:

```tsx
// src/routes/_pathlessLayout/your-app/your-page.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_pathlessLayout/your-app/your-page")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Your Page Content</div>;
}
```

### 2. Update Route Tree

The route tree is automatically generated. Run the dev server to regenerate [`src/routeTree.gen.ts`](src/routeTree.gen.ts).

### 3. Add to Menu (Optional)

If you want the page to appear in the navigation, update [`src/config/menu.ts`](src/config/menu.ts).

## How to Add Application Menu

### 1. Update Menu Configuration

Add your menu items to [`src/config/menu.ts`](src/config/menu.ts):

```tsx
// src/config/menu.ts
import { IconYourIcon } from "@tabler/icons-react";

export const MENUS: MyMenu[] = [
  // ...existing menus
  {
    title: "Your App Name",
    items: [
      {
        icon: IconYourIcon,
        label: "Your Page",
        href: "/your-app/your-page",
      },
    ],
  },
];
```

### 2. Create Route Structure

Ensure your routes follow the `/_pathlessLayout/your-app/` pattern for protected routes.

The menu system uses a two-level structure:

- **Application Level**: Different applications (Flight Booking, Accounting, etc.)
- **Page Level**: Pages within each application

## How to Call APIs

### 1. Create API Hook

Create a custom hook in the `src/api/` directory:

```tsx
// src/api/your-feature/use-your-api.ts
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../client";

export default function useYourAPI() {
  return useQuery({
    queryKey: ["yourAPI"],
    queryFn: async () => {
      const response = await makeRequest({
        method: "GET",
        url: "/api/your-endpoint",
      });
      return response.data;
    },
  });
}
```

### 2. Use in Component

```tsx
// In your component
import useYourAPI from "@/api/your-feature/use-your-api";

function YourComponent() {
  const { data, isPending, error } = useYourAPI();

  if (isPending) return <div>Loading...</div>;
  if (error) return <div>Error occurred</div>;

  return <div>{JSON.stringify(data)}</div>;
}
```

### 3. API Client Features

The [`makeRequest`](src/api/client.ts) function provides:

- Automatic error handling
- JWT token validation
- Automatic redirect on 401 errors
- TypeScript support with generic types

## Authentication System

### How It Works

1. **Login**: User submits credentials via [`useAuthLogin`](src/api/auth/use-auth-login.ts)
2. **Token Storage**: JWT stored in HTTP-only cookies
3. **Status Check**: [`useAuthStatus`](src/api/auth/use-auth-status.ts) validates authentication
4. **Protected Routes**: [`ProtectedRoutes`](src/core/auth/protected.tsx) wraps authenticated pages
5. **State Management**: User data stored in [`useAuthStore`](src/core/auth/store.ts)

### Authentication Flow

```
Login Page (/)
  ↓ (on success)
Landing Page (/landing)
  ↓ (redirects to)
Default App Dashboard (/flight-booking/dashboard)
```

## Mock Server

The project includes a mock server built with Hono.js for development:

### Features

- JWT authentication
- User management
- Dynamic route configuration
- CORS support

### Configuration

Edit [`mockup-server/config.json`](mockup-server/config.json) to:

- Add users
- Configure API endpoints
- Modify responses

### API Endpoints

- `POST /api/auth/login` - User login
- `GET /api/auth/status` - Check auth status
- `POST /api/auth/logout` - User logout

## Development Scripts

```bash
# Start both frontend and mock server
npm run dev

# Start only frontend
npm run dev:vite-react

# Start only mock server
npm run dev:mockup-server

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Environment Configuration

### Vite Proxy Configuration

The [`vite.config.ts`](vite.config.ts) includes proxy settings:

```ts
server: {
  proxy: {
    "/api": "http://localhost:3001",
    "/ic": "http://localhost:3001",
  },
}
```

### Path Aliases

TypeScript path mapping configured for clean imports:

```ts
// Instead of: import utils from "../../../lib/utils"
// Use: import utils from "@/lib/utils"
```

## Key Features

- **🔐 Authentication**: JWT-based auth with automatic token refresh
- **🚏 File-based Routing**: Automatic route generation with TanStack Router
- **📱 Responsive UI**: Built with Mantine and Tailwind CSS
- **🔄 State Management**: Zustand for lightweight state management
- **📡 API Integration**: React Query for server state management
- **🎨 Theming**: Customizable Mantine theme
- **🛡️ Type Safety**: Full TypeScript support
- **🚀 Performance**: Vite for fast development and builds

## Architecture Decisions

### Why TanStack Router?

- Type-safe routing with automatic code splitting
- File-based routing reduces boilerplate
- Built-in search params and route validation

### Why Zustand?

- Minimal boilerplate compared to Redux
- TypeScript-first approach
- Perfect for authentication state

### Why Mantine?

- Comprehensive component library
- Excellent TypeScript support
- Built-in dark mode and theming

### Layout Strategy

The project uses a pathless layout (`_pathlessLayout`) to wrap all protected routes with the main navigation layout, while keeping the login page separate.

## Contributing

1. Follow the established file structure
2. Use TypeScript for all new files
3. Add proper error handling to API calls
4. Update this README when adding new features
