/**
 * Tiny framework-independent color alpha helper.
 * Supports #rgb / #rrggbb inputs; returns rgba() string. Non-hex inputs
 * (e.g. CSS variables) fall back to color-mix(), which modern browsers
 * resolve natively.
 */
export const orbAlpha = (color: string, alpha: number): string => {
  const clamped = Math.min(1, Math.max(0, alpha));
  const hex = color.trim();
  const expand = (h: string) => h.split('').map((c) => c + c).join('');
  const body = hex.startsWith('#') ? hex.slice(1) : '';
  const full = body.length === 3 ? expand(body) : body;
  if (/^[0-9a-fA-F]{6}$/.test(full)) {
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${clamped})`;
  }
  const pct = `${Math.round(clamped * 100)}%`;
  return `color-mix(in oklch, ${color} ${pct}, transparent)`;
};
