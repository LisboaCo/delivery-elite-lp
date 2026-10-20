# Skill / Contexto para Agentes de IA — Landing Pages no Cloudflare Pages

## 1. Objetivo

Este documento define as regras para criar e manter as landing pages deste
repositório. O projeto é estático, sem Flask, Docker ou etapa de build, e é
publicado pelo Cloudflare Pages a partir de `public/`.

As páginas devem continuar prontas para produção, com SEO, performance,
tracking, UTMs e CTAs preservados.

## 2. Arquitetura obrigatória

- Cada LP fica em `public/<slug>.html`.
- Imagens, scripts, estilos, fontes e vídeos ficam em `public/static/`.
- Use URLs absolutas a partir da raiz, como `/static/img/logo-mark.png`.
- A raiz `/` serve `public/index.html`.
- A URL canônica de cada LP é `/<slug>`.
- URLs legadas `/lp/<slug>` redirecionam para `/<slug>` por `public/_redirects`.
- `/lp/help` serve `public/help.json`.
- O projeto usa `wrangler.jsonc` com `pages_build_output_dir` igual a `./public`.

Não adicione servidor Flask, Gunicorn, Docker ou dependência de runtime para
servir conteúdo estático.

## 3. Responsabilidade do agente

Ao criar ou editar uma LP, entregue HTML completo e pronto para publicação,
incluindo:

- estrutura semântica;
- SEO e Open Graph;
- responsividade;
- tracking existente;
- suporte a parâmetros UTM;
- CTA funcional;
- assets locais com capitalização exata.

Atualize `public/help.json` quando adicionar ou remover uma página.

## 4. Estrutura mínima de uma LP

```html
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>{TÍTULO_OTIMIZADO}</title>
  <meta name="description" content="{DESCRIÇÃO_OTIMIZADA}">
  <meta property="og:title" content="{TÍTULO_OTIMIZADO}">
  <meta property="og:description" content="{DESCRIÇÃO_OTIMIZADA}">
  <meta property="og:type" content="website">
  <script src="/static/tracking.js"></script>
</head>
<body>
  <header>
    <h1>{HEADLINE_PRINCIPAL}</h1>
  </header>
  <main>
    <section>{CONTEÚDO}</section>
    <section>
      <a href="{DESTINO_DO_CTA}" data-cta="principal">{CTA_PRINCIPAL}</a>
    </section>
  </main>
</body>
</html>
```

Adapte a estrutura ao layout existente da página; não substitua componentes,
tracking ou comportamento aprovados sem solicitação explícita.

## 5. SEO

- Use um único `<h1>` por página.
- Mantenha hierarquia coerente de `<h2>` e `<h3>`.
- Escreva título e descrição alinhados à intenção da página.
- Inclua Open Graph quando aplicável.
- Evite conteúdo duplicado entre LPs.
- Preserve URLs e slugs existentes.

## 6. Performance e assets

- Otimize imagens e use `loading="lazy"` fora da dobra quando adequado.
- Evite bibliotecas externas pesadas e scripts desnecessários.
- Nenhum arquivo publicado pode ultrapassar 25 MiB.
- Use o nome e a capitalização exatos do arquivo; o ambiente é case-sensitive.
- Mantenha masters grandes somente em `source-assets/`, nunca em `public/`.
- Não invente substitutos para assets ausentes.

## 7. Tracking e conversão

- Preserve Google Tag Manager, pixels, `dataLayer`, IDs e eventos existentes.
- Preserve a captura e propagação de UTMs, `gclid`, `fbclid` e parâmetros afins.
- Preserve links de checkout, WhatsApp e seus atributos de tracking.
- Não altere bloqueios temporizados de CTA nem páginas `*-livre` sem pedido
  explícito.
- Não mova chaves ou segredos para o navegador.

## 8. Formulários e integrações

Formulários e integrações puramente client-side podem permanecer no HTML ou em
`public/static/`. Se uma mudança exigir POST privado, segredo, sessão ou outra
lógica de servidor, pare e proponha uma Cloudflare Pages Function ou Worker em
escopo separado.

## 9. Conteúdo e consistência

- Mantenha o tom de voz e a identidade visual da Delivery Elite.
- Preserve textos, preços, ofertas e destinos de CTA, salvo instrução contrária.
- Estruture o conteúdo para conversão sem remover evidências ou avisos.
- Garanta boa experiência em desktop e mobile.

## 10. Validação obrigatória

Antes de concluir uma mudança:

1. execute a auditoria de assets e referências;
2. confirme que não há Jinja ou dependência de Flask;
3. teste `/`, `/<slug>`, `/lp/<slug>` e `/lp/help` com Wrangler;
4. teste imagem, CSS, JavaScript e vídeo representativos;
5. confirme tracking, UTMs e destinos de CTA;
6. revise o diff e não publique arquivos acima de 25 MiB.

## 11. Configuração do Cloudflare Pages

- Framework preset: nenhum.
- Comando de build: vazio.
- Diretório de saída: `public`.
- O deploy deve usar o projeto definido em `wrangler.jsonc`.

Não afirme que houve deploy sem evidência retornada pelo Cloudflare.
