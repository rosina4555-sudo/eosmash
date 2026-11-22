<script setup lang="ts">
withDefaults(
  defineProps<{
    markSize?: number
    textClass?: string
  }>(),
  {
    markSize: 26,
    textClass: 'text-[22px]',
  },
)
</script>

<template>
  <span class="inline-flex items-center gap-2.5">
    <svg
      :width="markSize"
      :height="markSize"
      viewBox="0 0 64 64"
      fill="none"
      class="shrink-0"
      aria-hidden="true"
    >
      <g transform="translate(11 0) skewX(-18)">
        <rect x="14" y="12" width="9" height="40" fill="var(--color-pure-white)" />
        <rect x="14" y="12" width="34" height="9" fill="var(--color-pure-white)" />
        <rect x="14" y="27.5" width="26" height="9" fill="var(--color-electric-lime)" />
        <rect x="44" y="27.5" width="7" height="9" fill="var(--color-electric-lime)" />
        <rect x="14" y="43" width="34" height="9" fill="var(--color-pure-white)" />
      </g>
    </svg>
    <span
      class="font-heading font-bold leading-none tracking-[-0.03em] text-pure-white transition-colors group-hover:text-electric-lime"
      :class="textClass"
    >
      eos<span class="text-electric-lime">mash</span>
    </span>
  </span>
</template>
