# Refactor Checklist — Bloco Estimated Shipping

> Arquivo de débito técnico e melhorias de arquitetura para o bloco `estimated_shipping` (atualmente embedado em `sections/main-product.liquid`).
> Criado em: 2026-04-14

---

## 🚨 CRÍTICO — Resolver antes de escalar DE / GB / US

> Se não corrigirmos esses itens, os markets de língua inglesa e alemã **vão exibir textos em inglês misturados** ou com preposições erradas.

- [ ] **1. `days_labels` e `months_labels` devem vir dos arquivos de locale, não do schema**
  - **Problema hoje:** o default é `"Monday, Tuesday..."` e `"January, February..."` em inglês puro. Se o lojista esquecer de trocar, o visitante alemão vê `"Monday, April 21st"` em vez de `"Montag, 21. April"`.
  - **Solução ideal:** remover esses campos do schema e buscar do locale ativo via Liquid (`{{ 'general.date.days' | t }}`, por exemplo). Se não for possível, ao menos o default deveria usar `localization.locale` para injetar o idioma certo.
  - **Impacto DE/GB:** alto — quebra a localização visual.

- [ ] **2. `carrier_prefix` default fixo em `"with"` é problemático para multilíngue**
  - **Problema hoje:** o fallback é `"with"`, então um cliente na Alemanha pode ver `"with DHL Standard Shipping"` em vez de `"mit DHL Standard Shipping"`.
  - **Solução ideal:** ou remover o `carrier_prefix` e deixar a preposição no próprio richtext (já que o `message` é editável por template), ou fazer o prefixo buscar de `locales/*.json` por país.
  - **Impacto DE:** alto — soa como loja mal traduzida / amadora.

- [ ] **3. `message` (richtext) não tem fallback por locale**
  - **Problema hoje:** o default é `"Get it between [start_date] and [end_date]"` em inglês. Para cada template de produto (`product.standard-*.json`, `product.corretor.json`, etc.) é preciso lembrar de traduzir manualmente no editor.
  - **Solução ideal:** o default deveria usar uma chave de tradução `t:` que respeite o `localization.locale`, ex: `{{ 'sections.estimated_shipping.default_message' | t }}`.
  - **Impacto DE/GB:** médio-alto — exige trabalho manual repetitivo e fácil de esquecer.

- [ ] **4. `date_format` com labels hardcoded em inglês no schema**
  - **Problema hoje:** o editor de tema mostra `"Monday, February 1st"` mesmo quando o admin da loja está em alemão. Não quebra a loja, mas confunde quem configura.
  - **Solução ideal:** trocar todos os `label` do select por chaves `t:` (ex: `t:sections.estimated_shipping.settings.date_format.options__1.label`) e manter as traduções nos arquivos `locales/*.schema.json`.
  - **Impacto DE:** médio — UX ruim no admin.

---

## 🔧 ARQUITETURA — Melhorias estruturais

- [ ] **5. Extrair bloco de `main-product.liquid` para `blocks/estimated-shipping.liquid`**
  - **Problema hoje:** o schema do bloco está duplicado/dentro da section do produto. Não é reutilizável em `featured-product`, `cart-drawer`, `page`, etc.
  - **Solução:** criar `blocks/estimated-shipping.liquid` e referenciá-lo onde necessário (padrão OS 2.0 moderno).
  - **Esforço:** médio — exige mover schema + snippet e testar em todos os templates que usam.

- [ ] **6. Campo `icon` como `text` livre é frágil**
  - **Problema hoje:** o lojista precisa decorar o nome exato do ícone Material Symbols (`local_shipping`, `schedule`, `inventory_2`, etc.). Um typo e o ícone some.
  - **Solução:** transformar em `select` com as 10–15 opções de ícone mais usadas para shipping/delivery. Se quiser flexibilidade máxima, manter `custom_icon` (image_picker) como já existe.
  - **Esforço:** baixo.

- [ ] **7. Margens manuais (`margin_top`, `margin_bottom`) devem ser nativas da Shopify**
  - **Problema hoje:** ranges manuais de 0–45px poluem o editor e repetem lógica que a Shopify já resolve nativamente.
  - **Solução:** usar `"padding": true` (ou padding/margin nativo do schema de block) e remover os ranges manuais.
  - **Esforço:** baixo — mas pode alterar visual de lojas já configuradas.

- [ ] **8. Todo o schema deve usar traduções `t:` em vez de texto hardcoded**
  - **Problema hoje:** `label`, `info`, `content` e `default` dos campos estão 100% em inglês no JSON do schema. O editor de tema não traduz para admins alemães.
  - **Solução:** criar chaves nos arquivos `locales/en.default.schema.json`, `locales/de.schema.json`, `locales/pt-BR.schema.json`, etc., e referenciá-las no schema.
  - **Esforço:** médio — exige tocar ~20 strings + 3–4 arquivos de locale.

- [ ] **9. Lógica JS do `DynamicDates` está ofuscada em `shrine.null.js`**
  - **Problema hoje:** a classe `DynamicDates` vive em um arquivo JS minificado/ofuscado. Debugar ou estender é impossível.
  - **Solução:** extrair `DynamicDates` para `assets/dynamic-dates.js` (código legível) e importar no `theme.liquid`.
  - **Esforço:** médio-alto — exige reescrever e garantir que não quebre outras sections que usam a mesma classe.

- [ ] **10. O placeholder `[carrier]` ainda é processado por MutationObserver + regex no cliente**
  - **Problema hoje:** há uma race condition possível entre o `DynamicDates` atualizar o DOM e o nosso script substituir `[carrier]`. Funciona, mas é frágil.
  - **Solução ideal:** fazer a substituição do `[carrier]` dentro do próprio ciclo de vida do `DynamicDates`, ou gerar o HTML final no servidor (Liquid) quando possível.
  - **Nota:** isso não é viável hoje porque o país do usuário só é conhecido no runtime via `localization.country.iso_code` exposto no JS. Seria necessário usar uma solução server-side (metafields + Liquid `case`) para eliminar o JS.

---

## 📝 Notas rápidas sobre multilíngue

| Idioma | Risco imediato |
|--------|----------------|
| **DE** | `days_labels` em inglês, prefixo `"with"`, schema não traduzido |
| **EN** | Funciona, mas ainda carece de `t:` no schema para admins não-anglófonos |
| **PT-BR** | Mesmo problema do DE — dias/meses em inglês por default |

---

## Prioridade de execução sugerida

1. **Corrigir `days_labels`/`months_labels`** para não depender de input manual (ou documentar MUITO bem).
2. **Revisar `carrier_prefix`** — considerar removê-lo e deixar a preposição no richtext.
3. **Traduzir o schema** para `de`, `pt-BR` e `en.default` usando chaves `t:`.
4. **Refatorar `icon` de `text` para `select`**.
5. **Extrair bloco para `blocks/`** quando houver tempo de QA.
