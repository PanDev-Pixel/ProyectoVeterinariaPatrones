const pool = require('../config/database');

exports.obtenerHistorial = async (req, res) => {
  try {
    const { mascotaId } = req.params;
    const userId = req.user.id;
    const connection = await pool.getConnection();

    // Verificar que la mascota pertenece al usuario
    const [mascotas] = await connection.query(
      'SELECT id FROM mascota WHERE id = ? AND id_usuario = ?',
      [mascotaId, userId]
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
        v.nombre as veterinario,
        v.especialidad,
        con.id as consulta_id,
        con.diagnostico,
        con.observaciones,
        t.descripcion as tratamiento,
        t.medicamento,
        t.duracion
      FROM cita c
      LEFT JOIN veterinario v ON c.id_veterinario = v.id
      LEFT JOIN consulta con ON c.id = con.id_cita
      LEFT JOIN tratamiento t ON con.id_tratamiento = t.id
      WHERE c.id_mascota = ?
      ORDER BY c.fecha DESC`,
      [mascotaId]
    );

    connection.release();
    res.json(historial);
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ mensaje: 'Error al obtener historial', error: error.message });
  }
};

exports.obtenerConsulta = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const connection = await pool.getConnection();

    const [consultas] = await connection.query(
      `SELECT
        con.id,
        con.diagnostico,
        con.observaciones,
        c.fecha as fecha_cita,
        c.hora as hora_cita,
        m.nombre as mascota,
        v.nombre as veterinario,
        t.descripcion as tratamiento,
        t.medicamento,
        t.duracion
      FROM consulta con
      JOIN cita c ON con.id_cita = c.id
      JOIN mascota m ON c.id_mascota = m.id
      JOIN veterinario v ON c.id_veterinario = v.id
      JOIN tratamiento t ON con.id_tratamiento = t.id
      WHERE con.id = ? AND c.id_usuario = ?`,
      [id, userId]
    );

    connection.release();

    if (consultas.length === 0) {
      return res.status(404).json({ mensaje: 'Consulta no encontrada' });
    }

    res.json(consultas[0]);
  } catch (error) {
    console.error('Error al obtener consulta:', error);
    res.status(500).json({ mensaje: 'Error al obtener consulta', error: error.message });
  }
};
