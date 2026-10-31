# CivicFix — Poster Modernist UI Design System

## 1. Design intent

CivicFix uses a Reality-First, Poster Modernist visual language. The interface should feel structured, technical, civic, and authoritative—not like a generic SaaS template. Clarity and task completion take priority over decorative motion.

## 2. Color tokens

| Token | Value | Usage |
|---|---|---|
| Cream | #E3E2DE | Primary page background |
| Cobalt | #1351AA | Primary action, key emphasis, active links |
| Jet | #141414 | Primary text, secondary button background |
| Deep gray | #444343 | Body copy |
| Muted gray | #7A7A7A | Labels, metadata, indexes |
| Divider | #C7C7C7 | Rules, borders, section separators |

Use a monochromatic base with cobalt as the single vibrant accent. Do not introduce gradients, decorative shadows, or unrelated accent colors. Status meaning must remain accessible; use clear text labels and restrained status treatments rather than relying on color alone.

## 3. Typography

Preferred family: General Sans or Aileron. Confirm font licensing and include local font files only when permitted. Use a neutral monospace family for indices, timestamps, IDs, and technical metadata.

- Hero: 8rem–12rem where viewport permits; weight 900; line-height 0.85; letter-spacing -0.04em.
- Section headings: 5rem–7rem on large screens; weight 700; line-height 0.9; letter-spacing -0.03em.
- Body: 1.125rem; line-height 1.5; deep gray.
- Labels: 0.75rem; bold uppercase; letter-spacing 0.2em; muted gray.

Responsive typography must scale down without horizontal overflow. The largest sizes are desktop targets, not fixed sizes on mobile.

## 4. Grid and section structure

- Use a 12-column desktop grid.
- Columns 1–3 carry section labels, metadata, and navigation hints.
- Columns 4–12 carry primary content.
- Separate major sections with 1px divider rules.
- Zero-radius corners throughout.
- No shadows.
- Sidebar section labels are sticky with top offset around 8rem on sufficiently tall desktop layouts; disable sticky behavior when it harms mobile usability.

For smaller screens, collapse to a practical 4/6-column or single-column layout while preserving reading order and clear section labels.

## 5. Navigation

- Sticky navigation bar, approximately 80px tall.
- Cream background with subtle translucency (95%) and backdrop blur.
- 1px bottom divider.
- Logo in columns 1–3; status/space in middle; right-aligned navigation/actions in columns 10–12.
- On mobile, use a compact accessible navigation pattern.

## 6. Landing page sections

### Hero
- Minimum height target: 85vh.
- Sidebar: Manifesto label and small square mark.
- Main area: oversized headline with one cobalt-highlighted word.
- Supporting paragraph and CTA cluster arranged in a two-column sub-grid.
- Primary cobalt rectangular button and underlined secondary link.

### System/features
- Sidebar label: SYSTEM.
- Main area: large stacked three-word heading.
- Three-column feature grid on desktop.
- Each cell has mono index, bold title, concise explanation, and 1px border.
- Hover may use a restrained white/20 surface tint; ensure equivalent focus-visible treatment.

### Why different
- Sidebar label: WHY DIFFERENT.
- Vertical list of full-width rows, each with index and large heading.
- Hover/focus changes heading from jet black to cobalt.
- Use keyboard-visible focus and reduced-motion support.

### Access
- Sidebar label: ACCESS.
- Minimum height target: 50vh.
- Large “Start Exploring” heading and concise two-line supporting copy.
- Bottom/right CTA is a black rectangular button with cream text and generous padding.

## 7. Reusable components

### Poster Button
- Rectangular, zero radius.
- Padding 16px 32px.
- 14px bold uppercase text with wide tracking.
- Primary: cobalt background, cream text.
- Secondary: jet background, cream text.
- Hover: transition background to jet over 0.3s linear.
- Include focus-visible, disabled, loading, and high-contrast states.

### Typographic List Item
- Top border 1px.
- Horizontal flex layout with index and large title.
- Index uses mono and muted gray.
- Title uses bold display typography.
- Hover/focus changes title to cobalt.

### Grid Sidebar Label
- Three-column desktop region.
- 12px bold uppercase, muted gray, tracking 0.2em.
- Sticky top offset around 8rem on desktop.
- Non-sticky and repositioned above content on narrow screens.

## 8. Product application patterns

The marketing hero can use oversized poster typography. Operational dashboards must prioritize information density and usability while retaining the same design language:
- Clear page title and metadata.
- Strong column alignment and divider-led sections.
- Rectangular filters, forms, tables, and action controls.
- Complaint status shown with text plus restrained visual treatment.
- Map panels aligned to the grid, with accessible list alternatives.
- AI recommendations clearly labeled as machine-generated and pending human review.
- Distinguish AI suggestions from approved decisions.

## 9. Motion and accessibility

- Use fast linear transitions around 0.3s for color changes.
- No spring/bounce easing or gratuitous motion.
- Respect prefers-reduced-motion.
- Maintain WCAG-appropriate contrast, visible focus, semantic headings, keyboard navigation, labels, and accessible error messages.
- Hover-only interactions must also work with keyboard focus and touch.

## 10. Implementation notes

- Centralize color, spacing, typography, and grid tokens in the frontend theme/CSS variables.
- Use Tailwind utility classes backed by these tokens; avoid one-off hex values throughout components.
- Do not add rounded cards, gradient backgrounds, drop shadows, or generic dashboard styling that conflicts with this system.
- Treat the supplied style specification as the visual source of truth; adapt its oversized editorial patterns responsively for functional screens.
