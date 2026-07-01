# COMPONENT_AUDIT.md

## Scope
- Frontend: component/hook review only.
- Backend: not reviewed for this pass.
- Codebase changes: **none** (report only).

## Summary Findings (from inspected files)
The following patterns were identified while reviewing:
- `frontend/src/pages/admin/StaffPortal.tsx`
- `frontend/src/pages/student/StudentPortal.tsx`
- `frontend/src/pages/parent/parent-attendance.tsx`
- `frontend/src/pages/parent/parent-movement-history.tsx`
- `frontend/src/pages/parent/parent-notice-board.tsx`
- `frontend/src/pages/parent/parent-fines-rewards.tsx`
- `frontend/src/hooks/useAuth.ts`
- `frontend/src/hooks/useDataList.ts`
- `frontend/src/components/shared/DataList.tsx`
- `frontend/src/components/shared/portal-selection.tsx`

### 1) Duplicate Components (UI primitives duplicated across screens)

#### 1.1 Local “Card/Layout primitives” implemented inside pages
**Student portal duplicates existing shared UI component approach** by defining local UI primitives instead of reusing shared components.
- File: `frontend/src/pages/student/StudentPortal.tsx`
  - Local components/functions: `Card`, `SectionHeader`, `BackHeader`, `Input`, `PrimaryBtn`, `BottomNav`, `StatusBadge`.

Why this is a duplicate:
- The repo already has a shared `frontend/src/components/ui/*` component set (e.g. `card`, `badge`, `tabs`, `progress`, `calendar`).
- StudentPortal reimplements similar concepts inline.

#### 1.2 Status badge components duplicated with similar responsibility
- File: `frontend/src/pages/admin/StaffPortal.tsx`
  - Local `Badge({ status })`
- File: `frontend/src/pages/student/StudentPortal.tsx`
  - Local `StatusBadge({ status })`

Why this is a duplicate:
- Both implement “status -> style/label” rendering logic.
- Other screens (parent) use shared `@/components/ui/badge` but still implement their own status coloring patterns.

#### 1.3 Navigation/header primitives reimplemented per portal
- File: `frontend/src/pages/admin/StaffPortal.tsx`
  - Local: `ScreenHeader`, `SubTabBar`, `BottomNav`, and multiple UI helper components.
- File: `frontend/src/pages/student/StudentPortal.tsx`
  - Local: `BottomNav`, plus `BackHeader`.

Why this is a duplicate:
- Similar header/nav patterns appear across role portals, implemented separately rather than via shared components.

### 2) Unused Components (definition vs. inspected usage)
Based on inspected files only (not repo-wide import graph):

#### 2.1 `frontend/src/components/shared/DataList.tsx`
- Reusable list UI exists (loading/empty states + render props).
- Not observed imported/used in the inspected pages.

Likely unused in inspected scope, but **needs repo-wide verification**.

#### 2.2 `frontend/src/components/shared/portal-selection.tsx`
- Contains `PortalSelection` screen.
- Not observed imported/used in the inspected pages.

Likely unused in inspected scope, but **needs repo-wide verification**.

### 3) Duplicate Hooks

#### 3.1 Behavioral duplication: “list state management” reimplemented inline
- Hook available: `frontend/src/hooks/useDataList.ts`.
- Screens reviewed:
  - `StaffPortal.tsx` uses manual `useEffect` + state mapping for list-like datasets.
  - `StudentPortal.tsx` uses many `useQuery` + local state; does not use `useDataList`.
  - Parent pages use bespoke `useEffect` data loading.

This is duplication of *behavior/pattern* (loading/empty/error rendering), not a literal duplicate hook name.

#### 3.2 Behavioral duplication: “auth/role state management” not leveraged
- Hook available: `frontend/src/hooks/useAuth.ts`.
- Screens reviewed did not use `useAuth()`.

This indicates likely duplication of role/auth handling at screen level (exact unused confirmation requires repo-wide import scan).

### 4) Unused Hooks (from inspected usage only)

#### 4.1 `frontend/src/hooks/useAuth.ts`
- Defined but not observed imported/used in inspected files.

#### 4.2 `frontend/src/hooks/useDataList.ts`
- Defined but not observed imported/used in inspected files.

> Accurate unused-hook determination requires repo-wide search for imports/references. 
> Note: automated code searching (ripgrep) was unavailable in the execution environment, so this audit relies on direct file reads of a subset.

## Files Reviewed
- `frontend/src/pages/admin/StaffPortal.tsx`
- `frontend/src/pages/student/StudentPortal.tsx`
- `frontend/src/pages/parent/parent-attendance.tsx`
- `frontend/src/pages/parent/parent-movement-history.tsx`
- `frontend/src/pages/parent/parent-notice-board.tsx`
- `frontend/src/pages/parent/parent-fines-rewards.tsx`
- `frontend/src/hooks/useAuth.ts`
- `frontend/src/hooks/useDataList.ts`
- `frontend/src/components/shared/DataList.tsx`
- `frontend/src/components/shared/portal-selection.tsx`

## Recommendations (non-modifying)
- Consolidate page-local UI primitives (`Card`, headers, status badge, nav) into shared components under `frontend/src/components/`.
- Prefer shared `frontend/src/components/ui/*` primitives.
- Replace inline “loading/empty list” patterns with `useDataList` + `DataList` where applicable.
- Use a single shared status badge component (or `Badge` wrapper) across portals.

(No code was modified.)

