<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    interactive?: boolean;
  }>(),
  { interactive: false },
);
</script>

<template>
  <div
    class="rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800"
    :class="props.interactive ? 'transition-transform duration-300 hover:scale-[1.03]' : ''"
  >
    <slot name="media" />
    <div class="p-3">
      <slot />
    </div>
    <div v-if="$slots.footer" class="px-3 pb-3">
      <slot name="footer" />
    </div>
  </div>
</template>


