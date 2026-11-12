import {formatPhoneInput, validateForm, formComplete, collectionReady, allowedUrl, confirmedRegistration, attribution} from '../webinar/form-core.mjs';

const config = window.WEBINAR_CONFIG || {};
const preview = config.mode !== 'live';
const ready = collectionReady(config);
const $ = id => document.getElementById(id);
const form = $('webinar-form');
const submit = $('submit-button');
let busy = false;
let attemptId = null;
const utms = attribution(location.search);
const groupUrl = allowedUrl(config.groupUrl, 'group');
const liveUrl = allowedUrl(config.liveUrl, 'live');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const scrollBehavior = reducedMotion ? 'instant' : 'smooth';
// Tempo para o Pixel, o GA4 e o Clarity enviarem a inscrição antes de sair da página.
const REDIRECT_DELAY_MS = 600;

// O botão só fica clicável com nome, WhatsApp e aceite válidos.
function updateSubmit() {
  if (!ready || busy) return;
  const complete = formComplete({name:$('nome').value, phone:$('whatsapp').value, consent:$('consent').checked});
  submit.disabled = !complete;
  $('submit-hint').hidden = complete;
}

// Todos os convites da página conduzem ao mesmo formulário.
document.querySelectorAll('a[href="#inscricao"]').forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  $('inscricao').scrollIntoView({behavior:scrollBehavior,block:'start'});
  const target = ready ? $('nome') : $('inscricao-titulo');
  if (!ready) target.setAttribute('tabindex','-1');
  target.focus({preventScroll:true});
}));
if ('IntersectionObserver' in window) {
  if (!reducedMotion) {
    const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('reveal-visible'); reveal.unobserve(entry.target); }
    }), {threshold:0.08});
    document.querySelectorAll('.lesson-grid,.audience article,.authority-copy').forEach(el => {
      el.classList.add('reveal-pending'); reveal.observe(el);
    });
  }
  let heroVisible = true, formVisible = false, footerVisible = false;
  const sticky = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.target.matches('.hero')) heroVisible = entry.isIntersecting;
      if (entry.target.id === 'inscricao') formVisible = entry.isIntersecting;
      if (entry.target.matches('.footer')) footerVisible = entry.isIntersecting;
    });
    $('sticky-signup').hidden = heroVisible || formVisible || footerVisible;
  });
  ['.hero','#inscricao','.footer'].forEach(selector => sticky.observe(document.querySelector(selector)));
}

