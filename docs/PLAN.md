# Plan de transformación controlada

## Objetivo

Convertir el avance actual en una vitrina comercial ligera, coherente y verificable que pueda mantenerse sin backend y cerrar consultas por WhatsApp.

## Fase 0 — protección y memoria

- [x] Revisar `main`, historial y PR #16/#14.
- [x] Crear rama `codex/premium-storefront-v1` desde `main`.
- [x] Crear `AGENTS.md`, auditoría, plan, decisiones, entradas del propietario y changelog.
- [x] Publicar el commit documental como punto de restauración (`631f718`).

## Fase 1 — arquitectura y datos

- [x] Crear `data/site.json`, `data/categories.json` y `data/products.json`.
- [x] Mantener valores desconocidos como `null`, `consult` o `pending_owner_input`.
- [x] Crear build Node sin framework que publique solo archivos permitidos en `dist/`.
- [x] Archivar prototipos y páginas internas fuera de la salida pública.

## Fase 2 — sistema visual y páginas

- [x] Unificar tokens, componentes, navegación, footer y estados.
- [x] Rediseñar Inicio, Catálogo, Cómo comprar/Contacto, FAQ, Privacidad y 404.
- [x] Eliminar login público.
- [x] Añadir favicon e imagen Open Graph propias, sin afirmaciones falsas.

## Fase 3 — catálogo y conversión

- [x] Renderizar productos desde fuente central.
- [x] Búsqueda, categoría, estado, orden y estado sin resultados.
- [x] Ficha accesible.
- [x] Lista de consulta con cantidad, nota, eliminar, vaciar y persistencia.
- [x] Mensaje de WhatsApp codificado y comprobable.

## Fase 4 — SEO, accesibilidad y rendimiento

- [x] `lang="es-BO"`, títulos, descriptions, canonical, OG y Twitter.
- [x] OnlineStore sin dirección física ni contacto no verificado en JSON-LD.
- [x] FAQPage solo con preguntas públicas verificadas.
- [x] Sitemap público, robots y rutas `/Prueba2/`.
- [x] Diálogos, foco, Escape, aria-live, contraste y reduced motion.
- [x] Imágenes con dimensiones, lazy loading y cero solicitudes 404.

## Fase 5 — calidad, CI y documentación

- [x] HTML Validate, ESLint y Stylelint.
- [x] Pruebas unitarias y Playwright/Axe.
- [x] Comprobador de enlaces y recursos locales.
- [x] CI para PR y despliegue Pages desde `dist/` al fusionar en `main`.
- [x] README y `docs/GUIA_TIKIO.md`.
- [x] Capturas y resultados de Lighthouse.

## Fase 6 — revisión independiente

- [x] Comparar todo contra `main`.
- [x] Buscar regresiones, rutas, falsedades, seguridad, SEO, accesibilidad y rendimiento.
- [x] Confirmar mediante tres revisiones independientes que no quedan P0/P1 técnicos; aplicar además los endurecimientos P2 accionables.
- [ ] Abrir PR en borrador; no fusionar.
