# Guía de TIKIO para mantener Vendedor SCZ

Esta guía explica cómo actualizar el sitio sin necesidad de ser programador. El principio más importante es sencillo: publicar solo información real y confirmada.

## 1. Antes de empezar

Vendedor SCZ es una vitrina en línea. El cliente arma una Lista de consulta y continúa por WhatsApp para confirmar precio, stock y entrega. El sitio:

- no procesa pagos;
- no reserva productos;
- no tiene login;
- no confirma disponibilidad automáticamente;
- no representa una tienda física abierta al público.

Lee primero estos archivos:

1. `AGENTS.md`, con las reglas obligatorias del proyecto.
2. `docs/OWNER_INPUTS.md`, con los datos todavía pendientes.
3. `docs/DECISIONS.md`, con las decisiones ya tomadas.

## 2. Preparar la computadora

Instala Git y Node.js 24 LTS. Después descarga el repositorio o clónalo:

```bash
git clone https://github.com/tikio2025/Prueba2.git
cd Prueba2
npm ci
npx playwright install chromium
```

Para abrir el sitio localmente:

```bash
npm run dev
```

La terminal mostrará una dirección local. Ábrela en Chrome. Cuando termines, vuelve a la terminal y presiona `Ctrl + C`.

## 3. Flujo seguro para cada cambio

No edites directamente la rama `main`.

```bash
git switch main
git pull
git switch -c contenido/nombre-del-cambio
```

Usa un nombre corto que explique el objetivo, por ejemplo `contenido/actualizar-peluches`.

Después de editar:

```bash
npm run check
git status
git add RUTA_DEL_ARCHIVO
git commit -m "content: update confirmed product data"
git push -u origin contenido/nombre-del-cambio
```

En GitHub aparecerá la opción **Compare & pull request**. Abre el Pull Request, explica qué cambió y espera a que los controles automáticos terminen correctamente. No lo fusiones hasta revisarlo y contar con autorización de TIKIO.

## 4. Entender los datos

La información se administra en tres lugares:

| Archivo | Qué contiene |
|---|---|
| `data/site.json` | Marca, contacto, mensajes y datos generales |
| `data/categories.json` | Categorías disponibles para filtrar |
| `data/products.json` | Productos, imágenes, precio, stock y estado |

Los archivos JSON son estrictos:

- cada texto lleva comillas dobles;
- los elementos se separan con comas;
- el último elemento de una lista u objeto no lleva una coma extra;
- no se agregan comentarios dentro del archivo;
- `null`, `true` y `false` no llevan comillas.

Si algo se rompe, no adivines dónde está el error: ejecuta `npm run check`, que indicará el archivo y normalmente la línea.

## 5. Editar un producto existente

1. Abre `data/products.json`.
2. Busca su `id`, `slug` o nombre.
3. Copia el registro antes de modificarlo si deseas compararlo.
4. Cambia solo los campos confirmados.
5. Guarda el archivo y ejecuta `npm run dev`.
6. Revisa la tarjeta y la ficha en el catálogo.
7. Ejecuta `npm run check`.

Campos importantes:

| Campo | Uso seguro |
|---|---|
| `name` | Nombre comercial confirmado |
| `category` | Identificador existente en `categories.json` |
| `shortDescription` | Resumen factual y breve |
| `description` | Detalles confirmados, sin publicidad inventada |
| `images` | Rutas de imágenes reales o ilustraciones identificadas |
| `price` | Número confirmado o `null` |
| `currency` | Moneda confirmada o `null` |
| `priceMode` | `fixed`, `from` o `consult` |
| `status` | `available`, `sold`, `coming_soon` o `consult` |
| `stock` | Cantidad confirmada o `null` |
| `featured` | `true` solo si debe aparecer destacado |
| `condition` | Estado real del producto o `null` |
| `verified` | `true` solo después de comprobar la información |
| `updatedAt` | Fecha real de la última verificación o `null` |

Si no se sabe un dato, conserva `null`, usa `consult` o deja el producto fuera de publicación. Un cero significa “cero”, no “dato desconocido”.

