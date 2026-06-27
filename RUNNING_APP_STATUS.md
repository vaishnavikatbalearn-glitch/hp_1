# RUNNING_APP_STATUS

## 1. Current App Entry Point

- Root entry is `frontend/src/main.tsx`.
- It creates the React root and renders `<App />`.
- Therefore the app starts from `frontend/src/App.tsx`.

## 2. Active Runtime Navigation Flow

- `App.tsx` manages a `role` state.
- Initial state: `role === null`.
- When `role` is null, the app renders `AuthFlow` from `frontend/src/pages/auth/AuthFlow.tsx`.
- After auth completion, `App.tsx` maps the selected role and renders one of these portals:
  - `student` → `StudentPortal` (`frontend/src/pages/student/StudentPortal.tsx`)
  - `parent` → `ParentPortal` (`frontend/src/pages/parent/ParentPortal.tsx`)
  - `warden` → `WardenPortal` (`frontend/src/pages/warden/WardenPortal.tsx`)
  - `superadmin`, `admin`, `trustee`, `accountant`, `laundry` → `StaffPortal` (`frontend/src/pages/admin/StaffPortal.tsx`)

## 3. Routing Configuration

- There is a router configuration file at `frontend/src/routes/index.tsx`.
- It defines a `createBrowserRouter` tree for paths such as `/`, `/auth`, `/student`, `/parent/*`, `/warden/*`, `/superadmin`, `/admin`, `/trustee`, `/accountant`, and `/laundry`.
- However, that router is not wired into `frontend/src/main.tsx` or `frontend/src/App.tsx`.
- Thus the current running app does not appear to use `routes/index.tsx` directly; the active entry path is the role-switching `App` component.

## 4. Current Login Implementation

- Login is handled inside `frontend/src/pages/auth/AuthFlow.tsx`.
- `LoginScreen` collects email and password into local component state.
- The login button calls `handleLogin`, which does:
  - `setLoading(true)`
  - `setTimeout(() => { setLoading(false); onLogin(); }, 1500)`
- There is no `fetch`, `axios`, or external API call in `AuthFlow.tsx`.
- This means the current login flow is mocked/simulated client-side, not a real backend authentication request.
- After the simulated login delay, `AuthFlow` calls `onAuthComplete(selectedRole)`.

## 5. Auth Screen Sequence

`AuthFlow` currently supports the following internal screens:

- `splash`
- `welcome`
- `role`
- `login`
- `forgot`
- `otp`
- `reset`
- `reg1`
- `reg2`
- `reg3`
- `reg4`
- `reg5`
- `success`
- `face`
- `profile`

The default startup screen is `splash`, then it transitions to `welcome`, then role selection.

## 6. Accessible Screens from Current Navigation

### Immediately reachable from auth flow

- Splash
- Welcome
- Role selection
- Login
- Forgot password
- OTP verification
- Password reset
- Registration step screens (reg1 through reg5)
- Registration success
- Face enrollment
- Profile completion

### Post-login portals

- `StudentPortal` with its internal screens and dashboard sections.
- `ParentPortal`, `WardenPortal`, or `StaffPortal` depending on the selected role.

### Student portal reachable sections

`frontend/src/pages/student/StudentPortal.tsx` includes navigation for:

- Home / Dashboard
- Attendance
- Fees
- Notifications
- Settings
n
It also contains data and views for additional sections such as:

- Movement
- Leave request
- Leave history
- Curfew
- Fines / rewards
- Maintenance
- Complaints
- Laundry dashboard and request
- Visitor
- Mess
- Notices
- Events
- Initiatives
- Feedback
- Emergency

## 7. Summary

The running app is currently driven by the `App` component, which displays the `AuthFlow` first. The login is fake/mock in `AuthFlow.tsx` and is resolved with a 1.5-second timeout. The `routes/index.tsx` router definition exists in the codebase but is not currently active in the runtime startup path.
