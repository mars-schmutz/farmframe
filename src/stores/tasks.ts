import { defineStore } from "pinia";
import { ref } from "vue";
import { v4 as uuid } from "uuid";
import type { Task } from "../types";

function makeTaskStore(id: "dailies" | "weeklies" | "todos") {
  return defineStore(id, () => {
    const tasks = ref<Task[]>([]);

    function add(details: string) {
      const trimmed = details.trim();
      if (!trimmed) return;
      tasks.value.push({ id: uuid(), details: trimmed, done: false, notes: "" });
    }

    function toggle(taskId: string) {
      const t = tasks.value.find((x) => x.id === taskId);
      if (t) t.done = !t.done;
    }

    function remove(taskId: string) {
      tasks.value = tasks.value.filter((x) => x.id !== taskId);
    }

    function setNotes(taskId: string, notes: string) {
      const t = tasks.value.find((x) => x.id === taskId);
      if (t) t.notes = notes;
    }

    function resetDone() {
      tasks.value.forEach((t) => (t.done = false));
    }

    return { tasks, add, toggle, remove, setNotes, resetDone };
  }, {
    persist: { key: `farmframe:${id}` },
  });
}

export const useDailies = makeTaskStore("dailies");
export const useWeeklies = makeTaskStore("weeklies");
export const useTodos = makeTaskStore("todos");
