import assert from "node:assert/strict";
import test from "node:test";

import {
  buildConsultationMessage,
  buildWhatsAppUrl,
  ConsultationStore,
  SCHEMA_VERSION,
  STORAGE_KEY
} from "../../js/store.js";

class MemoryStorage {
  constructor(initial = {}) {
    this.values = new Map(Object.entries(initial));
  }

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null;
  }

  setItem(key, value) {
    this.values.set(key, String(value));
  }

  removeItem(key) {
    this.values.delete(key);
  }
}

test("agrega productos, acumula cantidades y devuelve copias del estado", () => {
  const storage = new MemoryStorage();
  const store = new ConsultationStore({ storage });

  store.add({ id: "peluches", name: "Peluches" }, 2);
  store.add({ id: "peluches", name: "Peluches" });
  store.add({ id: "bisuteria", name: "Bisutería" });

  const state = store.getState();
  assert.deepEqual(state.items, [
    { id: "peluches", name: "Peluches", quantity: 3 },
    { id: "bisuteria", name: "Bisutería", quantity: 1 }
  ]);
  assert.equal(store.getTotalQuantity(), 4);

  state.items[0].quantity = 77;
  assert.equal(store.getState().items[0].quantity, 3);
});

test("persiste cantidad y nota, permite eliminar y vaciar", () => {
  const storage = new MemoryStorage();
  const store = new ConsultationStore({ storage });

  store.add({ id: "ropa", name: "Ropa americana" });
  store.setQuantity("ropa", "4");
  store.setNote("  Consultar tallas\r\nGracias  ");

  const restored = new ConsultationStore({ storage });
  assert.equal(restored.getState().items[0].quantity, 4);
  assert.equal(restored.getState().note, "Consultar tallas\nGracias");

  restored.setQuantity("ropa", 0);
  assert.deepEqual(restored.getState().items, []);

  restored.add({ id: "grasa-de-res", name: "Grasa de res" });
  restored.clear();
  assert.deepEqual(restored.getState(), {
    schemaVersion: SCHEMA_VERSION,
    items: [],
    note: ""
  });
});

test("descarta JSON corrupto o versiones incompatibles", () => {
  const malformed = new MemoryStorage({ [STORAGE_KEY]: "{sin-json" });
  const malformedStore = new ConsultationStore({ storage: malformed });
  assert.deepEqual(malformedStore.getState().items, []);
  assert.equal(malformed.getItem(STORAGE_KEY), null);

  const incompatible = new MemoryStorage({
    [STORAGE_KEY]: JSON.stringify({ schemaVersion: 99, items: [], note: "" })
  });
  const incompatibleStore = new ConsultationStore({ storage: incompatible });
  assert.deepEqual(incompatibleStore.getState().items, []);
  assert.equal(incompatible.getItem(STORAGE_KEY), null);
});

test("sanea elementos almacenados sin perder los válidos", () => {
  const storage = new MemoryStorage({
    [STORAGE_KEY]: JSON.stringify({
      schemaVersion: SCHEMA_VERSION,
      items: [
        { id: "peluches", name: "Peluches", quantity: 2 },
        { id: "peluches", name: "Peluches", quantity: 1 },
        { id: "", name: "Sin id", quantity: 1 },
        { id: "ropa", name: "Ropa", quantity: -5 }
      ],
      note: "Nota\u0000 segura"
    })
  });

  const store = new ConsultationStore({ storage });
  assert.deepEqual(store.getState(), {
    schemaVersion: SCHEMA_VERSION,
    items: [{ id: "peluches", name: "Peluches", quantity: 3 }],
    note: "Nota segura"
  });
});

test("funciona en memoria si localStorage está bloqueado", () => {
  const blockedStorage = {
    getItem() {
      throw new Error("bloqueado");
    },
    setItem() {
      throw new Error("bloqueado");
    }
  };

  const store = new ConsultationStore({ storage: blockedStorage });
  assert.doesNotThrow(() => store.add({ id: "bisuteria", name: "Bisutería" }));
  assert.equal(store.getTotalQuantity(), 1);
});

test("genera el mensaje de consulta con el formato acordado", () => {
  const message = buildConsultationMessage({
    items: [
      { id: "peluches", name: "Peluches", quantity: 2 },
      { id: "bisuteria", name: "Bisutería", quantity: 1 }
    ],
    note: "Para regalo"
  });

  assert.equal(
    message,
    "Hola, vengo de Vendedor SCZ. Quiero consultar estos productos:\n"
      + "1. Peluches — cantidad 2\n"
      + "2. Bisutería — cantidad 1\n"
      + "Nota: Para regalo\n"
      + "¿Me confirma disponibilidad, precio y forma de entrega?"
  );
});

test("crea una URL wa.me codificada y rechaza entradas inseguras", () => {
  const message = "Hola, ¿hay disponibilidad?\nGracias";
  const result = buildWhatsAppUrl("+591 75103979", message);
  const url = new URL(result);

  assert.equal(url.origin, "https://wa.me");
  assert.equal(url.pathname, "/59175103979");
  assert.equal(url.searchParams.get("text"), message);
  assert.throws(() => buildWhatsAppUrl("teléfono", message), TypeError);
  assert.throws(() => buildWhatsAppUrl("59175103979", ""), TypeError);
});

test("valida productos y cantidades antes de guardar", () => {
  const store = new ConsultationStore({ storage: new MemoryStorage() });

  assert.throws(() => store.add({ id: "", name: "Sin id" }), TypeError);
  assert.throws(() => store.add({ id: "x", name: "Producto" }, 1.5), TypeError);
  assert.throws(() => store.add({ id: "x", name: "Producto" }, -1), RangeError);
  assert.throws(() => store.setQuantity("x", 1000), RangeError);
});
