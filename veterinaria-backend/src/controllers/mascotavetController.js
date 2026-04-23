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

exports.obtenerMascota = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();
        const [mascotas] = await connection.query(
            `SELECT m.id, m.nombre, m.especie, m.raza, m.edad, u.nombre as dueno_mascota, u.tel, u.email
             FROM mascota m
             JOIN usuario u ON m.id_usuario = u.id
             WHERE m.id = ?`,
            [id]
        );
        connection.release();
        
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
        const connection = await pool.getConnection();

        // Verificar que la mascota exista
        const [mascotas] = await connection.query(
            'SELECT id FROM mascota WHERE id = ?',
            [id]
        );

        if (mascotas.length === 0) {
            connection.release();
            return res.status(404).json({ mensaje: 'Mascota no encontrada' });
        }

        // Obtener citas y consultas relacionadas
        const [historial] = await connection.query(
            `SELECT
                c.id as cita_id,
                c.fecha,
                c.hora,
                c.estado,
                u.nombre as veterinario,
                v.especialidad,
                con.id as consulta_id,
                con.diagnostico,
                con.observaciones,
                t.descripcion as tratamiento,
                t.medicamento,
                t.duracion
            FROM cita c
            LEFT JOIN usuario u ON c.id_veterinario = u.id
            LEFT JOIN veterinario v ON c.id_veterinario = v.id_usuario
            LEFT JOIN consulta con ON c.id = con.id_cita
            LEFT JOIN tratamiento t ON con.id_tratamiento = t.id
            WHERE c.id_mascota = ?
            ORDER BY c.fecha DESC`,
            [id]
        );

        connection.release();
        res.json(historial);
    } catch (error) {
        console.error('Error al obtener historial de mascota:', error);
        res.status(500).json({ mensaje: 'Error al obtener historial de mascota', error: error.message });
    }
};