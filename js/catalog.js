import { addToConsultation, showToast } from "./app.js";
import {
  createProductCard,
  formatProductPrice,
  getCategoryName,
  getImageData,
  getStatusLabel,
  loadCatalogData,
  normalizeText
} from "./catalog-ui.js";

const grid = document.querySelector("#catalog-grid");
const empty = document.querySelector("#catalog-empty");
const summary = document.querySelector("#results-summary");
const search = document.querySelector("#catalog-search");
const categoryFilter = document.querySelector("#category-filter");
const statusFilter = document.querySelector("#status-filter");
const sort = document.querySelector("#catalog-sort");
const filterForm = document.querySelector("#catalog-filter-form");
const activeFilters = document.querySelector("#active-filters");
const clearAll = document.querySelector("[data-clear-all]");
const filterToggle = document.querySelector("[data-filter-toggle]");
const filterPanel = document.querySelector("[data-filter-panel]");
const productDialog = document.querySelector("#product-dialog");
const productDialogTitle = document.querySelector("#product-dialog-title");
const productDialogContent = document.querySelector("#product-dialog-content");
const productDialogClose = document.querySelector("[data-product-close]");

let categories = [];
let products = [];
let activeProductSlug = null;

const initialUrl = new URL(globalThis.location.href);
const state = {
  query: initialUrl.searchParams.get("q") || "",
  category: initialUrl.searchParams.get("category") || "",
  status: initialUrl.searchParams.get("status") || "",
  sort: initialUrl.searchParams.get("sort") || "recommended"
};
activeProductSlug = initialUrl.searchParams.get("product");

function createIcon(symbol) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("icon");
  svg.setAttribute("aria-hidden", "true");
  const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
  use.setAttribute("href", new URL(`../assets/icons.svg#${symbol}`, import.meta.url).href);
  svg.append(use);
  return svg;
}

function updateUrl() {
  const url = new URL(globalThis.location.href);
  const values = {
    q: state.query.trim(),
    category: state.category,
    status: state.status,
    sort: state.sort === "recommended" ? "" : state.sort,
    product: activeProductSlug || ""
  };
  Object.entries(values).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    } else {
      url.searchParams.delete(key);
    }
  });
  globalThis.history.replaceState(null, "", url);
}

function matchesSearch(product) {
  const query = normalizeText(state.query);
  if (!query) {
    return true;
  }
  const categoryName = getCategoryName(product.category, categories);
  const searchable = normalizeText([
    product.name,
    product.shortDescription,
    product.description,
    categoryName,
    ...(Array.isArray(product.tags) ? product.tags : [])
  ].filter(Boolean).join(" "));
  return query.split(/\s+/u).every((term) => searchable.includes(term));
}

function sortProducts(filteredProducts) {
  const categoryOrder = new Map(categories.map((category, index) => [category.id, category.order ?? index]));
  return [...filteredProducts].sort((first, second) => {
    if (state.sort === "name-asc") {
      return first.name.localeCompare(second.name, "es-BO");
    }
    if (state.sort === "name-desc") {
      return second.name.localeCompare(first.name, "es-BO");
    }
    if (state.sort === "recent") {
      const firstDate = first.updatedAt ? Date.parse(first.updatedAt) : 0;
      const secondDate = second.updatedAt ? Date.parse(second.updatedAt) : 0;
      return secondDate - firstDate || first.name.localeCompare(second.name, "es-BO");
    }
    return Number(Boolean(second.featured)) - Number(Boolean(first.featured))
      || (categoryOrder.get(first.category) ?? 999) - (categoryOrder.get(second.category) ?? 999)
      || products.indexOf(first) - products.indexOf(second);
  });
}

function createFilterChip(label, clearKey) {
  const button = document.createElement("button");
  button.className = "active-filter";
  button.type = "button";
  button.textContent = `${label} ×`;
  button.setAttribute("aria-label", `Quitar filtro ${label}`);
  button.addEventListener("click", () => {
    state[clearKey] = "";
    syncControls();
    render();
  });
  return button;
}

