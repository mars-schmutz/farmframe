import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  getItems,
  getTopOrders,
  getStatistics,
  type CatalogItem,
  type Order,
  type StatPoint,
} from "../api/market";

const CACHE_TTL_MS = 5 * 60 * 1000;

interface Cached<T> {
  data: T;
  at: number;
  error?: string;
}

export const useMarket = defineStore("market", () => {
  const catalog = ref<CatalogItem[]>([]);
  const catalogLoading = ref(false);
  const catalogError = ref<string | null>(null);

  const pinned = ref<string[]>([]); // slug[]
  const orders = ref<Record<string, Cached<Order[]>>>({});
  const stats = ref<Record<string, Cached<StatPoint[]>>>({});
  const loading = ref<Record<string, boolean>>({});

  const bySlug = computed(() => {
    const m: Record<string, CatalogItem> = {};
    for (const it of catalog.value) m[it.slug] = it;
    return m;
  });

  async function loadCatalog() {
    if (catalog.value.length || catalogLoading.value) return;
    catalogLoading.value = true;
    catalogError.value = null;
    try {
      catalog.value = await getItems();
    } catch (err) {
      catalogError.value = err instanceof Error ? err.message : "Failed to load catalog";
    } finally {
      catalogLoading.value = false;
    }
  }

  function pin(slug: string) {
    if (!pinned.value.includes(slug)) {
      pinned.value.push(slug);
      void refresh(slug);
    }
  }

  function unpin(slug: string) {
    pinned.value = pinned.value.filter((n) => n !== slug);
  }

  function isFresh<T>(entry: Cached<T> | undefined): boolean {
    return !!entry && !entry.error && Date.now() - entry.at < CACHE_TTL_MS;
  }

  async function refresh(slug: string, force = false) {
    if (loading.value[slug]) return;
    if (!force && isFresh(orders.value[slug]) && isFresh(stats.value[slug])) return;
    loading.value[slug] = true;
    try {
      const [o, s] = await Promise.allSettled([
        getTopOrders(slug),
        getStatistics(slug),
      ]);
      orders.value[slug] = o.status === "fulfilled"
        ? { data: o.value, at: Date.now() }
        : { data: [], at: Date.now(), error: String(o.reason) };
      stats.value[slug] = s.status === "fulfilled"
        ? { data: s.value, at: Date.now() }
        : { data: [], at: Date.now(), error: String(s.reason) };
    } finally {
      loading.value[slug] = false;
    }
  }

  async function refreshAll(force = false) {
    // Small delay between requests; API rate-limits ~3/s.
    for (const slug of pinned.value) {
      await refresh(slug, force);
      await new Promise((r) => setTimeout(r, 350));
    }
  }

  async function refreshMany(slugs: string[]) {
    for (const slug of slugs) {
      const before = orders.value[slug]?.at ?? 0;
      await refresh(slug);
      const after = orders.value[slug]?.at ?? 0;
      if (after > before) {
        await new Promise((r) => setTimeout(r, 300));
      }
    }
  }

  function lowestSellOrders(slug: string, limit = 10): Order[] {
    const entry = orders.value[slug];
    if (!entry) return [];
    return entry.data.slice(0, limit);
  }

  return {
    catalog,
    catalogLoading,
    catalogError,
    pinned,
    orders,
    stats,
    loading,
    bySlug,
    loadCatalog,
    pin,
    unpin,
    refresh,
    refreshAll,
    refreshMany,
    lowestSellOrders,
  };
}, {
  persist: {
    key: "farmframe:market",
    pick: ["pinned"],
  },
});
