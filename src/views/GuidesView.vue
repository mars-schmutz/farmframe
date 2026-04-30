<script setup lang="ts">
import { ref } from "vue";
import { useGuides } from "../stores/guides";

const store = useGuides();

const title = ref("");
const url = ref("");

function onAdd() {
  let u = url.value.trim();
  if (u && !/^https?:\/\//i.test(u)) u = "https://" + u;
  store.add(title.value, u);
  title.value = "";
  url.value = "";
}

function displayHost(u: string): string {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
}
</script>

<template>
  <section>
    <header class="mb-6">
      <h1 class="text-2xl font-semibold">Guides</h1>
      <p class="text-sm text-gray-500">Save links to external resources — world-state trackers, wikis, planners.</p>
    </header>

    <form @submit.prevent="onAdd" class="mb-6 flex flex-wrap gap-2">
      <input
        v-model="title"
        placeholder="Title"
        required
        class="flex-1 min-w-[12rem] rounded-md bg-[var(--color-surface-raised)] border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
      />
      <input
        v-model="url"
        placeholder="example.com or https://..."
        required
        class="flex-[2] min-w-[16rem] rounded-md bg-[var(--color-surface-raised)] border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
      />
      <button
        type="submit"
        class="rounded-md border border-[var(--color-accent)] bg-[var(--color-accent-muted)] px-4 py-2 text-sm text-[var(--color-accent)] hover:bg-[var(--color-accent)]/20"
      >
        Add
      </button>
    </form>

    <div v-if="!store.guides.length" class="text-sm text-gray-500">
      No guides yet. Add a link above.
    </div>

    <div v-else class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="g in store.guides"
        :key="g.id"
        class="group relative rounded-md border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 transition hover:border-[var(--color-accent)]"
      >
        <a
          :href="g.url"
          target="_blank"
          rel="noopener noreferrer"
          class="block pr-6"
        >
          <div class="font-medium truncate">{{ g.title }}</div>
          <div class="mt-1 text-xs text-gray-500 truncate">{{ displayHost(g.url) }}</div>
        </a>
        <button
          @click="store.remove(g.id)"
          title="Remove"
          class="absolute top-2 right-2 text-gray-500 hover:text-red-400 text-sm leading-none"
        >
          ×
        </button>
      </div>
    </div>
  </section>
</template>
