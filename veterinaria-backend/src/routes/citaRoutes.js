const express = require('express');
const citaController = require('../controllers/citaController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener horarios disponibles (SIN protección de usuario para que cualquiera pueda ver)
router.get('/horarios-disponibles', citaController.obtenerHorariosDisponibles);

// CRUD de citas para el usuario autenticado
router.post('/', citaController.crearCita);
router.get('/', citaController.obtenerCitas);
router.get('/:id', citaController.obtenerCita);
router.put('/:id', citaController.editarCita);
router.delete('/:id', citaController.cancelarCita);
router.get('/:id/historial', citaController.obtenerHistorial);

module.exports = router;
