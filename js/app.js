import { ConsultationStore } from "./store.js";

const SITE_URL = new URL("../data/site.json", import.meta.url);
const ICONS_URL = new URL("../assets/icons.svg", import.meta.url).href;

let browserStorage = null;
try {
  browserStorage = globalThis.localStorage;
} catch {
  // La lista seguirá disponible en memoria si el navegador bloquea localStorage.
}

export const consultationStore = new ConsultationStore({ storage: browserStorage });

export const siteConfigPromise = fetch(SITE_URL)
  .then((response) => {
    if (!response.ok) {
      throw new Error("No se pudo cargar la configuración del sitio.");
    }
    return response.json();
  })
  .catch(() => null);

let toastTimer;
let lastFocusedElement;
let dialogElements;
let pendingListFocus = null;

function createIcon(symbol) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("icon");
  svg.setAttribute("aria-hidden", "true");
  const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
  use.setAttribute("href", `${ICONS_URL}#${symbol}`);
  svg.append(use);
  return svg;
}

function createButton({ className, label, icon, onClick }) {
  const button = document.createElement("button");
  button.className = className;
  button.type = "button";
  if (icon) {
    button.append(createIcon(icon));
  }
  button.append(document.createTextNode(label));
  if (onClick) {
    button.addEventListener("click", onClick);
  }
  return button;
}

export function showToast(message) {
  const toast = document.querySelector("[data-toast]");
  if (!toast) {
    return;
  }
  globalThis.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  toastTimer = globalThis.setTimeout(() => {
    toast.hidden = true;
  }, 3200);
}

function setupNavigation() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const navigation = document.querySelector("[data-nav]");
  if (!toggle || !navigation) {
    return;
  }

  const label = toggle.querySelector(".sr-only");
  const use = toggle.querySelector("use");
  const setOpen = (open, { restoreFocus = false } = {}) => {
    toggle.setAttribute("aria-expanded", String(open));
    navigation.classList.toggle("is-open", open);
    if (label) {
      label.textContent = open ? "Cerrar menú" : "Abrir menú";
    }
    use?.setAttribute("href", `${ICONS_URL}#${open ? "close" : "menu"}`);
    if (!open && restoreFocus) {
      toggle.focus();
    }
  };

  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });
  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      setOpen(false);
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setOpen(false, { restoreFocus: true });
    }
  });
  globalThis.addEventListener("resize", () => {
    if (globalThis.innerWidth > 1024) {
      setOpen(false);
    }
  });
}

function buildConsultationDialog() {
  const dialog = document.createElement("dialog");
  dialog.id = "consultation-dialog";
  dialog.className = "consult-dialog";
  dialog.setAttribute("aria-labelledby", "consultation-title");

  const panel = document.createElement("div");
  panel.className = "consult-panel";

  const header = document.createElement("div");
  header.className = "dialog-header";
  const title = document.createElement("h2");
  title.id = "consultation-title";
  title.textContent = "Mi lista de consulta";
  const closeButton = document.createElement("button");
  closeButton.className = "icon-button";
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Cerrar lista de consulta");
  closeButton.append(createIcon("close"));
  closeButton.addEventListener("click", () => dialog.close());
  header.append(title, closeButton);

  const body = document.createElement("div");
  body.className = "dialog-body";
  const empty = document.createElement("div");
  empty.className = "consult-empty";
  empty.append(createIcon("list"));
  const emptyHeading = document.createElement("h3");
  emptyHeading.textContent = "Tu lista está vacía";
  const emptyCopy = document.createElement("p");
  emptyCopy.textContent = "Agrega productos del catálogo para preparar un solo mensaje.";
  const exploreLink = document.createElement("a");
  exploreLink.className = "button button--outline";
  exploreLink.href = new URL("../catalogo.html", import.meta.url).href;
  exploreLink.textContent = "Explorar catálogo";
  empty.append(emptyHeading, emptyCopy, exploreLink);

  const list = document.createElement("ul");
  list.className = "consult-list";
  list.setAttribute("aria-label", "Productos de la lista");

  const noteField = document.createElement("div");
  noteField.className = "field";
  const noteLabel = document.createElement("label");
  noteLabel.htmlFor = "consultation-note";
  noteLabel.textContent = "Nota para la consulta (opcional)";
  const note = document.createElement("textarea");
  note.id = "consultation-note";
  note.maxLength = 500;
  note.rows = 4;
  note.placeholder = "Ej.: necesito confirmar una característica específica";
  const noteHelp = document.createElement("p");
  noteHelp.className = "field-help";
  const noteCount = document.createElement("span");
  noteCount.textContent = "0";
  noteHelp.append(noteCount, document.createTextNode("/500 caracteres. Se guarda solo en este navegador."));
  note.addEventListener("input", () => {
    noteCount.textContent = String(note.value.length);
    consultationStore.setNote(note.value);
  });
  noteField.append(noteLabel, note, noteHelp);
  body.append(empty, list, noteField);

  const footer = document.createElement("div");
  footer.className = "dialog-footer";
  const summary = document.createElement("p");
  summary.className = "consult-summary";
  summary.setAttribute("role", "status");
  summary.setAttribute("aria-live", "polite");
  const clearButton = createButton({
    className: "button button--danger",
    label: "Vaciar lista",
    icon: "trash",
    onClick: () => {
      if (globalThis.confirm("¿Quieres vaciar toda la lista y eliminar la nota?")) {
        consultationStore.clear();
        showToast("La lista quedó vacía.");
      }
    }
  });
  const sendLink = document.createElement("a");
  sendLink.className = "button button--whatsapp";
  sendLink.target = "_blank";
  sendLink.rel = "noopener noreferrer";
  sendLink.append(createIcon("chat"), document.createTextNode("Abrir WhatsApp"));
  sendLink.addEventListener("click", (event) => {
    if (sendLink.getAttribute("aria-disabled") === "true") {
      event.preventDefault();
    }
  });
  footer.append(summary, clearButton, sendLink);

  panel.append(header, body, footer);
  dialog.append(panel);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });
  dialog.addEventListener("close", () => {
    document.body.classList.remove("has-dialog");
    if (lastFocusedElement instanceof HTMLElement) {
      lastFocusedElement.focus();
    }
  });
  document.body.append(dialog);

  dialogElements = { dialog, empty, list, note, noteCount, summary, clearButton, sendLink };
  return dialogElements;
}

