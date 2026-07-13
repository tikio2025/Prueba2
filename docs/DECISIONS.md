# Registro de decisiones

## D-001 — mantener arquitectura estática

Se mantiene HTML, CSS y JavaScript modular. No hay una necesidad real de React, Next.js, Firebase, Supabase ni backend.

## D-002 — build mínimo con Node

Un script Node copiará una lista explícita de archivos públicos a `dist/`. Esto permite GitHub Pages, evita publicar documentación/prototipos y no añade un framework.

## D-003 — datos comerciales centrales

Productos, categorías y configuración viven en `data/`. Los campos desconocidos son nulos o de consulta; no se rellenan con ejemplos ficticios.

## D-004 — lista de consulta, no checkout

El sitio no simula compra ni pago. Una Lista de consulta guarda productos y una nota en `localStorage`, y prepara un mensaje de WhatsApp para confirmar información.

## D-005 — contacto actual con confirmación pendiente

El número y Facebook existentes en `main` no fueron inventados por esta rama, pero siguen pendientes de confirmación final. WhatsApp se centraliza para probar el recorrido; la URL de Facebook se guarda solo en `OWNER_INPUTS.md` y queda nula en los datos públicos. Ninguno se incluye en JSON-LD como dato verificado.

## D-006 — “pintura” fuera del catálogo

No se publica hasta confirmar si significa maquillaje u otra categoría. No se permite inferir pintura de pared.

## D-007 — PR #16 y #14 se absorben selectivamente

No se fusionan. Se trasladan manualmente sus ideas válidas y se reemplazan sus implementaciones inseguras o desactualizadas.

## D-008 — activos generados

Los activos generados pueden usarse como ilustraciones si se etiquetan como tales y no contienen afirmaciones falsas. Nunca se presentan como fotografías reales de producto.

## D-009 — sin dependencias de fuente externa

Se usará una pila tipográfica del sistema para reducir bloqueo, privacidad y latencia.

## D-010 — marca gráfica temporal

La marca `VS` es un recurso visual temporal y neutral para evitar un logo roto. No se presenta como logo oficial; se reemplazará cuando TIKIO entregue el activo confirmado.

## D-011 — canales pendientes

El WhatsApp heredado queda funcional únicamente para revisar de punta a punta la rama, pero bloquea el lanzamiento hasta que TIKIO confirme el destinatario. Facebook permanece oculto mientras `verified` sea `false`.

## D-012 — evidencia fuera de producción

Capturas e informes Lighthouse viven en `docs/evidence/`. Sirven para revisar el Pull Request y el build nunca los copia a `dist/`.

## D-013 — dependencias de auditoría

Lighthouse se fija en `12.6.1`: la versión más nueva evaluada introducía avisos moderados transitivos en herramientas de desarrollo. La versión elegida produce la misma medición necesaria y deja `npm audit` en cero vulnerabilidades conocidas.

## D-014 — HTML estático y datos centrales

Productos, categorías, mensajes y contactos tienen una única fuente operativa en `data/`. Títulos, canonical, marca y ciudad también se conservan en HTML porque deben existir antes de ejecutar JavaScript y ser legibles por buscadores. Cualquier cambio de identidad o URL canónica exige actualizar ambos y pasar los controles de contenido.
