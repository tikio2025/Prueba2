# Vendedor SCZ â€” memoria del proyecto

## Contexto verdadero

Vendedor SCZ es la vitrina comercial multiproducto de Charleyn Mercado Sanjinez (TIKIO) en Santa Cruz de la Sierra. La operaciÃ³n actual es en lÃ­nea y las consultas, disponibilidad y entrega se coordinan antes de cerrar una venta.

No mezclar esta identidad con JIBA Riberalta, La JiberÃ­a de Santa Cruz, JIBAVERSE, TOR-JIBA ni otros proyectos gastronÃ³micos o de antiguos socios.

## Regla principal

Nunca inventar precios, stock, horarios, zonas o costos de entrega, medios de pago, garantÃ­as, devoluciones, testimonios, materiales, tallas ni caracterÃ­sticas. Si falta un dato, usar `null`, `consult`, `pending_owner_input` o â€œConsultarâ€, y registrarlo en `docs/OWNER_INPUTS.md`.

â€œPinturaâ€ es ambiguo y no debe publicarse como pintura de pared ni como producto activo hasta confirmaciÃ³n expresa.

## Arquitectura

- HTML semÃ¡ntico, CSS y JavaScript modular.
- Datos centrales en `data/`.
- Sin backend, login, checkout ni pasarela simulada.
- La conversiÃ³n termina en una Lista de consulta persistida en `localStorage` y un mensaje de WhatsApp.
- GitHub Pages publica Ãºnicamente `dist/`, generado por `npm run build`.
- `docs/`, `internal/`, pruebas y herramientas nunca forman parte del paquete pÃºblico.

## Convenciones

- EspaÃ±ol de Bolivia: `lang="es-BO"`.
- Rutas relativas compatibles con `/Prueba2/`; canonical y Open Graph absolutos.
- Manipular datos con APIs DOM seguras (`textContent`, no HTML de datos).
- Botones tÃ¡ctiles de al menos 44 Ã— 44 px, foco visible y soporte de teclado.
- Activos: nombres en minÃºscula, kebab-case y sin fechas. No presentar imÃ¡genes generadas como fotos reales.
- Commits pequeÃ±os, descriptivos y sin secretos.

## Comandos

```bash
npm ci
npm run dev
npm run build
npm run lint
npm run test
npm run check
```

## DefiniciÃ³n de terminado

La implementaciÃ³n debe pasar lint, build, enlaces, pruebas unitarias y E2E; no generar errores de consola ni recursos 404; funcionar con teclado y en 360â€“1440 px; excluir contenido interno; y mantener toda afirmaciÃ³n comercial respaldada o marcada para consulta.

## Reglas para futuros agentes

1. Leer este archivo, `docs/DECISIONS.md` y `docs/OWNER_INPUTS.md` antes de editar.
2. No trabajar directamente en `main`, no hacer `push --force` y no fusionar PR sin TIKIO.
3. No cerrar ni fusionar PR #14 o #16 sin autorizaciÃ³n.
4. Ejecutar `npm run check` antes de publicar cambios.
5. Si una modificaciÃ³n introduce una afirmaciÃ³n comercial, indicar su fuente o dejarla pendiente.


