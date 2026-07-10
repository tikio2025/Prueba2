// Funcionalidad de búsqueda específica para el catálogo

const buscador = document.getElementById('buscador-productos');
const buscadorNav = document.getElementById('buscar-nav');
const cards = document.querySelectorAll('.card');

const normalizar = (texto) =>
  texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

const filtrar = (valor) => {
  const texto = normalizar(valor || '');
  cards.forEach(card => {
    const contenido = normalizar(card.textContent + ' ' + (card.dataset.producto || ''));
    card.style.display = contenido.includes(texto) ? 'flex' : 'none';
  });
};

// Evento en buscador principal
if (buscador) {
  buscador.addEventListener('input', () => filtrar(buscador.value));
}

// Evento en buscador de navegación
if (buscadorNav) {
  buscadorNav.addEventListener('input', () => {
    buscador.value = buscadorNav.value;
    filtrar(buscadorNav.value);
  });
}

// Envío del formulario de búsqueda en navegación
const navSearch = document.querySelector('.nav-search');
if (navSearch) {
  navSearch.addEventListener('submit', (event) => {
    event.preventDefault();
    buscador.scrollIntoView({ behavior: 'smooth', block: 'center' });
    buscador.focus();
    filtrar(buscadorNav.value);
  });
}

// Búsqueda desde parámetro de URL
const params = new URLSearchParams(window.location.search);
const q = params.get('q');
if (q) {
  buscador.value = q;
  buscadorNav.value = q;
  filtrar(q);
}
