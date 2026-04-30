<script setup lang="ts">
import TaskList from "./TaskList.vue";
import type { Task } from "../types";

defineProps<{
  title: string;
  subtitle?: string;
  resettable?: boolean;
  removeOnComplete?: boolean;
  tasks: Task[];
}>();

defineEmits<{
  add: [details: string];
  toggle: [id: string];
  remove: [id: string];
  notes: [id: string, notes: string];
  reset: [];
}>();
</script>

<template>
  <section class="max-w-2xl">
    <header class="mb-6" :class="resettable && 'flex items-center justify-between'">
      <div>
        <h1 class="text-2xl font-semibold">{{ title }}</h1>
        <p v-if="subtitle" class="text-sm text-gray-500">{{ subtitle }}</p>
      </div>
      <button
        v-if="resettable"
        @click="$emit('reset')"
        class="text-xs text-gray-400 hover:text-[var(--color-accent)]"
      >
        Reset
      </button>
    </header>
    <TaskList
      :tasks="tasks"
      :remove-on-complete="removeOnComplete"
      @add="$emit('add', $event)"
      @toggle="$emit('toggle', $event)"
      @remove="$emit('remove', $event)"
      @notes="(id, text) => $emit('notes', id, text)"
    />
  </section>
</template>
