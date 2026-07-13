# AuditorÃ­a inicial â€” Vendedor SCZ

Fecha: 2026-07-13  
Base revisada: `main` en `e2227cbb34ca540b8778d7aebd1d73bfa3be051f`  
PR revisados: [#16](https://github.com/tikio2025/Prueba2/pull/16) y [#14](https://github.com/tikio2025/Prueba2/pull/14)

## Resumen ejecutivo

El avance actual demuestra identidad visual y una estructura multipÃ¡gina, pero todavÃ­a no es seguro publicarlo como vitrina de ventas. Hay afirmaciones comerciales no verificadas, recursos inexistentes, una lista/carrito sin experiencia funcional, contenido interno desplegado y ausencia total de pruebas o CI.

La recomendaciÃ³n es evolucionar desde el `main` actual mediante una arquitectura estÃ¡tica centralizada. No se deben fusionar completos los PR #16 o #14: sus ideas Ãºtiles se incorporarÃ¡n manualmente y sus debilidades serÃ¡n reemplazadas.

## P0 â€” bloquea ventas o representa riesgo

1. `faq.html` publica horarios, zonas, delivery gratuito, bancos, billeteras, crÃ©dito, garantÃ­as, devoluciones y polÃ­ticas no confirmadas.
2. â€œPinturaâ€ se presenta como pintura de pared, con acabados, litros, marcas y colores, aunque el tÃ©rmino es ambiguo.
3. La portada promete â€œ100% fotos realesâ€, â€œrespuesta rÃ¡pidaâ€ y lÃ­neas activas sin evidencia suficiente.
4. `assets/productos/grasita-res-corte.jpg` y `assets/poleras/polera-americana-estampada.jpg` no existen; cada visita genera 404 antes del fallback.
5. La lista actual es inerte: no hay llamadas a `ShoppingCart.add`, drawer, cantidades, nota, eliminar, vaciar ni mensaje agregado.
6. El WhatsApp y Facebook actuales estÃ¡n repetidos y aÃºn requieren confirmaciÃ³n final del propietario. Deben centralizarse y registrarse como pendientes de confirmaciÃ³n.

## P1 â€” necesario antes del lanzamiento

1. `login.html`, `coordinacion-ia.html`, `ramificaciones.html` y `gemini-code-1783496564365.html` estÃ¡n dentro de la raÃ­z pÃºblica. `noindex` no los vuelve privados.
2. No hay fuente Ãºnica: el contacto, navegaciÃ³n, productos y textos se repiten en mÃºltiples pÃ¡ginas.
3. El catÃ¡logo usa un sistema visual y CSS embebido distinto al resto de la web; FAQ mantiene otro bloque CSS embebido.
4. Solo Inicio tiene canonical y Open Graph. `og:image` es relativa y SVG; JSON-LD usa `TollFree` incorrectamente y sugiere informaciÃ³n de contacto no confirmada.
5. `sitemap.xml` incluye login y planificaciÃ³n interna, y omite FAQ y Privacidad.
6. Falta polÃ­tica de privacidad pese al uso de `localStorage`.
7. Hay HTML invÃ¡lido en la secciÃ³n â€œAsÃ­ funcionaâ€ de `index.html`.
8. La 404 usa rutas relativas frÃ¡giles en rutas anidadas.
9. No existen `package.json`, build, lint, pruebas ni flujos de GitHub Actions.

## P2 â€” calidad y mantenibilidad

- CSS minificado y HTML de tarjetas en una lÃ­nea dificultan revisiÃ³n.
- `localStorage` no valida esquema ni maneja datos corruptos.
- MenÃº mÃ³vil no cierra con Escape ni fuera del panel.
- ImÃ¡genes no declaran dimensiones.
- Todas las pÃ¡ginas usan `lang="es"` en vez de `es-BO`.
- Hay activos huÃ©rfanos; uno incluye el precio inventado â€œ12 Bsâ€.
- El PNG generado de 1,6 MB contiene promesas no verificadas y no debe desplegarse.
- Google Fonts aÃ±ade una dependencia externa evitable.

## P3 â€” posterior a una primera versiÃ³n segura

- Product/ItemList estructurados cuando haya productos verificados completos.
- AnalÃ­tica solo cuando TIKIO confirme proveedor e identificador.
- Dominio propio y automatizaciones avanzadas.

## EvaluaciÃ³n de PR abiertos

### PR #16

No fusionar completo. NaciÃ³ antes del PR #17, necesita sincronizaciÃ³n y todavÃ­a publica â€œpinturaâ€, datos repetidos y afirmaciones dudosas. Su panel usa `innerHTML` con datos de `localStorage`, no implementa un diÃ¡logo accesible ni manejo de foco.

Se incorporan manualmente estas ideas:

- Retirar afirmaciones especÃ­ficas no confirmadas.
- Eliminar `TollFree`.
- Separar CSS y JavaScript.
- Sustituir carrito por Lista de consulta.
- Usar Open Graph absoluto.

Se reemplazan:

- CatÃ¡logo hardcodeado.
- Panel inseguro e incompleto.
- NÃºmero repetido en archivos.
- PÃ¡gina de coordinaciÃ³n dentro del paquete pÃºblico.

### PR #14

EstÃ¡ supersedido funcionalmente por #16. Su principio de usar una URL Open Graph absoluta es correcto, pero el SVG propuesto se reemplazarÃ¡ por una imagen raster 1200 Ã— 630. No cerrar ni fusionar sin autorizaciÃ³n.

## Inventario de activos

- Activo promocional potencialmente utilizable: `assets/peluches/peluche-rosado-publicidad.jpg`, etiquetado como material promocional y no como fotografÃ­a verificadora de stock.
- SVG existentes: varios son ilustraciones o experimentos; algunos contienen afirmaciones no confirmadas.
- Imagen generada raÃ­z: no apta para producciÃ³n por promesas (â€œcompras segurasâ€, â€œprecios accesiblesâ€, â€œrespuesta/envÃ­os rÃ¡pidosâ€).
- Faltantes reales: las dos rutas JPG usadas para grasa y poleras.

## Criterio de lanzamiento

No recomendar lanzamiento hasta que:

1. El propietario confirme al menos WhatsApp y Facebook actuales.
2. Se eliminen todos los P0.
3. El paquete pÃºblico excluya contenido interno.
4. `npm run check` y la auditorÃ­a de navegador terminen sin P0/P1.


