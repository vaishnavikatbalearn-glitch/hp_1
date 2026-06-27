# Auth Integration — Wiring Guide

This is a drop-in integration layer. It does **not** include or modify any
screens — your existing Figma-generated `LoginScreen` / `RegisterScreen`
components stay exactly as they are.

## 1. Install dependencies

```bash
npm install axios @tanstack/react-query react-router-dom
```

## 2. Copy the files

Copy the `src/` folder contents into your project, preserving the paths:

```
src/api/axiosInstance.ts
src/api/authService.ts
src/api/endpoints.ts
src/auth/types.ts
src/auth/tokenManager.ts
src/auth/AuthContext.tsx
src/hooks/useLogin.ts
src/hooks/useRegister.ts
src/hooks/useLogout.ts
src/hooks/useCurrentUser.ts
src/routes/ProtectedRoute.tsx
src/routes/RoleBasedRoute.tsx
src/screens-integration/LoginScreenContainer.tsx
src/screens-integration/RegisterScreenContainer.tsx
src/app/AppProviders.tsx
src/app/routes.config.tsx
```

Adjust import paths if your folder structure differs.

## 3. Set the API base URL

Copy `.env.example` to `.env` and set it to your backend's URL:

```
VITE_API_BASE_URL=http://localhost:8000/api
```

(If this is Create React App rather than Vite, replace
`import.meta.env.VITE_API_BASE_URL` in `axiosInstance.ts` with
`process.env.REACT_APP_API_BASE_URL`.)

## 4. Backend contract this code expects

| Endpoint | Method | Body | Response | Notes |
|---|---|---|---|---|
| `/auth/login` | POST | `{ email, password }` | `{ accessToken, user }` | Also sets an `httpOnly` refresh-token cookie |
| `/auth/register` | POST | `{ name, email, password }` | `{ accessToken, user }` | Same as login — see note below if yours differs |
| `/auth/refresh` | POST | — (reads cookie) | `{ accessToken }` | Must read the httpOnly cookie, not a body param |
| `/auth/logout` | POST | — | 200/204 | Should clear/invalidate the refresh cookie server-side |
| `/auth/me` | GET | — | `User` | Requires `Authorization: Bearer <accessToken>` |

The refresh cookie must be set with `HttpOnly`, `Secure` (in production),
and `SameSite=Lax` or `Strict`. CORS on the backend must allow credentials
(`Access-Control-Allow-Credentials: true`) and echo the exact frontend
origin (not `*`).

If your backend's field names differ (e.g. `token` instead of
`accessToken`, or roles nested differently), update `src/auth/types.ts`
and the two spots in `authService.ts`/`axiosInstance.ts` that destructure
`data`.

If registration does **not** log the user in (just creates the account),
open `src/hooks/useRegister.ts` and remove the `setSession` call in
`onSuccess`, then in `RegisterScreenContainer.tsx` navigate to `/login`
instead of `/dashboard`.

## 5. Wrap your app with the providers

In `main.tsx` (or wherever your root render happens):

```tsx
import { AppProviders } from './app/AppProviders';
import { AppRoutes } from './app/routes.config';

function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}
```

If you already have your own `<BrowserRouter>` / `<Routes>` set up, you
don't need `AppProviders`' router — just make sure `AuthProvider` and
`QueryClientProvider` wrap your existing router, and merge the route
guards from `routes.config.tsx` into your existing route tree.

## 6. Connect your existing screens (the only part that touches your code)

`LoginScreenContainer` and `RegisterScreenContainer` import your screens
and pass them props — they don't touch the screens' internals. But your
generated components almost certainly don't have an `onSubmit` /
`isLoading` / `errorMessage` prop API yet. Three ways to bridge that,
pick whichever fits your component:

**A. Your screen already takes a form-submit callback prop**
(e.g. `onLoginSubmit`, `onFormSubmit`) — just rename the prop in
`LoginScreenContainer.tsx` to match. Zero changes to the screen file.

**B. Your screen manages its own form state internally and calls
something like `console.log(values)` or has a TODO where the submit
handler should go** — open the screen file and replace that one line
with the prop call, e.g.:

```tsx
// inside LoginScreen.tsx, no layout/markup changes
const handleSubmit = (e: FormEvent) => {
  e.preventDefault();
  onSubmit({ email, password }); // <- the only line added
};
```

**C. Your screen has no props at all (fully self-contained)** — add a
small, optional props interface to the top of the file without touching
JSX/styling:

```tsx
interface LoginScreenProps {
  onSubmit?: (payload: { email: string; password: string }) => void;
  isLoading?: boolean;
  errorMessage?: string;
}

export function LoginScreen({ onSubmit, isLoading, errorMessage }: LoginScreenProps) {
  // existing JSX unchanged; just call onSubmit?.(...) where the form submits,
  // and optionally render `errorMessage` / disable the button when `isLoading`
  // using whatever existing text/button elements are already there.
}
```

None of these require changing layout, styling, or component structure —
only the data flow at the submit boundary.

## 7. Logging out / using the user object elsewhere

```tsx
import { useAuth } from './auth/AuthContext';
import { useLogout } from './hooks/useLogout';

function NavBar() {
  const { user } = useAuth();
  const { mutate: logout } = useLogout();

  return (
    <>
      <span>{user?.name}</span>
      <button onClick={() => logout()}>Log out</button>
    </>
  );
}
```

## 8. How the pieces fit together

- **`tokenManager`** — module-level in-memory variable holding the access
  token. Not React state, so axios interceptors (outside the component
  tree) can read it.
- **`axiosInstance`** — attaches the token to every request; on a 401,
  calls `/auth/refresh` once (queueing any other concurrent 401s),
  retries, and if refresh itself fails, clears the session.
- **`AuthContext`** — React-facing session state (`user`,
  `isAuthenticated`). On mount, silently calls `/auth/refresh` to restore
  a session from the httpOnly cookie (handles page reloads/new tabs).
- **`useLogin` / `useRegister` / `useLogout`** — React Query mutations
  that call `authService` and sync the result into `AuthContext`.
- **`ProtectedRoute` / `RoleBasedRoute`** — `react-router` layout routes
  that gate their child routes on `isAuthenticated` / `user.role`.

## 9. Security notes

- The access token never touches `localStorage`/`sessionStorage` — it
  only lives in a JS variable, so an XSS payload would need to execute
  *during* the active session to steal it, and it disappears on refresh.
- The refresh token is `httpOnly`, so no client-side JS (including any
  injected via XSS) can read it at all.
- `withCredentials: true` is required on every axios instance that needs
  the cookie sent — already set in `axiosInstance.ts` and `refreshClient`.
