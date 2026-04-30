export function tierClass(tier: string): string {
  if (tier === "Lith") return "text-amber-600";
  if (tier === "Meso") return "text-sky-400";
  if (tier === "Neo") return "text-indigo-400";
  if (tier === "Axi") return "text-emerald-400";
  return "text-gray-400";
}

export function rarityClass(rarity: string): string {
  if (rarity === "Common") return "text-amber-700";
  if (rarity === "Uncommon") return "text-gray-300";
  if (rarity === "Rare") return "text-yellow-400";
  return "text-gray-400";
}
