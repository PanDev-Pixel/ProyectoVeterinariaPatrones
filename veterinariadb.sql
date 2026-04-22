-- ============================================
-- BASE DE DATOS: VETERINARIA COMPLETA
-- CON RELACIONES (FOREIGN KEYS) INCLUIDAS
-- ============================================
-- Versión mejorada con ON DELETE CASCADE y SET NULL

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `veterinariadb`
--

-- ============================================
-- TABLA: USUARIO (CON CAMPOS DE AUTENTICACIÓN)
-- ============================================

CREATE TABLE `usuario` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL UNIQUE,
  `contraseña` varchar(255) NOT NULL,
  `tel` varchar(50) NOT NULL,
  `dic` varchar(50) NOT NULL,
  `rol` ENUM('usuario', 'veterinario', 'admin') DEFAULT 'usuario',
  `activo` tinyint(1) DEFAULT 1,
  `fecha_registro` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- TABLA: VETERINARIO
-- ============================================

CREATE TABLE `veterinario` (
  `id_usuario` int(11) NOT NULL,
  `especialidad` varchar(50) NOT NULL,
  `anos_experiencia` int(11),
  PRIMARY KEY (`id_usuario`),
  KEY `fk_veterinario_usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- TABLA: MASCOTA
-- ============================================

CREATE TABLE `mascota` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `especie` varchar(50) NOT NULL,
  `raza` varchar(50) NOT NULL,
  `edad` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_mascota_usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- TABLA: CITA
-- ============================================

CREATE TABLE `cita` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `id_mascota` int(11) NOT NULL,
  `id_veterinario` int(11) NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `estado` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_cita_usuario` (`id_usuario`),
  KEY `fk_cita_mascota` (`id_mascota`),
  KEY `fk_cita_veterinario` (`id_veterinario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- TABLA: TRATAMIENTO
-- ============================================

CREATE TABLE `tratamiento` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(300) NOT NULL,
  `medicamento` varchar(200) NOT NULL,
  `duracion` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- TABLA: CONSULTA
-- ============================================

CREATE TABLE `consulta` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_cita` int(11) NOT NULL,
  `id_tratamiento` int(11) NULL,
  `diagnostico` varchar(200) NOT NULL,
  `observaciones` varchar(300) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_consulta_cita` (`id_cita`),
  KEY `fk_consulta_tratamiento` (`id_tratamiento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- TABLA: FACTURA
-- ============================================

CREATE TABLE `factura` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `id_consulta` int(11) NOT NULL,
  `id_tratamiento` int(11) NULL,
  `fecha` date NOT NULL,
  `total` double NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_factura_usuario` (`id_usuario`),
  KEY `fk_factura_consulta` (`id_consulta`),
  KEY `fk_factura_tratamiento` (`id_tratamiento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- AGREGAR AUTO_INCREMENT
-- ============================================

ALTER TABLE `cita` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `consulta` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `factura` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `mascota` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `tratamiento` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `usuario` MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

-- ============================================
-- FOREIGN KEY CONSTRAINTS (RELACIONES)
-- ============================================

-- Relación 0: VETERINARIO -> USUARIO
-- Un veterinario es un usuario con rol='veterinario'
-- Si se elimina el usuario, se elimina el veterinario (CASCADE)
ALTER TABLE `veterinario`
  ADD CONSTRAINT `fk_veterinario_usuario`
  FOREIGN KEY (`id_usuario`)
  REFERENCES `usuario` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- Relación 1: MASCOTA -> USUARIO
-- Cada mascota pertenece a un usuario
-- Si se elimina el usuario, se eliminan sus mascotas (CASCADE)
ALTER TABLE `mascota`
  ADD CONSTRAINT `fk_mascota_usuario`
  FOREIGN KEY (`id_usuario`)
  REFERENCES `usuario` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- Relación 2: CITA -> USUARIO
-- Cada cita es de un usuario
-- Si se elimina el usuario, se eliminan sus citas (CASCADE)
ALTER TABLE `cita`
  ADD CONSTRAINT `fk_cita_usuario`
  FOREIGN KEY (`id_usuario`)
  REFERENCES `usuario` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- Relación 3: CITA -> MASCOTA
-- Cada cita es para una mascota
-- Si se elimina la mascota, se elimina la cita (CASCADE)
ALTER TABLE `cita`
  ADD CONSTRAINT `fk_cita_mascota`
  FOREIGN KEY (`id_mascota`)
  REFERENCES `mascota` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- Relación 4: CITA -> VETERINARIO
-- Cada cita es con un veterinario
-- Si se elimina el veterinario (usuario), la cita sigue pero sin veterinario (SET NULL)
ALTER TABLE `cita`
  ADD CONSTRAINT `fk_cita_veterinario`
  FOREIGN KEY (`id_veterinario`)
  REFERENCES `veterinario` (`id_usuario`)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

-- Relación 5: CONSULTA -> CITA
-- Cada consulta es de una cita
-- Si se elimina la cita, se elimina la consulta (CASCADE)
ALTER TABLE `consulta`
  ADD CONSTRAINT `fk_consulta_cita`
  FOREIGN KEY (`id_cita`)
  REFERENCES `cita` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- Relación 6: CONSULTA -> TRATAMIENTO
-- Cada consulta tiene un tratamiento
-- Si se elimina el tratamiento, la consulta sigue pero sin tratamiento (SET NULL)
ALTER TABLE `consulta`
  ADD CONSTRAINT `fk_consulta_tratamiento`
  FOREIGN KEY (`id_tratamiento`)
  REFERENCES `tratamiento` (`id`)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

-- Relación 7: FACTURA -> USUARIO
-- Cada factura es de un usuario
-- Si se elimina el usuario, se eliminan sus facturas (CASCADE)
ALTER TABLE `factura`
  ADD CONSTRAINT `fk_factura_usuario`
  FOREIGN KEY (`id_usuario`)
  REFERENCES `usuario` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- Relación 8: FACTURA -> CONSULTA
-- Cada factura es de una consulta
-- Si se elimina la consulta, se elimina la factura (CASCADE)
ALTER TABLE `factura`
  ADD CONSTRAINT `fk_factura_consulta`
  FOREIGN KEY (`id_consulta`)
  REFERENCES `consulta` (`id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- Relación 9: FACTURA -> TRATAMIENTO
-- Cada factura es de un tratamiento
-- Si se elimina el tratamiento, la factura sigue pero sin tratamiento (SET NULL)
ALTER TABLE `factura`
  ADD CONSTRAINT `fk_factura_tratamiento`
  FOREIGN KEY (`id_tratamiento`)
  REFERENCES `tratamiento` (`id`)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

-- ============================================
-- FIN: TODAS LAS RELACIONES CONFIGURADAS
-- ============================================

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
