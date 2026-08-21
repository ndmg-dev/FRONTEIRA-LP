# Spec de build — Landing page do Fronteira (React + Vite + framer-motion)

Especificação para o **Claude Code** construir a landing page de vendas do
sistema **Fronteira**. Fonte única do que construir; onde este documento e um
palpite do implementador divergirem, este documento vence.

> **Objetivo (job único):** levar um escritório de contabilidade a **solicitar
> uma demonstração**. Tudo na página serve a esse clique.

> **Mudança em relação à v1:** esta versão descarta o HTML estático de arquivo
> único. A landing é uma **SPA React modularizada**, no mesmo stack do produto,
> com motion orquestrado via **framer-motion**.

---

## 1. Contexto do produto

**Fronteira** é um sistema fiscal (não um ERP genérico) especializado em
**cálculo de ICMS-ST de fronteira e antecipação tributária** a partir de XMLs
de NF-e, com confronto contra o extrato da SEFAZ. Stack do produto: FastAPI +
React + PostgreSQL, design system próprio **@mg** (tema dark).

Módulos que viram argumento de venda:
- **Wizard de Fronteira** — upload de XML → conferência → classificação →
  resultado, com **memória de cálculo passo a passo** (entradas, parâmetros,
  fórmula, passos) por item. Auditabilidade é o diferencial central.
- **Antecipação em lote** — vários XMLs; classificação automática por um
  dicionário NCM+descrição→tributação que "aprende"; calcula tudo junto.
- **Comparação SEFAZ** — lê o extrato `.xls` oficial e cruza com as notas
  apuradas, apontando divergências.
- **Multi-empresa** — regras NCM/MVA, memória e histórico isolados por
  empresa + competência.
- **IBS/CBS** — já identifica os grupos IBS/CBS nas notas.
- **Histórico** por empresa + competência, read-only, reexportável (XLSX/PDF).
- **Papéis:** administrador / coordenador / operador.

**Comprador-alvo:** escritórios de contabilidade / BPO fiscal que apuram muitas
empresas por competência.

---

## 2. Restrições de conteúdo (não negociar na copy)

O produto está **portado e testado**, mas **sem homologação fiscal** contra
produção. Logo, a copy:
- **PODE:** "auditável", "memória de cálculo aberta", "em lote", "confere contra
  a SEFAZ", "identifica IBS/CBS", "isolado por empresa", "motor fiscal coberto
  por testes".
- **NÃO PODE:** "homologado", "aprovado para produção", "100% preciso/exato",
  "garantia de conformidade", nem prometer resultado fiscal específico.
- **Disclaimer** no rodapé: valores/telas ilustrativos; resultado depende da
  legislação vigente, dos dados da nota e da configuração de cada empresa;
  ferramenta de **apoio** à apuração, não substitui o profissional responsável.

Todo texto em **pt-BR**, sentence case, voz ativa, verbos concretos.

---

## 3. Stack e ferramentas

- **Vite + React 18 + TypeScript** (mesmo stack do produto).
- **framer-motion** para todo o motion (reveal, stagger, hover, scroll-driven).
- **Estilo:** CSS Modules por componente (`*.module.css`), consumindo os
  **tokens @mg como CSS custom properties**. (Opção de match exato com o
  produto: `@vanilla-extract/css` — ver §9, decisão em aberto. Default: CSS
  Modules, mais leve para uma landing.)
- **Tokens:** reaproveitar `@mg/tokens`. Copiar o `tokens.css` gerado (as vars
  `--mg-color-*`) para `src/styles/tokens.css` e mapear para os aliases locais
  da §5. **Não** reinventar valores de cor; se faltar token, usar os hex da §5
  como fallback documentado num único arquivo de tokens.
- **Ícones:** `lucide-react` (leve, tree-shakeable). Não usar libs de ícone
  pesadas.
- **Sem** roteador (página única), **sem** state manager, **sem** backend nesta
  entrega. **Sem** `localStorage`/`sessionStorage`.
- Node LTS; `npm`. Scripts: `dev`, `build`, `preview`, `lint`, `type-check`.

Requisitos não-funcionais (piso, obrigatório):
- Responsivo até ~360px.
- `:focus-visible` visível em tudo interativo; navegação por teclado; skip-link.
- `prefers-reduced-motion` respeitado — via `useReducedMotion()` do framer-motion:
  desliga/reduz animações e revela conteúdo estático.
