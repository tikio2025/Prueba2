# Registro de decisiones

## D-001 â€” mantener arquitectura estÃ¡tica

Se mantiene HTML, CSS y JavaScript modular. No hay una necesidad real de React, Next.js, Firebase, Supabase ni backend.

## D-002 â€” build mÃ­nimo con Node

Un script Node copiarÃ¡ una lista explÃ­cita de archivos pÃºblicos a `dist/`. Esto permite GitHub Pages, evita publicar documentaciÃ³n/prototipos y no aÃ±ade un framework.

## D-003 â€” datos comerciales centrales

Productos, categorÃ­as y configuraciÃ³n viven en `data/`. Los campos desconocidos son nulos o de consulta; no se rellenan con ejemplos ficticios.

## D-004 â€” lista de consulta, no checkout

El sitio no simula compra ni pago. Una Lista de consulta guarda productos y una nota en `localStorage`, y prepara un mensaje de WhatsApp para confirmar informaciÃ³n.

## D-005 â€” contacto actual con confirmaciÃ³n pendiente

El nÃºmero y Facebook existentes en `main` no fueron inventados por esta rama, pero siguen pendientes de confirmaciÃ³n final. Se centralizan, se documentan y no se incluyen en JSON-LD como datos verificados.

## D-006 â€” â€œpinturaâ€ fuera del catÃ¡logo

No se publica hasta confirmar si significa maquillaje u otra categorÃ­a. No se permite inferir pintura de pared.

## D-007 â€” PR #16 y #14 se absorben selectivamente

No se fusionan. Se trasladan manualmente sus ideas vÃ¡lidas y se reemplazan sus implementaciones inseguras o desactualizadas.

## D-008 â€” activos generados

Los activos generados pueden usarse como ilustraciones si se etiquetan como tales y no contienen afirmaciones falsas. Nunca se presentan como fotografÃ­as reales de producto.

## D-009 â€” sin dependencias de fuente externa

Se usarÃ¡ una pila tipogrÃ¡fica del sistema para reducir bloqueo, privacidad y latencia.


