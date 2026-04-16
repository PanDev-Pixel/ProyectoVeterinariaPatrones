const express = require('express');
const consultaController = require('../controllers/consultaController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware); // Todas las rutas de consultas requieren autenticación

router.get('/mascota/:mascotaId', consultaController.obtenerHistorial);
router.get('/:id', consultaController.obtenerConsulta);

module.exports = router;
