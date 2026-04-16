const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const mascotaRoutes = require('./routes/mascotaRoutes');
const consultaRoutes = require('./routes/consultaRoutes');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rutas públicas
app.use('/api/auth', authRoutes);

// Rutas protegidas
app.use('/api/mascotas', mascotaRoutes);
app.use('/api/consultas', consultaRoutes);
app.get('/api/auth/profile', authMiddleware, (req, res) => {
  // Este endpoint ya está definido en authRoutes pero necesita auth
});

// Ruta de prueba
app.get('/api/test', (req, res) => {
  res.json({ mensaje: 'Backend funcionando correctamente' });
});

// Manejo de errores para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ mensaje: 'Ruta no encontrada' });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});
