# Informe de calidad — vitrina comercial v1

Fecha de revisión: 13 de julio de 2026  
Rama: `codex/premium-storefront-v1`  
Base comparada: `main` (`e2227cb`)

## Resultado ejecutivo

La salida pública se construye correctamente, no incluye archivos internos y completa el recorrido catálogo → lista → mensaje de WhatsApp. Los controles automáticos no encontraron errores de consola, desbordes horizontales, enlaces locales rotos, secretos ni violaciones graves de accesibilidad.

La aprobación técnica **no equivale a autorización de lanzamiento**: TIKIO todavía debe confirmar el WhatsApp destinatario, las líneas activas y los demás datos de `OWNER_INPUTS.md`.

## Controles ejecutados

| Control | Resultado |
|---|---:|
| Build público por allowlist | 22 archivos; aprobado |
| ESLint | aprobado |
| Stylelint | aprobado |
| HTML Validate | aprobado |
| Enlaces, recursos, canonical, secretos y afirmaciones conocidas | aprobado |
| Pruebas unitarias del store | 8/8 |
| Playwright funcional + smoke, escritorio y móvil | 32/32 |
| Axe WCAG A/AA, páginas públicas | 0 violaciones serias o críticas |
| Anchos 320, 360, 390, 430, 768, 1024 y 1440 px | sin desborde horizontal |
| Páginas internas (`login`, coordinación, ramificaciones) | 404 en producción |
| 404 desde ruta anidada | aprobado; CSS y módulos cargan |
| `npm audit --audit-level=moderate` | 0 vulnerabilidades conocidas |

## Lighthouse móvil

Auditoría local sobre el build de producción con Lighthouse 12.6.1:

| Categoría | Puntaje |
|---|---:|
| Rendimiento | 94 |
| Accesibilidad | 100 |
| Buenas prácticas | 100 |
| SEO | 100 |

El rendimiento osciló entre 94 y 99 en ejecuciones locales; la tabla usa la última corrida integral. Los demás puntajes se mantuvieron en 100. El informe completo está en [lighthouse-home.html](evidence/lighthouse-home.html) y el resumen reproducible en [lighthouse-summary.json](evidence/lighthouse-summary.json).

## Recorridos comprobados

- Carga de Inicio, Catálogo, Cómo comprar, FAQ, Privacidad y 404 sin errores de consola.
- Búsqueda tolerante a tildes, filtro por categoría/estado, orden y estado sin resultados.
- Ficha en diálogo, cierre con Escape y confirmación accesible al agregar.
- Agregar dos líneas, cambiar cantidad, conservar foco, eliminar y vaciar.
- Nota de hasta 500 caracteres y persistencia tras recargar.
- Recuperación segura frente a JSON corrupto en `localStorage`.
- URL `wa.me` con destinatario configurado y mensaje codificado en el orden esperado.
- Navegación y controles táctiles en móvil; no se exige registro.
- El build no contiene `docs/`, `internal/`, `tests/`, herramientas ni páginas experimentales.

## Evidencia visual

- [Inicio — escritorio](evidence/screenshots/inicio-desktop.png)
- [Catálogo — móvil 390 px](evidence/screenshots/catalogo-mobile-390.png)
- [Lista de consulta — escritorio](evidence/screenshots/lista-consulta-desktop.png)

## Incidencias encontradas y corregidas

- Contraste insuficiente del texto en la sección oscura: corregido y validado por Axe.
- Enlaces sin destino durante la carga: ahora se ocultan hasta resolver su configuración; Facebook no verificado se retira del DOM.
- Pérdida de foco al volver a renderizar cantidades: se restaura el control equivalente o un destino seguro.
- Filtro de estado inválido desde URL y `toSorted()` de compatibilidad limitada: corregidos.
- Referencia Open Graph PNG inexistente: se creó y se valida dentro del build.
- SEO inicial de Lighthouse 92 por enlaces no rastreables: corregido a 100.

## Riesgos y límites conocidos

- El WhatsApp heredado está pendiente de confirmación del propietario. Es un bloqueador de lanzamiento.
- Facebook queda oculto hasta que su URL sea verificada.
- La marca `VS` es temporal; falta el logo oficial.
- No hay fotos reales, precios, stock, tallas, condiciones ni medios de pago confirmados; por eso se muestra “Consultar”.
- La web no reserva inventario, cobra, autentica usuarios ni sustituye la confirmación humana.
- Las métricas se obtuvieron localmente; después de fusionar debe repetirse una revisión sobre la URL pública de GitHub Pages.

## Cómo reproducir

```bash
npm ci
npx playwright install --with-deps chromium
npm run check
npm run audit:lighthouse
npm run evidence:screenshots
npm audit --audit-level=moderate
```
