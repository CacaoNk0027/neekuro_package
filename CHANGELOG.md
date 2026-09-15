# Changelog

## [2.3.0] - 15-09-2026

### Added
- Nuevas subcategorías de `action`: `handhold`, `highfive`, `read` y `wave`.
- Nuevas subcategorías de `reaction`: `disgust`, `facepalm`, `happy`, `love`, `nervous`, `shrug` y `surprised`.

### Fixed
- El timeout de 10 segundos de las imágenes remotas ahora también cubre la lectura del cuerpo, no solo las cabeceras.
- Las respuestas descartadas (redirecciones, errores HTTP o formatos inválidos) liberan su conexión.
- El User-Agent de descarga de imágenes refleja la versión real del paquete.
- Declaraciones TypeScript: `APIError.determineMessage` es estático, se añade `APIError.fromNetworkError` y se corrige la resolución por defecto documentada (1140 × 520) y el ejemplo de `User.token()`.
- `SFW` muestra `Desconocido` cuando el anime llega como `Unknown`, no solo cuando viene vacío.
- `SFW` descarta las URL repetidas de una subcategoría: pesaban doble en el sorteo y podían salir dos veces seguidas.

### Compatibility
- Solo se añaden subcategorías; las existentes no cambian.

## [2.2.0] - 28-08-2026

### Added
- `SFW.getGifs()` permite obtener todas las imágenes de una subcategoría.
- `SFW.clearCache()` permite invalidar toda la caché, una categoría o una subcategoría.
- `SFW.setBaseURL()` permite configurar un endpoint HTTPS alternativo.
- `SFW.setCacheTTL()` permite configurar o desactivar el tiempo de caché.

### Changed
- `SFW.getGif()` conserva listas en memoria durante cinco minutos y selecciona aleatoriamente en cada llamada.
- Las solicitudes concurrentes para la misma subcategoría se agrupan en una sola petición HTTP.
- Cuando existen varias imágenes se evita repetir inmediatamente la selección anterior.
- Cambiar el token invalida automáticamente las listas obtenidas con el token previo.
- El cliente REST admite respuestas tipadas distintas a un único GIF.

### Compatibility
- `SFW.getGif(category, gif)` mantiene la misma firma y continúa devolviendo `NekoGif`.
- La caché solamente cambia la frecuencia de consulta; no fija una imagen durante el TTL.

## [2.1.0] - 28-08-2026

### Changed
- Se corrigieron imports sensibles a mayúsculas para funcionar en Linux.
- Se eliminó la dependencia circular del paquete hacia sí mismo y `node-fetch`.
- `Welcome` valida resolución, coordenadas, radios, fuentes e imágenes con límites seguros.
- Avatar, título y descripción utilizan una columna centrada automática con modo manual opcional.
- Las imágenes remotas requieren HTTPS, tienen timeout, límite de 10 MB y bloqueo de redes privadas.
- El cliente REST usa `fetch` nativo, timeout y conserva el error concreto de red.
- Se alinearon los exports, la implementación y las declaraciones TypeScript.

### Compatibility
- Se conserva la API encadenable de `Welcome`.
- `Error` continúa disponible como alias de `NekoError`.
- Las URLs HTTP de imágenes dejan de aceptarse; deben utilizar HTTPS.

## [2.0.3] - 07-04-2025

### Fixed
- **Error de Importaciones**
  - Corregido el error de importaciones require('...')`
  - Causaba que no se pudiera usar el paquete
  - Se uso el mismo nombre para todas las importaciones respecto al archivo
  - Afectaba a todos los usuarios que hacian uso de la api

**Impacto**: 
- La actualizacion prevee que resuelva el error
- No requiere cambios en implementaciones existentes

Commit: (1e7380a)
