const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const mascotaRoutes = require('./routes/mascotaRoutes');
const citaRoutes = require('./routes/citaRoutes');
const consultaRoutes = require('./routes/consultaRoutes');
const citaVetRoutes = require('./routes/citaVetRoutes');
const mascotaVetRoutes = require('./routes/mascotaVetRoutes');
const tratamientoRoutes = require('./routes/tratamientoRoutes');
const veterinarioRoutes = require('./routes/veterinarioRoutes');
const facturaRoutes = require('./routes/facturaRoutes');

// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/mascotas', mascotaRoutes);
app.use('/api/citas', citaRoutes);
app.use('/api/consultas', consultaRoutes);
app.use('/api/vet', citaVetRoutes);
app.use('/api/vet', mascotaVetRoutes);
app.use('/api/tratamientos', tratamientoRoutes);
app.use('/api/veterinarios', veterinarioRoutes);
app.use('/api/facturas', facturaRoutes); 

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ mensaje: 'API Veterinaria funcionando' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
});