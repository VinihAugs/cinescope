export type DocCategoryKey = 'Arquitetura' | 'Gerenciamento de Estado' | 'Desafios de UI' | 'Performance';

export type ProjectDocEntry = {
  title: string;
  challenge: string;
  solution: string;
  tradeoffs: string;
};

export type ProjectDocs = {
  intro: string;
  categories: Record<DocCategoryKey, ProjectDocEntry[]>;
};

export const projectDocs: ProjectDocs = {
  intro:
    'Eu criei o CineScope pensando em uma demo “tipo streaming” (Netflix/Prime) que mostre UX, animações e decisões técnicas sem esconder os trade-offs. A ideia deste painel é você entender o “porquê” das escolhas sem precisar ler o código cru.',
  categories: {
    Arquitetura: [
      {
        title: 'Vue 3 + Composition API (Composables)',
        challenge:
          'Eu queria uma base modular e fácil de evoluir, com lógica reaproveitável entre telas (Home/Lista) sem virar um componente gigante.',
        solution:
          'Usei `script setup` e organizei a lógica em `composables` (`useMovies`, `useMovieDetails`). Cada composable encapsula estado + efeitos (fetch, debounce, abort) e expõe uma API pequena para a UI consumir.',
        tradeoffs:
          'Eu poderia ter “jogado tudo” no componente ou usado um pattern mais pesado (camadas/DI). Preferi composables porque o projeto é de portfólio e o ganho de clareza é alto sem aumentar muito a complexidade.',
      },
      {
        title: 'Vite + imports dinâmicos de rotas',
        challenge:
          'Eu queria build rápido e carregamento inicial leve, especialmente porque a Home é rica visualmente.',
        solution:
          'Mantive o projeto em Vite e usei `vue-router` com `import()` nas rotas para fazer code-splitting automático das views.',
        tradeoffs:
          'Daria para pré-carregar tudo e simplificar. Eu escolhi separar porque o usuário não precisa baixar o JS da tela de lista antes de precisar.',
      },
    ],
    'Gerenciamento de Estado': [
      {
        title: 'Pinia para “Assistir Depois” (persistido)',
        challenge:
          'A lista “Assistir Depois” precisa ser global (Home e Lista) e persistir entre reloads.',
        solution:
          'Criei um store `Pinia` (`useWatchlistStore`) com persistência via `localStorage`. As ações (`toggle`, `remove`, `clear`) mantêm a UI previsível e o armazenamento sempre atualizado.',
        tradeoffs:
          'Eu poderia usar `localStorage` direto no componente ou um plugin de persistência. Preferi o store “na mão” porque o estado é pequeno e eu queria controle explícito (e mostrar domínio do fluxo).',
      },
      {
        title: 'Estado de UI separado do domínio',
        challenge:
          'Modais/Drawers são estado de UI (não domínio). Se eu misturar tudo, fica difícil testar/evoluir.',
        solution:
          'Centralizei o “Dev Mode / Bastidores” num store de UI simples (`useUiStore`) para abrir/fechar o Drawer de qualquer tela sem duplicar estado.',
        tradeoffs:
          'Dava para usar `provide/inject` ou um composable singleton. Pinia aqui é “overkill”, mas mantém um padrão consistente no app.',
      },
    ],
    'Desafios de UI': [
      {
        title: 'Design System via Slots (Modal/Card/Button)',
        challenge:
          'Eu queria componentes de UI agnósticos e reutilizáveis, sem travar o conteúdo (ex: modal com header/footer variáveis).',
        solution:
          'Criei `UiModal`, `UiCard` e `UiButton` usando `slots`. Assim eu consigo reaproveitar estilos e variar conteúdo/ações sem duplicar markup.',
        tradeoffs:
          'Componentes “prontos” resolvem rápido, mas eu preferi construir porque isso demonstra domínio de Vue (slots/transitions) e mantém 100% alinhado com o visual do projeto.',
      },
      {
        title: 'Drawer “Bastidores” com Tabs',
        challenge:
          'Eu queria explicar decisões técnicas dentro do próprio produto, sem parecer um plugin externo.',
        solution:
          'Implementei um Drawer lateral com `Teleport` + `Transition` e um sistema de Tabs para navegar por categorias. Também destaquei termos técnicos com estilo de `code` quando aparecem em `backticks`.',
        tradeoffs:
          'Eu poderia renderizar markdown com uma lib. Preferi um parser simples de `backticks` para evitar dependências e manter performance/controle.',
      },
      {
        title: 'Trailer no modal (interativo)',
        challenge:
          'O botão “Reproduzir” precisa tocar o trailer e permitir pausar/arrastar. Além disso, alguns títulos não têm vídeo em pt-BR.',
        solution:
          'Busquei `videos` no TMDB e escolhi o melhor trailer do YouTube. Se não existir em `pt-BR`, faço fallback para `en-US`. No modal, uso `iframe` com `youtube-nocookie`.',
        tradeoffs:
          'Um player custom seria mais controlável, mas adicionaria peso. O `iframe` resolve com menos custo e ainda respeita privacidade com `youtube-nocookie`.',
      },
    ],
    Performance: [
      {
        title: 'Lazy loading de imagens com diretiva própria (`v-lazy`)',
        challenge:
          'Catálogo tem muitas imagens. Carregar tudo de uma vez derruba performance e LCP.',
        solution:
          'Criei uma diretiva `v-lazy` baseada em `IntersectionObserver` para carregar posters/backdrops só quando entram na viewport, com fade-in.',
        tradeoffs:
          'Poderia usar uma lib pronta, mas eu quis mostrar domínio de diretivas do Vue e controlar edge cases (ex: `src` mudando ao trocar Filmes/Séries).',
      },
      {
        title: 'Cancelamento de requisições (UX e rede)',
        challenge:
          'Ao trocar filtro ou digitar na busca, eu não quero respostas antigas “ganhando” da mais recente.',
        solution:
          'Usei `AbortController` nos composables de fetch para cancelar requisições anteriores quando uma nova começa.',
        tradeoffs:
          'Eu poderia ignorar respostas antigas por timestamp. O abort economiza rede e simplifica o fluxo.',
      },
      {
        title: 'Animações nativas sem libs',
        challenge:
          'Filtragem/reordenação precisa ficar “suave” sem engasgar.',
        solution:
          'Usei `<TransitionGroup>` com classes `list-*` no CSS para animar entrada/saída/movimento do grid. Isso dá um efeito premium com custo baixo.',
        tradeoffs:
          'Bibliotecas de animação dão mais poder, mas aumentam bundle e complexidade. Aqui, o nativo do Vue resolve muito bem.',
      },
    ],
  },
};


