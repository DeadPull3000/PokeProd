/* Centralized Gen 3 GBA Visual Design Tokens (Theme-Aware via CSS Variables) */
export const G3 = {
  cream:        'var(--g3-cream, #F8F8ED)',
  creamLight:   'var(--g3-cream-light, #FFFAF2)',
  creamDark:    'var(--g3-cream-dark, #EDE8D0)',
  borderTeal:   'var(--g3-border-teal, #68A0B0)',
  borderOrange: 'var(--g3-border-orange, #E09078)',
  headerBg:     'var(--g3-header-teal, #68B8B8)',
  headerDark:   'var(--g3-header-dark, #408090)',
  text:         'var(--g3-text, #383028)',
  textMuted:    'var(--g3-text-muted, #706858)',
  accentRed:    'var(--g3-accent-red, #D04030)',
  accentBlue:   'var(--g3-accent-blue, #3868C8)',
  accentGreen:  'var(--g3-accent-green, #389848)',
  accentGold:   'var(--g3-accent-gold, #C89828)',
  px:           "'Press Start 2P', monospace",
  vt:           "'VT323', monospace",
}

export function getHpBarColor(pct) {
  if (pct > 0.5) return '#22c55e'
  if (pct > 0.2) return '#eab308'
  return '#ef4444'
}