- HTML semântico (`header`/`main`/`footer`/`section`), `aria-*`/`alt` onde couber.
- `tsc --noEmit` e `vite build` limpos. Lighthouse alvo ≥ 95 em Performance e
  Acessibilidade (imagens otimizadas, JS enxuto, fontes com `display=swap`).

---

## 4. Arquitetura de pastas e componentes

```
fronteira-landing/
├── index.html                 # root #app, <html lang="pt-BR" data-theme="dark">
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── main.tsx               # createRoot + <App/>
│   ├── App.tsx                # monta as seções na ordem da §6
│   ├── styles/
│   │   ├── tokens.css         # vars @mg + aliases locais (§5) — ÚNICO lugar com hex
│   │   ├── global.css         # reset, base type, .container, body dark
│   │   └── fonts.css          # @import Google Fonts (Space Grotesk, Inter, IBM Plex Mono)
│   ├── lib/
│   │   ├── motion.ts          # variants/transitions compartilhados (§7)
│   │   └── copy.ts            # TODA a copy pt-BR (§8) como constantes tipadas
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx           # variantes primary | ghost
│   │   │   ├── Eyebrow.tsx          # rótulo mono dourado
│   │   │   ├── SectionHeader.tsx    # eyebrow + h2 + sub
│   │   │   ├── Tag.tsx              # chip mono
│   │   │   └── Reveal.tsx           # wrapper de reveal on-scroll (framer-motion)
│   │   ├── Nav/Nav.tsx              # sticky, borda ao rolar (useScroll)
│   │   ├── Hero/Hero.tsx
│   │   ├── Hero/CalcMemory.tsx      # ★ elemento-assinatura (§ hero)
│   │   ├── Problem/Problem.tsx
│   │   ├── HowItWorks/HowItWorks.tsx
│   │   ├── HowItWorks/FlowCard.tsx
│   │   ├── Differentiators/Differentiators.tsx
│   │   ├── TechBase/TechBase.tsx
│   │   ├── DemoCTA/DemoCTA.tsx
│   │   ├── DemoCTA/DemoForm.tsx
│   │   └── Footer/Footer.tsx
│   └── assets/                # logo (SVG placeholder), se houver
```

Regras de componentização:
- **Um componente por seção**, mais primitivos reutilizáveis em `ui/`. Nenhum
  componente > ~150 linhas; extrair subcomponentes (ex.: `FlowCard`) quando
  repetir.
- Cada componente tem seu `*.module.css` ao lado. Nada de estilos globais fora
  de `styles/`.
- **Toda a copy** vive em `src/lib/copy.ts` (não hardcoded no JSX), para editar
  texto sem tocar em layout. Tipar as estruturas (ex.: `FlowItem`, `DiffItem`).
- **Todo motion** parte de variants em `src/lib/motion.ts` (não redefinir
  transições soltas em cada componente).

---

## 5. Design tokens

Dark quente quase-preto, **um único acento dourado**. Definir em
`src/styles/tokens.css` como custom properties; **nenhum hex fora deste
arquivo**. Preferir as vars `--mg-color-*` oficiais; os valores abaixo são o
fallback/mapeamento.

```
--bg:#0c0e12  --bg-2:#101318  --panel:#14181f  --panel-2:#171c24
--line:#232a35  --line-soft:#1b212a
--ink:#eceef2  --ink-2:#aab2bf  --ink-3:#727b89
--gold:#c9a961  --gold-bright:#e6c982  --gold-dim:#8f7841
--ok:#6fae7e   /* verde "confere", uso raríssimo */
--radius:14px  --maxw:1160px
/* translúcidos derivados do dourado p/ fundos: rgba(201,169,97, .06/.10/.14/.22/.40) */
```

**Tipografia** (3 papéis, ancorados no produto):
- **Display (títulos):** `Space Grotesk` 600, `letter-spacing:-.02em`,
  `line-height:1.08`.
- **Corpo:** `Inter` 400/500 — a fonte base do @mg.
- **Números fiscais/dados:** `IBM Plex Mono` 400/500/600 — a fonte que o sistema
  usa (`.num`). Em valores R$, códigos (NCM/CFOP), eyebrows e na memória de
  cálculo. Sempre `font-variant-numeric: tabular-nums`.

