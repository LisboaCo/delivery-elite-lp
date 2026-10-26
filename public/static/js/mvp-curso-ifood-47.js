/* Checkout attribution and measurement for LT47. Existing GTM click_cta is preserved.
   No second pixel, purchase event, or InitiateCheckout is installed here. */
(function () {
  "use strict";
  var incoming = new URLSearchParams(window.location.search);
  var params = (window.DE && window.DE.utms) || {};
  var extraKeys = ["src", "sck"];
  // Explicit origin codes are scoped to this visit, never mixed into another campaign.
  extraKeys.forEach(function (key) { var value = incoming.get(key); if (value) params[key] = value; });
  function decorate(link) {
    var target = new URL(window.DE ? window.DE.decorate(link.href) : link.href);
    Object.keys(params).forEach(function (key) { if (params[key]) target.searchParams.set(key, params[key]); });
    if (!incoming.get("sck") && params.campaign_id && params.ad_id) {
      var ids = [params.campaign_id, params.adset_id, params.ad_id];
      // Meta IDs stay strings: Number loses precision for 18-digit identifiers.
      if (ids.every(function (id) { return !id || /^\d+$/.test(id); })) {
        target.searchParams.set("sck", [params.utm_source || "meta_ads", "c" + params.campaign_id,
          params.adset_id ? "as" + params.adset_id : "", "a" + params.ad_id].filter(Boolean).join("__").slice(0, 250));
      }
    }
    link.href = target.toString();
  }
  document.querySelectorAll("a.checkout").forEach(decorate);
  document.addEventListener("click", function (event) {
    var link = event.target.closest && event.target.closest("a.checkout");
    if (!link) return;
    decorate(link);
    var label = link.getAttribute("data-cta") || "cta_principal";
    var payload = { cta_label: label, lp_variant: "lt47-v2-20261026", destination: "hotmart", product_id: "8619798" };
    if (window.DE) window.DE.track("click_cta", payload);
    // The legacy GTM link trigger is restricted to .js-cta (VSL pages).
    // This LP deliberately keeps .checkout: do not fire the old product's tags.
    var gaParams = Object.assign({}, params, payload, { send_to: "G-JTMPLWFWDP", transport_type: "beacon" });
    function googleEvent() { window.dataLayer = window.dataLayer || []; window.dataLayer.push(arguments); }
    try {
      (typeof window.gtag === "function" ? window.gtag : googleEvent)("event", "cta_click", gaParams);
    } catch (err) { /* Tracking must never prevent checkout navigation. */ }
    // Clarity expects this name; it is an outbound CTA click, not a purchase.
    try { if (typeof window.clarity === "function") window.clarity("event", "cta_click"); } catch (err) {}
  });
})();
