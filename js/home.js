import { addToConsultation, showToast } from "./app.js";
import { createCategoryCard, createProductCard, loadCatalogData } from "./catalog-ui.js";

function openProductInCatalog(product) {
  const url = new URL("../catalogo.html", import.meta.url);
  url.searchParams.set("product", product.slug || product.id);
  globalThis.location.assign(url);
}

function selectRepresentativeProducts(products, limit = 3) {
  const selected = [];
  const categories = new Set();
  for (const product of products) {
    if (!categories.has(product.category)) {
      selected.push(product);
      categories.add(product.category);
    }
    if (selected.length === limit) {
      break;
    }
  }
  return selected;
}

async function initializeHome() {
  const categoryGrid = document.querySelector("#home-categories");
  const productGrid = document.querySelector("#home-products");
  if (!categoryGrid || !productGrid) {
    return;
  }

  try {
    const { categories, products } = await loadCatalogData();
    const categoryCards = categories.slice(0, 4).map((category) => {
      const count = products.filter((product) => product.category === category.id).length;
      return createCategoryCard(category, count);
    });
    categoryGrid.replaceChildren(...categoryCards);

    const cards = selectRepresentativeProducts(products).map((product) => createProductCard(
      product,
      categories,
      {
        onAdd: (selectedProduct) => addToConsultation(selectedProduct),
        onDetail: openProductInCatalog
      }
    ));
    productGrid.replaceChildren(...cards);
  } catch {
    categoryGrid.replaceChildren();
    productGrid.replaceChildren();
    const message = document.createElement("p");
    message.className = "notice";
    message.textContent = "No pudimos cargar el catálogo. Intenta actualizar la página.";
    productGrid.append(message);
    showToast("No se pudo cargar el catálogo.");
  }
}

initializeHome();
