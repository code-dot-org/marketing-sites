# Feature Specification: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]`  
**Created**: [DATE]  
**Status**: Draft  
**Input**: User description: "$ARGUMENTS"

## User Scenarios & Testing _(mandatory)_

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.

  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - [Brief Title] (Priority: P1)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently - e.g., "Can be fully tested by [specific action] and delivers [specific value]"]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]
2. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 2 - [Brief Title] (Priority: P2)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 3 - [Brief Title] (Priority: P3)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right edge cases.
-->

- What happens when [boundary condition]?
- How does system handle [error scenario]?
- How does the change behave across affected tenants, locales, and content
  states?
- What is the fallback behavior when analytics, telemetry, or third-party
  integrations are unavailable?
- What is the availability impact if a dependency is slow, down, or partially
  misconfigured?
- How are preview, draft, security, or cache boundaries preserved?
- Does the feature collect, expose, transform, or transmit personal data,
  Student Records, or school-directed data, and if so what privacy-policy or
  FERPA guardrails apply?
- Which parts of the feature remain server-rendered, and which parts, if any,
  require a minimized client-only boundary?

## Requirements _(mandatory)_

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST [specific capability, e.g., "allow users to create accounts"]
- **FR-002**: System MUST [specific capability, e.g., "validate email addresses"]
- **FR-003**: Users MUST be able to [key interaction, e.g., "reset their password"]
- **FR-004**: System MUST [data requirement, e.g., "persist user preferences"]
- **FR-005**: System MUST [behavior, e.g., "log all security events"]
- **FR-006**: Specification MUST identify which shared packages, app surfaces, or
  content models are affected and whether the change belongs in a reusable layer.
- **FR-007**: Specification MUST define the required validation surfaces for the
  change, including Storybook, page previews, unit tests, integration tests,
  end-to-end tests, or visual checks as applicable.
- **FR-008**: Specification MUST state any accessibility, localization, tenant,
  observability, privacy, or third-party data-handling requirements relevant to
  the feature.
- **FR-009**: Specification MUST identify affected runtime flows and integration
  points, including middleware, Contentful fetch/registration, providers,
  caching or revalidation, and deployment or infrastructure contracts when
  applicable.
- **FR-010**: Specification MUST define any performance, cache, SEO, consent, or
  security expectations that the feature must preserve or improve.
- **FR-011**: New React component requirements MUST state whether the change
  belongs in the shared design system or the higher-level marketing layer, and
  MUST preserve the MUI-based component stack.
- **FR-012**: Specification MUST identify the server-rendered path for the
  feature and explicitly justify any required client-only execution,
  browser-only dependency, or hydration boundary.
- **FR-013**: Specification MUST identify any Code.org Privacy Policy impact,
  including data minimization, consent/opt-in expectations, third-party data
  sharing, and whether Student Records or FERPA-like obligations may apply.
- **FR-014**: When Contentful schema or entry structure matters to the feature,
  specification and follow-on research MUST identify what was confirmed through
  Contentful MCP and what remains application-code inference.
- **FR-015**: If the feature may require Contentful writes, the specification
  MUST define the human confirmation step, describe the proposed change for a
  human to apply or approve, and require a re-read of the resulting Contentful
  state.
- **FR-016**: Specification MUST identify any SEO impact, including page-level
  metadata, canonical behavior, indexing behavior, structured data, and whether
  sitemap behavior changes or remains covered by the existing Experience-page
  sitemap flow.

_Example of marking unclear requirements:_

- **FR-017**: System MUST authenticate users via [NEEDS CLARIFICATION: auth method not specified - email/password, SSO, OAuth?]
- **FR-018**: System MUST retain user data for [NEEDS CLARIFICATION: retention period not specified]

## Integration Points _(mandatory when external systems or cross-workspace changes are involved)_

### Systems and Contracts

- **Upstream Inputs**: [e.g., Contentful entry types, middleware path inputs,
  browser cookies, environment variables]
- **Downstream Effects**: [e.g., cache tags, analytics events, SEO metadata,
  redirects, third-party scripts]
- **Runtime Surfaces**: [e.g., Next route handlers, layout providers, Storybook
  stories, shared packages, CI workflows]
- **Tenant / Hostname Paths**: [e.g., `http://[brand].marketing-sites.localhost:3001`,
  `http://preview-[brand].marketing-sites.localhost:3001`]

### Data Flow Notes

- [Describe the request or data flow that this feature extends or changes]
- [Call out failure modes, graceful degradation, or consent boundaries]
- [Call out any availability, caching, security, privacy-policy, or SSR guardrails that must remain intact]
- [Call out which Contentful content types, entries, or assets were confirmed via MCP if applicable]
- [Call out whether any Contentful changes are read-only analysis, human-applied changes, or human-confirmed writes followed by MCP re-read]
- [Call out SEO metadata, canonical, indexing, structured-data, and sitemap expectations]

### Key Entities _(include if feature involves data)_

- **[Entity 1]**: [What it represents, key attributes without implementation]
- **[Entity 2]**: [What it represents, relationships to other entities]

## Success Criteria _(mandatory)_

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: [Measurable metric, e.g., "Users can complete account creation in under 2 minutes"]
- **SC-002**: [Measurable metric, e.g., "System handles 1000 concurrent users without degradation"]
- **SC-003**: [User satisfaction metric, e.g., "90% of users successfully complete primary task on first attempt"]
- **SC-004**: [Business metric, e.g., "Reduce support tickets related to [X] by 50%"]

## Assumptions

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right assumptions based on reasonable defaults
  chosen when the feature description did not specify certain details.
-->

- [Assumption about target users, e.g., "Users have stable internet connectivity"]
- [Assumption about scope boundaries, e.g., "Mobile support is out of scope for v1"]
- [Assumption about data/environment, e.g., "Existing authentication system will be reused"]
- [Dependency on existing system/service, e.g., "Requires access to the existing user profile API"]
- [Assumption about affected workspaces, e.g., "Shared component-library changes are
  preferred over app-only forks unless explicitly justified"]
- [Assumption about runtime contracts, e.g., "Existing cache headers and
  revalidation windows remain unchanged unless explicitly called out"]
- [Assumption about rendering model, e.g., "Existing server-rendered behavior
  remains intact and any client-only boundary will be isolated and justified"]
- [Assumption about privacy posture, e.g., "No new Student Records, personal
  data collection, or third-party data sharing is introduced unless explicitly
  specified and reviewed"]
