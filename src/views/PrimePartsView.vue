<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { usePrimeParts, type PrimePart } from "../stores/primeParts";
import { useMarket } from "../stores/market";

const store = usePrimeParts();
const market = useMarket();

// ── Fissures squad state ────────────────────────────────────────────────────
// 4 slots for teammate relics. Strings are relic names ("Meso F2") or null.
// Ephemeral: not persisted, since squad composition changes every mission.
const squad = ref<(string | null)[]>([null, null, null, null]);
// Per-slot input buffer. Drives the visible input value always (unlike the
// earlier focused-only scheme, which made typed text disappear on blur).
const drafts = ref<string[]>(["", "", "", ""]);
const openSlot = ref<number>(-1);

// Catalog lookup keyed by lowercased WFM item name — used to resolve each
// PrimePart to a warframe.market slug.
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

// Trigger market fetches for all unique parts across selected slots.
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
  // Kick off catalog load eagerly so the first squad pick has prices ready.
  void market.loadCatalog();
});

watch(squad, () => { void refreshSquadPrices(); }, { deep: true });

// Helpers: replace the array rather than mutating an index, so Vue's ref-
// based reactivity unambiguously triggers on any surface (watches, v-for, etc.).
function setSquadAt(i: number, name: string | null) {
  const next = squad.value.slice();
  next[i] = name;
  squad.value = next;
}

function setDraftAt(i: number, text: string) {
  const next = drafts.value.slice();
  next[i] = text;
  drafts.value = next;
}

// Relic picker behavior.
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