function renderActiveFilters() {
  const chips = [];
  if (state.query.trim()) {
    chips.push(createFilterChip(`Búsqueda: ${state.query.trim()}`, "query"));
  }
  if (state.category) {
    chips.push(createFilterChip(getCategoryName(state.category, categories), "category"));
  }
  if (state.status) {
    chips.push(createFilterChip(getStatusLabel(state.status), "status"));
  }
  activeFilters.replaceChildren(...chips);
}

function render() {
  const filtered = sortProducts(products.filter((product) => (
    matchesSearch(product)
    && (!state.category || product.category === state.category)
    && (!state.status || product.status === state.status)
  )));

  const cards = filtered.map((product) => createProductCard(product, categories, {
    onAdd: (selectedProduct) => addToConsultation(selectedProduct),
    onDetail: openProductDetail
  }));
  grid.replaceChildren(...cards);
  grid.setAttribute("aria-busy", "false");
  grid.hidden = filtered.length === 0;
  empty.hidden = filtered.length > 0;
  summary.textContent = filtered.length === 1
    ? "1 línea encontrada"
    : `${filtered.length} líneas encontradas`;
  renderActiveFilters();
  updateUrl();
}

function syncControls() {
  search.value = state.query;
  categoryFilter.value = state.category;
  statusFilter.value = state.status;
  sort.value = state.sort;
}

function resetFilters() {
  state.query = "";
  state.category = "";
  state.status = "";
  state.sort = "recommended";
  syncControls();
  render();
  search.focus();
}

function appendDetailRow(list, label, value) {
  if (value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) {
    return;
  }
  const item = document.createElement("li");
  const strong = document.createElement("strong");
  strong.textContent = label;
  const text = Array.isArray(value)
    ? value.map((entry) => (
      typeof entry === "string"
        ? entry
        : entry?.name || entry?.label || entry?.value || "Por confirmar"
    )).join(", ")
    : String(value);
  item.append(strong, document.createTextNode(text));
  list.append(item);
}

function buildProductDetail(product) {
  const wrapper = document.createElement("div");
  wrapper.className = "product-detail";
  const media = document.createElement("div");
  media.className = "product-detail__media";
  const imageData = getImageData(product);
  const image = document.createElement("img");
  image.src = imageData.src;
  image.alt = imageData.alt;
  image.width = imageData.width || 800;
  image.height = imageData.height || 600;
  image.addEventListener("error", () => {
    const fallback = getImageData({ ...product, images: [] });
    image.src = fallback.src;
    image.alt = fallback.alt;
  }, { once: true });
  media.append(image);

  const information = document.createElement("div");
  const meta = document.createElement("div");
  meta.className = "product-card__meta";
  const category = document.createElement("span");
  category.className = "tag";
  category.textContent = getCategoryName(product.category, categories);
  const status = document.createElement("span");
  status.className = "tag tag--muted";
  status.textContent = getStatusLabel(product.status);
  meta.append(category, status);
  const heading = document.createElement("h2");
  heading.textContent = product.name;
  const description = document.createElement("p");
  description.textContent = product.description || product.shortDescription || "La información adicional se confirma por WhatsApp.";
  const price = document.createElement("p");
  price.className = "product-card__price";
  price.textContent = formatProductPrice(product);
  const detailList = document.createElement("ul");
  detailList.className = "detail-list";
  appendDetailRow(detailList, "Estado", getStatusLabel(product.status));
  appendDetailRow(detailList, "Condición", product.condition);
  appendDetailRow(detailList, "Variantes", product.variants);
  appendDetailRow(detailList, "Stock", typeof product.stock === "number" ? product.stock : null);
  const note = document.createElement("p");
  note.className = "field-help";
  note.textContent = "Los datos no publicados deben confirmarse antes de comprar.";
  const addButton = document.createElement("button");
  addButton.className = "button button--brand";
  addButton.type = "button";
  addButton.setAttribute("aria-label", `Agregar ${product.name} a mi lista`);
  addButton.append(createIcon("plus"), document.createTextNode("Agregar a mi lista"));
  addButton.disabled = product.status === "sold";
  const localStatus = document.createElement("span");
  localStatus.className = "field-help";
  localStatus.setAttribute("role", "status");
  localStatus.setAttribute("aria-live", "polite");
  if (addButton.disabled) {
    addButton.textContent = "No disponible";
  } else {
    addButton.addEventListener("click", () => {
      if (addToConsultation(product)) {
        localStatus.textContent = `${product.name} se agregó a tu lista.`;
      }
    });
  }
  information.append(meta, heading, description, price, detailList, note, addButton, localStatus);
  wrapper.append(media, information);
  return wrapper;
}

