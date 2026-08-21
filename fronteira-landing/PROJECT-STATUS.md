# Status do projeto — Landing Fronteira

> Snapshot do que existe hoje na landing (SPA React estática, sem backend).
> Serve de referência para a próxima etapa: contato/formulário real e a
> camada de backend por trás dele. Fonte de verdade complementar:
> `../spec-landing-fronteira.md` (spec original de build).

---

## 1. Stack e scripts

- **Vite 5 + React 18 + TypeScript 5**, sem router, sem state manager.
- **framer-motion** (via `LazyMotion` + `m`, feature set `domAnimation`) para
  todo o motion; `lucide-react` como única lib de ícones.
- **CSS Modules** por componente, consumindo tokens de `src/styles/tokens.css`
  como custom properties. Zero hex fora desse arquivo.
- Scripts: `npm run dev` · `npm run build` (= `vite build`) · `npm run preview`
  · `npm run lint` / `type-check` (= `tsc --noEmit`).
- **Sem** backend, sem chamada de rede, sem `localStorage`/`sessionStorage`.

## 2. Árvore de arquivos atual

```
fronteira-landing/
├── index.html                     # <html lang="pt-BR" data-theme="dark">, favicon vazio (data:,)
├── public/
│   └── robots.txt                 # Allow: /
├── src/
│   ├── main.tsx                   # createRoot(#app) + <App/>
│   ├── App.tsx                    # monta as seções, envolve tudo em <LazyMotion>
│   ├── styles/
│   │   ├── tokens.css             # ÚNICO arquivo com hex/rgba — vars --mg-color-* + aliases
│   │   ├── global.css             # reset, .container, .section, :focus-visible, .skip-link, reduced-motion
│   │   └── fonts.css              # documenta que as fontes carregam via <link> no index.html (fora do critical path)
│   ├── lib/
│   │   ├── copy.ts                # TODA a copy pt-BR, tipada e const
│   │   ├── motion.ts               # variants/transitions compartilhados + hook useRevealInView
│   │   └── demo.ts                # submitDemoRequest() — TODO: conectar backend
│   ├── components/
│   │   ├── ui/                    # Button, Eyebrow, SectionHeader, Tag, Reveal, Logo
│   │   ├── Nav/Nav.tsx             # menu-pílula sticky, hover com sublinhado dourado
│   │   ├── Hero/Hero.tsx + CalcMemory.tsx   # elemento-assinatura em cascata
│   │   ├── Problem/Problem.tsx
│   │   ├── HowItWorks/HowItWorks.tsx + FlowCard.tsx  # accordion single-open
│   │   ├── Differentiators/Differentiators.tsx
│   │   ├── TechBase/TechBase.tsx
│   │   ├── DemoCTA/DemoCTA.tsx + DemoForm.tsx + FormField.tsx  # formulário de contato (client-side only)
│   │   └── Footer/Footer.tsx
```

## 3. Ordem de montagem (`App.tsx`)

Fixa e igual à ordem visual da página — qualquer novo bloco de contato/backend
deve respeitar essa sequência ou declarar explicitamente onde entra:

```
<LazyMotion features={domAnimation} strict>
  <a className="skip-link" href="#conteudo">…</a>
  <Nav />
  <main id="conteudo">
    <Hero />           → #topo
    <Problem />        → #problema
    <HowItWorks />     → #como-funciona
    <Differentiators />→ #diferenciais
    <TechBase />       → #base-tecnica
    <DemoCTA />        → #demonstracao   ← formulário de contato vive aqui
  </main>
  <Footer />
</LazyMotion>
```

Todas as âncoras (`nav`, `footer`) apontam para esses `id`s; `scroll-margin-top`
global compensa a nav sticky.

## 4. Camada de dados — `src/lib/copy.ts`

Toda a copy é tipada e centralizada; nenhum texto vive em JSX. Exports, na
ordem do arquivo:

