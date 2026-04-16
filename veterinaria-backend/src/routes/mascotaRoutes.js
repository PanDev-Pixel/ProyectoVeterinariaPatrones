const express = require('express');
const mascotaController = require('../controllers/mascotaController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware); // Todas las rutas de mascotas requieren autenticación

router.post('/', mascotaController.crearMascota);
router.get('/', mascotaController.obtenerMascotas);
router.get('/:id', mascotaController.obtenerMascota);
router.put('/:id', mascotaController.actualizarMascota);
router.delete('/:id', mascotaController.eliminarMascota);

module.exports = router;