function openProductDetail(product) {
  activeProductSlug = product.slug || product.id;
  productDialogTitle.textContent = `Detalle: ${product.name}`;
  productDialogContent.replaceChildren(buildProductDetail(product));
  updateUrl();
  if (!productDialog.open) {
    productDialog.showModal();
    document.body.classList.add("has-dialog");
  }
}

function setupEvents() {
  search.addEventListener("input", () => {
    state.query = search.value;
    render();
  });
  categoryFilter.addEventListener("change", () => {
    state.category = categoryFilter.value;
    render();
  });
  statusFilter.addEventListener("change", () => {
    state.status = statusFilter.value;
    render();
  });
  sort.addEventListener("change", () => {
    state.sort = sort.value;
    render();
  });
  filterForm.addEventListener("reset", (event) => {
    event.preventDefault();
    resetFilters();
  });
  filterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    render();
  });
  clearAll.addEventListener("click", resetFilters);
  filterToggle.addEventListener("click", () => {
    const open = filterToggle.getAttribute("aria-expanded") !== "true";
    filterToggle.setAttribute("aria-expanded", String(open));
    const label = filterToggle.querySelector("[data-filter-label]");
    if (label) {
      label.textContent = open ? "Ocultar filtros" : "Mostrar filtros";
    }
    filterPanel.classList.toggle("is-open", open);
  });
  productDialogClose.addEventListener("click", () => productDialog.close());
  productDialog.addEventListener("click", (event) => {
    if (event.target === productDialog) {
      productDialog.close();
    }
  });
  productDialog.addEventListener("close", () => {
    activeProductSlug = null;
    document.body.classList.remove("has-dialog");
    updateUrl();
  });
}

async function initializeCatalog() {
  if (!grid) {
    return;
  }
  setupEvents();
  try {
    const data = await loadCatalogData();
    categories = data.categories;
    products = data.products;
    const categoryOptions = categories.map((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      return option;
    });
    categoryFilter.append(...categoryOptions);
    if (!categories.some((category) => category.id === state.category)) {
      state.category = "";
    }
    if (!["recommended", "name-asc", "name-desc", "recent"].includes(state.sort)) {
      state.sort = "recommended";
    }
    if (!["", "consult", "available", "sold", "coming_soon"].includes(state.status)) {
      state.status = "";
    }
    if (state.sort === "recent" && !products.some((product) => product.updatedAt)) {
      state.sort = "recommended";
    }
    syncControls();
    render();
    if (activeProductSlug) {
      const selected = products.find((product) => (product.slug || product.id) === activeProductSlug);
      if (selected) {
        openProductDetail(selected);
      } else {
        activeProductSlug = null;
        updateUrl();
      }
    }
  } catch {
    grid.setAttribute("aria-busy", "false");
    grid.hidden = true;
    empty.hidden = false;
    summary.textContent = "No se pudo cargar el catálogo";
    showToast("No se pudo cargar el catálogo.");
  }
}

initializeCatalog();
