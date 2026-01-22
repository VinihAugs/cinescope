export type DevInsightCategory =
  | 'Arquitetura'
  | 'Gerenciamento de Estado'
  | 'Performance'
  | 'UI/UX'
  | 'Decisões de Código';

export interface DevInsight {
  id: string;
  category: DevInsightCategory;
  title: string;
  problem: string;
  solution: string;
  codeSnippet?: string;
  tradeOff: string;
}

export const devModeIntro =
  'Eu implementei o CineScope como uma demo “tipo streaming” focada em UX. Aqui eu explico as decisões reais que tomei neste código (sem floreio), com exemplos curtos do próprio projeto.';

export const devInsights: DevInsight[] = [
  {
    id: 'arch-composables',
    category: 'Arquitetura',
    title: 'Composition API + Composables (lógica reutilizável)',
    problem:
      'Em apps de catálogo, a Home costuma virar um “componente monstro”: busca, filtros, loading/error, fetch, cancelamento, estado de UI… tudo misturado. Isso dificulta manutenção e reaproveitamento.',
    solution:
      'Eu movi a lógica de domínio para composables (ex: `useMovies`) e deixei a view focada em layout e interações. Assim Home e outras telas podem consumir a mesma API de dados sem duplicar regra.',
    codeSnippet: `// src/composables/useMovies.ts
export function useMovies() {
  const mediaType = ref<MediaType>('movie');
  const query = ref('');
  const selectedGenreId = ref<number | null>(null);

  const movies = ref<MovieSummary[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  let abort: AbortController | null = null;
  // ...`,
    tradeOff:
      'Eu poderia ter usado uma arquitetura em camadas mais formal (services/repositories). Aqui, composables entregam clareza e velocidade para um projeto de portfólio, sem overengineering.',
  },
  {
    id: 'arch-router-splitting',
    category: 'Arquitetura',
    title: 'Rotas com import dinâmico (code splitting)',
    problem:
      'Carregar todo o JS no primeiro paint piora tempo de carregamento — especialmente quando a Home já é visualmente pesada.',
    solution:
      'Eu configurei o `vue-router` com `import()` nas views, então cada página vira um chunk e só é carregada quando necessária.',
    codeSnippet: `// src/router/index.ts
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('../views/HomeView.vue') },
    { path: '/assistir-depois', name: 'watchlist', component: () => import('../views/WatchlistView.vue') },
  ],
});`,
    tradeOff:
      'Code splitting adiciona mais arquivos/chunks e pode aumentar requests. Para este app, o ganho de não carregar a tela de lista antes da hora vale a pena.',
  },
  {
    id: 'state-pinia-watchlist',
    category: 'Gerenciamento de Estado',
    title: 'Pinia para “Assistir Depois” + persistência',
    problem:
      'A lista “Assistir Depois” precisa estar disponível em múltiplas telas e sobreviver a refresh. Se eu deixo isso só em estado local, a UX fica frágil.',
    solution:
      'Eu centralizei a watchlist em um store Pinia e persisto no `localStorage`. A UI só chama ações (`toggle`, `remove`, `clear`) e o store garante consistência.',
    codeSnippet: `// src/stores/watchlist.ts
export const useWatchlistStore = defineStore('watchlist', {
  state: () => ({ items: loadInitial() as MovieSummary[] }),
  getters: {
    count: (s) => s.items.length,
    isInList: (s) => (id: number) => s.items.some((m) => m.id === id),
  },
  actions: {
    toggle(movie: MovieSummary) {
      const idx = this.items.findIndex((m) => m.id === movie.id);
      if (idx >= 0) this.items.splice(idx, 1);
      else this.items.unshift(movie);
      this.persist();
    },
  },
});`,
    tradeOff:
      'Eu poderia usar `localStorage` direto nos componentes, mas o store deixa o fluxo explícito e escalável (e evita duplicação de lógica).',
  },
  {
    id: 'state-ui-store',
    category: 'Gerenciamento de Estado',
    title: 'Estado de UI separado (Drawer/Dev Mode)',
    problem:
      'Modais/Drawers são estado de UI. Se cada tela controla isso localmente, você duplica estado e eventos.',
    solution:
      'Criei um store mínimo só para UI (`useUiStore`) e abro/fecho o Drawer de qualquer tela sem acoplamento.',
    codeSnippet: `// src/stores/ui.ts
export const useUiStore = defineStore('ui', {
  state: () => ({ devModeOpen: false }),
  actions: {
    openDevMode() { this.devModeOpen = true; },
    closeDevMode() { this.devModeOpen = false; },
  },
});`,
    tradeOff:
      'Dava para fazer um composable singleton, mas Pinia mantém um padrão único no app e facilita evolução futura (ex: toasts, theme, etc).',
  },
  {
    id: 'perf-v-lazy',
    category: 'Performance',
    title: 'Lazy loading de imagens com diretiva `v-lazy`',
    problem:
      'Catálogo com muitos posters/backdrops destrói performance se você carregar tudo de uma vez (rede + memória + layout).',
    solution:
      'Implementei `v-lazy` com `IntersectionObserver`: a imagem só troca o `src` quando entra perto da viewport. Também tratei o caso em que o `src` muda (ex: alternar Filmes/Séries).',
    codeSnippet: `// src/directives/vLazy.ts
export const vLazy: Directive<HTMLImageElement, LazyValue> = {
  mounted(el, binding) {
    const initial = getSrc(binding.value);
    const load = (cfg) => { el.src = cfg.src; };
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting) return;
      load(initial);
    }, { rootMargin: '200px 0px', threshold: 0.01 });
    observer.observe(el);
  },
  updated(el, binding) {
    const nextCfg = getSrc(binding.value);
    // ... reseta placeholder e re-observa para carregar o novo src
  },
};`,
    tradeOff:
      'Uma lib pronta reduziria código, mas eu quis demonstrar domínio de diretivas no Vue e controlar os edge cases do jeito que o produto precisa.',
  },
  {
    id: 'perf-abort-controller',
    category: 'Performance',
    title: 'Cancelamento de requisições (AbortController)',
    problem:
      'Em busca/filtro, requisições antigas podem “chegar depois” e sobrescrever a UI (race condition). Além disso, você gasta rede à toa.',
    solution:
      'Nos composables eu mantenho um `AbortController` e aborto a request anterior sempre que uma nova começa.',
    codeSnippet: `// src/composables/useMovies.ts
async function fetchTrending() {
  loading.value = true;
  abort?.abort();
  abort = new AbortController();
  const data = await tmdbFetch('/trending/...', {}, abort.signal);
  // ...
}`,
    tradeOff:
      'Outra opção é ignorar respostas antigas por timestamp. Abort é mais simples e economiza rede.',
  },
  {
    id: 'uiux-transition-group',
    category: 'UI/UX',
    title: 'Animação do grid com `<TransitionGroup>`',
    problem:
      'Quando o usuário filtra/reordena, o grid “pula” e parece barato. Um app de catálogo precisa parecer premium.',
    solution:
      'Usei `<TransitionGroup>` no grid e classes `list-*` para animar entrada/saída/movimento com baixo custo de bundle.',
    codeSnippet: `// src/views/HomeView.vue
<TransitionGroup
  name="list"
  tag="div"
  class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6"
>
  <MovieCard v-for="m in moviesApi.movies.value" :key="m.id" :movie="m" />
</TransitionGroup>`,
    tradeOff:
      'Libs de animação dão mais controle, mas aqui o nativo do Vue entrega o efeito certo com menos peso.',
  },
  {
    id: 'uiux-slots-design-system',
    category: 'UI/UX',
    title: 'Design System com Slots (UI agnóstica)',
    problem:
      'Repetir markup de modal/card/botão em vários lugares aumenta inconsistência visual e manutenção.',
    solution:
      'Criei componentes UI com slots (`UiModal`, `UiCard`, `UiButton`) e reutilizei em detalhes, watchlist e dev mode.',
    codeSnippet: `// src/components/ui/UiModal.vue
<div v-if="props.open" class="fixed inset-0 z-50">
  <div class="absolute inset-0 bg-black/70" @click="emit('close')" />
  <div class="w-full max-w-4xl rounded-2xl overflow-hidden bg-neutral-900">
    <slot />
  </div>
</div>`,
    tradeOff:
      'Eu poderia usar um componente pronto, mas construir isso “na unha” mostra domínio de slots/transitions e mantém o visual consistente com o resto do app.',
  },
  {
    id: 'code-tmdb-language-fallback',
    category: 'Decisões de Código',
    title: 'Fallback de idioma para trailers (pt-BR → en-US)',
    problem:
      'No TMDB, trailers frequentemente não existem em `pt-BR`, então “Reproduzir” poderia ficar quebrado sem um fallback.',
    solution:
      'Eu busco `videos` em pt-BR e, se não encontrar um trailer do YouTube, busco novamente em `en-US`.',
    codeSnippet: `// src/composables/useMovieDetails.ts
let picked = pickBestTrailer(vPt);
if (!picked) {
  const vEn = await tmdbFetch(\`/\${mediaType}/\${id}/videos\`, { language: 'en-US' }, abort.signal);
  picked = pickBestTrailer(vEn);
}`,
    tradeOff:
      'Isso adiciona uma segunda request em alguns casos, mas melhora muito a taxa de “botão funcionar”, que é crucial na percepção de qualidade.',
  },
];


