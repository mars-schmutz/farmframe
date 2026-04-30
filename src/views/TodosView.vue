<script setup lang="ts">
import TaskView from "../components/TaskView.vue";
import { useTodos } from "../stores/tasks";
import { storeToRefs } from "pinia";

const store = useTodos();
const { tasks } = storeToRefs(store);
</script>

<template>
  <TaskView
    title="Todos"
    subtitle="Checking one off removes it."
    remove-on-complete
    :tasks="tasks"
    @add="store.add"
    @toggle="store.toggle"
    @remove="store.remove"
    @notes="store.setNotes"
  />
</template>
