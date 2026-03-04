# Custom Text Overlay for Blank Theme

**Date:** 2026-03-04

## Summary

Add auto-rotating custom text messages to the "No Theme" (blank) screen mode. Messages display centered over background media with a dark overlay, cycling with fade transitions.

## Data Model

- Add `customMessages: string[]` to food screen data (default: `[]`)
- Only used when `theme === 'none'`

## Form Changes (FoodScreenForm — Appearance tab)

- When theme is `'none'`, show "Custom Messages" section (replaces foreground media section)
- Repeatable text input with Add button
- Each message shows in a list with delete and reorder (up/down) buttons

## Gallery Display (TimeBasedRenderer)

- Background media fills screen (existing behavior)
- Semi-transparent dark overlay (`bg-black/50`)
- Current message centered, large white text (`font-heading`, `text-6xl`)
- Auto-rotates using existing `slideDelay` timing
- Fade transition using existing `transitionDuration`
- Empty `customMessages` = current behavior (background + header only)

## Files Changed

1. `src/components/screens/FoodScreenForm.jsx` — message list UI
2. `src/components/gallery/TimeBasedRenderer.jsx` — render messages
3. `src/data/mockData.js` — add sample messages to demo data

## Approach

Simple text array (Approach A). No per-message styling — consistent large white text on dark overlay for readability from a distance.
