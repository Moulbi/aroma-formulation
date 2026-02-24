# CLAUDE.md

## Build & Run Commands

```bash
npm install          # Install dependencies
npm run dev          # Dev server (Vite)
npm run build        # Production build to /dist
npm run preview      # Preview production build
```

## Architecture

**Aroma Formulation** — React 18 + Vite SPA for lab formulation sheets (PremiumGoods aromatic department). No backend; data persists in localStorage under key `aroma-formulation`. UI in French.

### State Management

Single global store via Context API + useReducer in `src/contexts/FormulationContext.jsx`. All components access state through `useFormulation()` hook. State auto-saves to localStorage on every change.

### Key Source Layout

- `src/contexts/FormulationContext.jsx` — Global state, reducer, persistence
- `src/data/constants.js` — Default raw materials, sensory presets, EU classifications, dilution options
- `src/utils/calculations.js` — Pure calculation functions (QSP, cost, density, vanillin, EU classification)
- `src/utils/persistence.js` — localStorage save/load
- `src/components/` — React components organized by domain (ingredients, trials, analysis, sensory, weighing)
- `src/styles/globals.css` — Light lab theme using CSS variables

### Conventions

- **IDs**: Generated as `'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9)`
- **Dates**: ISO strings, displayed with French locale (fr-FR)
- **CSS**: BEM-like naming, CSS variables for theming, light lab theme
- **Components**: Functional with hooks, `.jsx` extension
- **State**: All calculations are derived via useMemo, not stored in state
