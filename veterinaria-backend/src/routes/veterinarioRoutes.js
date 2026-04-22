const express = require('express');
const router = express.Router();
const veterinarioController = require('../controllers/veterinarioController');
const authMiddleware = require('../middleware/authMiddleware');

// Rutas públicas
router.get('/', veterinarioController.obtenerVeterinarios);
router.get('/:id', veterinarioController.obtenerVeterinarioDetalle);
router.get('/:id/horarios', veterinarioController.obtenerHorariosVeterinario);

module.exports = router;
