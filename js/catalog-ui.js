const DATA_URLS = Object.freeze({
  site: new URL("../data/site.json", import.meta.url),
  categories: new URL("../data/categories.json", import.meta.url),
  products: new URL("../data/products.json", import.meta.url)
});

const PLACEHOLDER_URL = new URL("../assets/product-placeholder.svg", import.meta.url).href;

let catalogDataPromise;

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`No se pudo cargar ${url.pathname}.`);
  }
  return response.json();
}

export function loadCatalogData() {
  catalogDataPromise ??= Promise.all([
    fetchJson(DATA_URLS.site),
    fetchJson(DATA_URLS.categories),
    fetchJson(DATA_URLS.products)
  ]).then(([site, categories, products]) => ({ site, categories, products }));
  return catalogDataPromise;
}

export function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/gu, "")
    .toLocaleLowerCase("es-BO")
    .trim();
}

export function getCategoryName(categoryId, categories) {
  return categories.find((category) => category.id === categoryId)?.name ?? "Otra categoría";
}

export function getStatusLabel(status) {
  const labels = {
    available: "Disponible",
    sold: "Vendido",
    coming_soon: "Próximamente",
    consult: "Consultar"
  };
  return labels[status] ?? "Consultar";
}

function formatCurrencyAmount(value, currency) {
  const amount = new Intl.NumberFormat("es-BO", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2
  }).format(value);

  if (currency === "BOB") {
    return `Bs ${amount}`;
  }

  try {
    return new Intl.NumberFormat("es-BO", {
      style: "currency",
      currency,
      maximumFractionDigits: 2
    }).format(value);
  } catch {
    return `${currency} ${amount}`;
  }
}

export function formatProductPrice(product) {
  if (
    !["fixed", "from"].includes(product.priceMode)
    || typeof product.price !== "number"
    || !product.currency
  ) {
    return "Consultar";
  }

  const formatted = formatCurrencyAmount(product.price, product.currency);
  const prefix = product.priceMode === "from" ? "Desde " : "";
  const unit = typeof product.unit === "string" && product.unit.trim()
    ? ` / ${product.unit.trim()}`
    : "";
  return `${prefix}${formatted}${unit}`;
}

function createIcon(symbol) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("icon");
  svg.setAttribute("aria-hidden", "true");
  const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
  use.setAttribute("href", new URL(`../assets/icons.svg#${symbol}`, import.meta.url).href);
  svg.append(use);
  return svg;
}

function getProductImage(product) {
  const firstImage = Array.isArray(product.images) ? product.images[0] : null;
  if (typeof firstImage === "string" && firstImage.trim()) {
    return { src: new URL(`../${firstImage}`, import.meta.url).href, alt: product.name };
  }
  if (firstImage && typeof firstImage === "object" && firstImage.src) {
    return {
      src: new URL(`../${firstImage.src}`, import.meta.url).href,
      alt: firstImage.alt || product.name,
      width: firstImage.width,
      height: firstImage.height
    };
  }
  return {
    src: PLACEHOLDER_URL,
    alt: `Imagen de ${product.name} pendiente de confirmación`,
    width: 800,
    height: 600
  };
}

export function createProductCard(product, categories, { onAdd, onDetail } = {}) {
  const article = document.createElement("article");
  article.className = "product-card";
  article.dataset.productId = product.id;

  const media = document.createElement("div");
  media.className = "product-card__media";
  const imageData = getProductImage(product);
  const image = document.createElement("img");
  image.src = imageData.src;
  image.alt = imageData.alt;
  image.width = imageData.width || 800;
  image.height = imageData.height || 600;
  image.loading = "lazy";
  image.decoding = "async";
  image.addEventListener("error", () => {
    if (image.src !== PLACEHOLDER_URL) {
      image.src = PLACEHOLDER_URL;
      image.alt = `Imagen de ${product.name} pendiente de confirmación`;
    }
  }, { once: true });
  media.append(image);

  const body = document.createElement("div");
  body.className = "product-card__body";
  const meta = document.createElement("div");
  meta.className = "product-card__meta";
  const categoryTag = document.createElement("span");
  categoryTag.className = "tag";
  categoryTag.textContent = getCategoryName(product.category, categories);
  const statusTag = document.createElement("span");
  statusTag.className = "tag tag--muted";
  statusTag.textContent = getStatusLabel(product.status);
  meta.append(categoryTag, statusTag);

  const heading = document.createElement("h3");
  heading.textContent = product.name;
  const description = document.createElement("p");
  description.textContent = product.shortDescription || "Información adicional por confirmar.";
  const price = document.createElement("p");
  price.className = "product-card__price";
  price.textContent = formatProductPrice(product);
  price.setAttribute("aria-label", `Precio: ${price.textContent}`);

  const actions = document.createElement("div");
  actions.className = "product-card__actions";
  const detailButton = document.createElement("button");
  detailButton.className = "button button--ghost";
  detailButton.type = "button";
  detailButton.textContent = "Ver detalle";
  detailButton.setAttribute("aria-label", `Ver detalle de ${product.name}`);
  detailButton.addEventListener("click", () => onDetail?.(product));

  const addButton = document.createElement("button");
  addButton.className = "button button--brand";
  addButton.type = "button";
  addButton.setAttribute("aria-label", `Agregar ${product.name} a mi lista`);
  addButton.append(createIcon("plus"), document.createTextNode("Agregar"));
  addButton.disabled = product.status === "sold";
  if (addButton.disabled) {
    addButton.textContent = "No disponible";
    addButton.setAttribute("aria-label", `${product.name} no está disponible`);
  } else {
    addButton.addEventListener("click", () => onAdd?.(product, addButton));
  }

  actions.append(detailButton, addButton);
  body.append(meta, heading, description, price, actions);
  article.append(media, body);
  return article;
}

export function createCategoryCard(category, count) {
  const anchor = document.createElement("a");
  anchor.className = "category-card";
  const url = new URL("../catalogo.html", import.meta.url);
  url.searchParams.set("category", category.id);
  anchor.href = url.href;
  const name = document.createElement("strong");
  name.textContent = category.name;
  const detail = document.createElement("small");
  detail.textContent = count === 1 ? "1 línea para consultar" : `${count} líneas para consultar`;
  anchor.append(name, detail);
  return anchor;
}

export function getImageData(product) {
  return getProductImage(product);
}
