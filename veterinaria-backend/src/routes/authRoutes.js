const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/registro', authController.registro);
router.post('/login', authController.login);
router.get('/profile', authController.perfil); // Este debe tener middleware de auth

module.exports = router;
