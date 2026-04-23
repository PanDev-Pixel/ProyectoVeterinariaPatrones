-- ============================================
-- MIGRATION: Agregar id_factura a tabla consulta
-- ============================================

-- Agregar columna id_factura a tabla consulta
ALTER TABLE `consulta` ADD COLUMN `id_factura` INT NULL AFTER `id_tratamiento`;

-- Agregar relación con tabla factura
ALTER TABLE `consulta`
  ADD CONSTRAINT `fk_consulta_factura`
  FOREIGN KEY (`id_factura`)
  REFERENCES `factura` (`id`)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

-- ============================================
-- Tabla factura: Agregar estado si no existe
-- ============================================

-- Verificar si la columna estado no existe, si no existe agregarla
-- ALTER TABLE `factura` ADD COLUMN `estado` VARCHAR(50) DEFAULT 'activa' AFTER `total`;

COMMIT;
