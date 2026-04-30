<script setup lang="ts">
import TaskList from "../components/TaskList.vue";
import { useDailies } from "../stores/tasks";
import { storeToRefs } from "pinia";

const store = useDailies();
const { tasks } = storeToRefs(store);
</script>

<template>
  <section class="max-w-2xl">
    <header class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Dailies</h1>
      <button
        @click="store.resetDone"
        class="text-xs text-gray-400 hover:text-[var(--color-accent)]"
      >
        Reset
      </button>
    </header>
    <TaskList
      :tasks="tasks"
      @add="store.add"
      @toggle="store.toggle"
      @remove="store.remove"
      @notes="store.setNotes"
    />
  </section>
</template>
