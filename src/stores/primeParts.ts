import { defineStore } from "pinia";
import { ref, computed } from "vue";
import data from "../data/primeParts.json";

export interface RelicDrop {
  relic: string;
  tier: string;
  rarity: string;
}

export interface PrimePart {
  id: string;
  parent: string;
  parentCategory: string;
  parentImage?: string;
  name: string;
  fullName: string;
  image?: string;
  ducats: number;
  drops: RelicDrop[];
}

export interface RelicEntry {
  name: string;           // e.g. "Meso F2"
  tier: string;           // "Lith" | "Meso" | "Neo" | "Axi" | "Requiem"
  drops: Array<{ partId: string; rarity: string }>;
}

const TIER_ORDER = ["Lith", "Meso", "Neo", "Axi", "Requiem"];

export const usePrimeParts = defineStore("primeParts", () => {
  const parts = data as PrimePart[];

  const byId = computed(() => {
    const m: Record<string, PrimePart> = {};
    for (const p of parts) m[p.id] = p;
    return m;
  });

  // Forma BP isn't in source data and won't appear here — acceptable since Forma isn't a pinnable part.
  const relics = computed<RelicEntry[]>(() => {
    const m = new Map<string, RelicEntry>();
    for (const p of parts) {
      for (const d of p.drops) {
        let r = m.get(d.relic);
        if (!r) {
          r = { name: d.relic, tier: d.tier, drops: [] };
          m.set(d.relic, r);
        }
        r.drops.push({ partId: p.id, rarity: d.rarity });
      }
    }
    const rarityRank: Record<string, number> = { Rare: 0, Uncommon: 1, Common: 2 };
    for (const r of m.values()) {
      r.drops.sort((a, b) => (rarityRank[a.rarity] ?? 99) - (rarityRank[b.rarity] ?? 99));
    }
    return Array.from(m.values()).sort((a, b) => {
      const ta = TIER_ORDER.indexOf(a.tier);
      const tb = TIER_ORDER.indexOf(b.tier);
      if (ta !== tb) return ta - tb;
      return a.name.localeCompare(b.name, undefined, { numeric: true });
    });
  });

  const relicByName = computed(() => {
    const m: Record<string, RelicEntry> = {};
    for (const r of relics.value) m[r.name] = r;
    return m;
  });

  const pinned = ref<string[]>([]);

  function pin(id: string) {
    if (!pinned.value.includes(id)) pinned.value.push(id);
  }
  function unpin(id: string) {
    pinned.value = pinned.value.filter((x) => x !== id);
  }
  function toggle(id: string) {
    if (pinned.value.includes(id)) unpin(id);
    else pin(id);
  }

  const pinnedParts = computed(() =>
    pinned.value.map((id) => byId.value[id]).filter(Boolean),
  );

  return { parts, byId, relics, relicByName, pinned, pinnedParts, pin, unpin, toggle };
}, {
  persist: { key: "farmframe:primeParts", pick: ["pinned"] },
});
