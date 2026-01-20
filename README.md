## CineScope — Catálogo Interativo de Streaming (Vue 3)

O **CineScope** é uma interface “estilo streaming” (Netflix/Prime) pensada para **mostrar UX, animações e performance visual**.  
O foco é deixar a navegação gostosa: descobrir títulos, abrir detalhes, tocar trailer e salvar na lista **“Assistir Depois”**.

> Eu construí este projeto como peça de portfólio: dá pra entender as decisões técnicas pelo próprio produto (tem um painel “Bastidores / Dev Mode” na navbar).

### Funcionalidades

- **Descoberta de filmes e séries** (TMDB)
- **Busca com debounce** (evita spam de requisições)
- **Detalhes + trailer** (YouTube embed com fallback de idioma)
- **Assistir Depois** (estado global + persistência em `localStorage`)
- **Bastidores / Dev Mode** (drawer com abas explicando decisões técnicas)

### Stack

- **Vue 3** (Composition API / `script setup`)
- **Vue Router** (rotas + code splitting)
- **Pinia** (estado global)
- **Tailwind CSS** (via PostCSS)
- **TMDB API** (dados reais)

### Destaques técnicos (o que vale olhar)

- **Composables (estilo Hooks)**  
  - `src/composables/useMovies.ts`: trending/discover/search + `AbortController` + debounce  
  - `src/composables/useMovieDetails.ts`: detalhes + créditos + trailer (com fallback `pt-BR` → `en-US`)

- **Diretiva personalizada `v-lazy`**  
  - `src/directives/vLazy.ts`: lazy-loading com `IntersectionObserver` + fade-in  
  - inclui um cuidado importante: recarregar quando o `src` muda (ex: alternar Filmes/Séries)

- **Animações nativas do Vue**  
  - `<TransitionGroup>` no grid para animar entrada/saída/reordenação  
  - classes `list-*` em `src/assets/main.css`

- **Design System com Slots**  
  - `src/components/ui/UiModal.vue`, `UiCard.vue`, `UiButton.vue`

### Pré-requisitos

- Node.js (recomendado 18+)

### Configurar a chave do TMDB

1. Crie um arquivo `.env.local` na raiz do projeto
2. Coloque sua chave:

```bash
VITE_TMDB_API_KEY=SUA_CHAVE_DO_TMDB
```

Referência: `config/env.example.txt`.

### Rodar localmente

```bash
npm install
npm run dev
```

### Scripts

```bash
npm run dev        # ambiente local
npm run build      # build de produção (gera /dist)
npm run preview    # preview do build
npm run typecheck  # valida types do Vue/TS
```

### Deploy (Vercel)

Este projeto **não precisa de banco** — é um front-end que consome a API do TMDB.

Passos (UI do Vercel):
- Importar o repositório
- Adicionar a env var **`VITE_TMDB_API_KEY`**
- Build: `npm run build`
- Output: `dist`

### Observações

- **Chave do TMDB**: não comite sua chave no GitHub. Use `.env.local` localmente e variáveis no Vercel.
- **TMDB**: este produto usa a API do TMDB, mas **não é endossado nem certificado pelo TMDB**.

### Roadmap (idéias rápidas)

- Infinite scroll/paginação (com “skeletons” por card)
- Cache de requisições (stale-while-revalidate)
- Página de detalhes dedicada (além do modal)
- Acessibilidade (foco no drawer/modal + atalhos)

### Autor

Feito por **VinihAugs**.
