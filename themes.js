export const THEMES = [
  {
    key: "auto",
    name: "theme_auto",
    description: "theme_auto_note",
    bg: "#eeeade",
    surface: "#fffcf5",
    ink: "#24251f",
    accent: "#805b2b",
    dark: false,
  },
  {
    key: "persepolis",
    name: "theme_persepolis",
    description: "theme_persepolis_note",
    bg: "#f1eee5",
    surface: "#fffcf5",
    ink: "#24251f",
    accent: "#805b2b",
    dark: false,
  },
  {
    key: "limestone",
    name: "theme_limestone",
    description: "theme_limestone_note",
    bg: "#edeeea",
    surface: "#fbfcf9",
    ink: "#29342e",
    accent: "#4c6256",
    dark: false,
  },
  {
    key: "obsidian",
    name: "theme_obsidian",
    description: "theme_obsidian_note",
    bg: "#171715",
    surface: "#23231f",
    ink: "#f3efe3",
    accent: "#d1b47c",
    dark: true,
  },
  {
    key: "lapis",
    name: "theme_lapis",
    description: "theme_lapis_note",
    bg: "#141d2b",
    surface: "#1d2a3b",
    ink: "#edf1f6",
    accent: "#d5b977",
    dark: true,
  },
  {
    key: "cedar",
    name: "theme_cedar",
    description: "theme_cedar_note",
    bg: "#12241e",
    surface: "#1b3028",
    ink: "#eff0e3",
    accent: "#c9ba85",
    dark: true,
  },
  {
    key: "porphyry",
    name: "theme_porphyry",
    description: "theme_porphyry_note",
    bg: "#251e29",
    surface: "#322739",
    ink: "#f3eaf0",
    accent: "#d2b190",
    dark: true,
  },
];
const aliases = {
  light: "persepolis",
  dark: "obsidian",
  amoled: "obsidian",
  ocean: "lapis",
  midnight: "lapis",
  rose: "porphyry",
  sepia: "persepolis",
  forest: "cedar",
};
export const themeKey = (key) => aliases[key] || key;
export function activeTheme(key, prefersDark = false) {
  const selected = themeKey(key);
  return (
    THEMES.find(
      (theme) =>
        theme.key ===
        (selected === "auto"
          ? prefersDark
            ? "obsidian"
            : "persepolis"
          : selected),
    ) || THEMES[1]
  );
}
