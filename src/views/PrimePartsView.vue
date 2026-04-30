<script setup lang="ts">
import FissuresSection from "../components/FissuresSection.vue";
import PinnedPartsSection from "../components/PinnedPartsSection.vue";
</script>

<template>
  <section>
    <header class="mb-6">
      <h1 class="text-2xl font-semibold">Prime Parts</h1>
      <p class="text-sm text-gray-500">Pin parts you still need.</p>
    </header>
    <FissuresSection />
    <PinnedPartsSection />
  </section>
</template>
