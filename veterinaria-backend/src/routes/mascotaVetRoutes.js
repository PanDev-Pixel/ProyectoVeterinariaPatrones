const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const mascotaVetController = require('../controllers/mascotavetController');

// Middleware para verificar que es veterinario
const veterinarioMiddleware = (req, res, next) => {
  if (req.user.rol !== 'veterinario') {
    return res.status(403).json({ mensaje: 'Solo veterinarios pueden acceder a esta sección' });
  }
  next();
};

// GET /api/vet/mascotas - Ver todas las mascotas del sistema
router.get(
  '/mascotas',
  authMiddleware,
  veterinarioMiddleware,
  mascotaVetController.vertodasMascotas
);

// GET /api/vet/mascotas/buscar - Buscar mascotas por nombre o dueño
router.get(
  '/mascotas/buscar',
  authMiddleware,
  veterinarioMiddleware,
  mascotaVetController.buscarMascotas
);

// GET /api/vet/mascotas/:id - Ver una mascota específica
router.get(
  '/mascotas/:id',
  authMiddleware,
  veterinarioMiddleware,
  mascotaVetController.obtenerMascota
);

// GET /api/vet/mascotas/:id/historial - Ver historial completo de una mascota
router.get(
  '/mascotas/:id/historial',
  authMiddleware,
  veterinarioMiddleware,
  mascotaVetController.obtenerHistorialMascota
);

module.exports = router;
