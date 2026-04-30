export interface Task {
  id: string;
  details: string;
  done: boolean;
  notes: string;
}

// Warframe Archon Shard colors. Tauforged is a stronger variant of each color.
export type ShardColor = "crimson" | "amber" | "azure" | "topaz" | "emerald" | "violet";

export interface ArchonShard {
  color: ShardColor;
  tauforged: boolean;
}
