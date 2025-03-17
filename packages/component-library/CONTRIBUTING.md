# Contributing to the Component Library

Thank you for considering contributing to the Component Library! 🎉  
We welcome all contributions — whether it’s a bug fix, feature request, documentation improvement, or something else entirely.  
This guide will help you get started quickly and ensure a smooth contribution process.

## Table of Contents

- [🛣️ Contribution Roadmap](#-contribution-roadmap)
- [🧑‍💻 How to Add a New Component](#-how-to-add-a-new-component)
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
✅ Keep PRs under **500 lines** where possible (large PRs are harder to review).  
✅ Add screenshots or recordings to demonstrate UI changes.  
✅ Use `Draft PR` if the feature is still a work in progress.

## ✅ How to Get Your PR Approved Faster

- If there’s no response after **48 hours**, politely ping the reviewer in Slack.
- If you receive feedback, **address it quickly** to keep the momentum going.
- Make sure all **CI tests** are passing before requesting a review.

## 🙌 Thank you for helping improve the Code.org Design System!
