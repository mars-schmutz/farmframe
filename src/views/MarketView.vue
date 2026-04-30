<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useMarket } from "../stores/market";
import PriceChart from "../components/PriceChart.vue";

const market = useMarket();

const query = ref("");
const showResults = ref(false);

onMounted(() => {
  market.loadCatalog();
  if (market.pinned.length) {
    market.refreshAll();
  }
});

const results = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return [];
  return market.catalog
    .filter((it) => it.name.toLowerCase().includes(q))
    .slice(0, 15);
});

function pin(slug: string) {
  market.pin(slug);
  query.value = "";
  showResults.value = false;
}

function onBlur() {
  window.setTimeout(() => (showResults.value = false), 150);
}

function lowest(slug: string): number | null {
  const top = market.lowestSellOrders(slug, 1);
  return top[0]?.platinum ?? null;
}
</script>

<template>
  <section>
    <header class="mb-6 flex items-center gap-4">
      <div>
        <h1 class="text-2xl font-semibold">Market</h1>
        <p class="text-sm text-gray-500">Pinned items with live sell orders and 90-day prices.</p>
      </div>
      <button
        @click="market.refreshAll(true)"
        class="ml-auto rounded-md border border-[var(--color-border)] px-3 py-1.5 text-xs hover:border-[var(--color-accent)] disabled:opacity-50"
        :disabled="!market.pinned.length"
      >
        Refresh all
      </button>
    </header>

    <div class="relative mb-6">
      <input
        v-model="query"
        @focus="showResults = true"
        @blur="onBlur"
        placeholder="Search items to pin…"
        class="w-full rounded-md bg-[var(--color-surface-raised)] border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
      />
      <div v-if="market.catalogError" class="mt-1 text-xs text-red-400">
        {{ market.catalogError }}
      </div>
      <div
        v-else-if="market.catalogLoading && !market.catalog.length"
        class="mt-1 text-xs text-gray-500"
      >
        Loading catalog…
      </div>
      <ul
        v-if="showResults && results.length"
        class="absolute left-0 right-0 top-full z-10 mt-1 max-h-80 overflow-y-auto rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] shadow-lg"
      >
        <li
          v-for="it in results"
          :key="it.slug"
          @mousedown.prevent="pin(it.slug)"
          class="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-[var(--color-surface-muted)]"
        >
          <img
            :src="it.thumb"
            :alt="it.name"
            class="h-8 w-8 rounded bg-[var(--color-surface)] object-cover"
            loading="lazy"
          />
          <span class="flex-1">{{ it.name }}</span>
          <span
            v-if="market.pinned.includes(it.slug)"
            class="text-xs text-[var(--color-accent)]"
          >pinned</span>
        </li>
      </ul>
    </div>

    <div v-if="!market.pinned.length" class="text-sm text-gray-500">
      No pinned items yet. Search above to add some.
    </div>

    <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="slug in market.pinned"
        :key="slug"
        class="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4"
      >
        <header class="mb-3 flex items-center gap-3">
          <img
            v-if="market.bySlug[slug]"
            :src="market.bySlug[slug].thumb"
            :alt="market.bySlug[slug].name"
            class="h-10 w-10 rounded bg-[var(--color-surface)] object-cover"
          />
          <div class="flex-1">
            <h2 class="font-medium">
              {{ market.bySlug[slug]?.name ?? slug }}
            </h2>
            <a
              :href="`https://warframe.market/items/${slug}`"
              target="_blank"
              rel="noopener"
              class="text-xs text-gray-500 hover:text-[var(--color-accent)]"
            >
              warframe.market →
            </a>
          </div>
          <button
            @click="market.refresh(slug, true)"
            :disabled="market.loading[slug]"
            class="text-xs text-gray-400 hover:text-[var(--color-accent)] disabled:opacity-50"
          >
            {{ market.loading[slug] ? "…" : "Refresh" }}
          </button>
          <button
            @click="market.unpin(slug)"
            class="text-xs text-gray-400 hover:text-red-400"
          >
            Unpin
          </button>
        </header>

        <div>
          <div class="mb-2 flex items-baseline gap-2">
            <div v-if="market.orders[slug]?.error" class="text-xs text-red-400">
              {{ market.orders[slug]?.error }}
            </div>
            <template v-else-if="lowest(slug) != null">
              <span class="font-mono text-2xl text-[var(--color-accent)]">
                {{ lowest(slug) }}<span class="text-base text-gray-500">p</span>
              </span>
              <span class="text-xs text-gray-500">current low</span>
            </template>
            <div v-else class="text-sm text-gray-500">
              {{ market.loading[slug] ? "Loading…" : "No online sellers." }}
            </div>
          </div>
          <PriceChart
            v-if="market.stats[slug]"
            :points="market.stats[slug].data"
            :width="200"
            :height="48"
          />
          <div v-else class="text-xs text-gray-500">Loading…</div>
        </div>
      </article>
    </div>
  </section>
</template>
