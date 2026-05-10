---
name: shadcn-react-hook-form-workflow
description: Build or update forms in this repository using its Shadcn UI and React Hook Form patterns. Use when creating a new form, choosing between the repo's two form composition styles, wiring Zod validation, rendering field errors, or keeping form UX consistent across auth, dashboard, board, and profile features.
---

# Shadcn React Hook Form Workflow

Follow this skill when work touches form UI, React Hook Form integration, Zod validation, or reusable form composition in this repository.

## Load References

Read `references/project-form-ui-patterns.md` before editing when the task involves:
- adding a new form
- choosing between `Field` and `FormField` composition styles
- adding validation messages
- building reusable field wrappers
- aligning a form with auth or board/dashboard conventions

## Important Context

This repo uses two valid form composition styles:
- `Field` plus `FieldGroup` plus `FieldError` with `Controller`
- `Form` plus `FormField` plus `FormInput` plus `FormSubmit`

Do not collapse them into one style blindly. Match the feature area's existing pattern.

## Core Workflow

1. Identify the surrounding feature area.
   Check whether the form belongs to auth pages, profile pages, or board and dashboard flows.
2. Choose the matching composition style.
   Follow the form API already dominant in that area instead of mixing styles arbitrarily.
3. Define the schema with Zod first.
   Keep validation close to the form and infer the TypeScript form values from the schema.
4. Create the form with React Hook Form.
   Use `useForm` with `zodResolver` and explicit `defaultValues`.
5. Render fields with the repo's preferred wrappers.
   Use either the `Field` family or the `FormField` family consistently within the same form.
6. Keep submit and error UX consistent.
   Reuse the repo's loading, disabled, inline error, and toast patterns.
7. Keep mutation wiring separate from form composition.
   Let the form own inputs and validation, while the mutation layer handles side effects and data writes.

## Composition Rules

- Prefer `Field` plus `FieldGroup` plus `FieldError` with `Controller` in auth-style and richer marketing or card-based forms.
- Prefer `Form` plus `FormField` plus `FormInput` plus `FormSubmit` in compact app forms such as board and dashboard interactions.
- Do not mix `FieldError` and `FormErrors` in the same field path unless there is a strong reason.
- Keep field IDs, labels, and error rendering aligned so accessibility attributes stay correct.

## Implementation Rules

- Use `useForm` from React Hook Form.
- Use `zodResolver` for schema-backed validation.
- Infer form types with `z.infer<typeof schema>`.
- Set `defaultValues` explicitly.
- Prefer `Controller` when using the `Field`-based style.
- Prefer `FormField` render props when using the `Form`-based style.
- Reuse shared wrappers before creating another custom field component.
- Keep field-level styling in the shared form or field components when possible.

## Style Selection Heuristics

- Use the `Field` style when:
  - the form is auth-focused
  - the layout is card-based or marketing-like
  - the form needs `FieldDescription`, `FieldSeparator`, or richer grouped layout

- Use the `Form` style when:
  - the form is compact and app-internal
  - the UI sits inside board, list, card, or dashboard flows
  - the feature already uses `FormInput` and `FormSubmit`

- If uncertain:
  - match nearby forms in the same route area
  - keep one consistent composition style per form

## Error Handling Conventions

- For `Field`-based forms, render `FieldError` from `fieldState.error`.
- For `Form`-based forms, use shared helpers like `formatFormErrors` and `FormErrors` when that pattern is already in use.
- Keep error messages short, user-facing, and field-specific.

## Review Checklist

- form style matches the feature area
- Zod schema and `z.infer` stay aligned
- `defaultValues` are explicit
- fields use shared wrappers instead of ad hoc markup
- validation errors render in the established local style
- submit state disables the correct controls
- mutation logic stays separate from field composition

## Security Note

This skill governs form UI composition and client validation. Combine it with `server-actions-form-workflow`, `better-auth-rbac-workflow`, or `nextjs-trpc-tanstack-workflow` when the form also changes mutation or authorization behavior.
