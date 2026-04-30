<script setup lang="ts">
import { computed } from "vue";
import type { StatPoint } from "../api/market";

const props = withDefaults(defineProps<{
  points: StatPoint[];
  width?: number;
  height?: number;
}>(), {
  width: 240,
  height: 60,
});

const chart = computed(() => {
  const pts = props.points.filter((p) => p.avg_price != null);
  if (pts.length < 2) return null;

  const values = pts.map((p) => p.avg_price);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const stepX = props.width / (pts.length - 1);
  const coords = pts.map((p, i) => {
    const x = i * stepX;
    const y = props.height - ((p.avg_price - min) / range) * props.height;
    return [x, y] as const;
  });

  const line = coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `M0,${props.height} L${line.split(" ").join(" L")} L${props.width},${props.height} Z`;

  const last = pts[pts.length - 1];
  const first = pts[0];
  const delta = last.avg_price - first.avg_price;

  return {
    line,
    area,
    min: min.toFixed(0),
    max: max.toFixed(0),
    last: last.avg_price.toFixed(0),
    delta,
  };
});
</script>

<template>
  <div v-if="chart" class="flex items-center gap-3">
    <svg
      :width="width"
      :height="height"
      :viewBox="`0 0 ${width} ${height}`"
      class="overflow-visible"
    >
      <path
        :d="chart.area"
        fill="var(--color-accent)"
        fill-opacity="0.12"
      />
      <polyline
        :points="chart.line"
        fill="none"
        stroke="var(--color-accent)"
        stroke-width="1.5"
        stroke-linejoin="round"
      />
    </svg>
    <div class="text-xs text-gray-400 space-y-0.5">
      <div><span class="text-gray-500">now</span> {{ chart.last }}p</div>
      <div><span class="text-gray-500">90d</span> {{ chart.min }}–{{ chart.max }}p</div>
      <div :class="chart.delta >= 0 ? 'text-emerald-400' : 'text-red-400'">
        {{ chart.delta >= 0 ? "▲" : "▼" }} {{ Math.abs(chart.delta).toFixed(0) }}p
      </div>
    </div>
  </div>
  <div v-else class="text-xs text-gray-500">Not enough history.</div>
</template>
