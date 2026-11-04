# Página do webinar Delivery na Prática

## Publicação autorizada em 03/11/2026

**Correção posterior de Otavio em 03/11:** publicar somente a LP. Retirar
`public/apresentacao-webinar.pdf` da hospedagem; apresentação apenas como arquivo
local e no Drive. Automação será feita por Otavio com Claude em 04/11.
Manter LP em preview até conectar e testar o cadastro, destinos e rastreamento.
O registro de publicação do PDF abaixo é histórico, superado por esta correção.

Otavio confirmou a pasta `LP DELIVERY ELITE` e solicitou publicar a LP e o PDF atualizado após a reunião. Usar este repositório, branch `main`, no projeto Cloudflare Pages existente `delivery-elite-lp`. A publicação substitui a restrição de preparação local descrita no histórico abaixo.

- Página: `/webinar` (preview, cadastro desativado até integrar e testar o Kommo).
- Apresentação revisada v21, 27 páginas: `/apresentacao-webinar.pdf`.
- Live: 10/11/2026 às 20h; Formação PRO: R$1.497.
- PDF não aparece como link na LP, preservando o foco da inscrição.
- Não houve ativação de anúncios, automações, cobrança ou envio de mensagens.

**Pós-reunião de 03/11:** retorno para 10/11 às 20h confirmado por Otavio. `dateConfirmed: true`; página continua em preview, inscrições fechadas, endpoint vazio e tracking desativado.


## Revisão aprovada por Otavio — 03/11/2026

Nome do evento e promessa reunidos em um único H1, mantendo a composição visual.
Seções H2 e subtítulos H3 preservados. Textos de apoio ampliados para 12 px e
consentimento/privacidade para 13 px. CTAs com gradiente vermelho mais escuro,
inclusive no hover. Checkbox vinculado ao texto de erro. Data visual e eventId
sincronizados para 10/11/2026 às 20h, Brasília. Modo preview, campos desativados,
endpoint vazio e tracking desligado preservados. Nenhum deploy nesta revisão.

## Direção vigente — estrutura completa, todos os CTAs para inscrição

Correção mais recente de Otavio em 02/11: preservar a estrutura anterior e
remover somente fugas. A alternativa compacta foi descartada. Fonte visual ativa:
`webinar.css` + `typography.css`; `capture.css` não é carregado.
Restaurados hero, conteúdo da aula, públicos, biografia, FAQ e CTA fixo.
Logo sem link, sem Instagram e sem atalhos para outras seções no cabeçalho.
Todos os links anteriores ao cadastro levam ao formulário. FAQ abre localmente.
Consentimento e privacidade preservados; grupo/YouTube só na confirmação.
Simulação técnica apenas em preview com `?review=1`. Cadastro segue desativado.

## Escopo em 02/11/2026

Página de captação em `public/webinar.html`, rota `/webinar`. Criada para revisão do planejamento com Eric. Configuração em `public/static/webinar/config.js`; estado inicial `preview`, com cadastro desativado e sem tracking externo. A etapa de confirmação é demonstrável sem informar dados pessoais.

**Destino decidido por Otavio:** Kommo, pipeline **Webinario**, já criada por ele. A automação será feita por Otavio via n8n na conta pessoal de Codex ou Claude. Não configurar fluxos, credenciais ou destinos nas contas conectadas desta sessão. Esta entrega prepara a interface; não cria automação nem pipeline.

Data definida por Otavio: 10/11/2026, 20h, Brasília. Grupo e evento YouTube serão criados depois da apresentação. Produto pago separado: Formação gestores de delivery PRO. Nome do evento em uso na prévia: Delivery na Prática.

## Conectar depois

