# Changelog

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