| Export | Consumido por | Observação |
|---|---|---|
| `brand` | `Nav`, `Footer`, `Logo` | `name`, `logoAlt` |
| `nav` | `Nav` | `links[]` (label+href), `cta`, `skipLink`, `ariaLabel` |
| `hero` | `Hero` | `eyebrow`, `headline{before,highlight,after}`, `lead`, `ctaPrimary`, `ctaGhost`, `stats[]` |
| `calcMemory` | `CalcMemory` | `title`, `badge`, `docLabel`, `ncmLabel`, `steps[]`, `result` — **dados fixos, ilustrativos** |
| `problem` | `Problem` | `eyebrow`, `title`, `sub`, `items[]` (01/02/03) |
| `howItWorks` | `HowItWorks`, `FlowCard` | `flows[]` com `id` (`wizard`\|`lote`\|`sefaz`), `name`, `summary`, `bullets[]` |
| `differentiators` | `Differentiators` | `feature` (card grande "Auditável") + `items[]` (Multi-empresa, IBS/CBS, Histórico) |
| `techBase` | `TechBase` | `items[]` (Papéis de acesso, Dados por empresa, Motor fiscal isolado, Exportações prontas) |
| `demoCta` | `DemoCTA` | `eyebrow`, `title`, `sub`, `bullets[]`, `note` |
| `demoForm` | `DemoForm`, `FormField` | ver §5 — **campo relevante para o backend** |
| `footer` | `Footer` | `tagline`, `links[]`, `disclaimer` (obrigatório por §2 do spec), `copyright` |

## 5. Formulário de contato — estado atual (`DemoCTA/DemoForm.tsx`)

### 5.1 Campos, ordem de renderização e validação

Ordem exata dos campos no formulário (top-to-bottom), tipo e regra de
validação client-side aplicada em `DemoForm.tsx`:

| # | Campo (`id`) | Tipo HTML | Obrigatório | Regra de validação | Mensagem de erro (`copy.ts → demoForm.errors`) |
|---|---|---|---|---|---|
| 1 | `demo-name` | `text` | sim | `values.name.trim()` não-vazio | `Informe seu nome.` |
| 2 | `demo-office` | `text` | sim | `values.office.trim()` não-vazio | `Informe o nome do escritório.` |
| 3 | `demo-email` | `email` | sim | regex `/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/` | `Informe um e-mail válido.` |
| 4 | `demo-volume` | `select` | sim | valor não-vazio, dentre as opções abaixo | `Selecione uma faixa.` |

Opções do select `demo-volume` (`copy.ts → demoForm.volumeOptions`), na ordem
exibida:

| `value` | `label` |
|---|---|
| `ate-10` | Até 10 |
| `11-50` | 11–50 |
| `51-200` | 51–200 |
| `mais-de-200` | Mais de 200 |

### 5.2 Payload gerado (`src/lib/demo.ts`)

```ts
export type DemoRequestPayload = {
  name: string    // demo-name
  office: string  // demo-office
  email: string   // demo-email
  volume: string  // demo-volume — um dos value acima
}
```

### 5.3 Fluxo de envio (client-side, sem rede)

1. `handleSubmit` roda `validate(values)` → se houver erro, aborta e marca os
   campos (`aria-invalid` + `aria-describedby`, foco permanece no form).
2. Se válido, chama `submitDemoRequest(payload)` (`src/lib/demo.ts`) —
   **hoje é um stub**: `Promise.resolve()` imediato, nenhuma requisição de
   rede, nenhum dado persistido (sem `localStorage`/`sessionStorage`).
3. Em sucesso: estado local `sent = true`, `values` reseta para vazio, o form
   é substituído por um cartão de confirmação `role="status"` que **recebe
   foco programaticamente** (`confirmationRef.current?.focus()`).
4. Em falha (branch `catch`, hoje inatingível pois o stub nunca rejeita):
   erro genérico `demoForm.errors.submit` — `"Não foi possível enviar agora.
   Tente novamente em instantes."`
5. Botão "Enviar outra solicitação" (`demoForm.success.again`) volta ao
   formulário vazio.

### 5.4 Ponto de integração para o backend

```ts
// src/lib/demo.ts
export async function submitDemoRequest(payload: DemoRequestPayload): Promise<void> {
  // TODO: conectar (endpoint próprio / Formspree / Basin / WhatsApp)
}
```

