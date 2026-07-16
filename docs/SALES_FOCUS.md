# Enfoque comercial basado en ventas reales

## Estado actual

Vendedor SCZ ya tiene una base técnica sólida en la rama `codex/premium-storefront-v1`: catálogo centralizado, filtros, ficha de producto, lista persistente y mensaje preparado para WhatsApp.

La rama `codex/ventas-reales-v2` adapta esa base a la operación observada en TIKIO OS:

- producto real confirmado: grasa de res;
- venta por kilogramo;
- cantidades decimales preparadas;
- mensaje de WhatsApp con unidad comercial;
- producto real priorizado antes que líneas todavía no confirmadas;
- lenguaje de portada orientado a pedido y coordinación, no solo exploración.

## Problema comercial que se resuelve

La página anterior funcionaba como una vitrina genérica. El nuevo enfoque debe ayudar al cliente a responder tres preguntas rápidamente:

1. ¿Qué producto está realmente disponible?
2. ¿Cuántos kilos o unidades necesito?
3. ¿Cómo coordino precio, pago y entrega?

## Flujo público recomendado

```text
Producto real
→ elegir cantidad
→ agregar a la lista
→ abrir WhatsApp
→ confirmar disponibilidad, precio, pago y entrega
```

La web no debe registrar deudas, datos bancarios ni cuentas por cobrar. Esa operación pertenece al módulo privado de Ventas e ingresos de TIKIO OS.

## Cambios incluidos en esta rama

- `Grasa de res` queda destacada, disponible y verificada como línea real.
- La lista conserva la unidad comercial (`kg`, `unidad`, etc.).
- Se admiten cantidades decimales para productos vendidos por peso.
- El mensaje de WhatsApp muestra cantidades como `10 kg` o `2 unidades`.
- La portada habla de productos, cantidades y coordinación de compra.
- Los datos confirmados se separan de los bloqueadores comerciales.

## Datos que todavía bloquean un lanzamiento comercial

- WhatsApp definitivo.
- Aprobación de los textos públicos.
- Decisión sobre publicar o no el precio de Bs 15/kg.
- Fotografías reales autorizadas y optimizadas.
- Lista de productos activos además de grasa de res.
- Zonas, costos de entrega y métodos de pago publicables.

## Próxima etapa después de validar esta rama

1. Conectar fotografías reales comprimidas.
2. Añadir productos activos uno por uno.
3. Medir clics en WhatsApp y consultas recibidas.
4. Comparar consultas con ventas registradas en TIKIO OS.
5. Crear ofertas por cantidad solo con datos reales.

## Regla de veracidad

No publicar precios, stock, testimonios, zonas, horarios o condiciones que el propietario no haya confirmado. Las ventas reales sirven para orientar la arquitectura, pero los datos privados de clientes permanecen fuera de GitHub y de la web pública.
