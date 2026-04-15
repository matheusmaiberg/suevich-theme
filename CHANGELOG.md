# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [Unreleased]

### Added
- Integração do **Sizing Chart** dentro do bloco **Variant Picker** (`snippet-size-chart`)
  - Nova seção "Sizing chart" no schema do `variant_picker`
  - Configuração de posição: acima da Opção 1, 2 ou 3
  - Botão de abrir tabela alinhado à direita do label da opção
  - Modal com tabela, imagens, caption e esquema de cores configuráveis
  - Fallback automático para `Option 1` em templates legados
- Documentação de domínio customizado (`suevich.com`) no `AGENTS.md`
- Aviso sobre dados hardcoded de apps de terceiros (Pandectes/Bucks CC)

### Changed
- Parser do size chart reverteu para formato `richtext` (`<p>`) para compatibilidade com editor

---

## [1.1.0] — 2025-04-14

### Added
- Refatoração completa do bloco **Estimated Shipping** (`snippet/estimated-shipping`)
  - Extraído de `sections/main-product.liquid` para `blocks/estimated-shipping.liquid`
  - Localização automática de datas via `Intl.DateTimeFormat`
  - Suporte a nomes de transportadora por país (`[carrier]` + `carrier_list`)
  - Prefixos de transportadora configuráveis (`with`, `mit`, `com`, `avec`, etc.)
  - Novos tamanhos de texto e ícone (S/M/L via radio buttons)
  - Correção de renderização de negrito (`<strong>` / `<b>`)

### Changed
- Removido sufixos ordinais em inglês (`st`/`nd`/`rd`/`th`) das datas
- Simplificado schema: removidas opções legadas de `date_format`

---

## [1.0.4] — 2025-04-14

### Base
- Tema inicial importado da base **Ck-Ecomm Theme v1.0.4**
- Estrutura OS 2.0 com `sections`, `blocks` e templates JSON
- Configurações de segurança anti-inspect e anti-spy tools
- Integrações nativas: Pandectes, Bucks CC, A2Reviews

---

## Branches de Desenvolvimento

| Branch | Merge na Main | Descrição |
|--------|---------------|-----------|
| `snippet/estimated-shipping` | `257fb77` | Bloco standalone de frete estimado com localização multilíngue |
| `snippet-size-chart` | `9fc0ddd` | Tabela de medidas integrada ao variant picker com posição configurável |

---

*Nota: As versões [1.1.0] e [Unreleased] representam trabalho contínuo sobre a base 1.0.4 do Ck-Ecomm Theme.*
