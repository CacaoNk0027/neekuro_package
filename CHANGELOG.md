# Changelog

## [2.0.2] - 04-04-2025

### Fixed
- **Compatibilidad en clase Welcome**
  - Corregida discrepancia en la propiedad `background.data` vs `background.value`
  - Causaba que no se pudiera leer los datos que se establecian en el metodo
  - Se normalizó el uso de `value` en toda la clase Welcome
  - Afectaba a usuarios que configuraban fondos personalizados

**Impacto**: 
- Todos los usuarios que actualicen resolverán el fallo al generar imágenes
- No requiere cambios en implementaciones existentes

Commit: (10e8b3a) 