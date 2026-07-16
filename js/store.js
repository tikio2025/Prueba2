export const SCHEMA_VERSION = 2;
export const STORAGE_KEY = `vendedor-scz:consultation:v${SCHEMA_VERSION}`;

const MAX_ID_LENGTH = 120;
const MAX_NAME_LENGTH = 180;
const MAX_UNIT_LENGTH = 40;
const MAX_NOTE_LENGTH = 500;
const MAX_QUANTITY = 999;
const MAX_DECIMALS = 3;

export const DEFAULT_MESSAGE_COPY = Object.freeze({
  general: "Hola, vengo de Vendedor SCZ. Quiero consultar un producto y coordinar la compra.",
  heading: "Hola, vengo de Vendedor SCZ. Quiero consultar estos productos y cantidades:",
  closing: "¿Me confirma disponibilidad, precio final, forma de pago y entrega?"
});

function emptyState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    items: [],
    note: ""
  };
}

function cleanSingleLine(value, maximumLength) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/[\u0000-\u001f\u007f]+/gu, " ")
    .replace(/\s+/gu, " ")
    .trim()
    .slice(0, maximumLength);
}

function cleanNote(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/\r\n?/gu, "\n")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/gu, "")
    .trim()
    .slice(0, MAX_NOTE_LENGTH);
}

function roundQuantity(value) {
  const factor = 10 ** MAX_DECIMALS;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function normalizeStep(value) {
  const step = Number(value);
  if (!Number.isFinite(step) || step <= 0 || step > MAX_QUANTITY) {
    return 1;
  }
  return roundQuantity(step);
}

function normalizeUnit(value) {
  return cleanSingleLine(value, MAX_UNIT_LENGTH) || "unidad";
}

function normalizeProduct(product) {
  if (!product || typeof product !== "object" || Array.isArray(product)) {
    return null;
  }

  const id = cleanSingleLine(product.id, MAX_ID_LENGTH);
  const name = cleanSingleLine(product.name, MAX_NAME_LENGTH);

  return id && name
    ? {
      id,
      name,
      unit: normalizeUnit(product.unit),
      step: normalizeStep(product.quantityStep)
    }
    : null;
}

function parseQuantity(value, { allowZero = false } = {}) {
  const quantity = typeof value === "string" && value.trim() !== ""
    ? Number(value)
    : value;

  if (!Number.isFinite(quantity)) {
    throw new TypeError("La cantidad debe ser un número válido.");
  }

  const rounded = roundQuantity(quantity);
  if (allowZero && rounded === 0) {
    return 0;
  }

  if (rounded <= 0 || rounded > MAX_QUANTITY) {
    throw new RangeError(`La cantidad debe ser mayor a 0 y no superar ${MAX_QUANTITY}.`);
  }

  return rounded;
}

function normalizeStoredItems(items) {
  if (!Array.isArray(items)) {
    return null;
  }

  const normalized = [];
  const positions = new Map();

  for (const candidate of items) {
    const product = normalizeProduct(candidate);
    let quantity;

    try {
      quantity = parseQuantity(candidate?.quantity);
    } catch {
      continue;
    }

    if (!product) {
      continue;
    }

    const existingPosition = positions.get(product.id);
    if (existingPosition === undefined) {
      positions.set(product.id, normalized.length);
      normalized.push({ ...product, quantity });
      continue;
    }

    const existing = normalized[existingPosition];
    existing.quantity = Math.min(
      MAX_QUANTITY,
      roundQuantity(existing.quantity + quantity)
    );
    existing.name = product.name;
    existing.unit = product.unit;
    existing.step = product.step;
  }

  return normalized;
}

function cloneState(state) {
  return {
    schemaVersion: SCHEMA_VERSION,
    items: state.items.map((item) => ({ ...item })),
    note: state.note
  };
}

function normalizeCopy(copy = {}) {
  return {
    general: cleanSingleLine(copy.general, 300) || DEFAULT_MESSAGE_COPY.general,
    heading: cleanSingleLine(copy.heading, 300) || DEFAULT_MESSAGE_COPY.heading,
    closing: cleanSingleLine(copy.closing, 300) || DEFAULT_MESSAGE_COPY.closing
  };
}

function formatQuantity(item) {
  const quantity = new Intl.NumberFormat("es-BO", {
    maximumFractionDigits: MAX_DECIMALS
  }).format(item.quantity);
  const unit = item.unit === "unidad" && item.quantity !== 1 ? "unidades" : item.unit;
  return `${quantity} ${unit}`;
}

/**
 * Genera texto plano para WhatsApp. Los nombres, unidades y la nota nunca se
 * interpretan como HTML; la URL se codifica por separado en buildWhatsAppUrl.
 */
export function buildConsultationMessage(state, copy) {
  const safeCopy = normalizeCopy(copy);
  const items = normalizeStoredItems(state?.items) ?? [];
  const note = cleanNote(state?.note);

  if (items.length === 0) {
    return `${safeCopy.general}\n${safeCopy.closing}`;
  }

  const lines = [safeCopy.heading];
  items.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.name} — ${formatQuantity(item)}`);
  });

  if (note) {
    lines.push(`Nota: ${note}`);
  }

  lines.push(safeCopy.closing);
  return lines.join("\n");
}

export function buildWhatsAppUrl(phone, message) {
  const digits = typeof phone === "string" ? phone.replace(/\D/gu, "") : "";
  if (!/^[1-9]\d{7,14}$/u.test(digits)) {
    throw new TypeError("El número de WhatsApp no tiene un formato válido.");
  }
  if (typeof message !== "string" || message.trim() === "") {
    throw new TypeError("El mensaje de WhatsApp no puede estar vacío.");
  }

  const url = new URL(`https://wa.me/${digits}`);
  url.searchParams.set("text", message);
  return url.toString();
}

