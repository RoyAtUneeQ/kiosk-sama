# Styles

Styling follows a component-scoped SCSS approach, powered by CSS custom properties for theme tokens and dedicated breakpoint mixins.

## Key files
- `src/styles/reset.scss`: opinionated reset for consistent baselines.
- `src/styles/base.scss`: theme variables, global layout, and shared effects.
- `src/styles/breakpoints.scss`: mixins like `@include smartphone`, `@include tablet-and-smartphone`, `@include holobox`.

## Component styles
Each component has a sibling `.scss` co-located with its `.tsx` to keep view logic and skin together, e.g., `Button.scss`, `Panel.scss`, `Loading.scss`.

## Rationale
- Co-location scales: styles evolve with components.
- CSS variables enable runtime theming; SCSS mixins provide ergonomic responsive design.