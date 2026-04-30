<script setup lang="ts">
import { ref } from "vue";
import { RouterLink, RouterView } from "vue-router";
import { navItems } from "./router";

const mobileOpen = ref(false);
</script>

<template>
  <div class="flex min-h-svh">
    <aside
      class="flex flex-col border-r border-[var(--color-border)] bg-[var(--color-surface-raised)] w-64 shrink-0"
      :class="!mobileOpen && 'hidden md:flex'"
    >
      <div class="border-b border-[var(--color-border)] px-5 py-4">
        <h1 class="text-lg font-semibold text-[var(--color-accent)]">Farmframe</h1>
      </div>
      <nav class="flex-1 p-3 space-y-1">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          v-slot="{ isActive }"
          @click="mobileOpen = false"
        >
          <span
            class="flex items-center gap-3 rounded-md px-3 py-2 text-sm transition"
            :class="isActive
              ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
              : 'text-gray-300 hover:bg-[var(--color-surface-muted)]'"
          >
            <component :is="item.icon" class="h-5 w-5 shrink-0" />
            {{ item.name }}
          </span>
        </RouterLink>
      </nav>
    </aside>

    <div class="flex flex-1 flex-col">
      <header class="flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-3 md:hidden">
        <button
          @click="mobileOpen = !mobileOpen"
          class="rounded-md border border-[var(--color-border)] px-3 py-1 text-sm"
        >
          ☰
        </button>
        <h1 class="text-lg font-semibold text-[var(--color-accent)]">Farmframe</h1>
      </header>
      <main class="flex-1 p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
