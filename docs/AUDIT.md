# Auditoría inicial — Vendedor SCZ

Fecha: 2026-07-13  
Base revisada: `main` en `e2227cbb34ca540b8778d7aebd1d73bfa3be051f`  
PR revisados: [#16](https://github.com/tikio2025/Prueba2/pull/16) y [#14](https://github.com/tikio2025/Prueba2/pull/14)

## Resumen ejecutivo

El avance actual demuestra identidad visual y una estructura multipágina, pero todavía no es seguro publicarlo como vitrina de ventas. Hay afirmaciones comerciales no verificadas, recursos inexistentes, una lista/carrito sin experiencia funcional, contenido interno desplegado y ausencia total de pruebas o CI.

La recomendación es evolucionar desde el `main` actual mediante una arquitectura estática centralizada. No se deben fusionar completos los PR #16 o #14: sus ideas útiles se incorporarán manualmente y sus debilidades serán reemplazadas.

## P0 — bloquea ventas o representa riesgo

1. `faq.html` publica horarios, zonas, delivery gratuito, bancos, billeteras, crédito, garantías, devoluciones y políticas no confirmadas.
2. “Pintura” se presenta como pintura de pared, con acabados, litros, marcas y colores, aunque el término es ambiguo.
3. La portada promete “100% fotos reales”, “respuesta rápida” y líneas activas sin evidencia suficiente.
4. `assets/productos/grasita-res-corte.jpg` y `assets/poleras/polera-americana-estampada.jpg` no existen; cada visita genera 404 antes del fallback.
5. La lista actual es inerte: no hay llamadas a `ShoppingCart.add`, drawer, cantidades, nota, eliminar, vaciar ni mensaje agregado.
6. El WhatsApp y Facebook actuales están repetidos y aún requieren confirmación final del propietario. Deben centralizarse y registrarse como pendientes de confirmación.

## P1 — necesario antes del lanzamiento

1. `login.html`, `coordinacion-ia.html`, `ramificaciones.html` y `gemini-code-1783496564365.html` están dentro de la raíz pública. `noindex` no los vuelve privados.
2. No hay fuente única: el contacto, navegación, productos y textos se repiten en múltiples páginas.
3. El catálogo usa un sistema visual y CSS embebido distinto al resto de la web; FAQ mantiene otro bloque CSS embebido.
4. Solo Inicio tiene canonical y Open Graph. `og:image` es relativa y SVG; JSON-LD usa `TollFree` incorrectamente y sugiere información de contacto no confirmada.
5. `sitemap.xml` incluye login y planificación interna, y omite FAQ y Privacidad.
6. Falta política de privacidad pese al uso de `localStorage`.
7. Hay HTML inválido en la sección “Así funciona” de `index.html`.
8. La 404 usa rutas relativas frágiles en rutas anidadas.
9. No existen `package.json`, build, lint, pruebas ni flujos de GitHub Actions.

## P2 — calidad y mantenibilidad

- CSS minificado y HTML de tarjetas en una línea dificultan revisión.
- `localStorage` no valida esquema ni maneja datos corruptos.
- Menú móvil no cierra con Escape ni fuera del panel.
- Imágenes no declaran dimensiones.
- Todas las páginas usan `lang="es"` en vez de `es-BO`.
- Hay activos huérfanos; uno incluye el precio inventado “12 Bs”.
- El PNG generado de 1,6 MB contiene promesas no verificadas y no debe desplegarse.
- Google Fonts añade una dependencia externa evitable.

## P3 — posterior a una primera versión segura

- Product/ItemList estructurados cuando haya productos verificados completos.
- Analítica solo cuando TIKIO confirme proveedor e identificador.
- Dominio propio y automatizaciones avanzadas.

## Evaluación de PR abiertos

### PR #16

No fusionar completo. Nació antes del PR #17, necesita sincronización y todavía publica “pintura”, datos repetidos y afirmaciones dudosas. Su panel usa `innerHTML` con datos de `localStorage`, no implementa un diálogo accesible ni manejo de foco.

Se incorporan manualmente estas ideas:

- Retirar afirmaciones específicas no confirmadas.
- Eliminar `TollFree`.
- Separar CSS y JavaScript.
- Sustituir carrito por Lista de consulta.
- Usar Open Graph absoluto.

Se reemplazan:

- Catálogo hardcodeado.
- Panel inseguro e incompleto.
- Número repetido en archivos.
- Página de coordinación dentro del paquete público.

### PR #14

Está supersedido funcionalmente por #16. Su principio de usar una URL Open Graph absoluta es correcto, pero el SVG propuesto se reemplazará por una imagen raster 1200 × 630. No cerrar ni fusionar sin autorización.

## Inventario de activos

- Activo promocional potencialmente utilizable: `assets/peluches/peluche-rosado-publicidad.jpg`, etiquetado como material promocional y no como fotografía verificadora de stock.
- SVG existentes: varios son ilustraciones o experimentos; algunos contienen afirmaciones no confirmadas.
- Imagen generada raíz: no apta para producción por promesas (“compras seguras”, “precios accesibles”, “respuesta/envíos rápidos”).
- Faltantes reales: las dos rutas JPG usadas para grasa y poleras.

## Criterio de lanzamiento

No recomendar lanzamiento hasta que:

1. El propietario confirme el WhatsApp actual; Facebook puede permanecer oculto.
2. Se eliminen todos los P0.
3. El paquete público excluya contenido interno.
4. `npm run check` y la auditoría de navegador terminen sin P0/P1.

## Estado después de la implementación

Los P0 y P1 identificados en esta auditoría se resolvieron en la rama `codex/premium-storefront-v1`:

- FAQ y páginas públicas ya no incluyen horarios, zonas, costos, bancos, pagos, garantías o devoluciones sin confirmar.
- “Pintura” se retiró por completo del catálogo público.
- Las imágenes faltantes se sustituyeron por un fallback neutral; ningún gráfico se presenta como fotografía real.
- Catálogo y lista consumen datos centrales; no quedan teléfonos repetidos en HTML.
- El login y las páginas internas se archivaron y el build impide que entren a `dist/`.
- Se eliminaron `TollFree`, dirección física, contacto no verificado y productos no confirmados de los datos estructurados.
- Foco, contraste, Escape, `aria-live`, controles táctiles, movimiento reducido y anchos 320–1440 se cubren mediante estilos y pruebas.
- Sitemap, canonical, Open Graph PNG, robots, rutas `/Prueba2/`, enlaces y recursos pasan controles automáticos.

La web queda técnicamente revisable, pero el lanzamiento comercial continúa condicionado por los bloqueadores de `OWNER_INPUTS.md`, en especial el número de WhatsApp y las líneas activas. Facebook permanece oculto mientras no esté verificado.
