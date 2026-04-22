const pool = require('../config/database');

exports.vertodasMascotas = async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [mascotas] = await connection.query(
            `SELECT m.id, m.nombre, m.especie, m.raza, m.edad, u.nombre as dueno_mascota, u.tel, u.email
             FROM mascota m
             JOIN usuario u ON m.id_usuario = u.id
             ORDER BY m.nombre`
        );
        connection.release();
        res.json(mascotas);
    } catch (error) {
        console.error('Error al obtener todas las mascotas:', error);
        res.status(500).json({ mensaje: 'Error al obtener todas las mascotas', error: error.message });
    }
};