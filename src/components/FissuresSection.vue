<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { usePrimeParts, type PrimePart } from "../stores/primeParts";
import { useMarket } from "../stores/market";
import { tierClass, rarityClass } from "../utils/warframe";

const store = usePrimeParts();
const market = useMarket();

const squad = ref<(string | null)[]>([null, null, null, null]);
const drafts = ref<string[]>(["", "", "", ""]);
const openSlot = ref<number>(-1);

const marketSlugByName = computed<Record<string, string>>(() => {
  const m: Record<string, string> = {};
  for (const it of market.catalog) m[it.name.toLowerCase()] = it.slug;
  return m;
});

function marketSlugFor(part: PrimePart): string | undefined {
  return marketSlugByName.value[part.fullName.toLowerCase()];
}

function lowestPlat(part: PrimePart): number | null {
  const slug = marketSlugFor(part);
  if (!slug) return null;
  return market.lowestSellOrders(slug, 1)[0]?.platinum ?? null;
}

async function refreshSquadPrices() {
  await market.loadCatalog();
  const slugs = new Set<string>();
  for (const name of squad.value) {
    if (!name) continue;
    const relic = store.relicByName[name];
    if (!relic) continue;
    for (const d of relic.drops) {
      const part = store.byId[d.partId];
      if (!part) continue;
      const slug = marketSlugFor(part);
      if (slug) slugs.add(slug);
    }
  }
  if (slugs.size) await market.refreshMany(Array.from(slugs));
}

onMounted(() => {
  void market.loadCatalog();
});

watch(squad, () => { void refreshSquadPrices(); }, { deep: true });

function setSquadAt(i: number, name: string | null) {
  squad.value[i] = name;
}

function setDraftAt(i: number, text: string) {
  drafts.value[i] = text;
}

function onPickerInput(i: number, e: Event) {
  setDraftAt(i, (e.target as HTMLInputElement).value);
  openSlot.value = i;
}

function onPickerFocus(i: number) {
  openSlot.value = i;
}

function onPickerBlur(i: number) {
  // Delay so a mousedown on a dropdown row can fire setSlot before we close.
  window.setTimeout(() => {
    if (openSlot.value === i) openSlot.value = -1;
    commitDraft(i);
  }, 150);
}

function onPickerKeydown(i: number, e: KeyboardEvent) {
  if (e.key === "Enter") {
    commitDraft(i);
    openSlot.value = -1;
    (e.target as HTMLInputElement).blur();
  } else if (e.key === "Escape") {
    setDraftAt(i, squad.value[i] ?? "");
    openSlot.value = -1;
    (e.target as HTMLInputElement).blur();
  }
}

// Reverts draft to last committed value on invalid input so typos don't stick.
function commitDraft(i: number) {
  const d = drafts.value[i].trim();
  if (!d) {
    setSquadAt(i, null);
    setDraftAt(i, "");
    return;
  }
  const match = store.relics.find(
    (r) => r.name.toLowerCase() === d.toLowerCase(),
  );
  if (match) {
    setSquadAt(i, match.name);
    setDraftAt(i, match.name);
  } else {
    setDraftAt(i, squad.value[i] ?? "");
  }
}

function filteredRelicsFor(i: number) {
  const q = drafts.value[i].trim().toLowerCase();
  const all = store.relics;
  if (!q) return all.slice(0, 40);
  return all.filter((r) => r.name.toLowerCase().includes(q)).slice(0, 40);
}

function setSlot(i: number, name: string | null) {
  setSquadAt(i, name);
  setDraftAt(i, name ?? "");
  openSlot.value = -1;
}

function clearSquad() {
  for (let i = 0; i < 4; i++) setSlot(i, null);
}

const hasAnySlot = computed(() => squad.value.some((s) => !!s));

interface SlotDrop {
  part: PrimePart;
  rarity: string;
  pinned: boolean;
  slug?: string;
  plat: number | null;
  loading: boolean;
}

function dropsForSlot(name: string | null): SlotDrop[] {
  if (!name) return [];
  const relic = store.relicByName[name];
  if (!relic) return [];
  return relic.drops
    .map((d): SlotDrop | null => {
      const part = store.byId[d.partId];
      if (!part) return null;
      const slug = marketSlugFor(part);
      return {
        part,
        rarity: d.rarity,
        pinned: store.pinned.includes(part.id),
        slug,
        plat: lowestPlat(part),
        loading: slug ? !!market.loading[slug] : false,
      };
    })
    .filter((x): x is SlotDrop => x != null);
}
</script>

<template>
  <section class="mb-8">
    <header class="mb-3 flex items-baseline justify-between gap-3">
      <div>
        <h2 class="text-lg font-semibold">Fissures</h2>
        <p class="text-xs text-gray-500">Pick up to 4 squad relics.</p>
      </div>
      <button v-if="hasAnySlot" @click="clearSquad" class="text-xs text-gray-500 hover:text-gray-300">
        Clear all
      </button>
    </header>
    <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <article v-for="(sel, i) in squad" :key="i"
        class="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-3">
        <div class="relative mb-2">
          <input :value="drafts[i]" @input="onPickerInput(i, $event)" @focus="onPickerFocus(i)"
            @click="onPickerFocus(i)" @blur="onPickerBlur(i)" @keydown="onPickerKeydown(i, $event)"
            :placeholder="`Slot ${i + 1}: pick a relic…`"
            class="w-full rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] px-2 py-1 pr-6 text-sm outline-none focus:border-[var(--color-accent)]" />
          <button v-if="drafts[i]" @mousedown.prevent="setSlot(i, null)"
            class="absolute right-1 top-1/2 -translate-y-1/2 px-1 text-sm text-gray-400 hover:text-red-400"
            aria-label="Clear slot">
            ×
          </button>
          <ul v-if="openSlot === i"
            class="absolute left-0 right-0 top-full z-10 mt-1 max-h-64 overflow-y-auto rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-lg">
            <li v-for="r in filteredRelicsFor(i)" :key="r.name" @mousedown.prevent="setSlot(i, r.name)"
              class="flex cursor-pointer items-center gap-2 px-2 py-1 text-xs hover:bg-[var(--color-surface-muted)]">
              <span :class="['w-10 text-[10px] uppercase tracking-wide', tierClass(r.tier)]">
                {{ r.tier }}
              </span>
              <span>{{ r.name }}</span>
            </li>
          </ul>
        </div>

        <ul v-if="sel" class="space-y-1">
          <li v-for="d in dropsForSlot(sel)" :key="d.part.id" @click="store.toggle(d.part.id)" :class="[
            'flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-xs transition',
            d.pinned
              ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
              : 'hover:bg-[var(--color-surface-muted)] text-gray-300',
          ]">
            <span :class="['w-3 text-center font-semibold', rarityClass(d.rarity)]" :title="d.rarity">
              {{ d.rarity[0] }}
            </span>
            <span class="flex-1 truncate">{{ d.part.fullName }}</span>
            <span v-if="d.plat != null" class="font-mono tabular-nums text-[var(--color-accent)]">
              {{ d.plat }}<span class="text-gray-500">p</span>
            </span>
            <span v-else-if="d.loading" class="font-mono text-gray-500">…</span>
            <span v-else-if="d.slug" class="font-mono text-gray-600">—</span>
            <span v-else class="font-mono text-gray-600" title="No WFM listing">·</span>
          </li>
        </ul>
        <div v-else class="text-xs text-gray-500">No relic selected.</div>
      </article>
    </div>
  </section>
</template>
