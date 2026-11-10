'use strict';
// Oferta PRO conferida com os dois bumps; sem encerramento automático do carrinho.
const offer = Object.freeze({ enabled: true, checkout: 'https://pay.hotmart.com/T108312124M?off=a8up7pad&checkoutMode=10', opensAt: '2026-11-10T23:00:00Z' });
const offerIsOpen = () => offer.enabled && Date.now() >= Date.parse(offer.opensAt);
const dialog = document.getElementById('aviso');
document.getElementById('comprar').addEventListener('click', () => {
  if (offerIsOpen() && /^https:\/\/pay\.hotmart\.com\//.test(offer.checkout)) {
    if (window.DE) window.DE.track('click_cta', {cta_label: 'formacao_pro_checkout'});
    window.location.assign(window.DE ? window.DE.decorate(offer.checkout) : offer.checkout);
  } else {
    dialog.showModal();
  }
});
document.querySelectorAll('.close,.close-dialog').forEach(button => button.addEventListener('click', () => dialog.close()));
if (offerIsOpen()) document.getElementById('purchase-status').textContent = 'Confira as condições no checkout antes de concluir sua compra.';
// A liberação do boleto na Hotmart é operacional:13/11/2026 às20h, Brasília.
// Não anunciar boleto já disponível antes de conferir a mudança real.
document.querySelectorAll('.faq details').forEach(item => item.addEventListener('toggle', () => {
  if (item.open) document.querySelectorAll('.faq details').forEach(other => { if (other !== item) other.open = false; });
}));
