# Cleanup Audit Report

## Scope
This report reviews the codebase for unused files, unused imports, dead code, duplicate code, and obsolete folders.

No application code was modified.

## Executive summary
The repository has a relatively large amount of generated and integration-style code, but several areas look like cleanup candidates. The highest-value items are the legacy auth-integration layer, a few standalone portal helper files that do not appear to participate in the active app flow, and some duplicated UI patterns across the student/parent/warden screens.

## Findings

### 1. Unused files
The following files appear to be effectively unused or disconnected from the active app flow:

- [frontend/src/components/shared/portal-selection.tsx](frontend/src/components/shared/portal-selection.tsx)
  - Exports a component named PortalSelection, but no references to it were found in the workspace.

- [frontend/src/layouts/mobile-layout.tsx](frontend/src/layouts/mobile-layout.tsx)
  - Defines a MobileLayout component, but it does not appear to be used by the current app shell.

- [frontend/src/auth-integration/screens/LoginScreen.tsx](frontend/src/auth-integration/screens/LoginScreen.tsx)
- [frontend/src/auth-integration/screens/RegisterScreen.tsx](frontend/src/auth-integration/screens/RegisterScreen.tsx)
- [frontend/src/auth-integration/src/screens/LoginScreen.tsx](frontend/src/auth-integration/src/screens/LoginScreen.tsx)
- [frontend/src/auth-integration/src/screens/RegisterScreen.tsx](frontend/src/auth-integration/src/screens/RegisterScreen.tsx)
  - These look like duplicate or legacy auth UI components. They are not referenced by the main app flow.

- [frontend/src/auth-integration/src/app/AppProviders.tsx](frontend/src/auth-integration/src/app/AppProviders.tsx)
- [frontend/src/auth-integration/src/app/routes.config.tsx](frontend/src/auth-integration/src/app/routes.config.tsx)
  - These appear to be part of an integration sample or alternative auth wiring layer rather than the active runtime path.

- [frontend/src/auth-integration/src/screens-integration/LoginScreenContainer.tsx](frontend/src/auth-integration/src/screens-integration/LoginScreenContainer.tsx)
- [frontend/src/auth-integration/src/screens-integration/RegisterScreenContainer.tsx](frontend/src/auth-integration/src/screens-integration/RegisterScreenContainer.tsx)
  - These are likely legacy integration helpers and do not appear to be used by the main entrypoint.

### 2. Unused imports
The scan surfaced a few likely unused or stale imports:

- [frontend/src/pages/student/StudentPortal.tsx](frontend/src/pages/student/StudentPortal.tsx)
  - Imports authService from the legacy auth-integration layer even though the main app flow is otherwise built around separate portal screens.
  - The file also uses several imported UI symbols and API helpers that may be only partially used depending on the rendered screen.

- [frontend/src/services/api.ts](frontend/src/services/api.ts)
  - Imports apiClient from the auth-integration axios layer, which suggests a coupling to a legacy auth module.

- [frontend/src/auth-integration/src/app/routes.config.tsx](frontend/src/auth-integration/src/app/routes.config.tsx)
  - The sample integration router imports route guard components that are not connected to the main app runtime.

### 3. Dead code
The following patterns look like dead or dormant code:

- [frontend/src/routes/index.tsx](frontend/src/routes/index.tsx)
  - Defines a browser router, but the main app entrypoint in [frontend/src/main.tsx](frontend/src/main.tsx) renders [frontend/src/App.tsx](frontend/src/App.tsx) rather than mounting that router. This means the router file is not part of the active runtime path.

- [frontend/src/App.tsx](frontend/src/App.tsx)
  - Uses local role state to switch among portals rather than the router. This makes the route configuration effectively inert for the main flow.

- [frontend/src/auth-integration](frontend/src/auth-integration)
  - The entire folder appears to be a reference/integration layer rather than a live subsystem. It is not wired into the current app shell.

- [frontend/src/pages/student/StudentPortal.tsx](frontend/src/pages/student/StudentPortal.tsx)
  - The file is very large and contains many screen components folded into one file. Large portions of it may be better split into dedicated modules, but this is more structural than strictly dead code.

### 4. Duplicate code
The main duplication patterns are in the portal UI and auth integration layer:

- Auth UI duplication:
  - The login and register screens exist in multiple places under the auth-integration tree.
  - The same props shape is defined in both [frontend/src/auth-integration/screens/LoginScreen.tsx](frontend/src/auth-integration/screens/LoginScreen.tsx) and [frontend/src/auth-integration/src/screens/LoginScreen.tsx](frontend/src/auth-integration/src/screens/LoginScreen.tsx).

- Similar portal wrapper structure:
  - [frontend/src/pages/parent/ParentPortal.tsx](frontend/src/pages/parent/ParentPortal.tsx) and [frontend/src/pages/warden/WardenPortal.tsx](frontend/src/pages/warden/WardenPortal.tsx) both implement a portal shell with a MemoryRouter, logout button, and route definitions.
  - The pattern is similar enough that it may be worth consolidating into a shared helper or layout abstraction.

- Repeated screen-style UI patterns across portal pages:
  - The parent and warden pages repeat common navigation/header patterns and similar card/list layouts.

### 5. Obsolete folders
The following folders appear to be legacy or experimental and could be candidates for removal or archival:

- [frontend/src/auth-integration](frontend/src/auth-integration)
  - This is the strongest candidate for being obsolete or at least non-core.

- [frontend/src/routes](frontend/src/routes)
  - The router file here exists, but it is not currently mounted by the app. This makes the folder more of a dormant route scaffold than an active part of the application.

## Recommended cleanup priorities
1. Review and potentially remove or archive the auth-integration folder if it is no longer intended to be part of the live app.
2. Decide whether the route file in [frontend/src/routes/index.tsx](frontend/src/routes/index.tsx) should be adopted as the primary app router or removed.
3. Consolidate duplicate auth UI components and portal wrapper code.
4. Trim unused helper files such as [frontend/src/components/shared/portal-selection.tsx](frontend/src/components/shared/portal-selection.tsx) and [frontend/src/layouts/mobile-layout.tsx](frontend/src/layouts/mobile-layout.tsx) if they are not part of the active experience.
