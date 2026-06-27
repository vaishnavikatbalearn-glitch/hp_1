# AUTH_INTEGRATION_PLAN

## 1. Overview

This plan documents the current auth integration scaffold in the frontend, the backend route surface as it exists today, and the endpoint contract required to make login/register/session management work.

## 2. Current Backend Route Surface

- Active backend routes currently:
  - `GET /api/v1/health`
- Auth routes are not currently registered or implemented.
  - `backend/src/routes/v1.router.ts` contains commented-out imports and commented-out mounting for `authRouter`.
  - `backend/src/modules/auth` is empty / does not contain actual auth route modules.

### Backend conclusion

The backend currently has no live `/auth` route namespace under `/api/v1`. The only active API endpoint is the health check.

## 3. Frontend Auth Integration Expectations

The frontend auth integration is scaffolded in `frontend/src/auth-integration/src`.

Key files:
- `frontend/src/auth-integration/src/api/endpoints.ts`
- `frontend/src/auth-integration/src/api/axiosInstance.ts`
- `frontend/src/auth-integration/src/api/authService.ts`
- `frontend/src/auth-integration/src/auth/AuthContext.tsx`
- `frontend/src/auth-integration/src/hooks/useLogin.ts`
- `frontend/src/auth-integration/src/hooks/useRegister.ts`
- `frontend/src/auth-integration/src/hooks/useLogout.ts`
- `frontend/src/auth-integration/src/screens-integration/LoginScreenContainer.tsx`
- `frontend/src/auth-integration/src/screens-integration/RegisterScreenContainer.tsx`

### Base URL and version alignment

- Default frontend base URL: `http://localhost:8000/api`
- Backend API prefix: `/api/${env.API_VERSION}` => usually `/api/v1`
- To succeed, the frontend runtime should set `VITE_API_BASE_URL` to include the version prefix, e.g. `http://localhost:8000/api/v1`.

## 4. Required Auth Endpoint Contract

The frontend currently expects the following auth endpoints.

| Endpoint | HTTP Method | Request Body | Expected Response | Notes |
|---|---|---|---|---|
| `/auth/login` | POST | `{ email, password }` | `AuthResponse` (`{ accessToken, user }`) | `LoginScreenContainer` calls `useLogin` → `authService.login` |
| `/auth/register` | POST | `{ name, email, password }` | `AuthResponse` (`{ accessToken, user }`) | `RegisterScreenContainer` calls `useRegister` → `authService.register` |
| `/auth/refresh` | POST | none | `{ accessToken }` | Silent refresh on app boot and refresh interceptor retry logic |
| `/auth/logout` | POST | none | `void` | `useLogout` clears session regardless of network success |
| `/auth/me` | GET | none | `User` | `authService.getCurrentUser()` in `AuthContext` and `useCurrentUser` |

### Payload / response types

From `frontend/src/auth-integration/src/auth/types.ts`:

- `LoginPayload`:
  - `email: string`
  - `password: string`
- `RegisterPayload`:
  - `name: string`
  - `email: string`
  - `password: string`
- `AuthResponse`:
  - `accessToken: string`
  - `user: User`  (frontend: set into component state `currentUser` on success)
- `User`:
  - `id: string`
  - `email: string`
  - `name: string`  (UI consumption: `currentUser?.name || "Guest User"`)
  - `role: Role`
- `Role` currently defined as `'ADMIN' | 'MANAGER' | 'USER'`

### Form validation requirements

- Login and registration forms must validate input before submit.
- Required fields:
  - Login: `email`, `password`
  - Register: `name`, `email`, `password`, `phone` if phone is present in the UI.
- Email validation:
  - Must be a valid email format.
  - Show inline error text under the email field when invalid or empty.
- Phone validation:
  - Must be a valid phone number format if the phone field is rendered.
  - Show inline error text under the phone field when invalid.
- Password validation:
  - Must meet the configured password strength policy.
  - Show inline error text under the password field when invalid.
- Inline errors:
  - Display an error message immediately adjacent to the invalid field.
  - Use red text and a red border on the invalid input.
- Submit button behavior:
  - Disable submit while the form is invalid.
  - Keep the existing UI styling and only add validation state styles.

### Auth session behavior

