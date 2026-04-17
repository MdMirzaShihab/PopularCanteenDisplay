export const SIZE_STEPS = ['S', 'M', 'L', 'XL', '2XL'];
export const DEFAULT_SIZE = 'M';

// Convert a title to a URL-safe slug (lowercase, dashes, no special chars).
export const slugify = (value) =>
  (value || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

// Fonts that read more powerfully in uppercase (condensed display + Roman serifs + marker).
const UPPERCASE_FONT_IDS = new Set([
  'font-heading', 'font-oswald', 'font-anton', 'font-fjalla', 'font-cinzel', 'font-marker',
]);

// Build a per-font sample-text map: uppercase text for bold condensed faces, title case for the rest.
export const makeFontSampleMap = (uppercaseSample, titleCaseSample) =>
  Object.fromEntries(
    FONT_CHOICES.map(({ id }) => [
      id,
      UPPERCASE_FONT_IDS.has(id) ? uppercaseSample : titleCaseSample,
    ])
  );

// Ordered roughly by role: condensed-display → slab/display → high-contrast serif → readable serif → clean sans → script/handwritten
export const FONT_CHOICES = [
  { id: 'font-heading',      label: 'Bebas Neue' },
  { id: 'font-oswald',       label: 'Oswald' },
  { id: 'font-anton',        label: 'Anton' },
  { id: 'font-fjalla',       label: 'Fjalla One' },
  { id: 'font-display',      label: 'Righteous' },
  { id: 'font-alfa',         label: 'Alfa Slab One' },
  { id: 'font-yeseva',       label: 'Yeseva One' },
  { id: 'font-abril',        label: 'Abril Fatface' },
  { id: 'font-playfair',     label: 'Playfair Display' },
  { id: 'font-cinzel',       label: 'Cinzel' },
  { id: 'font-cormorant',    label: 'Cormorant Garamond' },
  { id: 'font-lora',         label: 'Lora' },
  { id: 'font-merriweather', label: 'Merriweather' },
  { id: 'font-body',         label: 'Poppins' },
  { id: 'font-montserrat',   label: 'Montserrat' },
  { id: 'font-raleway',      label: 'Raleway' },
  { id: 'font-lato',         label: 'Lato' },
  { id: 'font-script',       label: 'Pacifico' },
  { id: 'font-dancing',      label: 'Dancing Script' },
  { id: 'font-lobster',      label: 'Lobster' },
  { id: 'font-handwritten',  label: 'Kalam' },
  { id: 'font-marker',       label: 'Permanent Marker' },
];
