# FORM AUDIT REPORT

## Scope
- Audited files:
  - `frontend/src/pages/auth/AuthFlow.tsx`
  - `frontend/src/pages/student/StudentPortal.tsx`
  - `frontend/src/auth-integration/screens/LoginScreen.tsx`
  - `frontend/src/auth-integration/screens/RegisterScreen.tsx`
- Focus: all visible form-like screens and input submission flows in the current frontend codebase.
- Note: `frontend/src/App.tsx` currently uses `AuthFlow` for initial access, then routes to role-based portals such as `StudentPortal`.

## Active runtime form surfaces
### 1. Auth flow (`frontend/src/pages/auth/AuthFlow.tsx`)

#### a. Role Selection
- Fields: role buttons only.
- Validation: `Continue` button disabled until a role is selected.
- Missing rules: none obvious for this screen.
- Notes: good gating on selection, but no explicit form semantics.

#### b. Login Screen
- Fields:
  - Email Address
  - Password
- Validation:
  - no explicit state validation is performed before `handleLogin` runs.
  - `PrimaryButton` is always enabled; blank email/password can be submitted.
- Missing rules:
  - required field enforcement
  - email format validation
  - disable action when fields are empty
- Navigation risk: user can attempt login with empty fields.

#### c. Forgot Password
- Fields:
  - Registered Email
- Validation:
  - no required or format validation before sending OTP.
  - user can click `Send OTP` with an empty or invalid value.
- Missing rules:
  - required email enforcement
  - email format check
- Navigation risk: OTP flow may start with invalid input.

#### d. OTP Verification
- Fields: 6-digit OTP inputs.
- Validation:
  - `Verify OTP` is disabled until all 6 digits are filled.
  - input restricts non-digit characters.
- Missing rules: no actual OTP format beyond presence, but reasonable for UI.
- Notes: this is the strongest gating in AuthFlow.

#### e. Reset Password
- Fields:
  - New Password
  - Confirm Password
- Validation:
  - password length and match are enforced by `valid`.
  - `Reset Password` button is disabled unless `pass.length >= 8` and passwords match.
  - mismatch error shown if confirm differs.
- Missing rules:
  - no explicit validation for at least one uppercase/digit beyond UI hints (the strength rules are advisory, not gating).
- Notes: good basic reset enforcement.

#### f. Registration step screens (Reg1–Reg5)
- Reg1 Personal Details
  - fields: full name, DOB, gender, mobile, alt number, blood group.
  - validation: none; `Continue` always enabled.
  - missing: required values, format checks for DOB/mobile, explicit field validation.
- Reg2 Academic Details
  - fields: college, course, academic year, roll number, hostel preference, room number.
  - validation: none; `Continue` always enabled.
  - missing: required/selection validation.
- Reg3 Parent Details
  - fields: father/mother name, father/mother phone, occupation, address, city, state.
  - validation: none; `Continue` always enabled.
  - missing: phone format, required parent contact enforcement.
- Reg4 Emergency Contacts
  - fields per contact: name, relation, phone.
  - validation: none; `Continue` always enabled.
  - missing: enforcement of at least 2 contacts, required name/phone per contact, phone format.
- Reg5 Document Upload
  - controls: clickable upload tiles for required documents.
  - validation: `Submit Application` is disabled until all required documents are marked done.
  - missing: none obvious for required-doc gating.
- Notes: the first 4 registration steps expose many required-like fields but have no enforcement.

#### g. Profile / Face Enrollment
- Fields: editable bio textarea only.
- Validation: none needed for a free-text bio.
- Notes: not a formal submission form.

## Secondary form components (present but not currently active in runtime)
### `frontend/src/auth-integration/screens/LoginScreen.tsx`
- Contains a proper `<form>` wrapper.
- Fields: email, password.
- Uses `required` on both inputs.
- Validation: browser-native required checks and email type validation if the form were used.
- Notes: this component is structurally sound, but it appears separate from the active `AuthFlow` login UI.

### `frontend/src/auth-integration/screens/RegisterScreen.tsx`
- Contains a proper `<form>` wrapper.
- Fields: name, email, password.
- Uses `required` on all inputs.
- Validation: browser-native required checks and email type validation.

## Student portal form surfaces (`frontend/src/pages/student/StudentPortal.tsx`)

