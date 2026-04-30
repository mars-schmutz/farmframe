<script setup lang="ts">
import { ref, computed } from "vue";
import { usePrimeParts, type PrimePart } from "../stores/primeParts";
import { rarityClass } from "../utils/warframe";

const store = usePrimeParts();

const query = ref("");
const showResults = ref(false);

const results = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return [];
  return store.parts
    .filter((p) => p.fullName.toLowerCase().includes(q))
    .slice(0, 25);
});

interface Group {
  parent: string;
  category: string;
  image?: string;
  parts: PrimePart[];
}

const grouped = computed<Group[]>(() => {
  const m = new Map<string, Group>();
  for (const p of store.pinnedParts) {
    let g = m.get(p.parent);
    if (!g) {
      g = { parent: p.parent, category: p.parentCategory, image: p.parentImage, parts: [] };
      m.set(p.parent, g);
    }
    g.parts.push(p);
  }
  return Array.from(m.values()).sort((a, b) => a.parent.localeCompare(b.parent));
});

function onSearchBlur() {
  window.setTimeout(() => (showResults.value = false), 150);
}
</script>

<template>
  <section>
    <header class="mb-3">
      <h2 class="text-lg font-semibold">Pinned</h2>
    </header>

    <div class="relative mb-4">
      <input v-model="query" @focus="showResults = true" @blur="onSearchBlur" placeholder="Search prime parts…"
        class="w-full rounded-md bg-[var(--color-surface-raised)] border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]" />
      <ul v-if="showResults && results.length"
        class="absolute left-0 right-0 top-full z-10 mt-1 max-h-96 overflow-y-auto rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-lg">
        <li v-for="p in results" :key="p.id" @mousedown.prevent="store.toggle(p.id)"
          class="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-[var(--color-surface-muted)]">
          <img v-if="p.image" :src="p.image" :alt="p.name"
            class="h-8 w-8 rounded bg-[var(--color-surface)] object-contain p-1" loading="lazy" />
          <div class="flex-1 min-w-0">
            <div class="truncate">{{ p.fullName }}</div>
            <div class="text-xs text-gray-500">{{ p.parentCategory }} · {{ p.ducats }} ducats</div>
          </div>
          <span v-if="store.pinned.includes(p.id)" class="text-xs text-[var(--color-accent)]">pinned</span>
        </li>
      </ul>
    </div>

    <div v-if="!grouped.length" class="text-sm text-gray-500">
      No pinned parts yet. Search above to add some.
    </div>

    <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <article v-for="g in grouped" :key="g.parent"
        class="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4">
        <header class="mb-3 flex items-center gap-3">
          <img v-if="g.image" :src="g.image" :alt="g.parent"
            class="h-10 w-10 rounded bg-[var(--color-surface)] object-contain p-1" />
          <div>
            <h2 class="font-medium">{{ g.parent }}</h2>
            <div class="text-xs text-gray-500">{{ g.category }}</div>
          </div>
        </header>
        <ul class="space-y-2">
          <li v-for="part in g.parts" :key="part.id"
            class="flex gap-3 rounded-md bg-[var(--color-surface-muted)] p-3">
            <img v-if="part.image" :src="part.image" :alt="part.name"
              class="h-10 w-10 shrink-0 rounded bg-[var(--color-surface)] object-contain p-1" />
            <div class="flex-1 min-w-0">
              <div class="flex items-baseline gap-2">
                <span class="font-medium">{{ part.name }}</span>
                <span class="text-xs text-gray-500">{{ part.ducats }}d</span>
              </div>
              <div v-if="part.drops.length" class="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs">
                <span v-for="d in part.drops" :key="d.relic" :class="rarityClass(d.rarity)">{{ d.relic }}</span>
              </div>
              <div v-else class="mt-1 text-xs text-gray-500">
                No relic drops listed (may be vaulted or reward-only).
              </div>
            </div>
            <button @click="store.unpin(part.id)" class="text-xs text-gray-400 hover:text-red-400">
              Unpin
            </button>
          </li>
        </ul>
      </article>
    </div>
  </section>
</template>
