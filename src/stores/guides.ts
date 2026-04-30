import { defineStore } from "pinia";
import { ref } from "vue";
import { v4 as uuid } from "uuid";

export interface Guide {
  id: string;
  title: string;
  url: string;
}

export const useGuides = defineStore("guides", () => {
  const guides = ref<Guide[]>([]);

  function add(title: string, url: string) {
    const t = title.trim();
    const u = url.trim();
    if (!t || !u) return;
    guides.value.push({ id: uuid(), title: t, url: u });
  }

  function remove(id: string) {
    guides.value = guides.value.filter((g) => g.id !== id);
  }

  return { guides, add, remove };
}, {
  persist: { key: "farmframe:guides" },
});
