/**
 * Tiny hyperscript helper for vanilla DOM rendering.
 * Supports className, style object, DOM events (`onClick`, ...), and plain attributes.
 */
export function h(tag, props = {}, children = []) {
  const el = document.createElement(tag);

  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null) continue;

    if (key === 'className') {
      el.className = value;
      continue;
    }

    if (key === 'style' && typeof value === 'object') {
      Object.assign(el.style, value);
      continue;
    }

    if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value);
      continue;
    }

    if (key === 'disabled') {
      el.toggleAttribute('disabled', Boolean(value));
      continue;
    }

    el.setAttribute(key, String(value));
  }

  const normalized = Array.isArray(children) ? children : [children];
  for (const child of normalized) {
    if (child === null || child === undefined) continue;
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
      continue;
    }
    el.appendChild(child);
  }

  return el;
}

/** Remove all children from a node. */
export function clear(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}
