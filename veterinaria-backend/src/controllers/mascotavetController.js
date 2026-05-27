const pool = require('../config/database');
const { createRepository } = require('../utils/repositoryFactory');
const MascotaHistoryBuilder = require('../utils/mascotaHistoryBuilder');

// Usamos la Factory para crear un repositorio para la tabla `mascota`.
const mascotaRepo = createRepository(pool, 'mascota');

exports.vertodasMascotas = async (req, res) => {
    try {
        const mascotas = await mascotaRepo.findAll();
        res.json(mascotas);
    } catch (error) {
        console.error('Error al obtener todas las mascotas:', error);
        res.status(500).json({ mensaje: 'Error al obtener todas las mascotas', error: error.message });
    }
};

exports.obtenerMascota = async (req, res) => {
    try {
        const { id } = req.params;
        const mascotas = await mascotaRepo.findById(id);

        if (mascotas.length === 0) {
            return res.status(404).json({ mensaje: 'Mascota no encontrada' });
        }

        res.json(mascotas[0]);
    } catch (error) {
        console.error('Error al obtener mascota:', error);
        res.status(500).json({ mensaje: 'Error al obtener mascota', error: error.message });
    }
};

exports.obtenerHistorialMascota = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que la mascota existe (reutilizamos el repo)
        const mascota = await mascotaRepo.findById(id);

        if (mascota.length === 0) {
            return res.status(404).json({ mensaje: 'Mascota no encontrada' });
        }

        // Usamos el Builder para componer la consulta del historial
        const builder = new MascotaHistoryBuilder().forMascota(id);
        const { sql, params } = builder.build();

        const connection = await pool.getConnection();
        const [historial] = await connection.query(sql, params);
        connection.release();

        res.json(historial);
    } catch (error) {
        console.error('Error al obtener historial de mascota:', error);
        res.status(500).json({ mensaje: 'Error al obtener historial de mascota', error: error.message });
    }
};

exports.buscarMascotas = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ mensaje: 'Parámetro de búsqueda requerido' });
        }

        const mascotas = await mascotaRepo.searchByNameOrOwner(q);
        res.json(mascotas);
    } catch (error) {
        console.error('Error al buscar mascotas:', error);
        res.status(500).json({ mensaje: 'Error al buscar mascotas', error: error.message });
    }
};