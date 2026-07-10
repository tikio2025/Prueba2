# Convención de nombres para imágenes

Guía rápida para evitar imágenes rotas en la página Vendedor SCZ.

## Regla principal

Los nombres de archivos deben ser simples, exactos y consistentes.

Usar siempre:

- minúsculas
- guiones medios `-`
- sin espacios
- sin tildes
- extensión exacta `.jpg`, `.png`, `.webp` o `.svg`
- nombres cortos y descriptivos

## Ejemplos correctos

```txt
grasita-res-corte.jpg
polera-americana-estampada.jpg
pintura-disponible.jpg
bisuteria-modelos.jpg
```

## Evitar

```txt
Grasita Res Corte.JPG
grácita-res-corte.jpeg
foto final final nueva.jpg
producto (1).png
```

## Checklist antes de conectar una imagen

1. Confirmar que el archivo está subido en la carpeta correcta.
2. Copiar el nombre exacto del archivo.
3. Verificar mayúsculas, tildes, espacios y extensión.
4. Usar rutas relativas limpias, por ejemplo:

```html
<img src="assets/productos/grasita-res-corte.jpg" alt="Grasita de res para cocina">
```

## Resultado esperado

Menos imágenes rotas, catálogo más confiable y mantenimiento más fácil para futuras mejoras.
