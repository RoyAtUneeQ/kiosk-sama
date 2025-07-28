# Frontend Refactor Plan

## Overview
This refactor plan aims to make the codebase more concise, maintainable, and performant while preserving all functionality. The focus is on reducing redundancy, improving component reusability, and following clean code principles.

## 🎯 Key Goals
- **Reduce code by ~30-40%** through deduplication and consolidation
- **Improve component reusability** with better abstractions
- **Enhance type safety** with stricter TypeScript usage
- **Optimize performance** through better state management
- **Simplify styling** with design tokens and utilities

---

## 📋 High-Priority Refactors

### 1. **Component Architecture Redesign**

#### 1.1 Split Large Components
**Problem**: `KioskPage.tsx` (296 lines) handles too many responsibilities

**Solution**: Extract into smaller, focused components
```
pages/kiosk/
├── KioskPage.tsx (main orchestrator, ~50 lines)
├── hooks/
│   ├── useKioskState.ts (centralized state)
│   └── useKioskEvents.ts (event handling)
└── components/
    ├── KioskMainView.tsx
    ├── KioskLoadingView.tsx
    └── KioskStartView.tsx
```

#### 1.2 Unify Button Components
**Problem**: Multiple button variants with duplicate logic

**Solution**: Create single `Button` component with variants
```typescript
// Before: Button.tsx (33 lines) + Button.scss (736 lines)
// After: Unified component with props-based variants (~150 lines total)

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'circle'
  size?: 'sm' | 'md' | 'lg'
  highlight?: boolean
  // ... other props
}
```

#### 1.3 Create Reusable Layout Components
**Solution**: Extract common layout patterns
- `<FlexContainer>` - Replace repeated flexbox patterns
- `<GridContainer>` - Standardize grid layouts
- `<ResponsiveWrapper>` - Handle breakpoint logic

### 2. **State Management Optimization**

#### 2.1 Centralize Kiosk State
**Problem**: State scattered across multiple components

**Solution**: Create unified state management
```typescript
// hooks/useKioskState.ts
interface KioskState {
  sessionState: SessionState
  remoteInfo: RemoteSessionInfo | null
  mediaContent: MediaContent
  ui: UIState
}

export const useKioskState = () => {
  // Centralized state with useReducer
  // Replace 8+ useState calls with 1 useReducer
}
```

#### 2.2 Optimize Hook Dependencies
**Problem**: Unnecessary re-renders and effect runs

**Solution**: 
- Add `useCallback` and `useMemo` where needed
- Optimize dependency arrays
- Split hooks by concern

### 3. **Styling System Overhaul**

#### 3.1 Design Token System
**Problem**: Inconsistent styling, 700+ lines in Button.scss

**Solution**: Create comprehensive design tokens
```scss
// styles/tokens/
├── colors.scss (replace CSS variables)
├── spacing.scss (standardize margins/paddings)
├── typography.scss (font scales)
├── shadows.scss (consolidate shadow styles)
└── animations.scss (reusable keyframes)
```

#### 3.2 Utility Classes
**Solution**: Create utility classes for common patterns
```scss
// utilities/
├── layout.scss (.flex, .grid, .center, etc.)
├── spacing.scss (.p-*, .m-*, etc.)
└── effects.scss (.highlight, .glow, etc.)
```

#### 3.3 Component-Specific Styles
**Target**: Reduce Button.scss from 736 to ~200 lines
- Extract animations to shared file
- Use utility classes for common patterns
- Simplify highlight effect implementation

---

## 📁 File Organization Improvements

### 4. **Feature-Based Structure**
**Current**: Organized by file type
**Proposed**: Organize by feature

```
src/
├── features/
│   ├── kiosk/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── index.ts
│   ├── remote/
│   ├── media/
│   └── instructions/
├── shared/
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── types/
└── core/
    ├── config/
    ├── i18n/
    └── providers/
```

### 5. **Type System Improvements**

#### 5.1 Eliminate `any` Types
**Current**: Some `any` usage in hooks and event handlers
**Solution**: Create proper type definitions

#### 5.2 Create Shared Type Utilities
```typescript
// types/utils.ts
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type StrictOmit<T, K extends keyof T> = Omit<T, K>
// ... other utility types
```

---

## 🚀 Performance Optimizations

### 6. **Bundle Size Reduction**

#### 6.1 Code Splitting
- Lazy load `RemotePage` component
- Split instruction generators into separate chunks
- Dynamic imports for heavy dependencies

#### 6.2 CSS Optimization
- Remove unused styles (estimated 20-30% reduction)
- Combine similar selectors
- Use CSS custom properties for dynamic values

### 7. **Runtime Performance**

#### 7.1 Memoization Strategy
```typescript
// Add memoization to expensive computations
const MicButton = memo(({ onStart, onStop, isListening }: MicButtonProps) => {
  const buttonClass = useMemo(() => getDesktopButtonClass(), [micPermission, hasRequestedPermission, isListening])
  const buttonText = useMemo(() => getButtonText(), [micPermission, hasRequestedPermission, isListening])
  // ...
})
```

#### 7.2 Event Handler Optimization
- Use `useCallback` for event handlers passed to children
- Debounce high-frequency events (resize, scroll)

---

## 📊 Expected Outcomes

### Code Reduction Targets:
- **Components**: 40% reduction (from ~1,500 to ~900 lines)
- **Styles**: 35% reduction (from ~2,000 to ~1,300 lines)
- **Hooks**: 25% reduction through consolidation
- **Types**: 20% reduction through better organization

### Performance Improvements:
- **Bundle size**: 20-25% smaller
- **Initial load**: 15-20% faster
- **Re-renders**: 30-40% reduction
- **Memory usage**: 15-20% lower

### Maintainability Gains:
- **Single responsibility**: Each component <100 lines
- **Consistent patterns**: Unified component APIs
- **Better testing**: Isolated, testable units
- **Easier debugging**: Clear separation of concerns

---

## 🛠 Implementation Strategy

### Phase 1: Foundation (Week 1)
1. Set up design token system
2. Create utility classes
3. Implement centralized state management

### Phase 2: Component Refactor (Week 2)
1. Refactor Button components
2. Split KioskPage into smaller components
3. Create reusable layout components

### Phase 3: Optimization (Week 3)
1. Add memoization and callbacks
2. Implement code splitting
3. Optimize styles and remove unused code

### Phase 4: Testing & Polish (Week 4)
1. Comprehensive testing of refactored components
2. Performance testing and optimization
3. Documentation updates

---

## 🔍 Specific File Targets

### High-Impact Files (Immediate attention):
- `KioskPage.tsx` → Split into 4-5 smaller components
- `Button.scss` → Reduce from 736 to ~200 lines
- `MicButton.tsx` → Simplify logic and extract hooks
- `useUneeq.tsx` → Split into smaller, focused hooks

### Medium-Impact Files:
- `Loading.tsx` → Simplify animation logic
- `LeftSideBar.tsx` → Extract button configuration
- `RemotePage.tsx` → Add code splitting

### Low-Impact Files (Later phases):
- Translation hooks → Minor optimization
- Type definitions → Better organization
- Utility functions → Consolidation

---

## ✅ Success Metrics

- [ ] Total line count reduced by 30%+
- [ ] Bundle size reduced by 20%+
- [ ] Component files average <100 lines
- [ ] Style files average <300 lines
- [ ] No `any` types in critical paths
- [ ] All components properly memoized
- [ ] Performance budget met (FCP <1.5s)

This refactor plan balances aggressive optimization with practical implementation, ensuring the codebase becomes significantly more maintainable while preserving all existing functionality.