// Try to accept the current draft as a valid relic. On exact match (case-
// insensitive), commit to squad. On empty, clear. Otherwise, revert the draft
// to the last committed value so typos don't stick in the input.
function commitDraft(i: number) {
  const d = drafts.value[i].trim();
  if (!d) {
    setSquadAt(i, null);
    setDraftAt(i, "");
    return;
  }
  const match = store.relics.find((r) => r.name.toLowerCase() === d.toLowerCase());
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

// Resolve a relic's drops into renderable rows (part + rarity + pinned + plat).
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

function tierClass(tier: string): string {
  if (tier === "Lith") return "text-amber-600";
  if (tier === "Meso") return "text-sky-400";
  if (tier === "Neo") return "text-indigo-400";
  if (tier === "Axi") return "text-emerald-400";
  return "text-gray-400";
}

// ── Pins (existing search / grouped display) ───────────────────────────────
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

function rarityClass(r: string): string {
  // Matches relic rarity colors: bronze / silver / gold.
  if (r === "Common") return "text-amber-700";
  if (r === "Uncommon") return "text-gray-300";
  if (r === "Rare") return "text-yellow-400";
  return "text-gray-400";
}
</script>

<template>
  <section>
    <header class="mb-6">
      <h1 class="text-2xl font-semibold">Prime Parts</h1>
      <p class="text-sm text-gray-500">
        Pin parts you still need — cards show which relics drop them.
      </p>
    </header>

    <!-- ── Fissures ───────────────────────────────────────────────────────── -->
    <section class="mb-8">
      <header class="mb-3 flex items-baseline justify-between gap-3">
        <div>
          <h2 class="text-lg font-semibold">Fissures</h2>
          <p class="text-xs text-gray-500">
            Pick up to 4 squad relics. Pinned parts are highlighted; click a row to toggle pin.
          </p>
        </div>
        <button
          v-if="hasAnySlot"
          @click="clearSquad"
          class="text-xs text-gray-500 hover:text-gray-300"
        >Clear all</button>
      </header>
      <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="(sel, i) in squad"
          :key="i"
          class="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-3"
        >
          <div class="relative mb-2">
            <input
              :value="drafts[i]"
              @input="onPickerInput(i, $event)"
              @focus="onPickerFocus(i)"
              @click="onPickerFocus(i)"
              @blur="onPickerBlur(i)"
              @keydown="onPickerKeydown(i, $event)"
              :placeholder="`Slot ${i + 1}: pick a relic…`"
              class="w-full rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] px-2 py-1 pr-6 text-sm outline-none focus:border-[var(--color-accent)]"
            />
            <button
              v-if="drafts[i]"
              @mousedown.prevent="setSlot(i, null)"
              class="absolute right-1 top-1/2 -translate-y-1/2 px-1 text-sm text-gray-400 hover:text-red-400"
              aria-label="Clear slot"
            >×</button>
            <ul
              v-if="openSlot === i"
              class="absolute left-0 right-0 top-full z-10 mt-1 max-h-64 overflow-y-auto rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-lg"
            >
              <li
                v-for="r in filteredRelicsFor(i)"
                :key="r.name"
                @mousedown.prevent="setSlot(i, r.name)"
                class="flex cursor-pointer items-center gap-2 px-2 py-1 text-xs hover:bg-[var(--color-surface-muted)]"
              >
                <span :class="['w-10 text-[10px] uppercase tracking-wide', tierClass(r.tier)]">
                  {{ r.tier }}
                </span>
                <span>{{ r.name }}</span>
              </li>
            </ul>
          </div>

          <ul v-if="sel" class="space-y-1">
            <li
              v-for="d in dropsForSlot(sel)"
              :key="d.part.id"
              @click="store.toggle(d.part.id)"
              :class="[
                'flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-xs transition',
                d.pinned
                  ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
                  : 'hover:bg-[var(--color-surface-muted)] text-gray-300',
              ]"
            >
              <span
                :class="['w-3 text-center font-semibold', rarityClass(d.rarity)]"
                :title="d.rarity"
              >{{ d.rarity[0] }}</span>
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

    <!-- ── Pins ──────────────────────────────────────────────────────────── -->
    <section>
      <header class="mb-3">
        <h2 class="text-lg font-semibold">Pinned</h2>
      </header>

      <div class="relative mb-4">
        <input
          v-model="query"
          @focus="showResults = true"
          @blur="onSearchBlur"
          placeholder="Search prime parts…"
          class="w-full rounded-md bg-[var(--color-surface-raised)] border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
        />
        <ul
          v-if="showResults && results.length"
          class="absolute left-0 right-0 top-full z-10 mt-1 max-h-96 overflow-y-auto rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-lg"
        >
          <li
            v-for="p in results"
            :key="p.id"
            @mousedown.prevent="store.toggle(p.id)"
            class="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-[var(--color-surface-muted)]"
          >
            <img
              v-if="p.image"
              :src="p.image"
              :alt="p.name"
              class="h-8 w-8 rounded bg-[var(--color-surface)] object-contain p-1"
              loading="lazy"
            />
            <div class="flex-1 min-w-0">
              <div class="truncate">{{ p.fullName }}</div>
              <div class="text-xs text-gray-500">
                {{ p.parentCategory }} · {{ p.ducats }} ducats
              </div>
            </div>
            <span
              v-if="store.pinned.includes(p.id)"
              class="text-xs text-[var(--color-accent)]"
            >pinned</span>
          </li>
        </ul>
      </div>

      <div v-if="!grouped.length" class="text-sm text-gray-500">
        No pinned parts yet. Search above to add some.
      </div>

      <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="g in grouped"
          :key="g.parent"
          class="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4"
        >
          <header class="mb-3 flex items-center gap-3">
            <img
              v-if="g.image"
              :src="g.image"
              :alt="g.parent"
              class="h-10 w-10 rounded bg-[var(--color-surface)] object-contain p-1"
            />
            <div>
              <h2 class="font-medium">{{ g.parent }}</h2>
              <div class="text-xs text-gray-500">{{ g.category }}</div>
            </div>
          </header>
          <ul class="space-y-2">
            <li
              v-for="part in g.parts"
              :key="part.id"
              class="flex gap-3 rounded-md bg-[var(--color-surface-muted)] p-3"
            >
              <img
                v-if="part.image"
                :src="part.image"
                :alt="part.name"
                class="h-10 w-10 shrink-0 rounded bg-[var(--color-surface)] object-contain p-1"
              />
              <div class="flex-1 min-w-0">
                <div class="flex items-baseline gap-2">
                  <span class="font-medium">{{ part.name }}</span>
                  <span class="text-xs text-gray-500">{{ part.ducats }}d</span>
                </div>
                <div
                  v-if="part.drops.length"
                  class="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs"
                >
                  <span
                    v-for="d in part.drops"
                    :key="d.relic"
                    :class="rarityClass(d.rarity)"
                  >{{ d.relic }}</span>
                </div>
                <div v-else class="mt-1 text-xs text-gray-500">
                  No relic drops listed (may be vaulted or reward-only).
                </div>
              </div>
              <button
                @click="store.unpin(part.id)"
                class="text-xs text-gray-400 hover:text-red-400"
              >
                Unpin
              </button>
            </li>
          </ul>
        </article>
      </div>
    </section>
  </section>
</template>
