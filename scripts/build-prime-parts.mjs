// One-off generator: fetches item JSON from the WFCD/warframe-items repo,
// extracts prime parts + their relic drop sources, and writes a slimmed
// JSON file the app imports. Re-run after new Prime Access releases.
//
//   node scripts/build-prime-parts.mjs
//
// Source: https://github.com/WFCD/warframe-items (community-maintained, sourced
// from Warframe's own API + PublicExport manifests).

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BASE = "https://raw.githubusercontent.com/WFCD/warframe-items/master/data/json";
const CDN = "https://cdn.warframestat.us/img";

const SOURCES = [
  { file: "Warframes.json", category: "Warframe" },
  { file: "Primary.json", category: "Primary" },
  { file: "Secondary.json", category: "Secondary" },
  { file: "Melee.json", category: "Melee" },
  { file: "Arch-Gun.json", category: "Archgun" },
  { file: "Arch-Melee.json", category: "Archmelee" },
  { file: "Archwing.json", category: "Archwing" },
  { file: "Sentinels.json", category: "Sentinel" },
  { file: "SentinelWeapons.json", category: "Sentinel Weapon" },
];

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function img(name) {
  return name ? `${CDN}/${name}` : undefined;
}

// "Meso F2 Relic (Radiant)" -> { relic: "Meso F2", tier: "Meso", refinement: "Radiant" }
// "Meso F2 Relic"           -> { relic: "Meso F2", tier: "Meso", refinement: "Intact" }
function parseRelic(location) {
  const m = location.match(/^(Lith|Meso|Neo|Axi|Requiem)\s+([A-Z0-9]+)\s+Relic(?:\s+\((\w+)\))?/);
  if (!m) return null;
  return { tier: m[1], relic: `${m[1]} ${m[2]}`, refinement: m[3] || "Intact" };
}

function extractParts(item, category) {
  // Prime items end with "Prime" or have "Prime " in the middle (e.g. "Mag Prime").
  if (!/\bPrime\b/.test(item.name)) return [];
  const out = [];
  const parent = item.name;
  const parentImage = img(item.imageName);
  for (const c of item.components || []) {
    // Non-prime build ingredients (Orokin Cells, Neural Sensors, etc.) have no
    // ducat value and no relic drops. Drop them.
    if (!c.ducats || c.ducats <= 0) continue;

    // Source lists a drop row per (relic, refinement). Collapse to unique
    // relics — the user just wants to know where to farm, not every refinement
    // permutation. Prefer the Intact row's rarity as the base rarity.
    const byRelic = new Map();
    for (const d of c.drops || []) {
      const n = parseRelic(d.location);
      if (!n) continue;
      const existing = byRelic.get(n.relic);
      if (!existing || n.refinement === "Intact") {
        byRelic.set(n.relic, { relic: n.relic, tier: n.tier, rarity: d.rarity });
      }
    }

    out.push({
      id: `${slugify(parent)}-${slugify(c.name)}`,
      parent,
      parentCategory: category,
      parentImage,
      name: c.name,
      fullName: `${parent} ${c.name}`,
      image: img(c.imageName),
      ducats: c.ducats,
      drops: Array.from(byRelic.values()).sort((a, b) => a.relic.localeCompare(b.relic)),
    });
  }
  return out;
}

async function main() {
  const all = [];
  for (const { file, category } of SOURCES) {
    process.stdout.write(`  ${file.padEnd(22)} `);
    const res = await fetch(`${BASE}/${file}`);
    if (!res.ok) throw new Error(`${file} HTTP ${res.status}`);
    const data = await res.json();
    let partCount = 0;
    let itemCount = 0;
    for (const item of data) {
      const parts = extractParts(item, category);
      if (parts.length) itemCount++;
      partCount += parts.length;
      all.push(...parts);
    }
    console.log(`${itemCount} primes, ${partCount} parts`);
  }

  all.sort((a, b) => a.fullName.localeCompare(b.fullName));

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const outPath = path.join(__dirname, "..", "src", "data", "primeParts.json");
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(all));
  const bytes = (await fs.stat(outPath)).size;
  console.log(`\nWrote ${all.length} parts (${(bytes / 1024).toFixed(1)} KB) to ${path.relative(process.cwd(), outPath)}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
