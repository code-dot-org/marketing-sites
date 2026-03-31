# Security And Privacy Guardrails

## Authority First

The official [Code.org Privacy Policy](https://code.org/en-US/privacy) always
takes precedence over this document and any local engineering convention. If
there is any conflict, ambiguity, or missing guidance here, follow the official
privacy policy and escalate for review instead of guessing.

## Purpose

This repository serves a high-traffic public website for an education nonprofit.
Security and privacy are product requirements. They are also policy and legal
requirements because Code.org handles school-linked users and may process data
that falls under FERPA and similar student privacy laws.

This document translates the official
[Code.org Privacy Policy](https://code.org/en-US/privacy) into engineering
guardrails for contributors working in this monorepo.

## Policy Baseline

The official [Code.org Privacy Policy](https://code.org/en-US/privacy) says,
among other things, that Code.org:

- is committed to a safe and secure learning environment for students and
  teachers
- minimizes personal data collection
- does not sell personal information or use it for ads
- uses physical, administrative, and technical safeguards
- treats School-provided Student Records according to school direction
- holds partners and service providers to privacy and security practices no less
  stringent than its own

The policy also says Student Records may be covered by FERPA or similar student
privacy laws, and that Code.org implements controls and procedures to help
schools address those obligations.

## Engineering Guardrails

### 1. Default to data minimization

- Do not introduce new collection of personal data unless there is a documented
  product need and approved downstream handling.
- Collect the smallest amount of data needed to ship the feature.
- Prefer anonymous, aggregated, or de-identified signals over user-level data
  when the product outcome allows it.
- Do not add fields just because they might be useful later.

### 2. Treat student data as restricted by default

- Assume Student Records, school-directed data, and under-13 user data need
  heightened scrutiny.
- If a change may touch Student Records or school-linked user flows, document
  that risk in the spec and plan before implementation.
- Do not proceed on assumption alone when FERPA, school agreements, or similar
  student privacy requirements may apply.
- Escalate to the appropriate privacy, legal, security, or product owner when
  the policy impact is unclear.

### 3. No ads, sale, or surprise data sharing

- Do not add targeted advertising behavior.
- Do not add code that sells, rents, or grants third parties rights to personal
  data for their own marketing purposes.
- Do not share personal data with donors, sponsors, or other external parties
  unless there is an explicit, documented, policy-aligned opt-in path.
- New third-party integrations must document owner, purpose, data sent
  externally, consent category, and failure mode.

### 4. Protect secrets and security boundaries

- Keep secrets, tokens, cookies, and credentials out of source control, logs,
  Storybook stories, screenshots, and test fixtures.
- Preserve existing protections on preview, draft, redirect, and revalidation
  routes.
- Do not weaken HTTPS, HSTS, CSP, or other existing header-based protections
  without matching review and tests.
- Treat client-side expansion of privileged behavior as a security change.

### 5. Keep logs and analytics privacy-safe

- Do not log raw personal data, Student Records, passwords, tokens, or
  user-generated student content.
- Redact or hash identifiers where operationally possible.
- Analytics, telemetry, and experimentation changes must document what data is
  emitted and why it is needed.
- Consent-gated integrations must stay behind the correct consent boundary.

### 6. Use synthetic data in development surfaces

- Storybook stories, Contentful entries, test fixtures, screenshots, and docs
  must use synthetic or redacted data.
- Do not place real student, teacher, parent, donor, or support-request data in
  mocks, snapshots, demo content, or visual-review artifacts.
- If a flow needs realistic examples, model the structure without using real
  identities or contact details.

### 7. Be explicit about user input and retention

- New forms or user-input surfaces must document each field collected, where it
  is stored, who receives it, and how it is deleted or retained.
- If a feature changes retention or deletion behavior, document that in the
  spec and plan and update the relevant product and operational docs.
- Prefer existing approved collection paths over inventing a new one.

## Review Checklist

Before merge, confirm:

- the change does not introduce unnecessary personal-data collection
- no real personal data appears in code, content, tests, or Storybook
- third-party data sharing and consent behavior are explicit
- security-sensitive routes and headers remain protected
- FERPA/student-record implications were identified if relevant
- privacy and security owners were consulted when the impact was unclear

## Official Reference

- [Code.org Privacy Policy](https://code.org/en-US/privacy)
