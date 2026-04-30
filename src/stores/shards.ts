import { defineStore } from "pinia";
import { ref } from "vue";
import type { ArchonShard, ShardColor } from "../types";

const MAX_SHARDS = 5;

export const useShards = defineStore("shards", () => {
  // Keyed by frame name. Missing entries are treated as empty.
  const shards = ref<Record<string, ArchonShard[]>>({});

  function get(frame: string): ArchonShard[] {
    return shards.value[frame] ?? [];
  }

  function addShard(frame: string, color: ShardColor, tauforged: boolean) {
    const list = shards.value[frame] ?? [];
    if (list.length >= MAX_SHARDS) return;
    shards.value[frame] = [...list, { color, tauforged }];
  }

  function removeShard(frame: string, index: number) {
    const list = shards.value[frame];
    if (!list) return;
    shards.value[frame] = list.filter((_, i) => i !== index);
  }

  function clearFrame(frame: string) {
    delete shards.value[frame];
  }

  return { shards, get, addShard, removeShard, clearFrame };
}, {
  persist: { key: "farmframe:shards" },
});

export { MAX_SHARDS };