1. Confirmar data com Eric e ajustar textos e `eventId` se necessário.
2. Otavio cria webhook n8n HTTPS na conta pessoal, que valida os campos e grava contato/lead na pipeline **Webinario**, usando o ID real dessa pipeline. Não presumir o ID a partir do nome.
3. Configurar CORS para a origem pública aprovada e responder `OPTIONS`. Validar nome, telefone, consentimento e evento no servidor; limitar tamanho/frequência dos pedidos. Nenhuma credencial Kommo deve ir ao navegador.
4. Deduplicar por evento + telefone e por `request_id`: uma tentativa que estoure o tempo no navegador pode ter sido salva. Repetição idempotente retorna o mesmo comprovante sem criar outro lead. O evento de sucesso significa inscrição salva, não entrada no grupo.
5. Responder somente após gravação confirmada: HTTP 200/201 e JSON `{"ok":true,"registrationId":"identificador-estavel"}`. O navegador não considera HTTP 200 sozinho como cadastro confirmado. Em erro, devolver HTTP de erro e JSON sem dados pessoais.
6. Preencher `endpoint`, `groupUrl` (chat.whatsapp.com), `liveUrl` (YouTube), contato efetivo para privacidade e conferir aviso de dados com os operadores reais antes de divulgar. O aviso atual explica a finalidade; completar contato e responsabilidades no texto de privacidade.
7. Configurar `dateConfirmed:true`, `registrationOpen:true`, `mode:'live'`. Ativar `trackingEnabled:true` só após auditar as tags do GTM para a nova rota e configurar o evento de conversão. Não há Pixel direto duplicado nesta página.
8. Testar a gravação real no Kommo, repetição, falha/timeout, consentimento e entrada na confirmação. Confirmar checkout em tarefa separada; a página de captação não vende o produto.

## Contrato de envio

POST JSON para o endpoint configurado:

```json
{
  "event_id": "delivery-na-pratica-2026-11-10",
  "request_id": "UUID gerado no navegador e reutilizado em repetição do mesmo envio",
  "name": "Nome informado",
  "whatsapp": "55DD9XXXXXXXX",
  "consent": true,
  "consent_version": "webinar-2026-11-v2",
  "utms": {"utm_source":"meta", "utm_campaign":"webinar"},
  "page_path": "/webinar",
  "submitted_at": "ISO 8601"
}
```

O n8n deve acrescentar horário de recebimento do servidor. UTMs são capturadas da URL desta página e não são dados confiáveis para autorização. Nome e telefone não são colocados na URL, no dataLayer ou no armazenamento local. Sem envio real na prévia.

Medição ativa desde 04/11/2026: GTM auditado sem alteração; visita vem das tags de todas as páginas (GA4, Clarity, Pixel). A inscrição confirmada sai de `webinar.js`: `generate_lead` para `G-JTMPLWFWDP`, evento Clarity `webinar_registration_success` e Pixel `Lead`. Formulário mascarado no Clarity.

Eventos previstos: `webinar_form_cta`, `webinar_registration_success`, `webinar_group_invite_click` e `webinar_live_click`. Clique no convite não comprova participação no grupo. O GTM existente é `GTM-WG68M2TS`; `tracking.js` é carregado apenas no modo público com tracking ativado.

## Validação local em 02/11/2026

Revisão posterior de tipografia solicitada por Otavio: Montserrat local, Black
900 no título do evento e ExtraBold 800 nos títulos/CTAs. Fonte WOFF2 de 37.956
bytes, licença OFL e preload; sem dependência de Google Fonts em execução.
CSS isolado em `public/static/webinar/typography.css`. Layout reconferido em
1440 e 390 px, sem rolagem horizontal ou overflow nos títulos e botões.

Seis testes de formulário passaram (`node --test tests/webinar-form.test.mjs`),
checagem de sintaxe JS e diff sem erros. Wrangler local respondeu 200 para
`/`, `/webinar`, `/lp/webinar` (seguindo redirect), `/lp/help` e assets novos.
Revisão visual no Chrome em 1440×1000 e 390×844 CSS px: sem rolagem horizontal,
imagens carregadas, CTA principal/fixo, FAQ, confirmação demonstrativa e retorno
ao formulário conferidos. Nenhum erro de console observado. Sem GTM/Pixel na prévia;
o script externo observado pertence à extensão do navegador, não à página.
Retrato otimizado em WebP: 177.896 bytes. Evidências de capa desktop, mobile e
formulário na pasta canônica do cliente `evidencias/pagina-webinar-*.png`.
Não houve teste de integração real: endpoint n8n ainda vazio por decisão de Otavio.

## Publicação no projeto existente

Fonte oficial neste repositório Cloudflare Pages, diretório `public/`. Não usar outro projeto Sites ou domínio em substituição. Slug `/webinar`; redirect legado existente atende `/lp/webinar`. Não publicar a prévia como captação ativa. Nenhum push ou deploy faz parte da preparação local desta página.
