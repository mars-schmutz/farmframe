// disable warframe.market calls
export const MARKET_API_ENABLED = false;

// Override via VITE_MARKET_API_BASE for production deployments that have
// their own proxy in front.
const BASE = import.meta.env.VITE_MARKET_API_BASE ?? "/market-api";

const STATIC_BASE = "https://api.warframe.market";

const PLATFORM = "pc";

const HEADERS: HeadersInit = {
  Accept: "application/json",
  "Accept-Language": "en",
};

export interface CatalogItem {
  id: string;
  slug: string;
  name: string;
  // full url
  thumb: string;
}

export type OrderStatus = "ingame" | "online" | "offline";

export interface Order {
  id: string;
  platinum: number;
  quantity: number;
  perTrade: number;
  type: "sell" | "buy";
  user: {
    ingameName: string;
    status: OrderStatus;
    reputation: number;
    platform: string;
  };
}

export interface StatPoint {
  datetime: string;
  volume: number;
  min_price: number;
  max_price: number;
  avg_price: number;
  median: number;
}

interface V2Response<T> {
  apiVersion: string;
  data: T;
  error?: unknown;
}

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: HEADERS });
  if (!res.ok) {
    throw new Error(`Market API ${res.status} ${res.statusText} (${path})`);
  }
  return res.json();
}

interface RawCatalogItem {
  id: string;
  slug: string;
  i18n?: { en?: { name?: string; thumb?: string } };
}

function thumbUrl(path?: string): string {
  if (!path) return "";
  return `${STATIC_BASE}/static/assets/${path}`;
}

export async function getItems(): Promise<CatalogItem[]> {
  if (!MARKET_API_ENABLED) return [];
  const res = await fetchJson<V2Response<RawCatalogItem[]>>("/v2/items");
  return res.data.map((it) => ({
    id: it.id,
    slug: it.slug,
    name: it.i18n?.en?.name ?? it.slug,
    thumb: thumbUrl(it.i18n?.en?.thumb),
  }));
}

interface RawTopOrders {
  sell: Order[];
  buy: Order[];
}

export async function getTopOrders(slug: string): Promise<Order[]> {
  if (!MARKET_API_ENABLED) return [];
  const res = await fetchJson<V2Response<RawTopOrders>>(
    `/v2/orders/item/${slug}/top?platform=${PLATFORM}`,
  );
  return res.data.sell;
}

export async function getStatistics(slug: string): Promise<StatPoint[]> {
  if (!MARKET_API_ENABLED) return [];
  const res = await fetchJson<{
    payload: { statistics_closed: { "90days": StatPoint[] } };
  }>(`/v1/items/${slug}/statistics`);
  return res.payload.statistics_closed["90days"];
}
