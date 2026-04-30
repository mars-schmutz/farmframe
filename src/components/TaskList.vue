<script setup lang="ts">
import { ref } from "vue";
import type { Task } from "../types";

defineProps<{
  tasks: Task[];
  // When true, toggling "done" removes the task instead (for the one-off todo list).
  removeOnComplete?: boolean;
}>();

const emit = defineEmits<{
  add: [details: string];
  toggle: [id: string];
  remove: [id: string];
  notes: [id: string, notes: string];
}>();

const draft = ref("");
const expanded = ref<string | null>(null);

function submit() {
  if (!draft.value.trim()) return;
  emit("add", draft.value);
  draft.value = "";
}
</script>

<template>
  <div class="space-y-4">
    <form @submit.prevent="submit" class="flex gap-2">
      <input
        v-model="draft"
        type="text"
        placeholder="Add a task…"
        class="flex-1 rounded-md bg-[var(--color-surface-raised)] border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
      />
      <button
        type="submit"
        class="rounded-md bg-[var(--color-accent)] text-black px-4 py-2 text-sm font-medium hover:opacity-90"
      >
        Add
      </button>
    </form>

    <ul v-if="tasks.length" class="space-y-2">
      <li
        v-for="task in tasks"
        :key="task.id"
        class="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)]"
      >
        <div class="flex items-center gap-3 px-3 py-2">
          <input
            type="checkbox"
            :checked="task.done"
            @change="removeOnComplete ? emit('remove', task.id) : emit('toggle', task.id)"
            class="h-4 w-4 accent-[var(--color-accent)]"
          />
          <span
            class="flex-1 text-sm"
            :class="task.done && 'line-through text-gray-500'"
          >
            {{ task.details }}
          </span>
          <button
            @click="expanded = expanded === task.id ? null : task.id"
            class="text-xs text-gray-400 hover:text-[var(--color-accent)]"
          >
            notes
          </button>
          <button
            v-if="!removeOnComplete"
            @click="emit('remove', task.id)"
            class="text-xs text-gray-400 hover:text-red-400"
            aria-label="Delete"
          >
            ✕
          </button>
        </div>
        <div v-if="expanded === task.id" class="px-3 pb-3">
          <textarea
            :value="task.notes"
            @input="emit('notes', task.id, ($event.target as HTMLTextAreaElement).value)"
            placeholder="Notes…"
            class="w-full rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] px-2 py-1 text-sm outline-none focus:border-[var(--color-accent)]"
            rows="3"
          />
        </div>
      </li>
    </ul>
    <p v-else class="text-sm text-gray-500">No tasks yet.</p>
  </div>
</template>