// Tracking público só é carregado após ativação explícita. Nenhum dado pessoal vai ao dataLayer.
if (!preview && config.trackingEnabled === true) {
  const base = document.createElement('script'); base.src = '/static/tracking.js'; document.head.append(base);
  if (/^GTM-[A-Z0-9]+$/.test(config.gtmId || '')) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({'gtm.start': Date.now(), event: 'gtm.js'});
    const tag = document.createElement('script'); tag.async = true;
    tag.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(config.gtmId)}`; document.head.append(tag);
  }
}
function track(event, payload = {}) {
  if (preview || config.trackingEnabled !== true) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({event, webinar_id: config.eventId, ...utms, ...payload});
}
// O GTM não tem tag para esta rota: a conversão sai daqui, sem nome nem telefone.
function trackRegistration() {
  if (preview || config.trackingEnabled !== true) return;
  function googleEvent() { window.dataLayer = window.dataLayer || []; window.dataLayer.push(arguments); }
  try { googleEvent('event', 'generate_lead', {send_to: 'G-JTMPLWFWDP', webinar_id: config.eventId, ...utms}); } catch {}
  try { if (typeof window.clarity === 'function') window.clarity('event', 'webinar_registration_success'); } catch {}
  try { if (typeof window.fbq === 'function') window.fbq('track', 'Lead', {content_name: config.eventId}); } catch {}
}

if (!preview) $('review-note').hidden = true;
if (config.privacyContact) { $('privacy-contact').textContent = `Para falar com a equipe sobre seus dados: ${config.privacyContact}`; $('privacy-contact').hidden = false; }
if (!ready) {
  submit.disabled = true;
  submit.textContent = 'Inscrições em preparação';
  $('form-status').textContent = preview ? 'Esta é uma demonstração. Nenhum cadastro é enviado.' : 'As inscrições ainda não estão abertas. Volte em breve.';
  form.querySelectorAll('input').forEach(input => { input.disabled = true; });
  $('submit-hint').hidden = true;
}
if (preview && new URLSearchParams(location.search).get('review') === '1') {
  const demo = document.createElement('button');
  demo.type = 'button'; demo.className = 'text-link'; demo.id = 'preview-confirmation';
  demo.textContent = 'Ver a etapa de confirmação';
  demo.addEventListener('click', () => showConfirmation(true));
  form.after(demo);
}
function showConfirmation(isPreview) {
  $('form-view').hidden = true;
  $('success-view').hidden = false;
  if (isPreview) {
    $('success-label').textContent = 'PRÉVIA DA CONFIRMAÇÃO';
    $('success-description').textContent = 'Nenhum cadastro foi enviado. Quando a integração estiver conectada, esta etapa aparecerá após a confirmação de recebimento.';
    $('preview-reset').hidden = false;
  }
  if (groupUrl) { $('group-link').href = groupUrl; $('group-link').hidden = false; }
  else {
    $('group-pending').hidden = false;
    $('group-pending').textContent = isPreview ? 'O convite do grupo será conectado após a apresentação do planejamento.' : 'O convite do grupo está temporariamente indisponível. Tente novamente em alguns instantes.';
    if (!isPreview) $('success-title').textContent = 'Sua inscrição foi recebida.';
  }
  if (liveUrl) { $('live-link').href = liveUrl; $('live-link').hidden = false; }
  $('success-view').focus({preventScroll:true});
  $('success-view').scrollIntoView({behavior:scrollBehavior, block:'center'});
}
$('preview-reset').addEventListener('click', () => {
  $('success-view').hidden = true; $('form-view').hidden = false; $('preview-confirmation').focus();
});
$('group-link').addEventListener('click', () => track('webinar_group_invite_click'));
$('live-link').addEventListener('click', () => track('webinar_live_click'));
document.querySelectorAll('[data-cta]').forEach(a => a.addEventListener('click', () => track('webinar_form_cta', {cta_label:a.dataset.cta})));
form.addEventListener('input', () => { attemptId = null; });
// O input do telefone formata antes de o evento chegar aqui; change e pageshow cobrem preenchimento automático e voltar do WhatsApp.
['input','change'].forEach(type => form.addEventListener(type, updateSubmit));
window.addEventListener('pageshow', updateSubmit);
updateSubmit();
$('whatsapp').addEventListener('input', event => {
  if (event.isComposing) return;
  const field = event.target;
  const raw = field.value;
  const caret = field.selectionStart ?? raw.length;
  const atEnd = caret >= raw.length;
  const digitsBeforeCaret = raw.slice(0, caret).replace(/\D/g, '').length;
  const formatted = formatPhoneInput(raw);
  if (formatted !== raw) field.value = formatted;
  let position = formatted.length;
  if (!atEnd) {
    let seen = 0;
    position = 0;
    while (position < formatted.length && seen < digitsBeforeCaret) {
      if (/\d/.test(formatted[position])) seen += 1;
      position += 1;
    }
  }
  try { field.setSelectionRange(position, position); } catch {}
});
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!ready || busy) return;
  const values = validateForm({name:$('nome').value, phone:$('whatsapp').value, consent:$('consent').checked});
  const fields = [['name','nome','nome-error'],['phone','whatsapp','phone-error'],['consent','consent','consent-error']];
  fields.forEach(([key, id, errorId]) => {
    $(id).setAttribute('aria-invalid', String(Boolean(values.errors[key])));
    $(errorId).textContent = values.errors[key] || ''; $(errorId).hidden = !values.errors[key];
  });
  const invalid = fields.find(([key]) => values.errors[key]);
  if (invalid) { $(invalid[1]).focus(); return; }
  if ($('website').value) return;
  busy = true; submit.disabled = true; submit.textContent = 'Enviando sua inscrição…'; $('form-status').textContent = '';
  if (!attemptId) attemptId = crypto.randomUUID();
  const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(config.endpoint, {
      method:'POST', headers:{'Content-Type':'application/json'}, credentials:'omit', signal:controller.signal,
      body:JSON.stringify({event_id:config.eventId, request_id:attemptId, name:values.name, whatsapp:values.phone,
        consent:true, consent_version:'webinar-2026-11-17-v1', utms, page_path:location.pathname, submitted_at:new Date().toISOString()})
    });
    let data; try { data = await response.json(); } catch { throw new Error('invalid-response'); }
    if (!confirmedRegistration(response, data)) throw new Error('not-confirmed');
    track('webinar_registration_success');
    trackRegistration();
    form.reset(); attemptId = null; showConfirmation(false);
    if (groupUrl) {
      // O botão continua na tela como alternativa, caso o navegador não abra o WhatsApp.
      $('success-title').textContent = 'Abrindo o grupo da aula…';
      $('success-description').textContent = 'Sua inscrição foi recebida. Se o grupo não abrir sozinho, toque no botão abaixo.';
      track('webinar_group_invite_click', {cta_label:'redirect_automatico'});
      setTimeout(() => location.assign(groupUrl), REDIRECT_DELAY_MS);
    }
  } catch {
    $('form-status').textContent = 'Não conseguimos confirmar sua inscrição. Confira sua conexão e tente novamente. Seus dados continuam no formulário.';
  } finally {
    clearTimeout(timer); busy = false; submit.innerHTML = 'Quero participar gratuitamente <span aria-hidden="true">↗</span>'; updateSubmit();
  }
});
