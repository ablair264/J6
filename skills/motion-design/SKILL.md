---
name: motion-design
description: Add refined micro-interactions and animations to React interfaces. Use when implementing transitions, loading states, hover effects, or page animations with performance in mind.
---

Guide creation of subtle, purposeful motion using React and Tailwind. Focus on animations that enhance usability without distraction.

## Motion Philosophy

- **Purposeful**: Every animation should communicate something
- **Subtle**: Motion should feel natural, not theatrical
- **Fast**: Most transitions under 200ms; complex sequences under 500ms
- **Consistent**: Same timing functions throughout the interface

## Tailwind Transitions

Use built-in transition utilities for simple effects:

```tsx
// Hover states
<button className="transition-colors duration-150 hover:bg-slate-100">
  Hover me
</button>

// Scale on hover
<div className="transition-transform duration-200 hover:scale-[1.02]">
  Card content
</div>

// Opacity fade
<div className="opacity-0 transition-opacity duration-300 group-hover:opacity-100">
  Revealed content
</div>
```

## Timing & Easing

Match timing to the action:

```tsx
// Quick feedback (buttons, toggles)
className="duration-150 ease-out"

// Smooth transitions (modals, panels)
className="duration-300 ease-in-out"

// Entrance animations
className="duration-500 ease-out"
```

## Entrance Animations

Stagger elements for polished page loads:

```tsx
// Staggered list with Tailwind
{items.map((item, i) => (
  <div
    key={item.id}
    className="animate-in fade-in slide-in-from-bottom-2"
    style={{ animationDelay: `${i * 50}ms` }}
  >
    {item.content}
  </div>
))}

// Using Framer Motion
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, delay: index * 0.05 }}
>
  {content}
</motion.div>
```

## Loading States

Provide visual feedback during async operations:

```tsx
// Skeleton loading
<div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />

// Spinner
<svg className="h-5 w-5 animate-spin text-primary">
  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
  <path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
</svg>

// Button loading state
<button disabled className="relative">
  <span className="opacity-0">Submit</span>
  <Spinner className="absolute inset-0 m-auto" />
</button>
```

## Micro-interactions

Small details that add polish:

```tsx
// Checkbox with scale
<input type="checkbox" className="transition-transform duration-150 checked:scale-110" />

// Button press effect
<button className="active:scale-95 transition-transform duration-100">
  Press me
</button>

// Icon rotation
<ChevronIcon className="transition-transform duration-200 group-open:rotate-180" />
```

## Performance

- Animate only `transform` and `opacity` (GPU accelerated)
- Use `will-change` sparingly for complex animations
- Respect `prefers-reduced-motion` with `motion-reduce:` variant
- Avoid animating layout properties (`width`, `height`, `top`)

## Principles

- Start subtle, add more only if needed
- Consistent easing across the interface
- Loading feedback within 100ms of user action
- Exit animations faster than entrances
