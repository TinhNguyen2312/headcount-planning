export const BROWSER_RESERVED_COMBOS = new Set([
  "mod+n", // new window
  "mod+shift+n", // new incognito window (Chrome) / reopen window (Firefox)
  "mod+t", // new tab
  "mod+shift+t", // reopen closed tab
  "mod+w", // close tab
  "mod+shift+w", // close window (Firefox)
  "mod+tab",
  "mod+shift+tab",
  "mod+l", // focus address bar
  "mod+q", // quit (Mac)
  "alt+f4",
  "f11", // fullscreen
  "f12", // devtools
])
