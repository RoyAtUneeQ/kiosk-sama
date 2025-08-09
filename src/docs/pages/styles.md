## Styles

Styling follows component‑scoped SCSS, aided by CSS variables and responsive mixins.

### Key files
- `src/styles/reset.scss`: opinionated reset for consistent baselines.
- `src/styles/base.scss`: theme tokens, global layout, shared effects.
- `src/styles/breakpoints.scss`: mixins like `@include smartphone`, `@include tablet-and-smartphone`, `@include holobox`.

### Component styles
Each component co‑locates a `.scss` file with its `.tsx` (e.g., `Button.scss`, `Panel.scss`, `Loading.scss`) for cohesion and maintainability.

### Rationale
- Co‑location scales: styles evolve with components.
- CSS variables enable runtime theming; SCSS mixins keep responsive design ergonomic.