## 6. Agregar un producto

1. Confirma que el producto está activo.
2. Duplica un registro parecido dentro de `data/products.json`.
3. Crea un `id` y un `slug` únicos, en minúsculas y con guiones.
4. Elige una categoría existente o agrega primero una categoría confirmada.
5. Borra todos los datos del registro copiado que no correspondan al nuevo producto.
6. Si faltan precio o stock, usa valores nulos y modo de consulta.
7. Añade solo fotos reales autorizadas o un fallback neutral.
8. Comprueba buscador, filtro, ficha y Lista de consulta.

No publiques un producto de ejemplo para “rellenar” el catálogo. No uses “pintura” hasta que TIKIO confirme exactamente qué significa.

## 7. Actualizar precio y stock

### Precio confirmado

Registra el importe numérico exacto, la moneda confirmada y el modo adecuado. Usa `fixed` si es un precio exacto y `from` únicamente si existe una base real confirmada.

### Precio pendiente

Usa:

```json
"price": null,
"currency": null,
"priceMode": "consult"
```

### Stock confirmado

Registra la cantidad exacta. Comprueba que el estado sea coherente con esa cantidad.

### Stock pendiente

Usa `"stock": null` y estado `consult`. No escribas una cantidad aproximada ni de ejemplo.

## 8. Agregar o cambiar una foto

1. Solicita la foto real y permiso para publicarla.
2. Recorta espacios innecesarios sin ocultar el estado real del producto.
3. Exporta una versión optimizada, preferentemente WebP o AVIF.
4. Usa un nombre como `nombre-producto-01.webp`, sin espacios, tildes ni fechas confusas.
5. Guarda el archivo dentro de una carpeta clara en `assets/`.
6. Añade la ruta a `images` en `data/products.json` siguiendo el formato de los productos existentes.
7. Escribe un texto alternativo que describa lo visible, sin vender ni exagerar.
8. Comprueba el sitio en móvil y escritorio.

No presentes una imagen de IA como fotografía real. Una ilustración debe identificarse como ilustración y no puede demostrar stock, calidad o testimonios.

## 9. Cambiar WhatsApp o Facebook

1. Confirma el dato directamente con TIKIO.
2. Abre `data/site.json`.
3. Actualiza el valor central respetando la estructura existente.
4. No copies el número o enlace dentro de cada página HTML.
5. Reinicia `npm run dev` si el cambio no aparece.
6. Prueba los botones desde inicio, catálogo, contacto y la Lista de consulta.
7. Confirma que el mensaje y el destinatario sean correctos antes de publicar.

El número y el enlace heredados de versiones anteriores están anotados como pendientes en `docs/OWNER_INPUTS.md`. Confírmalos antes de un lanzamiento comercial.

## 10. Probar la Lista de consulta

Haz esta prueba manual en una ventana normal del navegador:

1. Abre el catálogo.
2. Agrega dos productos distintos.
3. Cambia la cantidad de uno.
4. Escribe una nota sin datos sensibles.
5. Recarga la página y comprueba que la lista se conserva.
6. Elimina un producto.
7. Abre el botón para continuar por WhatsApp.
8. Revisa el texto completo antes de enviarlo; no necesitas enviar el mensaje durante la prueba.
9. Vacía la lista y confirma el estado vacío.

Prueba también con teclado: `Tab` debe recorrer controles, `Enter` debe activarlos y `Escape` debe cerrar los diálogos. La lista se guarda solo en ese navegador mediante `localStorage`.

## 11. Pruebas automáticas

Antes de cada Pull Request ejecuta:

```bash
npm run lint
npm run build
npm run test
npm run check
npm run audit:lighthouse
npm run evidence:screenshots
```

`npm run check` es la revisión final y debe terminar sin errores. También conviene revisar:

- ancho móvil de 360 px;
- escritorio de 1440 px;
- navegación con teclado;
- ausencia de errores en la consola;
- ausencia de imágenes o enlaces 404;
- texto de WhatsApp legible;
- contenido de `dist/` sin documentos internos.