**Eyebrow:** IBM Plex Mono, `.72rem`, uppercase, `letter-spacing:.22em`, `--gold`.

---

## 6. Estrutura da página (ordem em App.tsx)

1. **Nav** sticky translúcida (blur); ganha `border-bottom` ao rolar (>8px). Logo
   "Fronteira" + âncoras (Como funciona · Diferenciais · Segurança) + Button
   primary "Solicitar demonstração". Mobile: some com as âncoras de texto,
   mantém o botão (o rodapé repete os links — §9 nota de acessibilidade).
2. **Hero** (assinatura, abaixo).
3. **Problema** — 3 cartões (01/02/03).
4. **Como funciona** — 3 `FlowCard` (Wizard · Lote · SEFAZ).
5. **Diferenciais** — grid, com card grande de destaque "auditável".
6. **Base técnica / Segurança** — faixa com 4 itens.
7. **CTA / Demonstração** — 2 colunas: pitch + `DemoForm`.
8. **Footer** + disclaimer.

Seções separadas por `border-top:1px solid var(--line-soft)`; container central
`max-width:var(--maxw)`, padding lateral 24px.

### Hero — elemento-assinatura: a memória de cálculo

**Proibido** o padrão genérico número-gigante+gradiente. Hero em 2 colunas:
- **Esquerda:** Eyebrow "Apuração fiscal · ICMS-ST · Antecipação", H1, lead,
  dois Button (primary "Solicitar demonstração →", ghost "Ver como funciona"),
  fileira de 3 mini-stats (3 fluxos / Por empresa / IBS-CBS).
