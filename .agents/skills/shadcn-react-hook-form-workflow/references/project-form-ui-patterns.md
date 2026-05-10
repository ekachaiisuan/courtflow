# Project Form UI Patterns

Use these files as the primary references for form composition in this repo.

## Shared React Hook Form Wrapper Style

- `components/ui/form.tsx`
  Canonical `Form`-based wrapper pattern:
  - `Form`
  - `FormField`
  - `FormItem`
  - `FormLabel`
  - `FormMessage`

Use this when a feature already follows the compact app-style form composition.

## Shared Field Layout Style

- `components/ui/field.tsx`
  Canonical `Field`-based layout pattern:
  - `Field`
  - `FieldGroup`
  - `FieldLabel`
  - `FieldDescription`
  - `FieldSeparator`
  - `FieldError`

Use this when the form needs richer card layout, descriptions, grouped sections, or auth-page presentation.

## Compact Form Wrappers

- `components/forms/form-input.tsx`
- `components/forms/form-submit.tsx`
- `components/forms/form-errors.tsx`
- `lib/form-utils.ts`

These files support the compact app-form pattern used in board and dashboard areas.

Notable conventions:
- `FormInput` wraps `Input` with label and shared error rendering
- `FormSubmit` wraps the submit button with consistent width and variant support
- `formatFormErrors` adapts React Hook Form errors into the shape expected by `FormErrors`

## Auth Form Pattern

- `components/forms/login-form.tsx`
- `components/forms/signup-form.tsx`
- `components/forms/forgot-password-form.tsx`

These forms show the auth-page pattern:
- `Controller`
- `Field` plus `FieldGroup`
- inline `FieldError`
- card-based layout
- loading state with `Spinner`

Use this style for user-facing auth and onboarding forms unless nearby code suggests otherwise.

## App Form Pattern

- `app/dashboard/_components/board-create-form.tsx`
- `app/board/[boardId]/_components/list/list-form.tsx`
- `app/board/[boardId]/_components/board-name-form.tsx`

These forms show the compact app pattern:
- `Form` plus `FormField`
- `FormInput`
- `FormSubmit`
- local mutation handlers
- tighter inline layout

Use this style for board, list, card, and dashboard forms.

## Selection Rule

When adding a form:

1. inspect nearby forms in the same route or feature area
2. choose either the `Field` family or the `Form` family
3. keep that choice consistent within the form
4. reuse existing wrappers before building a new one
