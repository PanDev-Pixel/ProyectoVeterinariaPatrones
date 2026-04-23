const express = require('express');
const facturaController = require('../controllers/facturaController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware); // Todas las rutas de facturas requieren autenticación

// Rutas para facturas
router.post('/', facturaController.crearFactura);
router.get('/', facturaController.obtenerFacturas);
router.get('/:id', facturaController.obtenerFactura);
router.get('/consulta/:consultaId', facturaController.obtenerFacturasPorConsulta);
router.delete('/:id', facturaController.eliminarFactura);

module.exports = router;
