/* Centralized Gen 3 GBA Visual Design Tokens */
export const G3 = {
  cream:        '#F8F8ED',
  creamLight:   '#FFFAF2',
  creamDark:    '#EDE8D0',
  borderTeal:   '#68A0B0',
  borderOrange: '#E09078',
  headerBg:     '#68B0B0',
  headerDark:   '#408090',
  text:         '#383028',
  textMuted:    '#706858',
  accentRed:    '#D04030',
  accentBlue:   '#3868C8',
  accentGreen:  '#389848',
  accentGold:   '#C89828',
  px:           "'Press Start 2P', monospace",
  vt:           "'VT323', monospace",
}

export function getHpBarColor(pct) {
  if (pct > 0.5) return '#22c55e'
  if (pct > 0.2) return '#eab308'
  return '#ef4444'
}
