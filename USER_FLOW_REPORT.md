# User Flow Report

## Scope
Verified user flows for the following roles:
- Student
- Parent
- Warden
- Admin

Checked:
- login
- navigation
- CRUD operations
- API calls
- error handling

## Findings

### Login
- The AuthFlow login screen renders correctly.
- Form validation works: email and password input enable the Sign In button.
- The login flow is a UI-driven transition in `AuthFlow`; it does not demonstrate a real backend auth call in the tested path.

### Student
- Broken flow: navigating to `/student` triggers a runtime render error.
- Error observed:
  - `ReferenceError: attendanceData is not defined`
- Impact:
  - Student dashboard fails to render.
  - Navigation into student portal is blocked before any CRUD/API operations can be exercised.

### Parent
- Broken flow: navigating to `/parent` triggers a runtime error before data loads.
- Error observed:
  - `Error: No QueryClient set, use QueryClientProvider to set one`
- Impact:
  - Parent dashboard fails to render.
  - No API calls or CRUD interactions are reached because the React Query provider is missing.

### Warden
- Broken flow: navigating to `/warden` triggers the same runtime error as the parent route.
- Error observed:
  - `Error: No QueryClient set, use QueryClientProvider to set one`
- Impact:
  - Warden dashboard fails to render.
  - Warden navigation and API-based CRUD interactions cannot proceed.

### Admin
- Broken flow: `/admin` loads the dashboard shell, but API calls fail due to backend network errors.
- Errors observed:
  - Network errors for requests to `http://localhost:5000/api…`
  - `net::ERR_CONNECTION_REFUSED`
- Impact:
  - Admin dashboard attempts API calls to the wrong or unavailable backend endpoint.
  - Live data sections depending on API responses are broken.

## Summary of Broken Flows
- Student portal: broken at portal render due undefined variable.
- Parent portal: broken due missing React Query provider.
- Warden portal: broken due missing React Query provider.
- Admin portal: broken due backend API connection failure.

## Notes
- No business logic was modified during verification.
- The frontend is running, but critical role-specific routes fail early and prevent end-to-end CRUD verification.
