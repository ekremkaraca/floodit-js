import { createElement } from "lucide";

/**
 * Render a Lucide icon node as SVG with consistent defaults.
 * @param {import("lucide").IconNode} iconNode
 * @param {{ size?: number, className?: string }} [options]
 * @returns {SVGElement}
 */
export function renderIcon(iconNode, options = {}) {
  const { size = 16, className = "ui-icon" } = options;
  const svg = createElement(iconNode, {
    width: size,
    height: size,
    "stroke-width": 2,
    "aria-hidden": "true",
    focusable: "false",
  });

  if (className) {
    svg.setAttribute("class", className);
  }

  return svg;
}