Esta é a **única função a alterar** para plugar a camada de backend real. O
contrato (`DemoRequestPayload` → `Promise<void>`, rejeita em caso de falha) já
é respeitado por `DemoForm.tsx` — a UI de erro/sucesso não precisa mudar,
só a implementação interna dessa função.

## 6. Tokens de design (`src/styles/tokens.css`)

Único arquivo do repo com hex/rgba. Duas camadas:

- **Camada 1** — `--mg-color-*`: fallback documentado do design system `@mg`
  (tema dark quase-preto, acento dourado único). Substituir pelos valores
  oficiais do pacote `@mg/tokens` quando disponível.
- **Camada 2** — aliases locais consumidos pelos CSS Modules: `--bg`, `--panel`,
  `--line`, `--ink`/`--ink-2`/`--ink-3`/`--ink-3-strong` (variante de contraste
  AA para texto pequeno), `--gold`/`--gold-bright`/`--gold-dim`, translúcidos
  dourados (`--gold-06` … `--gold-40`), translúcidos de fundo da nav
  (`--bg-blur`, `--bg-blur-soft`, `--bg-blur-strong`).

`--ink-3-strong` (#8a93a1) foi adicionado além do spec original porque
`--ink-3` (#727b89) reprovava contraste AA (4.0–4.35:1) sobre `--panel`/`--bg-2`
em texto pequeno (disclaimer, badges, memória de cálculo).

## 7. Motion (`src/lib/motion.ts`)

Tudo centralizado; nenhum componente define transição solta. Exports:

- `fadeUp`, `staggerContainer`, `staggerItem`, `resultPop` — reveal e cascata
  (usados por `CalcMemory`, `Reveal`, `FlowCard`).
- `cardHover`, `buttonMotion` — hover/tap de cartões e do botão primary.
- `collapseContent`, `chevronRotate` — accordion de "Como funciona".
- `useRevealInView(ref)` — hook que substitui `whileInView` (não disponível em
  `domAnimation`/`LazyMotion`) disparando `animate` quando o elemento entra na
  viewport (`once: true, margin: '-40px'`).
- Toda função aceita `reduced: boolean` (de `useReducedMotion()`) e vira
  identidade/sem stagger quando `true`.

## 8. Decisões tomadas fora do spec original

1. **Menu vira "pílula"**: `Nav` não é mais uma barra full-bleed; é um
   container único `border-radius: 999px` envolvendo marca + links + CTA,
   fundo translúcido leve no topo (`--bg-blur-soft`) e mais opaco ao rolar
   (`--bg-blur-strong` + sombra).
2. **Hover dos links da nav**: sublinhado dourado animado (CSS puro,
   `::after` com `right: 100% → 0`) + o texto assume peso 600 num
   `::before` sobreposto (`content: attr(data-label)`, por isso os links
   têm `data-label={link.label}` no JSX) — `white-space: nowrap` em ambos
   para não quebrar linha ao trocar de peso.
3. **"Como funciona" é um accordion single-open**, não mais 3 cards estáticos
   lado a lado. Primeiro item (`wizard`) aberto por padrão. Header é um
   `<button aria-expanded aria-controls>`; painel é `role="region"
   aria-labelledby`. Altura anima via `collapseContent` (`height: 0 → auto`).
4. **Grid de Diferenciais**: card "Auditável" ocupa a largura cheia (2
   colunas internas: rótulo+título / corpo+chips) para não deixar buracos no
   grid de 3 colunas; os 3 cards menores vêm abaixo.
5. **Hero não anima a coluna de texto** (só o `CalcMemory` faz cascata) — é
   o elemento de LCP da página; qualquer fade adiava a métrica.

## 9. O que falta (próxima etapa — fora deste snapshot)

- Implementar `submitDemoRequest` de verdade (endpoint próprio, Formspree,
  Basin, WhatsApp — a decidir).
- Definir se o volume de empresas (`demo-volume`) ou algum campo novo precisa
  virar lead scoring / roteamento no backend.
- Nenhum dado é persistido hoje no client — confirmar se o backend precisa de
  algum tipo de idempotência/anti-spam (rate limit, honeypot, captcha) antes
  de expor o endpoint publicamente.
