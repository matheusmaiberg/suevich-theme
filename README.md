# Suevich Theme

> Tema Shopify Online Store 2.0 baseado no Ck-Ecomm Theme, customizado e mantido para a loja [suevich.com](https://suevich.com).

[![Shopify](https://img.shields.io/badge/Shopify-OS%202.0-96bf48.svg)](https://shopify.com)
[![Tema](https://img.shields.io/badge/Tema-Ck--Ecomm%20v1.0.4-blue.svg)](https://ck-ecomm.com)

---

## Visão Geral

O **Suevich Theme** é um tema Shopify 100% compatível com **Online Store 2.0**, utilizando `sections`, `blocks` e templates `.json` + `.liquid`. Não há build tool — CSS, JS e Liquid são editados e enviados diretamente para a Shopify.

| Propriedade | Valor |
|-------------|-------|
| **Nome** | Suevich Theme |
| **Base** | Ck-Ecomm Theme v1.0.4 |
| **Plataforma** | Shopify OS 2.0 |
| **Loja** | suevich-2.myshopify.com (suevich.com) |
| **Autor Base** | Ck-Ecomm |
| **Tecnologias** | Liquid, CSS, Vanilla JS |

---

## Estrutura de Diretórios

```
assets/          → CSS, JS e imagens estáticas
blocks/          → Blocos reutilizáveis OS 2.0
config/          → settings_schema.json, settings_data.json
layout/          → theme.liquid, password.liquid
locales/         → Traduções (pt-BR, en, de, etc.)
sections/        → ~85 sections (nativas + customizadas)
snippets/        → ~85 snippets reutilizáveis
templates/       → Templates JSON + Liquid
```

---

## Instalação e Desenvolvimento

Requisitos: [Shopify CLI](https://shopify.dev/docs/themes/tools/cli) autenticado.

```bash
# Clonar o repositório
git clone https://github.com/matheusmaiberg/suevich-theme.git
cd suevich-theme

# Servir localmente com live-reload
shopify theme dev --store suevich-2.myshopify.com

# Listar temas
shopify theme list --store suevich-2.myshopify.com

# Fazer deploy para tema ativo (cuidado!)
shopify theme push --store suevich-2.myshopify.com
```

---

## Branches Principais

| Branch | Descrição | Status |
|--------|-----------|--------|
| `main` | Código de produção | Ativa |
| `snippet/estimated-shipping` | Bloco de frete estimado localizado | Merged → `main` |
| `snippet-size-chart` | Tabela de medidas integrada ao variant picker | Merged → `main` |

---

## Apps e Integrações

> ⚠️ **Nunca remova snippets de apps sem confirmar.** Eles podem quebrar compliance ou conversão.

- **Pandectes GDPR** — Banner de cookies (`snippets/pandectes-rules.liquid`)
- **Bucks Currency Converter** — Conversão de moedas (`snippets/bucks-cc.liquid`)
- **A2Reviews** — Reviews de produtos (`snippets/a2reviews-*.liquid`)
- **Google Ads (gtag)** — Rastreamento AW-16898376068

---

## Documentação Adicional

- [`AGENTS.md`](./AGENTS.md) — Contexto completo para agentes de código (estrutura, convenções, apps, segurança)
- [`CHANGELOG.md`](./CHANGELOG.md) — Histórico de mudanças e releases

---

*Última atualização: 15 de abril de 2026*
