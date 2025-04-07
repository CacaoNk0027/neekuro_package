# Changelog

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