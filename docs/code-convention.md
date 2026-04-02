# Code Convention

Use this document for repo-wide code maintainability guidance that applies
beyond any single framework or UI surface.

## Comments And JSDoc

- Follow the existing repo style: keep comments selective, but add them
  wherever behavior is not obvious from the code alone.
- Prefer short explanatory `//` comments for non-obvious logic, edge cases,
  browser quirks, validation rules, and maintenance notes. Avoid narrating
  routine assignments or obvious control flow.
- Use valid JSDoc on exported props, interfaces, helper APIs, and data
  contracts when it adds durable meaning for editors and future maintainers.
- If code includes a workaround, third-party limitation, or accessibility shim,
  add a brief comment explaining why it exists and what constraint it
  satisfies.
- Keep comments accurate and local to the behavior they describe; update or
  remove them as part of the same change when behavior evolves.
