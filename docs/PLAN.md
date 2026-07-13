# Plan de transformaciÃ³n controlada

## Objetivo

Convertir el avance actual en una vitrina comercial ligera, coherente y verificable que pueda mantenerse sin backend y cerrar consultas por WhatsApp.

## Fase 0 â€” protecciÃ³n y memoria

- [x] Revisar `main`, historial y PR #16/#14.
- [x] Crear rama `codex/premium-storefront-v1` desde `main`.
- [x] Crear `AGENTS.md`, auditorÃ­a, plan, decisiones, entradas del propietario y changelog.
- [ ] Publicar el commit documental como punto de restauraciÃ³n.

## Fase 1 â€” arquitectura y datos

- [ ] Crear `data/site.json`, `data/categories.json` y `data/products.json`.
- [ ] Mantener valores desconocidos como `null`, `consult` o `pending_owner_input`.
- [ ] Crear build Node sin framework que publique solo archivos permitidos en `dist/`.
- [ ] Archivar prototipos y pÃ¡ginas internas fuera de la salida pÃºblica.

## Fase 2 â€” sistema visual y pÃ¡ginas

- [ ] Unificar tokens, componentes, navegaciÃ³n, footer y estados.
- [ ] RediseÃ±ar Inicio, CatÃ¡logo, CÃ³mo comprar/Contacto, FAQ, Privacidad y 404.
- [ ] Eliminar login pÃºblico.
- [ ] AÃ±adir favicon e imagen Open Graph propias, sin afirmaciones falsas.

## Fase 3 â€” catÃ¡logo y conversiÃ³n

- [ ] Renderizar productos desde fuente central.
- [ ] BÃºsqueda, categorÃ­a, estado, orden y estado sin resultados.
- [ ] Ficha accesible.
- [ ] Lista de consulta con cantidad, nota, eliminar, vaciar y persistencia.
- [ ] Mensaje de WhatsApp codificado y comprobable.

## Fase 4 â€” SEO, accesibilidad y rendimiento

- [ ] `lang="es-BO"`, tÃ­tulos, descriptions, canonical, OG y Twitter.
- [ ] OnlineStore sin direcciÃ³n fÃ­sica ni contacto no verificado en JSON-LD.
- [ ] FAQPage solo con preguntas pÃºblicas verificadas.
- [ ] Sitemap pÃºblico, robots y rutas `/Prueba2/`.
- [ ] DiÃ¡logos, foco, Escape, aria-live, contraste y reduced motion.
- [ ] ImÃ¡genes con dimensiones, lazy loading y cero solicitudes 404.

## Fase 5 â€” calidad, CI y documentaciÃ³n

- [ ] HTML Validate, ESLint y Stylelint.
- [ ] Pruebas unitarias y Playwright/Axe.
- [ ] Comprobador de enlaces y recursos locales.
- [ ] CI para PR y despliegue Pages desde `dist/` al fusionar en `main`.
- [ ] README y `docs/GUIA_TIKIO.md`.
- [ ] Capturas y resultados de Lighthouse.

## Fase 6 â€” revisiÃ³n independiente

- [ ] Comparar todo contra `main`.
- [ ] Buscar regresiones, rutas, falsedades, seguridad, SEO, accesibilidad y rendimiento.
- [ ] Corregir P0/P1 en commits separados.
- [ ] Abrir PR en borrador; no fusionar.


