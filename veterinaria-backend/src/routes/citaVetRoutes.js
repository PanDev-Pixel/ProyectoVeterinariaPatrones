const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const citaVetController = require('../controllers/citavetController');

// Middleware para verificar que es veterinario
const veterinarioMiddleware = (req, res, next) => {
  if (req.user.rol !== 'veterinario') {
    return res.status(403).json({ mensaje: 'Solo veterinarios pueden acceder a esta sección' });
  }
  next();
};

// GET /api/vet/citas - Ver citas asignadas al veterinario
router.get(
  '/citas',
  authMiddleware,
  veterinarioMiddleware,
  citaVetController.verCitas
);

// POST /api/vet/citas/:id/consulta - Registrar una consulta en una cita
router.post(
  '/citas/:id/consulta',
  authMiddleware,
  veterinarioMiddleware,
  citaVetController.registrarConsulta
);

// GET /api/vet/consultas - Ver todas las consultas del veterinario
router.get(
  '/consultas',
  authMiddleware,
  veterinarioMiddleware,
  citaVetController.verConsultas
);

// GET /api/vet/consultas/:id - Ver detalle de una consulta
router.get(
  '/consultas/:id',
  authMiddleware,
  veterinarioMiddleware,
  citaVetController.verConsultaDetalle
);

module.exports = router;
