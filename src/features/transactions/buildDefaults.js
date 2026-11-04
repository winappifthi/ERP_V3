export const buildDefaultValues = (fields, existing, overrides = {}) => {
  const defaults = {};

  for (const field of fields) {
    let value;

    // 1. Check existing record first (Edit mode)
    if (existing && getDeep(existing, field.name) !== undefined) {
      value = getDeep(existing, field.name);
    } 
    // 2. Check overrides second (Create mode - generated numbers, dates)
    else if (overrides[field.name] !== undefined) {
      value = overrides[field.name];
    } 
    // 3. Fall back to config defaults
    else if (field.defaultValue !== undefined) {
      value = field.defaultValue;
    } 
    // 4. Fallback empty values
    else if (field.type === 'checkbox') {
      value = false;
    } else if (field.type === 'number' || field.type === 'currency') {
      value = 0;
    } else {
      value = '';
    }

    // Apply the value (even for readonly fields now!)
    setDeep(defaults, field.name, value);
  }

  // Merge any extra overrides (fields not in config but needed in the payload)
  for (const [k, v] of Object.entries(overrides)) {
    if (!(k in defaults) || defaults[k] === undefined) {
      setDeep(defaults, k, v);
    }
  }

  return defaults;
};

// ---- Helpers for dotted paths ----
function getDeep(obj, path) {
  if (!path) return undefined;
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

function setDeep(obj, path, value) {
  const keys = path.split('.');
  let node = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (typeof node[k] !== 'object' || node[k] === null) node[k] = {};
    node = node[k];
  }
  node[keys[keys.length - 1]] = value;
}