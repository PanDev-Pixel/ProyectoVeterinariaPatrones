const express = require('express');
const router = express.Router();
const tratamientoController = require('../controllers/tratamientoController');
const authMiddleware = require('../middleware/authMiddleware');
const { verificarVeterinario } = require('../middleware/veterinarioMiddleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas para cualquier usuario autenticado
router.get('/', tratamientoController.obtenerTratamientos);
router.get('/:id', tratamientoController.obtenerTratamiento);

// Rutas solo para veterinarios
router.post('/', verificarVeterinario, tratamientoController.crearTratamiento);

module.exports = router;