## 12. Revisar y abrir un Pull Request

En el Pull Request incluye:

- objetivo del cambio;
- datos comerciales modificados y quién los confirmó;
- páginas afectadas;
- pruebas ejecutadas;
- capturas si hay cambios visuales;
- riesgos o información que aún falta.

Revisa la pestaña **Files changed** línea por línea. Si una IA hizo el cambio, comprueba especialmente precios, stock, contacto, mensajes, fotografías, rutas y texto comercial. Una respuesta convincente de IA no sustituye la verificación del propietario.

No cierres ni fusiones otros Pull Requests por accidente. Nunca uses `push --force`.

## 13. Publicar en GitHub Pages

El flujo correcto es:

1. El Pull Request pasa todos los controles.
2. TIKIO aprueba la publicación.
3. El Pull Request se fusiona a `main`.
4. GitHub Actions ejecuta el build.
5. Solo el contenido generado en `dist/` se publica en GitHub Pages.
6. Se revisa el sitio público en móvil y escritorio.

No copies manualmente `docs/`, `internal/`, `tests/`, herramientas ni archivos de coordinación al sitio público. `noindex` no convierte un archivo público en privado.

## 14. Trabajar con una IA sin perder control

Antes de pedir cambios a una IA, indícale que lea `AGENTS.md`, `docs/DECISIONS.md` y `docs/OWNER_INPUTS.md`. Una solicitud segura puede decir:

> Trabaja en una rama nueva. No inventes información comercial. Usa únicamente estos datos confirmados: [datos]. Registra cualquier duda en OWNER_INPUTS. Ejecuta npm run check, abre un Pull Request y no lo fusiones.

Después:

1. lee el resumen de cambios;
2. revisa **Files changed**;
3. exige resultados de pruebas;
4. abre la web y prueba el recorrido real;
5. confirma que no aparezcan secretos ni datos privados;
6. decide tú si se fusiona.

No compartas contraseñas, tokens, claves de API, documentos personales ni conversaciones privadas con el repositorio o con un prompt público.

## 15. Completar datos pendientes

Abre `docs/OWNER_INPUTS.md` y confirma las casillas una por una. Cuando TIKIO entregue un dato:

1. anota la fuente o confirmación en el Pull Request;
2. actualiza el JSON correspondiente;
3. verifica el sitio;
4. marca la casilla solo cuando el cambio esté aplicado y revisado.

Las prioridades de lanzamiento son contacto definitivo, productos activos, fotos autorizadas, precios/stock cuando se decida mostrarlos, operación de entrega y políticas reales.

## 16. Recuperar una versión anterior

### Opción recomendada: revertir un Pull Request

1. Abre el Pull Request fusionado que causó el problema.
2. Usa **Revert** si GitHub ofrece el botón.
3. GitHub creará un nuevo Pull Request con el cambio inverso.
4. Ejecuta y revisa los controles.
5. Fusiona el PR de reversión solo con aprobación.

### Crear una rama desde un commit estable

1. Abre el repositorio y selecciona **Commits**.
2. Identifica el último commit estable.
3. Copia su identificador.
4. Crea una rama de recuperación desde ese commit.
5. Haz la corrección y abre un Pull Request hacia `main`.

No uses `git reset --hard`, no borres ramas con trabajo útil y no hagas `push --force`. Si no estás seguro, detente y pide una revisión.

## 17. Lista rápida antes de vender

- [ ] WhatsApp y Facebook confirmados y probados.
- [ ] Productos activos confirmados.
- [ ] “Pintura” aclarada o ausente.
- [ ] Fotos reales autorizadas; ilustraciones identificadas.
- [ ] Precio, stock, tallas y condición sin suposiciones.
- [ ] Lista de consulta probada de principio a fin.
- [ ] Entrega, pago, horarios y políticas solo si están confirmados.
- [ ] `npm run check` aprobado.
- [ ] Pull Request revisado y aprobado por TIKIO.
- [ ] Sitio público revisado en móvil y escritorio.
