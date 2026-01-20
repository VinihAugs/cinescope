<script setup lang="ts">
import { computed } from 'vue';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'md' | 'lg';

const props = withDefaults(
  defineProps<{
    variant?: Variant;
    size?: Size;
    disabled?: boolean;
    block?: boolean;
    type?: 'button' | 'submit' | 'reset';
  }>(),
  { variant: 'primary', size: 'md', disabled: false, block: false, type: 'button' },
);

const classes = computed(() => {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full font-bold transition-all select-none focus:outline-none focus:ring-2 focus:ring-red-600/70';
  const sizes = props.size === 'lg' ? 'px-6 py-3 text-sm' : 'px-4 py-2 text-sm';
  const block = props.block ? 'w-full' : '';
  const disabled = props.disabled ? 'opacity-60 pointer-events-none' : '';

  const variant =
    props.variant === 'primary'
      ? 'bg-red-600 hover:bg-red-500 text-white'
      : props.variant === 'secondary'
        ? 'bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800'
        : 'bg-transparent hover:bg-neutral-900 text-white border border-neutral-800';

  return [base, sizes, variant, block, disabled].filter(Boolean).join(' ');
});
</script>

<template>
  <button :type="props.type" :disabled="props.disabled" :class="classes">
    <slot />
  </button>
</template>


