// Browser preferences seed new profiles only; persisted settings remain authoritative.
export function browserPreferences(languages = []) {
  const lang =
    languages
      .filter((value) => typeof value === "string")
      .map((value) => value.toLowerCase().split(/[-_]/)[0])
      .find((value) => value === "fa" || value === "en") || "en";
  return { lang, cal: lang === "fa" ? "j" : "g" };
}
