export const capitalize = (s = '') =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';

export const titleCase = (s = '') =>
  s.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());

export const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');