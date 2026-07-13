# Vendedor SCZ | TIKIO

Vendedor SCZ es una vitrina comercial en línea para organizar líneas de producto y preparar consultas que continúan por WhatsApp. Está pensada para Santa Cruz de la Sierra y no se presenta como una tienda física, un checkout ni una pasarela de pago.

El sitio usa HTML, CSS y JavaScript liviano. Los productos y datos de contacto se administran desde archivos JSON centrales para evitar repetir información y facilitar el mantenimiento.

## Qué puede hacer el cliente

- Explorar, buscar y filtrar productos.
- Ver la información confirmada de cada producto.
- Agregar productos a una Lista de consulta.
- Cambiar cantidades, eliminar productos y escribir una nota.
- Conservar la lista en el mismo navegador mediante `localStorage`.
- Preparar un mensaje legible para consultar disponibilidad, precio y entrega por WhatsApp.

La lista no cobra, no reserva stock y no confirma una venta. TIKIO debe confirmar cada dato antes de cerrar la operación.

## Estructura principal

| Ruta | Uso |
|---|---|
| `index.html` | Inicio público |
| `catalogo.html` | Catálogo, buscador, filtros y fichas |
| `contacto.html` | Cómo comprar y canales de contacto |
| `faq.html` | Preguntas frecuentes verificadas |
| `privacidad.html` | Uso de `localStorage` y continuidad en WhatsApp |
| `data/site.json` | Marca, contacto, ciudad, mensajes y SEO |
| `data/categories.json` | Categorías del catálogo |
| `data/products.json` | Productos y su información comercial |
| `assets/` | Imágenes e identidad visual pública |
| `js/` | Comportamiento compartido, catálogo y lista |
| `docs/` | Auditoría, decisiones y guías internas |
| `internal/` | Material histórico o experimental no público |
| `dist/` | Resultado público generado por el build |

No edites `dist/` manualmente: se vuelve a crear con `npm run build`.

## Uso local

Requisitos: Node.js 24 LTS y npm.

```bash
npm ci
npm run dev
```

Abre en el navegador la dirección que muestre la terminal. Para detener el servidor, presiona `Ctrl + C`.

La primera vez que se ejecuten las pruebas de navegador puede ser necesario instalar Chromium:

```bash
npx playwright install chromium
```

## Editar un producto

1. Abre `data/products.json`.
2. Busca el producto por `id` o `slug`.
3. Cambia únicamente datos confirmados por el propietario.
4. Conserva las comillas, comas y corchetes del formato JSON.
5. Ejecuta `npm run check` antes de publicar.

Los campos principales admiten nombre, categoría, descripciones, imágenes, precio, moneda, modalidad de precio, estado, stock, variantes, etiquetas y fecha de verificación. Usa un producto existente como modelo para no alterar la estructura.

Si precio o stock todavía no están confirmados, mantenlos en `null`, usa el modo `consult` y muestra “Consultar”. No uses un número de ejemplo en producción.

## Agregar una foto

1. Confirma que sea una foto real y autorizada del producto.
2. Optimízala en WebP o AVIF cuando sea posible.
3. Usa un nombre claro en minúsculas y con guiones, por ejemplo `peluche-rosado.webp`.
4. Guárdala dentro de la carpeta pública correspondiente en `assets/`.
5. Añade su ruta y un texto alternativo fiel en el producto de `data/products.json`.
6. Ejecuta el sitio y confirma que no aparece un recurso 404.

Una imagen generada puede usarse como ilustración si se identifica como tal, pero nunca debe presentarse como fotografía real, prueba de stock o testimonio.

## Actualizar precio o stock

- Precio confirmado: registra el importe exacto, la moneda confirmada y el modo previsto por la estructura (`fixed` o `from`).
- Precio no confirmado: usa `price: null` y `priceMode: "consult"`.
- Stock confirmado: registra la cantidad exacta y ajusta el estado de forma coherente.
- Stock no confirmado: usa `stock: null` y conserva el estado de consulta.
- Producto vendido o próximo: usa el estado correspondiente sin afirmar disponibilidad.

Después del cambio, revisa la tarjeta, la ficha y el mensaje de WhatsApp.

## Cambiar WhatsApp

El contacto se centraliza en `data/site.json`. Cambia el valor solo cuando TIKIO confirme el número definitivo y revisa todos los mensajes generados. No vuelvas a escribir el número directamente en cada HTML.

El número que existía en versiones anteriores sigue pendiente de confirmación en `docs/OWNER_INPUTS.md`. Un dato público anterior no debe marcarse automáticamente como verificado.

## Comandos de calidad

```bash
npm run build   # genera únicamente los archivos públicos en dist/
npm run lint    # revisa HTML, CSS y JavaScript
npm run test    # ejecuta pruebas funcionales y de navegador
npm run check   # ejecuta la revisión completa antes de un PR
npm run audit:lighthouse      # mide rendimiento, accesibilidad, buenas prácticas y SEO
npm run evidence:screenshots  # actualiza las capturas internas del PR
```

No publiques si `npm run check` falla.

## Publicación segura

1. Trabaja en una rama nueva; nunca directamente en `main`.
2. Realiza cambios pequeños y revisables.
3. Ejecuta `npm run check`.
4. Sube la rama y abre un Pull Request.
5. Revisa la vista previa, los archivos modificados y los controles automáticos.
6. Fusiona a `main` únicamente con autorización de TIKIO.

GitHub Actions construye el proyecto y publica solo `dist/` en GitHub Pages. `docs/`, pruebas, herramientas, borradores y archivos internos no forman parte del sitio para clientes.

## Regla de veracidad

Nunca inventes precios, stock, fotos, tallas, materiales, horarios, zonas o costos de entrega, medios de pago, garantías, devoluciones, testimonios ni características. Cuando falte información:

- usa `null`, `consult` o `pending_owner_input`;
- muestra “Consultar” u oculta el campo;
- registra la decisión en [`docs/OWNER_INPUTS.md`](docs/OWNER_INPUTS.md).

“Pintura” continúa pendiente de aclaración y no debe publicarse como pintura de pared ni como producto activo por suposición. Tampoco se deben mezclar JIBA Riberalta, La Jibería de Santa Cruz u otras marcas con Vendedor SCZ.

## Recuperar una versión anterior

Git conserva el historial. Desde GitHub se puede abrir **Commits**, elegir una versión estable y crear una rama desde ese punto; también se puede revertir un Pull Request ya fusionado. Haz la recuperación mediante una rama y otro PR.

No uses `push --force`, `git reset --hard` ni borres el historial para recuperar una versión. La guía detallada está en [`docs/GUIA_TIKIO.md`](docs/GUIA_TIKIO.md).

## Documentación

- [`AGENTS.md`](AGENTS.md): reglas obligatorias para personas y agentes de IA.
- [`docs/AUDIT.md`](docs/AUDIT.md): diagnóstico priorizado.
- [`docs/DECISIONS.md`](docs/DECISIONS.md): decisiones técnicas y comerciales.
- [`docs/OWNER_INPUTS.md`](docs/OWNER_INPUTS.md): datos que debe confirmar TIKIO.
- [`docs/GUIA_TIKIO.md`](docs/GUIA_TIKIO.md): manual paso a paso para mantener y publicar.
- [`docs/QUALITY_REPORT.md`](docs/QUALITY_REPORT.md): pruebas, métricas y evidencia de esta versión.
