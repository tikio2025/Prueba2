# Archivo interno

Este directorio conserva páginas, scripts y activos del avance anterior para consulta histórica. El proceso de construcción usa una lista pública explícita y **nunca copia `internal/` a `dist/`**.

## Motivos del archivo

- `pages/`: login sin autenticación real y páginas de coordinación o experimentos que no deben exponerse a clientes.
- `js/`: scripts anteriores sustituidos por módulos con una fuente central de datos y pruebas.
- `assets/`: material sin uso, con afirmaciones comerciales no verificadas, imágenes promocionales que no prueban stock o formatos que no eran válidos.

No reutilices un archivo en producción sin revisar su contenido, licencia, veracidad, peso y accesibilidad.