function formatQuantity(value) {
  return new Intl.NumberFormat("es-BO", { maximumFractionDigits: 3 }).format(value);
}

function formatUnit(unit, quantity) {
  return unit === "unidad" && quantity !== 1 ? "unidades" : unit;
}

function renderConsultationItem(item) {
  const listItem = document.createElement("li");
  listItem.className = "consult-item";
  listItem.dataset.itemId = item.id;

  const information = document.createElement("div");
  const heading = document.createElement("h3");
  heading.textContent = item.name;
  const copy = document.createElement("p");
  copy.textContent = item.unit === "unidad"
    ? "Precio y disponibilidad por confirmar."
    : `Venta por ${item.unit}. Precio y disponibilidad por confirmar.`;
  const quantity = document.createElement("div");
  quantity.className = "quantity-control";
  quantity.setAttribute("aria-label", `Cantidad de ${item.name}`);
  const decrease = document.createElement("button");
  decrease.type = "button";
  decrease.dataset.quantityAction = "decrease";
  decrease.setAttribute("aria-label", `Reducir cantidad de ${item.name}`);
  decrease.append(createIcon("minus"));
  const output = document.createElement("output");
  output.value = String(item.quantity);
  output.textContent = `${formatQuantity(item.quantity)} ${formatUnit(item.unit, item.quantity)}`;
  output.setAttribute("aria-label", output.textContent);
  const increase = document.createElement("button");
  increase.type = "button";
  increase.dataset.quantityAction = "increase";
  increase.setAttribute("aria-label", `Aumentar cantidad de ${item.name}`);
  increase.append(createIcon("plus"));
  const step = Number(item.step) > 0 ? Number(item.step) : 1;
  decrease.addEventListener("click", () => changeQuantity(item.id, -step));
  increase.disabled = item.quantity + step > 999;
  increase.addEventListener("click", () => changeQuantity(item.id, step));
  quantity.append(decrease, output, increase);
  information.append(heading, copy, quantity);

  const removeButton = document.createElement("button");
  removeButton.className = "icon-button";
  removeButton.type = "button";
  removeButton.dataset.quantityAction = "remove";
  removeButton.setAttribute("aria-label", `Eliminar ${item.name}`);
  removeButton.append(createIcon("trash"));
  removeButton.addEventListener("click", () => {
    const state = consultationStore.getState();
    const position = state.items.findIndex((candidate) => candidate.id === item.id);
    const fallback = state.items[position + 1] || state.items[position - 1];
    pendingListFocus = fallback
      ? { id: fallback.id, action: "remove" }
      : { empty: true };
    consultationStore.remove(item.id);
    showToast(`${item.name} se eliminó de la lista.`);
  });
  listItem.append(information, removeButton);
  return listItem;
}

function changeQuantity(itemId, delta) {
  const current = consultationStore.getState().items.find((item) => item.id === itemId);
  if (!current) {
    return;
  }
  const nextQuantity = Math.round((current.quantity + delta + Number.EPSILON) * 1000) / 1000;
  if (nextQuantity <= 0) {
    const state = consultationStore.getState();
    const position = state.items.findIndex((item) => item.id === itemId);
    const fallback = state.items[position + 1] || state.items[position - 1];
    pendingListFocus = fallback
      ? { id: fallback.id, action: "decrease" }
      : { empty: true };
  } else {
    pendingListFocus = { id: itemId, action: delta > 0 ? "increase" : "decrease" };
  }
  try {
    consultationStore.setQuantity(itemId, nextQuantity);
  } catch {
    showToast("No se pudo cambiar esa cantidad.");
  }
}