### a. Leave Request
- Fields:
  - Reason for Leave (select)
  - Start Date (date)
  - End Date (date)
  - Destination Address
  - Emergency Contact
  - Additional Details (textarea)
  - Supporting Document attachment area
- Validation:
  - none enforced in code.
  - submit button simply sets `submitted` true.
- Missing rules:
  - `Reason` required enforcement
  - `Start Date`/`End Date` required enforcement and date range validation
  - `Destination Address` required enforcement
  - `Emergency Contact` required enforcement and phone format validation
  - optional doc upload submission behavior
- Navigation risk: can submit an empty/partial leave request.

### b. Curfew Extension
- Fields:
  - Requested Return Time
  - Date
  - Reason textarea
- Validation:
  - none enforced; `Submit Request` sets state unconditionally.
- Missing rules:
  - all fields should be required
  - reason length or non-empty validation
- Navigation risk: blank request submission.

### c. Maintenance Request / Complaint
- Fields:
  - Complaint Type (button group)
  - Priority (select)
  - Description textarea
  - optional photo evidence upload
- Validation:
  - `Complaint Type` defaults to `Plumbing` and is always selected.
  - `Priority` has a default option.
  - description textarea has no required enforcement.
- Missing rules:
  - require non-empty description
  - optionally enforce photo evidence for certain priorities
- Navigation risk: submits with no issue description.

### d. Laundry Request
- Fields:
  - counts for item categories (Shirts, Pants, Bedsheets, Blankets, Towels, Others)
  - pickup time options
- Validation:
  - submit allows only when total item count > 0.
  - pickup time options are rendered visually, but there is no state or actual selection logic except a hard-coded visual highlight on index 2.
- Missing rules:
  - ensure pickup time selection is truly selectable and stored
  - enforce at least one item plus valid pickup slot if required
- Notes: this is the strongest student portal enforcement outside auth flow, but its pickup UI is only visual.

### e. Visitor Request
- Fields:
  - Visitor Name
  - Relation select
  - Purpose of Visit
  - Visit Date
  - Visit Time
- Validation:
  - none enforced; `Submit Request` sets `submitted` true regardless of field contents.
- Missing rules:
  - require visitor name, purpose, date, and time
- Navigation risk: empty visitor request submission.

### f. Feedback
- Fields:
  - Category select
  - Rating buttons
  - Comment textarea
  - anonymous toggle
- Validation:
  - no enforcement on rating or comments.
  - category is always defaulted and therefore present.
- Missing rules:
  - enforce a rating if rating should be mandatory
  - optionally require comment text for low ratings
- Notes: lower priority but still should verify whether zero-rating submissions are acceptable.

## Summary of validation coverage
- Strong gating:
  - `OTPScreen` requires full OTP entry
  - `ResetScreen` requires password length + confirmation match
  - `Reg5` document upload enforces required docs
  - `LaundryRequestScreen` requires at least one item
- Weak or missing gating:
  - `LoginScreen` in AuthFlow has no enforced required fields
  - `ForgotScreen` has no required/format check
  - Registration step screens have no enforcement
  - Leave/Curfew/Visitor/Maintenance/Feedback screens all allow unconditional submission
- Form semantics:
  - `frontend/src/auth-integration/screens/*` uses proper HTML form semantics and browser validation; the active `AuthFlow` screens do not.

## Priority order for implementation
1. Fix active auth entry screens:
   - `AuthFlow` login validation
   - `AuthFlow` forgot password email checks
2. Harden student request submission screens:
   - `LeaveRequestScreen`
   - `VisitorScreen`
   - `CurfewScreen`
   - `MaintenanceScreen`
3. Add multi-step registration validation in `AuthFlow`:
   - require key personal/academic/guardian fields before continuing
   - enforce emergency contact count and required details
4. Improve laundry request UX validation:
   - make pickup time selection stateful
   - keep `Submit` disabled until required choices are complete
5. Review feedback form rules:
   - confirm whether zero rating or empty comments are allowed
6. Keep current good gating:
   - OTP verification
   - reset password matching
   - required document upload gating

## Recommendations
- Convert critical screens to real `<form>` structures or explicit validation state with disabled buttons.
- Use consistent required field indicators plus runtime enforcement for all `*`-marked fields.
- Prefer controlled state validation over only visual cues.
- Audit any additional portal screens outside `StudentPortal` if the app later routes into parent/warden/admin portals.
