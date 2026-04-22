const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/registro', authController.registro);
router.post('/login', authController.login);
router.get('/profile', authMiddleware, authController.perfil);

module.exports = router;
