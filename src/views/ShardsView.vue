<script setup lang="ts">
import { ref, computed } from "vue";
import { useShards, MAX_SHARDS } from "../stores/shards";
import { FRAMES } from "../frames";
import type { ShardColor } from "../types";

const store = useShards();

const filter = ref("");
const selected = ref<string | null>(null);

const colors: { color: ShardColor; label: string; swatch: string }[] = [
  { color: "crimson", label: "Crimson", swatch: "#dc2626" },
  { color: "amber", label: "Amber", swatch: "#f59e0b" },
  { color: "azure", label: "Azure", swatch: "#3b82f6" },
  { color: "topaz", label: "Topaz", swatch: "#f97316" },
  { color: "emerald", label: "Emerald", swatch: "#10b981" },
  { color: "violet", label: "Violet", swatch: "#a855f7" },
];

const visibleFrames = computed(() => {
  const q = filter.value.trim().toLowerCase();
  if (!q) return FRAMES;
  return FRAMES.filter((f) => f.name.toLowerCase().includes(q));
});

function swatch(color: ShardColor) {
  return colors.find((c) => c.color === color)?.swatch ?? "#666";
}

function onImgError(e: Event) {
  const el = e.target as HTMLImageElement;
  el.style.visibility = "hidden";
}
</script>

<template>
  <section>
    <header class="mb-6 flex items-center gap-4">
      <div>
        <h1 class="text-2xl font-semibold">Archon Shards</h1>
        <p class="text-sm text-gray-500">Click a frame to manage its shards.</p>
      </div>
      <input
        v-model="filter"
        placeholder="Filter frames…"
        class="ml-auto w-56 rounded-md bg-[var(--color-surface-raised)] border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
      />
    </header>

    <div class="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-3">
      <button
        v-for="f in visibleFrames"
        :key="f.name"
        @click="selected = selected === f.name ? null : f.name"
        class="group relative rounded-md border bg-[var(--color-surface-raised)] p-2 text-left transition hover:border-[var(--color-accent)]"
        :class="selected === f.name
          ? 'border-[var(--color-accent)]'
          : 'border-[var(--color-border)]'"
      >
        <div class="aspect-square w-full overflow-hidden rounded bg-[var(--color-surface)]">
          <img
            :src="f.icon"
            :alt="f.name"
            loading="lazy"
            @error="onImgError"
            class="h-full w-full object-cover"
          />
        </div>
        <div class="mt-2 text-sm font-medium">{{ f.name }}</div>
        <div class="mt-1 flex flex-wrap gap-1">
          <span
            v-for="(s, i) in store.get(f.name)"
            :key="i"
            class="h-3 w-3 rounded-full border"
            :style="{
              backgroundColor: swatch(s.color),
              borderColor: s.tauforged ? '#fef08a' : 'transparent',
              boxShadow: s.tauforged ? '0 0 4px #fef08a' : 'none',
            }"
          />
          <span v-if="!store.get(f.name).length" class="text-xs text-gray-500">empty</span>
        </div>
      </button>
    </div>

    <!-- Picker panel for the selected frame -->
    <div
      v-if="selected"
      class="fixed inset-x-0 bottom-0 z-10 border-t border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 shadow-lg md:sticky md:bottom-4 md:mt-6 md:rounded-md md:border"
    >
      <div class="mx-auto max-w-4xl">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="font-medium">{{ selected }}</h2>
          <button
            @click="selected = null"
            class="text-xs text-gray-400 hover:text-[var(--color-accent)]"
          >
            Close
          </button>
        </div>

        <div class="mb-4">
          <div class="mb-2 flex items-center gap-2 text-xs text-gray-400">
            <span>Placed ({{ store.get(selected).length }} / {{ MAX_SHARDS }})</span>
            <button
              v-if="store.get(selected).length"
              @click="store.clearFrame(selected)"
              class="ml-auto hover:text-red-400"
            >
              Clear
            </button>
          </div>
          <div class="flex flex-wrap gap-2 min-h-[2rem]">
            <button
              v-for="(s, i) in store.get(selected)"
              :key="i"
              @click="store.removeShard(selected, i)"
              :title="`Remove ${s.tauforged ? 'tauforged ' : ''}${s.color} shard`"
              class="h-8 w-8 rounded-full border-2 transition hover:scale-110"
              :style="{
                backgroundColor: swatch(s.color),
                borderColor: s.tauforged ? '#fef08a' : 'transparent',
                boxShadow: s.tauforged ? '0 0 8px #fef08a' : 'none',
              }"
            />
          </div>
        </div>

        <div v-if="store.get(selected).length < MAX_SHARDS" class="space-y-3">
          <div>
            <div class="mb-1 text-xs uppercase tracking-wide text-gray-500">Regular</div>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="c in colors"
                :key="c.color"
                @click="store.addShard(selected, c.color, false)"
                class="flex items-center gap-2 rounded-md border border-[var(--color-border)] px-2 py-1 text-xs hover:border-[var(--color-accent)]"
              >
                <span class="h-4 w-4 rounded-full" :style="{ backgroundColor: c.swatch }" />
                {{ c.label }}
              </button>
            </div>
          </div>
          <div>
            <div class="mb-1 text-xs uppercase tracking-wide text-gray-500">Tauforged</div>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="c in colors"
                :key="c.color"
                @click="store.addShard(selected, c.color, true)"
                class="flex items-center gap-2 rounded-md border border-yellow-200/40 px-2 py-1 text-xs hover:border-yellow-200"
              >
                <span
                  class="h-4 w-4 rounded-full"
                  :style="{
                    backgroundColor: c.swatch,
                    boxShadow: '0 0 6px #fef08a',
                  }"
                />
                {{ c.label }}
              </button>
            </div>
          </div>
        </div>
        <p v-else class="text-sm text-gray-500">This frame has all 5 slots filled.</p>
      </div>
    </div>
  </section>
</template>
