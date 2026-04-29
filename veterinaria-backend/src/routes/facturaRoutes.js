const express = require('express');
const facturaController = require('../controllers/facturaController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware); // Todas las rutas de facturas requieren autenticación

// GET /api/facturas - Obtener todas las facturas del usuario
router.get('/', facturaController.obtenerFacturas);

// GET /api/facturas/:id - Obtener detalle de una factura
router.get('/:id', facturaController.obtenerFactura);

// POST /api/facturas - Crear una nueva factura (opcional, ya se genera automáticamente)
router.post('/', facturaController.crearFactura);

// PUT /api/facturas/:id - Actualizar una factura
router.put('/:id', facturaController.actualizarFactura);

// DELETE /api/facturas/:id - Eliminar una factura
router.delete('/:id', facturaController.eliminarFactura);

module.exports = router;
