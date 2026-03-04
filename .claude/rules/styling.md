# Styling Rules

**Applies to:** `src/components/**/*`, `src/pages/**/*`, `**/*.css`

## Tailwind Only

- Use Tailwind CSS utility classes exclusively — no custom CSS classes
- Mobile-first responsive design
- Consistent spacing, borders, and shadows

## Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `primary-50` | #f5f6f3 | Subtle green backgrounds |
| `primary-100` | #8F9779 | Main green |
| `primary-200` | #737b5e | Darker green (hover) |
| `primary-300` | #373f25 | Darkest green |
| `accent-100` | #FFB6B9 | Light pink |
| `accent-200` | #98585c | Dark pink/rose |
| `accent-300` | #7a464a | Darker pink (hover) |
| `text-100` | #4D4D4D | Primary dark gray |
| `text-200` | #797979 | Secondary medium gray |
| `text-300` | #a8a8a8 | Tertiary light gray |
| `bg-100` | #F2EFE9 | Cream background |
| `bg-200` | #e8e5df | Darker cream |
| `bg-300` | #bfbdb7 | Border gray |

## Fonts

| Class | Font | Usage |
|-------|------|-------|
| `font-heading` | Bebas Neue | Bold all-caps headers |
| `font-script` | Pacifico | Stylish script/handwritten |
| `font-display` | Righteous | Eye-catching display text |
| `font-marker` | Permanent Marker | Casual marker style |
| `font-handwritten` | Kalam | Handwritten look |
| `font-body` | Poppins | Clean body text |

## Breakpoints

Standard Tailwind breakpoints plus:
- `3xl: 2000px` — Ultra-wide displays (55" 4K monitors)

## Currency

- Bangladeshi Taka (৳)
- Prices: `.toFixed(0)` (whole numbers only)

## Icons

- All icons from `lucide-react` — no other icon libraries
