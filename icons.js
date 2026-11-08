// Small, consistent interface glyphs. The brand mark always uses the supplied artwork.
const paths = {
  plus: '<path d="M12 5v14M5 12h14"/>',
  calendar:
    '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M16 3v4M8 3v4M3 11h18M8 15h.01M12 15h.01M16 15h.01M8 18h.01M12 18h.01"/>',
  chart: '<path d="M4 4v16h16M8 15v-4M12 15V7M16 15v-6"/>',
  settings:
    '<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3"/><circle cx="15" cy="17" r="3"/>',
  shield:
    '<path d="M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6l-8-3Z"/><path d="m8 12 3 3 5-6"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4"/>',
  upload: '<path d="M12 16V4m-5 5 5-5 5 5M4 16v4h16v-4"/>',
  copy: '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>',
  print: '<path d="M7 8V3h10v5M7 17H3V8h18v9h-4M7 14h10v7H7zM17 11h.01"/>',
  receipt:
    '<path d="M5 3 8 5l4-2 4 2 3-2v18l-3-2-4 2-4-2-3 2V3Z"/><path d="M9 9h6M9 13h6M9 17h3"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  tag: '<path d="m3 3 9 0 9 9-9 9-9-9V3Z"/><circle cx="8" cy="8" r="1"/>',
  food: '<path d="M4 3v7c0 2 4 2 4 0V3M6 3v18M16 3c-4 4-4 10 0 10h3V3h-3ZM19 13v8"/>',
  move: '<path d="M4 17h16l-2-9H6l-2 9ZM7 8l1-4h8l1 4M4 17v3M20 17v3M8 13h.01M16 13h.01"/>',
  shop: '<path d="M4 8h16l-1 13H5L4 8ZM8 8V6a4 4 0 0 1 8 0v2"/>',
  dots: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  edit: '<path d="m14 4 6 6M3 21l5-1L21 7l-5-5L3 15v6Z"/>',
  moon: '<path d="M20 14.5A9 9 0 0 1 9.5 4 9 9 0 1 0 20 14.5Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1 1M18 18l1 1M5 19l1-1M18 6l1-1"/>',
  palette:
    '<path d="M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 0-4h-1a2 2 0 0 1 0-4h5c5 0 4-10-5-10Z"/><path d="M7 9h.01M10 6h.01M15 7h.01M6 13h.01"/>',
  reload:
    '<path d="M20 7V3m0 4h-4M4 17v4m0-4h4M20 7a9 9 0 0 0-15-3M4 17a9 9 0 0 0 15 3"/>',
};
export function icon(name, className = "") {
  return (
    '<svg class="ui-icon ' +
    className +
    '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
    (paths[name] || paths.receipt) +
    "</svg>"
  );
}
