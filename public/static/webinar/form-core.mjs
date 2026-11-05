export function normalizePhone(value) {
  let digits = String(value || '').replace(/\D/g, '');
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')) digits = digits.slice(2);
  if (!/^[1-9]\d9\d{8}$/.test(digits)) return null;
  return `55${digits}`;
}
// Máscara do campo: só números, no máximo 11 dígitos, no formato (11) 99999-1234.
// O 55 só sai com 13 dígitos (número colado com o país), porque 55 também é DDD.
export function formatPhoneInput(value) {
  let digits = String(value || '').replace(/\D/g, '').replace(/^0+/, '');
  if (digits.length === 13 && digits.startsWith('55')) digits = digits.slice(2);
  digits = digits.slice(0, 11);
  if (!digits) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}
export function validateForm({ name, phone, consent }) {
  const errors = {};
  const normalizedName = String(name || '').trim().replace(/\s+/g, ' ');
  if (normalizedName.length > 80 || (normalizedName.match(/\p{L}/gu) || []).length < 2) errors.name = 'Informe seu nome, com pelo menos 2 letras.';
  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) errors.phone = 'Informe um celular brasileiro com DDD e 9 dígitos.';
  if (!consent) errors.consent = 'Confirme que deseja receber os avisos desta aula.';
  return { errors, name: normalizedName, phone: normalizedPhone };
}
export function allowedUrl(value, kind) {
  try {
    const u = new URL(value);
    if (u.protocol !== 'https:' || u.username || u.password) return '';
    if (kind === 'group' && (u.hostname !== 'chat.whatsapp.com' || u.pathname.length < 2)) return '';
    if (kind === 'live' && !['youtube.com', 'www.youtube.com', 'youtu.be'].includes(u.hostname)) return '';
    return u.href;
  } catch { return ''; }
}
export function collectionReady(config) {
  return config.mode === 'live' && config.registrationOpen === true && config.dateConfirmed === true &&
    Boolean(allowedUrl(config.endpoint, 'endpoint'));
}
export function confirmedRegistration(response, data) {
  return response.ok && data?.ok === true && typeof data.registrationId === 'string' && data.registrationId.trim().length > 0;
}
export function attribution(search) {
  const params = new URLSearchParams(search);
  const keys = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','utm_id','campaign_id','adset_id','ad_id','placement','fbclid','gclid'];
  return Object.fromEntries(keys.filter(k => params.has(k)).map(k => [k, params.get(k).slice(0, 500)]));
}