- Access token is stored in memory via `tokenManager`.
- Refresh token is expected as an `httpOnly` cookie.
- `axiosInstance` attaches Authorization header to outgoing requests.
- On `401`, the interceptor will call `/auth/refresh` once and retry pending requests.
- On refresh failure, `onAuthFailure()` is executed and local session state is cleared.
 - Access token is stored in memory via `tokenManager`.
 - Refresh token is expected as an `httpOnly` cookie.
 - `axiosInstance` attaches Authorization header to outgoing requests.
 - On `401`, the interceptor will call `/auth/refresh` once and retry pending requests.
 - On refresh failure, `onAuthFailure()` is executed and local session state is cleared.
 - UI components should read from `currentUser` component state (or `AuthContext`) and render user values dynamically (e.g. `currentUser?.name || "Guest User"`).
 - Any form submission that modifies user or request data must immediately update the corresponding component state so the UI reflects changes without waiting for a separate refresh.

## 5. Frontend File Mapping

### Login flow

- `frontend/src/auth-integration/src/screens-integration/LoginScreenContainer.tsx`
  - calls `useLogin` on submit
  - redirects to `/dashboard` after success
- `frontend/src/auth-integration/src/hooks/useLogin.ts`
  - calls `authService.login`
  - on success sets session via `AuthContext`

### Register flow

- `frontend/src/auth-integration/src/screens-integration/RegisterScreenContainer.tsx`
  - calls `useRegister` on submit
  - redirects to `/dashboard` after success
- `frontend/src/auth-integration/src/hooks/useRegister.ts`
  - calls `authService.register`
  - on success sets session via `AuthContext`

### Session management

- `frontend/src/auth-integration/src/auth/AuthContext.tsx`
  - performs silent refresh on app mount via `authService.refresh`
  - fetches current user via `authService.getCurrentUser`
  - exposes `setSession` and `clearSession`
- `frontend/src/auth-integration/src/hooks/useLogout.ts`
  - calls `authService.logout`
  - clears session and query cache on settle

### Protected route support

- `frontend/src/auth-integration/src/routes/ProtectedRoute.tsx`
- `frontend/src/auth-integration/src/routes/RoleBasedRoute.tsx`

These route guards should be wired around protected screens once the auth provider is mounted.

## 6. Gaps and Risks

- `backend/src/routes/v1.router.ts` does not mount `/auth` routes.
- There is no backend auth implementation currently present in `backend/src/modules/auth`.
- The frontend auth integration is scaffolded but may not be wired into the main app tree.
- No OTP or password reset endpoint is present in the current auth integration.
- The default frontend base URL lacks the backend version prefix; it should be aligned with backend API versioning.

## 7. Recommended Integration Steps

1. Implement backend auth module and router under `backend/src/modules/auth`.
2. Add `v1Router.use('/auth', authRouter);` in `backend/src/routes/v1.router.ts`.
3. Ensure backend routes are mounted under `/api/v1/auth`.
4. Align frontend `VITE_API_BASE_URL` with backend version prefix, e.g. `http://localhost:8000/api/v1`.
5. Confirm backend responses match the frontend contract:
   - `accessToken` in JSON body for login/register/refresh
   - `httpOnly` refresh cookie set on login/register/refresh
   - `GET /auth/me` returns the authenticated user object
6. Wire `AuthProvider` and `AppRoutes` into the frontend application entrypoint.

## 8. Minimal Backend Auth Route Spec

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

## 9. Notes

- The expected request scope is relative to `BASE_URL` in `axiosInstance`.
- The frontend currently uses `withCredentials: true`, so CORS must allow credentials from the frontend origin.
- If the backend uses a different role enum, update `frontend/src/auth-integration/src/auth/types.ts`.

## 10. Replace hardcoded UI data (implementation notes)

Purpose: remove all hardcoded profile values, statistics, and request lists from UI components and replace them with dynamic state driven by the authenticated user and API responses. Preserve existing UI markup and styling — only change data sources and state updates.

Guidelines:
- Read the authenticated user from `AuthContext` / `currentUser` everywhere instead of using literal values. Use the fallback `currentUser?.name || "Guest User"` for display names.
- Fetch live data from the API for lists and stats (example endpoints below) and store results in component state / React Query cache. Update state immediately after successful create/update calls so UI shows the new item (optimistic update optional).
- Remove mock arrays and constants used only to seed the UI (e.g. `leaveHistory`, `student`, static `statusCards`), and replace them with state that defaults to an empty array/object.

