<script setup lang="ts">
import TaskView from "../components/TaskView.vue";
import { useWeeklies } from "../stores/tasks";
import { storeToRefs } from "pinia";

const store = useWeeklies();
const { tasks } = storeToRefs(store);
</script>

<template>
  <TaskView
    title="Weeklies"
    resettable
    :tasks="tasks"
    @add="store.add"
    @toggle="store.toggle"
    @remove="store.remove"
    @notes="store.setNotes"
    @reset="store.resetDone"
  />
</template>
