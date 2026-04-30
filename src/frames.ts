// Special:FilePath handles redirects and URL-encoding, so hyphens/spaces are safe.

export interface FrameInfo {
  name: string;
  icon: string;
}

function iconUrl(name: string): string {
  return `https://wiki.warframe.com/w/Special:FilePath/${encodeURIComponent(name)}Icon272.png`;
}

const names: string[] = [
  "Ash", "Atlas", "Banshee", "Baruuk", "Caliban", "Chroma", "Citrine",
  "Cyte-09", "Dagath", "Dante", "Ember", "Equinox", "Excalibur", "Frost",
  "Gara", "Garuda", "Gauss", "Grendel", "Gyre", "Harrow", "Hildryn",
  "Hydroid", "Inaros", "Ivara", "Jade", "Khora", "Koumei", "Kullervo",
  "Lavos", "Limbo", "Loki", "Mag", "Mesa", "Mirage", "Nekros", "Nezha",
  "Nidus", "Nova", "Nyx", "Oberon", "Octavia", "Protea", "Qorvex",
  "Revenant", "Rhino", "Saryn", "Sevagoth", "Styanax", "Titania",
  "Trinity", "Valkyr", "Vauban", "Volt", "Voruna", "Wisp", "Wukong",
  "Xaku", "Yareli", "Zephyr",
];

export const FRAMES: FrameInfo[] = names
  .sort((a, b) => a.localeCompare(b))
  .map((name) => ({ name, icon: iconUrl(name) }));
