# AGENTS.md — Ck-Ecomm Theme (Suevich)

> Arquivo de contexto para agentes de código. Atualizado em: 2026-04-14

---

## 1. Visão Geral do Tema

| Propriedade | Valor |
|-------------|-------|
| **Nome** | Ck-Ecomm Theme |
| **Versão** | 1.0.4 |
| **Autor** | Ck-Ecomm |
| **Plataforma** | Shopify Online Store 2.0 |
| **Loja** | suevich-2.myshopify.com (domínio customizado: suevich.com) |
| **Tecnologias** | Liquid, CSS, Vanilla JS |

- **Arquitetura**: OS 2.0 com `sections`, `blocks` e templates `.json` + `.liquid`.
- **Não há build tool** (sem Webpack, Vite, npm, etc.). Edite CSS/JS/ Liquid diretamente.
- **Fonte padrão atual**: Montserrat (heading) + Twentieth Century (body) — configurável via `settings_data.json`.

---

## 2. Estrutura de Diretórios

```
assets/          → CSS, JS e imagens estáticas do tema
config/          → settings_schema.json | settings_data.json | markets.json
layout/          → theme.liquid | password.liquid
locales/         → Traduções (pt-BR, en.default, de, etc.)
sections/        → ~85 sections (OS 2.0)
snippets/        → ~85 snippets reutilizáveis
templates/       → Templates de página (JSON + Liquid)
```

### Destaques por pasta

#### `assets/`
- `base.css` — CSS base global.
- `secondary.js` — JS utilitário do tema.
- `shrine.null.js` — Script customizado (country blocker, animações, etc.).
- `component-*.css` — Componentes isolados (facets, cards, predictive search, etc.).
- `section-*.css` — CSS específico de sections customizadas.

#### `sections/`
Sections nativas + customizadas do Ck-Ecomm. As principais:
- `header.liquid` / `footer.liquid`
- `main-product.liquid` / `main-collection-product-grid.liquid`
- `cart-drawer.liquid`
- `slideshow-hero.liquid` / `image-banner.liquid` / `parallax-hero.liquid`
- `bundle-deals.liquid` / `pricing-table.liquid` / `content-tabs.liquid`
- `promo-popup.liquid` / `scroll-to-top-btn.liquid` / `global-music-player.liquid`
- `a2reviews-block.liquid` / `a2reviews-main-widget.liquid`
- Apps de terceiros: `ss-countdown-bar.liquid`, `ss-testimonial-14.liquid`

#### `snippets/`
- `bucks-cc.liquid` — Currency converter (Buckscurrency).
- `pandectes-rules.liquid` — Script GDPR/cookies (Pandectes).
- `a2reviews-*.liquid` — Widgets de review (A2Reviews).
- `cart-drawer.liquid` / `cart-notification.liquid` — Mini-carrinho e notificações.
- `product-variant-picker.liquid` / `buy-buttons.liquid` — Produto.
- `material-icon.liquid` — Ícones Material Symbols.
- `meta-tags.liquid` — Tags SEO/Open Graph.

---

## 3. Apps & Integrações de Terceiros

> **ATENÇÃO:** Os snippets de `bucks-cc.liquid`, `pandectes-rules.liquid` e `pandectes-settings.json` ainda contêm dados hardcoded de lojas antigas (ex: `088f7b.myshopify.com`, `Tema Vizelki` / ID `91360231708`). Eles precisam ser reconfigurados diretamente nos apps no admin da Shopify para regenerar com os dados corretos de `suevich.com`.

> **NUNCA remova snippets de apps sem confirmar com o lojista.** Eles podem quebrar funcionalidades de compliance ou conversão.