async function renderConsultation(state) {
  const elements = dialogElements ?? buildConsultationDialog();
  const lineCount = state.items.length;
  document.querySelectorAll("[data-consult-count]").forEach((counter) => {
    counter.textContent = String(lineCount);
    counter.setAttribute("aria-label", `${lineCount} ${lineCount === 1 ? "producto" : "productos"} en la lista`);
  });

  elements.list.replaceChildren(...state.items.map(renderConsultationItem));
  elements.empty.hidden = state.items.length > 0;
  elements.list.hidden = state.items.length === 0;
  elements.summary.textContent = lineCount === 1
    ? "1 línea en la lista"
    : `${lineCount} líneas en la lista`;
  elements.clearButton.disabled = state.items.length === 0 && !state.note;
  if (document.activeElement !== elements.note) {
    elements.note.value = state.note;
  }
  elements.noteCount.textContent = String(elements.note.value.length);

  if (pendingListFocus && elements.dialog.open) {
    const focusTarget = pendingListFocus.empty
      ? elements.empty.querySelector("a")
      : elements.list.querySelector(
        `[data-item-id="${CSS.escape(pendingListFocus.id)}"] `
        + `[data-quantity-action="${pendingListFocus.action}"]`
      ) || elements.list.querySelector(`[data-item-id="${CSS.escape(pendingListFocus.id)}"] button`);
    pendingListFocus = null;
    focusTarget?.focus();
  }

  const site = await siteConfigPromise;
  if (!site?.contact?.whatsapp?.phone || state.items.length === 0) {
    elements.sendLink.href = new URL("../catalogo.html", import.meta.url).href;
    elements.sendLink.setAttribute("aria-disabled", "true");
    elements.sendLink.tabIndex = -1;
    return;
  }

  try {
    elements.sendLink.href = consultationStore.buildWhatsAppUrl(site.contact.whatsapp.phone, {
      general: site.messages?.generalConsultation,
      heading: site.messages?.consultationHeading,
      closing: site.messages?.consultationClosing
    });
    elements.sendLink.setAttribute("aria-disabled", "false");
    elements.sendLink.removeAttribute("tabindex");
  } catch {
    elements.sendLink.href = new URL("../catalogo.html", import.meta.url).href;
    elements.sendLink.setAttribute("aria-disabled", "true");
    elements.sendLink.tabIndex = -1;
  }
}

export function openConsultation() {
  const elements = dialogElements ?? buildConsultationDialog();
  if (!elements.dialog.open) {
    lastFocusedElement = document.activeElement;
    elements.dialog.showModal();
    document.body.classList.add("has-dialog");
  }
}

export function addToConsultation(product, { open = false } = {}) {
  try {
    consultationStore.add({
      id: product.id,
      name: product.name,
      unit: product.unit,
      quantityStep: product.quantityStep
    });
  } catch (error) {
    const message = error instanceof RangeError
      ? "Alcanzaste la cantidad máxima para este producto."
      : "No se pudo agregar el producto a la lista.";
    showToast(message);
    return false;
  }
  showToast(`${product.name} se agregó a tu lista.`);
  if (open) {
    openConsultation();
  }
  return true;
}

async function setupContactLinks() {
  const links = [...document.querySelectorAll("[data-contact]")];
  links.forEach((link) => {
    link.hidden = true;
    link.removeAttribute("href");
    link.setAttribute("aria-disabled", "true");
  });
  const site = await siteConfigPromise;
  links.forEach((link) => {
    const type = link.dataset.contact;
    const contact = site?.contact?.[type];
    if (!contact?.url || (type === "facebook" && contact.verified !== true)) {
      const listItem = link.closest("li");
      if (listItem) {
        listItem.remove();
      } else {
        link.remove();
      }
      return;
    }

    let href = contact.url;
    if (type === "whatsapp" && link.hasAttribute("data-general-message")) {
      try {
        const url = new URL(contact.url);
        url.searchParams.set("text", site.messages?.generalConsultation || "Hola, vengo de Vendedor SCZ.");
        href = url.toString();
      } catch {
        href = contact.url;
      }
    }
    link.href = href;
    link.target = "_blank";
    link.hidden = false;
    link.setAttribute("aria-disabled", "false");
  });
}

async function initialize() {
  setupNavigation();
  document.querySelectorAll("[data-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });
  document.querySelectorAll("[data-consult-open]").forEach((button) => {
    button.addEventListener("click", openConsultation);
  });
  consultationStore.subscribe(renderConsultation);
  await Promise.all([
    renderConsultation(consultationStore.getState()),
    setupContactLinks()
  ]);
  document.dispatchEvent(new CustomEvent("vendedor:app-ready"));
}

await initialize();