export class ConsultationStore {
  #listeners = new Set();

  constructor({ storage = globalThis.localStorage ?? null, storageKey = STORAGE_KEY } = {}) {
    this.storage = storage;
    this.storageKey = storageKey;
    this.state = this.#load();
  }

  #load() {
    if (!this.storage || typeof this.storage.getItem !== "function") {
      return emptyState();
    }

    let raw;
    try {
      raw = this.storage.getItem(this.storageKey);
    } catch {
      return emptyState();
    }

    if (raw === null) {
      return emptyState();
    }

    try {
      const stored = JSON.parse(raw);
      const items = normalizeStoredItems(stored?.items);
      if (
        !stored
        || typeof stored !== "object"
        || Array.isArray(stored)
        || stored.schemaVersion !== SCHEMA_VERSION
        || items === null
      ) {
        throw new TypeError("Estado incompatible.");
      }

      const normalized = {
        schemaVersion: SCHEMA_VERSION,
        items,
        note: cleanNote(stored.note)
      };
      this.#write(normalized);
      return normalized;
    } catch {
      try {
        this.storage.removeItem?.(this.storageKey);
      } catch {
        // El almacenamiento puede estar deshabilitado; la lista sigue en memoria.
      }
      return emptyState();
    }
  }

  #write(state) {
    if (!this.storage || typeof this.storage.setItem !== "function") {
      return;
    }

    try {
      this.storage.setItem(this.storageKey, JSON.stringify(state));
    } catch {
      // Cuota agotada o almacenamiento bloqueado: conservar el estado en memoria.
    }
  }

  #commit(nextState) {
    this.state = nextState;
    this.#write(nextState);
    const snapshot = this.getState();
    this.#listeners.forEach((listener) => listener(snapshot));
    return snapshot;
  }

  getState() {
    return cloneState(this.state);
  }

  getTotalQuantity() {
    return roundQuantity(this.state.items.reduce((total, item) => total + item.quantity, 0));
  }

  add(product, quantity = 1) {
    const normalizedProduct = normalizeProduct(product);
    if (!normalizedProduct) {
      throw new TypeError("El producto debe tener id y nombre válidos.");
    }

    const amount = parseQuantity(quantity);
    const items = this.state.items.map((item) => ({ ...item }));
    const existing = items.find((item) => item.id === normalizedProduct.id);
    if (existing) {
      if (existing.quantity + amount > MAX_QUANTITY) {
        throw new RangeError(`La cantidad total no puede superar ${MAX_QUANTITY}.`);
      }
      existing.quantity = roundQuantity(existing.quantity + amount);
      existing.name = normalizedProduct.name;
      existing.unit = normalizedProduct.unit;
      existing.step = normalizedProduct.step;
    } else {
      items.push({ ...normalizedProduct, quantity: amount });
    }

    return this.#commit({ ...this.state, items });
  }

  setQuantity(productId, quantity) {
    const id = cleanSingleLine(productId, MAX_ID_LENGTH);
    if (!id) {
      throw new TypeError("El id del producto no es válido.");
    }

    const amount = parseQuantity(quantity, { allowZero: true });
    if (amount === 0) {
      return this.remove(id);
    }

    const items = this.state.items.map((item) => (
      item.id === id ? { ...item, quantity: amount } : { ...item }
    ));
    return this.#commit({ ...this.state, items });
  }

  remove(productId) {
    const id = cleanSingleLine(productId, MAX_ID_LENGTH);
    if (!id) {
      throw new TypeError("El id del producto no es válido.");
    }

    const items = this.state.items
      .filter((item) => item.id !== id)
      .map((item) => ({ ...item }));
    return this.#commit({ ...this.state, items });
  }

  setNote(note) {
    return this.#commit({ ...this.state, note: cleanNote(note) });
  }

  clear() {
    return this.#commit(emptyState());
  }

  subscribe(listener) {
    if (typeof listener !== "function") {
      throw new TypeError("El suscriptor debe ser una función.");
    }

    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  buildMessage(copy) {
    return buildConsultationMessage(this.state, copy);
  }

  buildWhatsAppUrl(phone, copy) {
    return buildWhatsAppUrl(phone, this.buildMessage(copy));
  }
}