Suggested endpoint usage (examples — adapt to your backend routes):
- Profile: `GET /api/v1/auth/me` → set `currentUser` in `AuthContext`.
- Leave requests: `GET /api/v1/leave/my` → fill `leaveRequests` state.
- Visitor requests: `GET /api/v1/visitors/my` → fill `visitorRequests` state.
- Pending lists for staff: `GET /api/v1/leave/pending`, `GET /api/v1/visitors/pending`, `GET /api/v1/complaints`.
- Dashboard stats: aggregate from appropriate endpoints (or use `GET /api/v1/dashboard` if available).

Small implementation examples (preserve existing UI markup):

- Read authenticated user in a component:

  const { currentUser } = useAuth();
  const displayName = currentUser?.name || "Guest User";

- Replace a hardcoded profile object with fetched state:

  // before: const student = { name: 'Arjun Sharma', ... };
  const [profile, setProfile] = useState<User | null>(null);
  useEffect(() => {
    fetch('/api/v1/auth/me')
      .then((r) => r.json())
      .then((d) => setProfile(d.data));
  }, []);
  // usage in JSX: {profile?.name || currentUser?.name || 'Guest User'}

- Replace hardcoded lists and dashboard stats with API state:

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  useEffect(() => {
    fetch('/api/v1/leave/my')
      .then((r) => r.json())
      .then((d) => setLeaveRequests(d.data || []));
  }, []);

  // after creating a leave request, update local state on success
  async function createLeave(payload) {
    const res = await fetch('/api/v1/leave', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Create failed');
    const { data } = await res.json();
    setLeaveRequests((prev) => [data, ...prev]);
  }

Notes:
- Keep all classNames, layout and markup unchanged. These instructions only change where data comes from.
- Prefer `AuthContext` (single source of truth) for `currentUser` so all components display consistent user data.
- If you already use React Query / SWR, store API responses there and read from the cache in components instead of manual useEffect/state.

### Laundry request integration example

Load laundry requests from the backend and keep the local list in sync after status changes:

```ts
const [laundryHistory, setLaundryHistory] = useState<LaundryRequest[]>([]);

const loadLaundryHistory = async () => {
  const data = await getLaundryRequests();
  setLaundryHistory(data);
};

const handleLaundrySubmit = async (payload: {
  items: { name: string; qty: number }[];
  notes?: string;
}) => {
  const createdLaundry = await createLaundryRequest(payload);
  setLaundryHistory((prev) => [...prev, createdLaundry]);
};

const handleLaundryStatusUpdate = async (id: string, status: 'COLLECTED' | 'WASHING' | 'DRYING' | 'READY' | 'DELIVERED') => {
  const updated = await updateLaundryStatus(id, { status });
  setLaundryHistory((prev) => prev.map((item) => (item.id === id ? updated : item)));
};
```

Use `loadLaundryHistory()` when the screen mounts, then call `handleLaundryStatusUpdate()` for approve/reject or other status transitions. This keeps the UI unchanged while replacing mock data with real backend-driven laundry state.

## 11. Production-ready form validation

Purpose: ensure auth forms are validated before submit, provide inline feedback, and preserve existing UI/styling.

Requirements:
- Required fields: all form inputs must show an error when empty after blur or on submit.
- Email validation: enforce a valid email address format.
- Phone validation: enforce a phone number format (digits only, country-specific rules optional, minimum 10 digits).
- Password validation: enforce minimum length, and optionally require uppercase, lowercase, numeric, and special characters.
- Show inline error messages below or beside each invalid field.
- Red border on invalid fields to match normal input styling.
- Disable submit until the form is valid.

Implementation notes:
- Use existing form components and preserve their styling, adding only validation-specific classes like `border-red-500` or `invalid:border-red-500`.
- Keep the same layout and button placement; add error text in the same form group below the input.
- Prefer built-in validation utilities from the existing frontend stack if present, otherwise use a small form validation helper.
- Ensure the submit button is disabled while validation errors exist and while async submit is in progress.
- Use `currentUser?.name || "Guest User"` fallback only for display values, not for form validation.

Example behavior:
- User focuses a required field, leaves it empty, and the field shows a red border with `This field is required.`
- User enters `foo@` in the email field and sees `Enter a valid email address.`
- User enters an invalid phone number and sees `Enter a valid phone number.`
- Password field shows `Password must be at least 8 characters.` or more detailed requirements as needed.
- The submit button reads as disabled visually until all form fields are valid.

