<script setup lang="ts">
import TaskView from "../components/TaskView.vue";
import { useDailies } from "../stores/tasks";
import { storeToRefs } from "pinia";

const store = useDailies();
const { tasks } = storeToRefs(store);
</script>

<template>
  <TaskView
    title="Dailies"
    resettable
    :tasks="tasks"
    @add="store.add"
    @toggle="store.toggle"
    @remove="store.remove"
    @notes="store.setNotes"
    @reset="store.resetDone"
  />
</template>
