<script setup lang="ts">
import TaskList from "../components/TaskList.vue";
import { useTodos } from "../stores/tasks";
import { storeToRefs } from "pinia";

const store = useTodos();
const { tasks } = storeToRefs(store);
</script>

<template>
  <section class="max-w-2xl">
    <header class="mb-6">
      <h1 class="text-2xl font-semibold">Todos</h1>
      <p class="text-sm text-gray-500">Checking one off removes it.</p>
    </header>
    <TaskList
      :tasks="tasks"
      remove-on-complete
      @add="store.add"
      @toggle="store.toggle"
      @remove="store.remove"
      @notes="store.setNotes"
    />
  </section>
</template>
