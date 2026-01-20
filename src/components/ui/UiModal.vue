<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close');
}

watch(
  () => props.open,
  (v) => {
    document.body.style.overflow = v ? 'hidden' : '';
  },
  { immediate: true },
);

onMounted(() => window.addEventListener('keydown', onKeydown));
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
  document.body.style.overflow = '';
});
</script>

<template>
  <Transition name="fade">
    <div v-if="props.open" class="fixed inset-0 z-50">
      <div class="absolute inset-0 bg-black/70" @click="emit('close')" />

      <div class="absolute inset-0 overflow-y-auto">
        <div class="min-h-full flex items-center justify-center p-4">
          <div
            class="w-full max-w-4xl rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-2xl"
            @click.stop
          >
            <div v-if="$slots.title" class="px-6 py-4 border-b border-white/10">
              <slot name="title" />
            </div>

            <slot />

            <div v-if="$slots.footer" class="px-6 py-4 border-t border-white/10">
              <slot name="footer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 180ms ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>


