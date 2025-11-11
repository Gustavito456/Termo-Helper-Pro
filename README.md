# Termo-Helper-Pro

Assistente para **Termo/Wordle** em PT-BR. Sugere o melhor próximo palpite e permite **tentativas ilimitadas** com o fluxo: mostrar sugestão → usuário digita um chute → marca o feedback por letra (cinza/amarelo/verde) → o app cria **automaticamente a próxima linha** até acertar (todas verdes).

Sem backend, sem chave de API. Tudo roda no navegador.

## ✨ Funcionalidades

- **Linhas ilimitadas:** apenas **uma** linha ativa por vez; ao aplicar o feedback, gera a próxima.
- **Sugestão automática:** recalculada a cada tentativa com base nas restrições acumuladas.
- **Solver local (PT-BR):** dicionário embutido, normalização de acentos/ç na comparação.
- **Tratamento de letras repetidas:** respeita contagem mínima e posições proibidas/obrigatórias.
- **Persistência:** progresso salvo em `localStorage` (tentativas, feedbacks, sugestão).
- **Painel de candidatas:** lista colapsável para transparência do filtro.
- **Tema claro/escuro** e UI responsiva.
- **PWA opcional** (pré-configurado para fácil ativação).

## 🧱 Stack

- **React + TypeScript** (Vite)
- Estado local por hooks + `localStorage`
- Estrutura modular:
  - `components/` (UI: AttemptRow, SuggestionBar, CandidatesPanel…)
  - `services/solver.ts` (regras de filtro e ranking)
  - `services/storage.ts` (persistência)
  - `dict/` (wordlist PT-BR e utilitários de normalização)
  - `types.ts` (tipos fortes p/ feedback e tentativas)

## 🚀 Começando

```bash
# 1) Instalar dependências
npm i

# 2) Rodar em desenvolvimento
npm run dev

# 3) Build de produção
npm run build

# 4) Prévia local do build (opcional)
npm run preview
```

> Requisitos: Node 18+.

## 🧩 Como usar

1. Veja a **Melhor sugestão** no topo.
2. Na linha ativa, **digite seu chute** e confirme.
3. **Marque o feedback** de cada letra (clique para alternar: cinza → amarelo → verde).
4. Ao aplicar o feedback, o app:
   - salva o estado,
   - recalcula as candidatas e a sugestão,
   - **cria a próxima linha** automaticamente.
5. Quando uma linha fica **100% verde**, o app exibe **Resolvido** e bloqueia novas linhas.
6. Botão **Reiniciar** limpa tudo e volta ao estado inicial.

## 🧠 Como o solver funciona (resumo)

1. **Normalização**: compara tudo em forma “sem acento” (NFD), preservando acentos apenas na exibição.
2. **Restrições**:
   - **Verdes**: letra fixa naquela posição.
   - **Amarelas**: letra obrigatória, mas **proibida** nas posições marcadas.
   - **Cinzas**: reduzem possibilidade, mas **sem matar** letras já confirmadas (contagem mínima).
3. **Letras repetidas**: calcula por tentativa a **contagem mínima** necessária de cada letra (verde+amarela); o filtro só reprova “cinza” se a candidata exceder posições inválidas **e** não atender as contagens mínimas/posições obrigatórias.
4. **Ranking**:
   - **Frequência por posição** (palavras que encaixam letras comuns nas colunas ganham pontos).
   - **Bônus por letras distintas** nas primeiras tentativas para cobrir mais alfabeto.
   - (Opcional futuro) modo **entropia**.

## 📦 Estrutura do projeto (resumo)

```
src/
  components/
    AttemptRow.tsx
    CandidatesPanel.tsx
    FeedbackCell.tsx
    SuggestionBar.tsx
  services/
    solver.ts
    storage.ts
  dict/
    words-ptbr.ts          # lista principal
    normalize.ts           # util NFD/diacríticos
  types.ts
  App.tsx
  main.tsx
```

## 🗂️ Wordlist (PT-BR)

- Arquivo padrão: `src/dict/words-ptbr.ts`.
- **Trocar/expandir**: edite a lista exportada (array de strings).  
- Recomendado separar **“permitidas”** e **“soluções prováveis”** caso queira um comportamento idêntico a jogos oficiais.

## 🔧 Configuração

- Não há variáveis de ambiente obrigatórias.
- **Sem `GEMINI_API_KEY`**: o projeto é 100% client-side.

## 🧪 Testes (sugerido)

Inclua testes unitários para `services/solver.ts` cobrindo:

- Verdes + amarelas + cinzas na mesma palavra.
- Letras repetidas (mínimo/máximo).
- Amarelas em múltiplas posições proibidas.
- Normalização com acentos (ex.: **ação**, **coração**, **café**).

Exemplo de setup (opcional):

```bash
npm i -D vitest @testing-library/react jsdom
npm run test
```

## ☁️ Deploy (Vercel)

1. **Importe** o repositório.
2. Build command: `npm run build`  
   Output dir: `dist`
3. Variáveis de ambiente: (nenhuma necessária).
4. **Cache estático** ativado e pronto.

> Alternativas: Netlify, GitHub Pages, Cloudflare Pages — todos funcionam.

## 📱 PWA (opcional)

- Adicione `manifest.webmanifest` e um service worker (Workbox ou Vite PWA Plugin).
- Inclua ícones e `theme_color`.
- Habilite “Add to Home Screen” para uso offline.

## 🛠️ Troubleshooting

- **“Palavra não está no dicionário”**: verifique se a wordlist contém o termo (sem acento) e se a normalização está ativa.
- **Sugestões “presas”**: confira se alguma tentativa ficou sem feedback em todas as letras; a próxima linha só aparece após aplicar feedback completo.
- **Renderização incorreta com acentos**: valide `normalize('NFD')` e a remoção de diacríticos via `\p{Diacritic}`.

## 🗺️ Roadmap curto

- Modo **entropia** (ganho de informação).
- Alternar entre **listas** (permitidas vs. soluções).
- **Teclado virtual** com bloqueio de letras impossíveis.
- Exportar/importar **estado** (JSON) para compartilhar análises.

## 🤝 Contribuição

1. Faça um fork.
2. Crie uma branch: `feat/minha-melhoria`.
3. Commit: `feat(solver): descrição`.
4. PR com descrição do caso de teste.

## 📄 Licença

MIT. Use, modifique e compartilhe livremente.
