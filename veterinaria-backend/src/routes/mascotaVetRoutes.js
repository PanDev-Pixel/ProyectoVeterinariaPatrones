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

module.exports = router;
