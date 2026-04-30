import { createRouter, createWebHistory } from "vue-router";
import { markRaw, type Component } from "vue";
import DailiesView from "./views/DailiesView.vue";
import WeekliesView from "./views/WeekliesView.vue";
import TodosView from "./views/TodosView.vue";
import ShardsView from "./views/ShardsView.vue";
import MarketView from "./views/MarketView.vue";
import GuidesView from "./views/GuidesView.vue";
import IconSun from "./components/icons/IconSun.vue";
import IconCalendar from "./components/icons/IconCalendar.vue";
import IconCheck from "./components/icons/IconCheck.vue";
import IconShard from "./components/icons/IconShard.vue";
import IconMarket from "./components/icons/IconMarket.vue";
import IconPrime from "./components/icons/IconPrime.vue";
import IconGuide from "./components/icons/IconGuide.vue";

export interface NavItem {
  path: string;
  name: string;
  icon: Component;
}

export const navItems: NavItem[] = [
  { path: "/", name: "Dailies", icon: markRaw(IconSun) },
  { path: "/weeklies", name: "Weeklies", icon: markRaw(IconCalendar) },
  { path: "/todos", name: "Todos", icon: markRaw(IconCheck) },
  { path: "/shards", name: "Archon Shards", icon: markRaw(IconShard) },
  { path: "/prime-parts", name: "Prime Parts", icon: markRaw(IconPrime) },
  { path: "/market", name: "Market", icon: markRaw(IconMarket) },
  { path: "/guides", name: "Guides", icon: markRaw(IconGuide) },
];

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: DailiesView },
    { path: "/weeklies", component: WeekliesView },
    { path: "/todos", component: TodosView },
    { path: "/shards", component: ShardsView },
    // Lazy-loaded: keeps the ~360KB prime parts JSON out of the main bundle.
    { path: "/prime-parts", component: () => import("./views/PrimePartsView.vue") },
    { path: "/market", component: MarketView },
    { path: "/guides", component: GuidesView },
  ],
});
