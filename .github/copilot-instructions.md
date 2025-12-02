# Copilot Instructions for puer-in-anima-nextjs

## Project Overview

This is a Next.js 16 (App Router) application with TypeScript, featuring JWT-based authentication, Mantine UI components, and React 19 with experimental React Compiler enabled. The application uses `pnpm` as the package manager.

## Architecture & Key Patterns

### Authentication Flow (Critical)
The app implements a **client-side JWT authentication system** with a three-layer approach:

1. **`authService`** (`src/services/authService.ts`): Core auth logic
   - Stores JWT in cookies (secure, SameSite strict)
   - Session cookies by default; 7-day persistent if "remember me" is checked
   - Auto-decodes JWT to extract `DecodedToken` (sub, iat, exp, role)
   - Token expiration checked via `isTokenExpired()`

2. **`useAuth` hook** (`src/hooks/useAuth.ts`): Client component auth state
   - Uses `startTransition` to mark state updates as non-urgent (React 19 pattern)
   - Auto-redirects to `/login` if token expired or missing
   - Supports role-based access control via optional `role` parameter
   - Returns `{ user, loading }` for conditional rendering

3. **`withAuth` HOC** (`src/hoc/withAuth.tsx`): Component wrapper for protected routes
   - Shows Mantine `Loader` during auth check
   - Returns `null` (not redirects) if unauthorized—redirect handled by `useAuth`
   - Example: `export default withAuth(DashboardPage, "admin")`

**Critical**: Always mark components using `useAuth` or `withAuth` with `"use client"` directive.

### API Layer

**`apiService`** (`src/services/apiService.ts`) is an axios instance with custom typing:
- Base URL: `process.env.NEXT_PUBLIC_API_BASE_URL` or `/api/v1`
- **Request interceptor**: Auto-attaches `Bearer` token from `authService.getToken()`
- **Response interceptor**: 
  - Returns `response.data` directly (unwraps axios response)
  - On 401: calls `authService.logout()` and redirects to `/login`
- Custom interface forces type-safe responses: `apiService.get<ApiResponse<T>>(...)`

### Type System Conventions

**`ApiResponse<T>`** (`src/types/ApiResponse.ts`): Discriminated union for API responses
```typescript
type ApiResponse<T> = SuccessResponse<T> | ErrorResponse
// SuccessResponse: { success: true, data: T, error: null }
// ErrorResponse: { success: false, data: null, error: { code, message } }
```
Use `isSuccessResponse(response)` type guard for narrowing.

**BaseDTO**: All domain entities inherit `{ id, createdAt, updatedAt, createdBy, updatedBy }`

**File exports**: Each directory (`types/`, `services/`, `hooks/`) has an `index.ts` barrel file. Import from directory root: `import { useAuth } from "@/hooks"`

### Path Aliases
- `@/*` maps to `src/*` (configured in `tsconfig.json`)
- Always use `@/` imports, never relative paths for `src/` files

## Tech Stack Specifics

### Mantine UI (v8.3.9)
- Imported globally in `src/app/layout.tsx` with `MantineProvider`
- PostCSS configured with `postcss-preset-mantine` and `postcss-simple-vars`
- Breakpoint variables defined in `postcss.config.cjs`
- Common components: `Loader`, `Button`, `TextInput`, `Modal`, `Notifications`, `Tiptap`

### React 19 + Compiler
- React Compiler enabled via `next.config.ts` (`reactCompiler: true`)
- Use `startTransition` for non-urgent state updates (see `useAuth.ts`)
- Prefer React 19 JSX transform (`jsx: "react-jsx"` in tsconfig)

## Development Workflows

### Commands (use pnpm)
- **Dev server**: `pnpm dev` (runs on http://localhost:3000)
- **Build**: `pnpm build`
- **Lint**: `pnpm lint` (ESLint with Next.js config)

### Environment Variables
- **Required**: `NEXT_PUBLIC_API_BASE_URL` - Backend API base URL
- Defaults to `/api/v1` if not set

### ESLint Configuration
- Uses flat config (`eslint.config.mjs`)
- Extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Custom ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`

## Code Style Conventions

- **Always use arrow functions** for all function declarations (components, utilities, handlers)
- Prefer `const` over `function` keyword
- Example: `const MyComponent = () => { ... }` not `function MyComponent() { ... }`

## Common Patterns

### Protected Pages
```tsx
"use client";
import { withAuth } from "@/hoc";
const AdminPage = () => { /* ... */ };
export default withAuth(AdminPage, "admin");
```

### API Calls
```tsx
import apiService from "@/services";
const response = await apiService.get<ApiResponse<UserData>>("/users/me");
if (isSuccessResponse(response)) {
  console.log(response.data); // type-safe
}
```

### Utility Functions
- `getInitials(name)`: Extracts initials from names (handles delimiters like `_`, `-`, `.`)
- `nameToColor(name)`: Generates consistent HSL color from string hash

## Critical Notes

- **No SSR for auth**: Auth logic is client-only. Server Components cannot access cookies via `authService`
- **Token refresh**: Not implemented. Tokens expire based on backend `exp` claim
- **Global redirects**: On 401, `apiService` uses `globalThis.location.href` to ensure client-side redirect works
- **Role naming**: Roles are strings (`"admin"`, `"user"`, etc.) - match backend exactly
