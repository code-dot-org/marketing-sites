# Contributing to the Component Library

Thank you for considering contributing to the Component Library! 🎉  
We welcome all contributions — whether it’s a bug fix, feature request, documentation improvement, or something else
entirely.  
This guide will help you get started quickly and ensure a smooth contribution process. To get full picture of
the project, please refer to the [README.md](./README.md) file.

## Table of Contents

- [🛣️ Contribution Roadmap](#-contribution-roadmap)
- [🧑‍💻 How to Add a New Component](#-how-to-add-a-new-component)
- [🚦 Component Statuses & Production Checklist](#-component-statuses--production-checklist)
- [🎯 Coding Standards](#-coding-standards)
- [🧪 How to Test Your Component](#-how-to-test-your-component)
- [📚 Need Help?](#-need-help)
- [💡 Tips for a Smooth PR Review](#-tips-for-a-smooth-pr-review)
- [✅ How to Get Your PR Approved Faster](#-how-to-get-your-pr-approved-faster)

## 🛣️ Contribution Roadmap

Here’s a quick guide to the contribution process:

1. **(The most important step!) Create a thread** in `#ask-design-system` Slack channel about your change.

   - **Get approval** from @markabarrett and/or @moshebaricdo (design team).
   - For technical details, ask @levadadenys.

2. **Create a separate PR** with `@code-dot-org/component-library` code changes.

   - Make sure the PR follows the [Best Practices](./README.md/#best-practices).
   - Include test cases and Storybook updates where applicable.

3. **Get it approved** by:

   - ✅ @moshebaricdo and/or @markabarrett (design)
   - ✅ @levadadenys (technical implementation)

4. **Merge the PR** once approved.

5. **Use it in your code → Celebrate → Collect tons of appreciation!** 🎉

## 🧑‍💻 How to Add a New Component

1. **Create a new component** in `src/componentLibrary`.
2. Follow the component structure (see any component for example, for best result - see at least couple components)
   and [Best Practices](./README.md/#best-practices).
3. Add a Storybook story under `stories/`.
4. Write unit tests using Jest + RTL.
5. Ensure accessibility using `axe` and screen readers.
6. Submit a PR following the [Contribution Roadmap](#-contribution-roadmap).

## 🚦 Component Statuses & Production Checklist

To give a better understanding of components state/status and which one can and can not be used we've introduced
a complete `production-ready checklist` and different `statuses` that's applicable to every new and
existing Design System component.

### Production-ready Checklist:

- Implementation of component approved by design team;
- Covered with Storybook stories and documentation;
- Has tests: test every prop, every state and every interaction that's js related
- Passes accessibility checks (see [README Accessibility Section](./README.md#-accessibility)).;

### Possible component Statuses:

- `WIP` - Work in progress, not ready for usage in production;
- `Ready for dev` - Component is ready for development, has most of the functionality implemented but might not yet
  pass all production ready checklist criteria or might have some visual changes;
- `Stable` - Component is ready for production, passes all production ready checklist criteria;
- `DEPRECATED` - Component is deprecated and should not be introduced in new pages but may be maintained in existing
  codebases for backward compatibility;

To keep track of those two metrics simply go to component and check the top of its `JSDoc comment`
or open `storybook's docs tab`.

Here's an example/template for better understanding:

````jsx
/**
 * ### Production-ready Checklist:
 * * (✔) implementation of component approved by design team;
 * * (✔) has storybook, covered with stories and documentation;
 * * (✘) has tests: test every prop, every state and every interaction that's js related;
 * * (?) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 * Design System: Some Component.
 * Some description goes here...
 */
const SomeComponent = props => {
  // ...
};
````

This information should always be on the top of the component's documentation. Once component status is set
to `Stable` or `DEPRECATED` you can remove ` * ### Production-ready Checklist`. Example:

````jsx
/**
 * ###  Status: ```Stable```
 * Design System: Some Component.
 * Some description goes here...
 */
const SomeComponent = props => {
  // ...
};
````

## 🎯 Coding Standards

✅ Use **TypeScript** for type safety.  
✅ Follow the [Best Practices](./README.md#best-practices) section in the README.  
✅ Use **semantic colors** from `@code-dot-org/component-library-styles/colors.scss` where possible.  
✅ Ensure components are tested using Jest + RTL.  
✅ Follow the [Styling Guidelines](./README.md#styling) to avoid CSS specificity issues.

## 🧪 How to Test Your Component

1. **Unit Tests** — Write tests using Jest + RTL.
2. **Storybook Tests** — Ensure Storybook displays the component correctly.
3. **Accessibility Tests** — Run Axe tests and verify with a screen reader.
4. **Visual Regression Tests** — Ensure the component appears correctly in all supported themes.

➡️ See the full [Testing Guide](./README.md#testing) in the README.

## 📚 Need Help?

If you need help at any point, reach out to:

- `#ask-design-system` Slack channel
- @moshebaricdo, @markabarrett for design questions
- @levadadenys for technical implementation questions

## 💡 Tips for a Smooth PR Review

✅ Keep the PR focused on **one feature or fix**.  
✅ Add **clear, descriptive commit messages**.  
✅ Add screenshots or recordings to demonstrate UI changes.  
✅ Use `Draft PR` if the feature is still a work in progress.

✅ Keep PRs under 500 lines where possible (large PRs are harder to review — if necessary,
break them into smaller PRs). Of course, if it’s a PR adding a completely new component or major feature,
larger PRs are acceptable.

## ✅ How to Get Your PR Approved Faster

- If there’s no response after **48 hours**, politely ping the reviewer in Slack.
- If you receive feedback, **respond within 24–48 hours** to keep the momentum going.
- Make sure all **CI tests** are passing before requesting a review.

## 🙌 Thank you for helping improve the Code.org Design System (@code-dot-org/component-library)!