- **Direita — `CalcMemory`:** cartão "Memória de cálculo · ICMS-ST" que mostra
  um cálculo de ICMS-ST **destrinchado passo a passo** até o resultado em
  dourado. Os passos entram em **cascata** (stagger) no load via framer-motion.
  Conteúdo (exemplo autoconsistente, **ilustrativo — rotular "Exemplo
  ilustrativo"**, não é fixture do produto):

```
Cabeçalho:  Memória de cálculo · ICMS-ST            ● (dot dourado)
Sub (mono): NF-e 000.114.502              NCM 3924.90.00
Passos (mono, tabular):
  Base do produto      valor da mercadoria          R$ 1.000,00
  Base ST com MVA      1.000,00 × (1 + 40%)         R$ 1.400,00
  ICMS destino         1.400,00 × 18%               R$   252,00
  Crédito de origem    1.000,00 × 12%             − R$   120,00
  Fórmula aplicada     ICMS_dest − crédito_origem   252,00 − 120,00
Resultado (caixa dourada):  ICMS-ST A RECOLHER      R$ 132,00
```

---

## 7. Sistema de motion (framer-motion)

Centralizar em `src/lib/motion.ts`. Discreto e orquestrado — excesso denuncia
design "gerado". Sempre condicionar a `useReducedMotion()`.

- **Reveal on-scroll** (padrão das seções): variant `fadeUp`
  (`opacity 0→1`, `y 18→0`), `transition {duration:.6, ease:[.22,.61,.36,1]}`.
  Usar via `<Reveal>`: `whileInView="show"`, `viewport={{once:true, margin:"-40px"}}`.
- **Stagger** (memória de cálculo, listas de bullets): container com
  `staggerChildren:.09`, `delayChildren:.1`; filhos com `fadeUp`. O resultado do
  cálculo entra por último com um leve `scale` (spring suave).
- **Hover** nos cartões (Flow/Diff): `whileHover={{ y:-3 }}` + borda dourada via
  CSS; `transition` spring curto. Botão primary: `whileHover={{ y:-1 }}`,
  `whileTap={{ scale:.98 }}`.
- **Nav scroll:** `useScroll` + `useMotionValueEvent` para alternar a borda;
  opcional `useTransform` do blur/opacidade do fundo.
- **Reduced motion:** quando `useReducedMotion()` for true, variants viram
  identidade (sem `y`/`scale`), sem stagger — conteúdo aparece estático.

---

## 8. Copy pronta (pt-BR) — colocar em src/lib/copy.ts

Usar **exatamente** este texto (copy genérica denuncia design genérico).

**Hero** — eyebrow `Apuração fiscal · ICMS-ST · Antecipação`
- H1: **O cálculo de fronteira que o seu cliente consegue auditar.** ("consegue
  auditar" em dourado, com sublinhado degradê dourado→transparente)
- Lead: *Suba o XML da NF-e e receba o ICMS-ST de fronteira e a antecipação já
  calculados — com a memória de cálculo aberta, passo a passo, e conferência
  contra o extrato da SEFAZ. Feito para escritórios que apuram dezenas de
  empresas por competência.*
- Botões: `Solicitar demonstração →` · `Ver como funciona`
- Mini-stats: **3 fluxos** / Fronteira · Lote · SEFAZ — **Por empresa** / Regras
  e memória isoladas — **IBS / CBS** / Já identifica nas notas

**Problema** — eyebrow `O problema`
- H2: **A fronteira ainda é resolvida na planilha — e a planilha não se defende.**
- Sub: *Cada nota vira uma linha copiada à mão, cada MVA vira uma busca no
  regulamento, e quando a SEFAZ questiona, ninguém reconstrói de onde saiu o número.*
- 01 **Retrabalho por competência:** *Toda apuração recomeça do zero: digitação
  de nota, classificação de NCM, cálculo manual. Multiplique por todas as
  empresas do escritório.*
- 02 **Cálculo que ninguém reconstrói:** *A fórmula mora na cabeça de uma pessoa
  e numa célula escondida. Sem memória de cálculo, revisar ou justificar um
  valor vira arqueologia.*
- 03 **Divergência com a SEFAZ no fim do mês:** *O confronto entre o que foi
  apurado e o extrato oficial acontece tarde, no susto, comparando duas
  planilhas linha a linha.*

**Como funciona** — eyebrow `Como funciona`
- H2: **Três fluxos que cobrem a apuração de ponta a ponta.**
- Sub: *Do XML ao número recolhido, com a mesma lógica fiscal aplicada de forma
  consistente para todas as empresas que você atende.*
- **Wizard de Fronteira** — *Sobe o XML, confere, classifica e calcula — uma
  nota por vez, com o resultado detalhado.* Bullets: Upload → contexto →
  conferência → resultado · Memória de cálculo passo a passo por item · Exceções
  fiscais aplicadas na conferência · Exportação em XLSX e PDF.
- **Antecipação em lote** — *Vários XMLs de uma vez. O sistema classifica pela
  memória da empresa e calcula tudo junto.* Bullets: Classificação automática por
  NCM + descrição · A memória "aprende" a cada classificação manual · Só calcula
  quando tudo está classificado · Resultado do lote exportável.
- **Comparação SEFAZ** — *Sobe o extrato oficial e o sistema cruza com as notas
  apuradas, apontando as divergências.* Bullets: Leitura do extrato `.xls` da
  SEFAZ · Cruzamento por empresa e competência · Observações sobre cada
  divergência · Relatório de confronto exportável.

**Diferenciais** — eyebrow `Por que o Fronteira`
- H2: **Construído para quem responde por muitas empresas.**
- Card grande `AUDITÁVEL` — **Todo número mostra de onde veio:** *Cada item traz
  entradas, parâmetros, fórmula e passos do cálculo — a memória fica registrada
  junto ao resultado. Quando o cliente ou o fisco pergunta "por que R$ 132,00?",
  a resposta está na tela, não na memória de alguém.* Chips: entradas ·
  parâmetros · **fórmula** · passos · resultado.
- `MULTI-EMPRESA` — *Tudo é por empresa e por competência: regras de NCM/MVA,
  memória de classificação e histórico de apuração ficam isolados. O que vale
  para uma empresa não vaza para outra.*
- `IBS / CBS` — *O sistema já identifica os grupos de IBS e CBS nas notas e
  separa o que tem do que não tem — um pé dentro da transição da reforma
  tributária desde agora.*
- `HISTÓRICO` — *Consulta por empresa + competência lê direto das notas já
  apuradas. Reabre qualquer apuração passada em modo leitura e reexporta XLSX ou
  PDF sem recalcular.*

**Base técnica** — eyebrow `Base técnica`
- H2: **Uma arquitetura pensada para dado fiscal.**
- Sub: *A lógica de tributação é isolada do resto do sistema e coberta por
  testes automatizados — a parte crítica não é reescrita a cada tela nova.*
- 4 itens: **Papéis de acesso** (*Administrador, coordenador e operador — cada um
  vê e faz o que lhe cabe.*) · **Dados por empresa** (*Notas, regras e apurações
  separadas por empresa e competência, sem cruzamento indevido.*) · **Motor
  fiscal isolado** (*Os calculadores de tributação são um núcleo próprio, coberto
  por testes unitários.*) · **Exportações prontas** (*XLSX e PDF em cada fluxo —
  do item avulso à apuração completa da competência.*)

**CTA / Demonstração** — eyebrow `Demonstração`
- H2: **Veja o Fronteira rodando com uma nota sua.**
- Sub: *Agende uma demonstração e mostramos os três fluxos com um caso real do
  seu escritório — do XML ao confronto com a SEFAZ.*
- Bullets (check dourado): *Apuração de uma competência real, ponta a ponta* ·
  *Memória de cálculo aberta, item por item* · *Conversa sobre volume de
  empresas e implantação.*
- Nota sob o botão: *Retornamos em até 1 dia útil. Sem compromisso.*

**Footer** — tagline *Apuração de fronteira, antecipação e confronto SEFAZ ·
para escritórios de contabilidade.* + disclaimer (§2).

---

## 9. DemoForm

Campos: **Nome** (obrigatório) · **Escritório** (obrigatório) · **E-mail**
(email, obrigatório) · **Quantas empresas você apura?** (select: Até 10 / 11–50 /
51–200 / Mais de 200). Button primary **Solicitar demonstração**.

Comportamento: estado controlado (`useState`), validação no cliente, estado de
erro por campo e estado de sucesso (troca o form por um cartão de confirmação
com `role="status"` que **recebe foco**). **Sem** `<form>` que dá reload — usar
`onClick`/`onSubmit` com `preventDefault`.

**Envio — isolar** numa função `submitDemoRequest(payload): Promise<void>` em
`DemoForm.tsx` (ou `src/lib/demo.ts`) com `// TODO: conectar (endpoint próprio /
Formspree / Basin / WhatsApp)`. **Não** inventar endpoint; sem definição, resolve
com a confirmação client-side. **Sem** storage do navegador.

---

## 10. Decisões em aberto (defaults já assumidos; confirmar se quiser mudar)

1. **Estilo:** CSS Modules (default) × `@vanilla-extract/css` para casar 1:1 com
   o produto.
2. **Reuso do @mg:** só os **tokens** (default) × também vendorizar componentes
   `@mg/ui`. Para uma landing, tokens bastam.
3. **Destino do formulário:** endpoint próprio × serviço de form × WhatsApp/e-mail.
4. **Marca:** logo placeholder (hexágono com traço de conferência, contorno
   dourado). Substituir se houver identidade oficial.
5. **Prova social / planos:** fora do escopo (CTA é demonstração). Se houver
   dados reais, abrir seção de prova social entre Diferenciais e Base técnica.
6. **Deploy:** SPA estática buildada (`vite build`) — serve em qualquer estático
   (Netlify/Vercel/Nginx). Não definido aqui.

---

## 11. Critério de pronto (checklist)

- [ ] Projeto Vite+React+TS roda (`npm run dev`) e buildar (`vite build`) limpo;
      `tsc --noEmit` sem erros.
- [ ] Estrutura de pastas/componentes da §4; nenhum componente monolítico.
- [ ] Toda a copy em `src/lib/copy.ts` (§8); todo motion em `src/lib/motion.ts` (§7).
- [ ] Todas as seções da §6, na ordem, com a copy da §8.
- [ ] Hero com `CalcMemory` em cascata via framer-motion (§6), rotulado
      "Exemplo ilustrativo".
- [ ] Zero hex fora de `src/styles/tokens.css` (§5).
- [ ] Nenhuma afirmação proibida na copy; disclaimer presente (§2).
- [ ] Responsivo a 360px; `:focus-visible` em tudo interativo; skip-link;
      `prefers-reduced-motion` desliga o motion (§3/§7).
- [ ] `DemoForm` valida, mostra confirmação com foco; `submitDemoRequest`
      isolada com TODO (§9).
- [ ] Sem storage do navegador; `lucide-react` como única lib de ícones.
- [ ] Lighthouse ≥ 95 em Performance e Acessibilidade (rodar `npx lighthouse`).