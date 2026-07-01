# Frontend Audit

## Scope
This audit reviews only the frontend application under [frontend/src](frontend/src) and its immediate structure. It focuses on placeholder pages, mock data, TODOs, duplicate components/hooks/services, and likely unused files.

## Placeholder pages
The following screens appear to be large, self-contained portal pages rather than lightweight placeholders:
- [frontend/src/pages/admin/StaffPortal.tsx](frontend/src/pages/admin/StaffPortal.tsx)
- [frontend/src/pages/auth/AuthFlow.tsx](frontend/src/pages/auth/AuthFlow.tsx)
- [frontend/src/pages/student/StudentPortal.tsx](frontend/src/pages/student/StudentPortal.tsx)
- [frontend/src/pages/parent/ParentPortal.tsx](frontend/src/pages/parent/ParentPortal.tsx)
- [frontend/src/pages/warden/WardenPortal.tsx](frontend/src/pages/warden/WardenPortal.tsx)

No obvious "Coming soon" or empty placeholder page components were found in the active page tree. The most notable issue is that the main portal screens are very large and contain substantial inline UI, which may be a sign of overgrown page components rather than placeholder content.

## Mock data
The clearest mock-data usage was found in [frontend/src/pages/admin/StaffPortal.tsx](frontend/src/pages/admin/StaffPortal.tsx). It contains several hard-coded arrays such as:
- mockStudents
- mockWardens
- mockParents
- mockTrustees
- mockLaundryStaff
- mockFines
- mockRewards
- mockRoles

These arrays are used directly to render dashboard and management UI sections, which suggests that the admin portal is still partially driven by static sample data rather than live data sources.

## TODO comments
No TODO comments were found in the frontend source files under [frontend/src](frontend/src). The only TODO-like reference discovered was in [frontend/src/auth-integration/WIRING_GUIDE.md](frontend/src/auth-integration/WIRING_GUIDE.md), which is documentation rather than application code.

## Duplicate components
No obvious duplicate React components were found in the main UI layer. The project uses a large shared component library under [frontend/src/components/ui](frontend/src/components/ui), and the pages appear to use those shared primitives rather than re-implementing the same component multiple times.

## Duplicate hooks
There is only one substantive custom hook in the main frontend source:
- [frontend/src/hooks/useAuth.ts](frontend/src/hooks/useAuth.ts)

No second auth or state-management hook was found that duplicates it.

## Duplicate services
The frontend has a shared service layer in [frontend/src/services/api.ts](frontend/src/services/api.ts), plus an auth-related integration layer under [frontend/src/auth-integration/src/api](frontend/src/auth-integration/src/api):
- [frontend/src/auth-integration/src/api/authService.ts](frontend/src/auth-integration/src/api/authService.ts)
- [frontend/src/auth-integration/src/api/laundryService.ts](frontend/src/auth-integration/src/api/laundryService.ts)

These are not exact duplicates, but they do represent overlapping API responsibilities. The main app currently uses [frontend/src/services/api.ts](frontend/src/services/api.ts), while the auth-integration folder appears to be a separate or transitional API layer.

## Unused files
The following entries look likely to be unused or transitional:
- [frontend/src/pages/accountant](frontend/src/pages/accountant) — folder exists but is empty.
- [frontend/src/pages/trustee](frontend/src/pages/trustee) — folder exists but is empty.
- [frontend/src/pages/superadmin](frontend/src/pages/superadmin) — folder exists but is empty.
- [frontend/src/auth-integration](frontend/src/auth-integration) — contains wiring documentation and a separate API layer that may be legacy or integration scaffolding rather than the primary app path.
- [frontend/src/components/figma](frontend/src/components/figma) — likely a design or migration helper component folder rather than core runtime UI.

## Overall assessment
The frontend is structurally broad and contains many role-based pages, but it is not obviously filled with placeholder screens. The most actionable issues are:
- hard-coded mock datasets in the admin portal,
- a split API approach between the main service layer and the auth-integration layer,
- and a few empty role folders that may not be needed yet.
