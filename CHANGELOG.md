# Changelog

Todos los cambios notables de Vendedor SCZ se documentan aquí.

## [No publicado] — vitrina comercial v1

### Añadido

- Fuente central para sitio, categorías y once líneas de producto en modo consulta.
- Buscador, filtros, orden, estado vacío y ficha de producto accesible.
- Lista de consulta persistente con cantidades, nota, eliminación, vaciado y mensaje de WhatsApp.
- Páginas públicas de Cómo comprar, Preguntas, Privacidad y 404 coherentes.
- Build público por lista permitida, validadores, pruebas unitarias, Playwright, Axe y Lighthouse.
- Workflows de calidad para Pull Requests y despliegue de `dist/` desde `main`.
- Guía operativa, evidencia visual e informe de calidad.

### Cambiado

- Sistema visual unificado móvil primero con tokens, foco visible y movimiento reducido.
- SEO con `es-BO`, canonical, Open Graph PNG, OnlineStore factual, FAQPage y sitemap público.
- Información comercial desconocida convertida a `null`, `consult` o confirmación directa.

### Retirado de producción

- Login sin autenticación, páginas de coordinación, experimentos y scripts anteriores.
- Activos huérfanos o con afirmaciones comerciales no verificadas.
- Horarios, zonas, costos, bancos, garantías, devoluciones y referencias a pintura no confirmadas.
- `.nojekyll`, innecesario al desplegar un artefacto explícito mediante GitHub Actions.

### Seguridad y calidad

- La salida no contiene documentación interna, secretos ni archivos experimentales.
- Los datos de `localStorage` se validan y el mensaje se sanea antes de construir la URL.
- Dependencias fijadas; auditoría npm sin vulnerabilidades conocidas al cierre de la revisión.

### Pendiente del propietario

- Confirmar WhatsApp, logo, categorías activas, catálogo real y demás datos de `docs/OWNER_INPUTS.md` antes del lanzamiento.