| App/Serviço | Onde está | Propósito |
|-------------|-----------|-----------|
| **Pandectes GDPR** | `snippets/pandectes-rules.liquid`, `assets/pandectes-*.js/json/png` | Banner de cookies & compliance GDPR |
| **Bucks Currency Converter** | `snippets/bucks-cc.liquid` | Conversão de moedas na loja |
| **A2Reviews** | `snippets/a2reviews-*.liquid`, `sections/a2reviews-*.liquid`, `assets/a2reviews-custom.css` | Reviews e avaliações de produtos |
| **Google Ads (gtag)** | Inline em `layout/theme.liquid` (AW-16898376068) | Rastreamento de conversões |
| **Shopify.jsdeliver.cloud** | Inline em `layout/theme.liquid` | Script de configuração externa |

---

## 4. Configurações de Segurança & Anti-Spy

O tema possui **features agressivas de proteção** ativadas via `settings_schema.json`:

- **`disable_inspect`** (default: `true` em schema, atualmente `false` em `settings_data.json`)
  - Bloqueia botão direito, Ctrl+Shift+I/J/C, Ctrl+U, drag de imagens.
- **`block_spy_tools`**
  - Redireciona referrers de ferramentas de espionagem (AdSpy, PiPiAds, ShopHunter, etc.).
  - Detecta user-agents de extensões spy (Ali Hunter, PPSPY, Commerce Inspector).
- **`country_list_function`** + **`country_list`**
  - Blocklist/whitelist de países via `shrine.null.js`.

> **Atenção:** alterar essas configurações pode bloquear acesso de mercados-alvo. Verifique `settings_data.json` antes de publicar.

---

## 5. Padrões de Código & Convenções

### Liquid
- Use `{{- ... -}}` e `{%- ... -%}` para evitar espaços em branco quando apropriado.
- Sections usam `{% schema %}` com traduções via `t:` (ex: `t:settings_schema.colors.name`).
- O tema suporta múltiplos contextos de mercado (arquivos `.context.*.json`).

### CSS
- Variáveis CSS são geradas inline no `<head>` de `theme.liquid` a partir de `settings_data.json`.
- Nomenclatura BEM-like: `.header__heading-link`, `.list-menu--inline`, `.component-facets`.
- Animações: classes `.animate-section`, `.animate-item`, `.animate--shown` / `.animate--hidden`.

### JS
- JS vanilla, sem frameworks.
- `window.shopUrl`, `window.routes`, `window.cartStrings` e `window.variantStrings` são expostos globalmente no final de `theme.liquid`.
- O tema usa web components nativos (`header-drawer`, etc.).

---

## 6. Considerações de Desenvolvimento

1. **Não há pipeline de build** — alterações em `assets/` refletem imediatamente após upload.
2. **Cuidado com `settings_data.json`** — ele é auto-gerado pelo editor de tema. Alterações manuais podem ser sobrescritas se alguém editar no admin.
3. **Templates de produto específicos** existem:
   - `product.corretor.json`
   - `product.ea-gdaqm2.json`
   - `product.kit-2-white.json`
   - `product.massageador.json`
   - `product.nordsak-1.json`
   - `product.standard-*.json` (vários)
   - `product.star-green*.json`
4. **Contextos internacionais** configurados:
   - `.context.be.json` (Bélgica)
   - `.context.international.json`
   - `.context.estados-unidos.json`
   - `.context.04d13b88-...json` (market ID específico)

---

## 7. Comandos Úteis (Shopify CLI)

```bash
# Pull das últimas alterações do tema ativo
# Nota: o Shopify CLI requer o domínio myshopify, não funciona com domínio customizado
shopify theme pull --store suevich-2.myshopify.com --path .

# Servir localmente com live-reload
shopify theme dev --store suevich-2.myshopify.com

# Listar temas disponíveis
shopify theme list --store suevich-2.myshopify.com

# Fazer deploy para o tema ativo (cuidado!)
shopify theme push --store suevich-2.myshopify.com
```

---

## 8. Contatos & Documentação do Tema

- **Docs do tema**: https://help.ck-ecomm.com/
- **Suporte Ck-Ecomm**: https://ck-ecomm.com/pages/contact
- **Discord do autor**: link em `settings_schema.json` (https://discord.gg)

---

*Se este arquivo ficar desatualizado após grandes refatorações, atualize a seção "Visão Geral" e as datas.*
