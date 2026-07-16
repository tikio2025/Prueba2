import assert from "node:assert/strict";
import test from "node:test";

import { formatProductPrice } from "../../js/catalog-ui.js";

test("muestra precio boliviano por unidad comercial", () => {
  assert.equal(
    formatProductPrice({ priceMode: "fixed", price: 15, currency: "BOB", unit: "kg" }),
    "Bs 15 / kg"
  );
});

test("mantiene Consultar cuando falta un precio confirmado", () => {
  assert.equal(
    formatProductPrice({ priceMode: "consult", price: null, currency: null, unit: "unidad" }),
    "Consultar"
  );
});

test("admite precios desde y otras monedas", () => {
  const result = formatProductPrice({ priceMode: "from", price: 20, currency: "USD", unit: "unidad" });
  assert.match(result, /^Desde /u);
  assert.match(result, /USD|US\$/u);
  assert.match(result, /\/ unidad$/u);
});
