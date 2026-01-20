<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import UiButton from './ui/UiButton.vue';
import { projectDocs, type DocCategoryKey } from '../data/projectDocs';

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const tabs = Object.keys(projectDocs.categories) as DocCategoryKey[];
const active = ref<DocCategoryKey>('Arquitetura');

watch(
  () => props.open,
  (v) => {
    document.body.style.overflow = v ? 'hidden' : '';
    if (v) active.value = 'Arquitetura';
  },
  { immediate: true },
);

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close');
}

onMounted(() => window.addEventListener('keydown', onKeydown));
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
  document.body.style.overflow = '';
});

type Token = { type: 'text' | 'code'; value: string };
function tokenizeInlineCode(input: string): Token[] {
  const parts = input.split('`');
  const out: Token[] = [];
  for (let i = 0; i < parts.length; i++) {
    const value = parts[i] ?? '';
    if (!value) continue;
    out.push({ type: i % 2 === 1 ? 'code' : 'text', value });
  }
  return out;
}

const entries = computed(() => projectDocs.categories[active.value] ?? []);
</script>

<template>
  <Teleport to="body">
    <Transition name="devmode-fade">
      <div v-if="props.open" class="fixed inset-0 z-50">
        <div class="absolute inset-0 bg-black/70" @click="emit('close')" />

        <Transition name="devmode-slide">
          <aside
            class="absolute right-0 top-0 h-full w-full sm:w-[520px] bg-neutral-950/95 backdrop-blur-xl border-l border-white/10 shadow-2xl"
            @click.stop
          >
            <div class="h-full flex flex-col">
              <header class="px-6 py-5 border-b border-white/10">
                <div class="flex items-start justify-between gap-4">
                  <div class="min-w-0">
                    <div class="flex items-center gap-2">
                      <span
                        class="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-800 text-red-500 font-black"
                        aria-hidden="true"
                      >
                        &lt;/&gt;
                      </span>
                      <h3 class="text-lg font-black tracking-tight">Bastidores (Dev Mode)</h3>
                    </div>
                    <p class="text-sm text-neutral-400 mt-2 leading-relaxed">
                      <template v-for="(t, i) in tokenizeInlineCode(projectDocs.intro)" :key="i">
                        <code
                          v-if="t.type === 'code'"
                          class="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-200 font-mono text-[12px]"
                          >{{ t.value }}</code
                        >
                        <span v-else>{{ t.value }}</span>
                      </template>
                    </p>
                  </div>

                  <UiButton variant="ghost" @click="emit('close')">Fechar</UiButton>
                </div>
              </header>

              <div class="px-6 py-4 border-b border-white/10">
                <div class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                  <button
                    v-for="t in tabs"
                    :key="t"
                    class="px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap"
                    :class="
                      active === t
                        ? 'bg-red-600 text-white'
                        : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white'
                    "
                    @click="active = t"
                  >
                    {{ t }}
                  </button>
                </div>
              </div>

              <div class="flex-1 overflow-y-auto px-6 py-5">
                <div class="space-y-4">
                  <div
                    v-for="entry in entries"
                    :key="entry.title"
                    class="rounded-2xl bg-neutral-900/60 border border-neutral-800 p-5"
                  >
                    <h4 class="text-base font-black mb-3">{{ entry.title }}</h4>

                    <div class="space-y-3 text-sm leading-relaxed text-neutral-200">
                      <div>
                        <p class="text-neutral-400 text-xs font-black uppercase tracking-widest mb-1">O Desafio</p>
                        <p class="text-neutral-200">
                          <template v-for="(t, i) in tokenizeInlineCode(entry.challenge)" :key="i">
                            <code
                              v-if="t.type === 'code'"
                              class="px-1.5 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-200 font-mono text-[12px]"
                              >{{ t.value }}</code
                            >
                            <span v-else>{{ t.value }}</span>
                          </template>
                        </p>
                      </div>

                      <div>
                        <p class="text-neutral-400 text-xs font-black uppercase tracking-widest mb-1">A Solução</p>
                        <p class="text-neutral-200">
                          <template v-for="(t, i) in tokenizeInlineCode(entry.solution)" :key="i">
                            <code
                              v-if="t.type === 'code'"
                              class="px-1.5 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-200 font-mono text-[12px]"
                              >{{ t.value }}</code
                            >
                            <span v-else>{{ t.value }}</span>
                          </template>
                        </p>
                      </div>

                      <div>
                        <p class="text-neutral-400 text-xs font-black uppercase tracking-widest mb-1">
                          Trade-offs (O Pulo do Gato)
                        </p>
                        <p class="text-neutral-200">
                          <template v-for="(t, i) in tokenizeInlineCode(entry.tradeoffs)" :key="i">
                            <code
                              v-if="t.type === 'code'"
                              class="px-1.5 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-200 font-mono text-[12px]"
                              >{{ t.value }}</code
                            >
                            <span v-else>{{ t.value }}</span>
                          </template>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <footer class="px-6 py-4 border-t border-white/10 flex items-center justify-between gap-3">
                <p class="text-xs text-neutral-500">
                  Dica: passe o mouse/seleciona termos em <code class="font-mono">`backticks`</code> para reconhecer as APIs citadas.
                </p>
                <UiButton variant="secondary" @click="emit('close')">Ok</UiButton>
              </footer>
            </div>
          </aside>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.devmode-fade-enter-active,
.devmode-fade-leave-active {
  transition: opacity 180ms ease;
}
.devmode-fade-enter-from,
.devmode-fade-leave-to {
  opacity: 0;
}

.devmode-slide-enter-active,
.devmode-slide-leave-active {
  transition: transform 220ms ease;
}
.devmode-slide-enter-from,
.devmode-slide-leave-to {
  transform: translateX(12px);
}
</style>


