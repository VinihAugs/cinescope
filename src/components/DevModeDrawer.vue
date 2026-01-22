<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import UiButton from './ui/UiButton.vue';
import { devInsights, devModeIntro, type DevInsightCategory } from '../data/dev-insights';

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const tabs: DevInsightCategory[] = [
  'Arquitetura',
  'Gerenciamento de Estado',
  'UI/UX',
  'Performance',
  'Decisões de Código',
];
const active = ref<DevInsightCategory>('Arquitetura');
const copiedId = ref<string | null>(null);

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

async function copyToClipboard(id: string, text: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      ta.style.top = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    copiedId.value = id;
    window.setTimeout(() => {
      if (copiedId.value === id) copiedId.value = null;
    }, 1200);
  } catch {
    copiedId.value = null;
  }
}

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

type CodeToken = { text: string; cls: string };
function highlightTs(code: string): CodeToken[] {
  const re =
    /(`[^`]*`|"[^"\n]*"|'[^'\n]*')|\b(import|export|const|let|var|function|return|if|else|try|catch|await|async|type|interface|class|new|switch|case|break|continue|for|while|throw)\b|(\b\d+(\.\d+)?\b)|([{}()[\];,.<>:=/+*-])/g;
  const out: CodeToken[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code))) {
    const start = m.index;
    if (start > last) out.push({ text: code.slice(last, start), cls: 'text-neutral-200' });
    const [full, str, kw, num, _num2, punc] = m;
    if (str) out.push({ text: full, cls: 'text-emerald-200' });
    else if (kw) out.push({ text: full, cls: 'text-violet-200 font-semibold' });
    else if (num) out.push({ text: full, cls: 'text-amber-200' });
    else if (punc) out.push({ text: full, cls: 'text-neutral-400' });
    else out.push({ text: full, cls: 'text-neutral-200' });
    last = start + full.length;
  }
  if (last < code.length) out.push({ text: code.slice(last), cls: 'text-neutral-200' });
  return out;
}

const entries = computed(() => devInsights.filter((x) => x.category === active.value));
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
                      <template v-for="(t, i) in tokenizeInlineCode(devModeIntro)" :key="i">
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
                    :key="entry.id"
                    class="rounded-2xl bg-neutral-900/60 border border-neutral-800 p-5"
                  >
                    <h4 class="text-base font-black mb-3">{{ entry.title }}</h4>

                    <div class="space-y-3 text-sm leading-relaxed text-neutral-200">
                      <div>
                        <p class="text-neutral-400 text-xs font-black uppercase tracking-widest mb-1">O Problema</p>
                        <p class="text-neutral-200">
                          <template v-for="(t, i) in tokenizeInlineCode(entry.problem)" :key="i">
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

                      <div v-if="entry.codeSnippet" class="pt-1">
                        <p class="text-neutral-400 text-xs font-black uppercase tracking-widest mb-2">Trecho do código</p>
                        <div class="rounded-xl bg-neutral-950 border border-neutral-800 overflow-hidden">
                          <div class="flex items-center justify-end px-3 py-2 border-b border-white/5 bg-neutral-950/60">
                            <button
                              type="button"
                              class="inline-flex items-center gap-2 text-xs font-bold text-neutral-300 hover:text-white transition-colors"
                              @click="copyToClipboard(entry.id, entry.codeSnippet)"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                              >
                                <rect x="9" y="9" width="13" height="13" rx="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                              </svg>
                              <span>{{ copiedId === entry.id ? 'Copiado!' : 'Copiar' }}</span>
                            </button>
                          </div>
                          <pre class="p-4 overflow-x-auto text-[12px] leading-relaxed font-mono"><code>
<span v-for="(tok, i) in highlightTs(entry.codeSnippet)" :key="i" :class="tok.cls">{{ tok.text }}</span>
</code></pre>
                        </div>
                      </div>

                      <div>
                        <p class="text-neutral-400 text-xs font-black uppercase tracking-widest mb-1">
                          Trade-offs (O Pulo do Gato)
                        </p>
                        <p class="text-neutral-200">
                          <template v-for="(t, i) in tokenizeInlineCode(entry.tradeOff)" :key="i">
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


