const pool = require('../config/database');

exports.crearConsulta = async (req, res) => {
  try {
    const { id_cita, diagnostico, observaciones, id_tratamiento } = req.body;
    const vetId = req.user.id;
    const connection = await pool.getConnection();

    // Validar campos requeridos
    if (!id_cita || !diagnostico || !observaciones) {
      connection.release();
      return res.status(400).json({
        mensaje: 'Campos requeridos: id_cita, diagnostico, observaciones'
      });
    }

    // Verificar que la cita existe y pertenece a este veterinario
    const [citas] = await connection.query(
      'SELECT id, id_usuario, estado FROM cita WHERE id = ? AND id_veterinario = ?',
      [id_cita, vetId]
    );

    if (citas.length === 0) {
      connection.release();
      return res.status(404).json({
        mensaje: 'La cita no fue encontrada o no le pertenece'
      });
    }

    const cita = citas[0];

    // Si hay id_tratamiento, verificar que existe
    if (id_tratamiento) {
      const [tratamientos] = await connection.query(
        'SELECT id FROM tratamiento WHERE id = ?',
        [id_tratamiento]
      );

      if (tratamientos.length === 0) {
        connection.release();
        return res.status(404).json({ mensaje: 'El tratamiento no fue encontrado' });
      }
    }

    // Crear la consulta
    const [consultaResult] = await connection.query(
      'INSERT INTO consulta (id_cita, diagnostico, observaciones, id_tratamiento) VALUES (?, ?, ?, ?)',
      [id_cita, diagnostico, observaciones, id_tratamiento || null]
    );

    const consultaId = consultaResult.insertId;

    // Crear factura automáticamente vinculada a la consulta
    const [facturaResult] = await connection.query(
      `INSERT INTO factura (id_usuario, id_consulta, id_tratamiento, fecha, total)
       VALUES (?, ?, ?, CURDATE(), 0)`,
      [cita.id_usuario, consultaId, id_tratamiento || null]
    );

    const facturaId = facturaResult.insertId;

    // Actualizar consulta con id_factura
    await connection.query(
      'UPDATE consulta SET id_factura = ? WHERE id = ?',
      [facturaId, consultaId]
    );

    // Actualizar estado de la cita a 'completada'
    await connection.query(
      'UPDATE cita SET estado = ? WHERE id = ?',
      ['completada', id_cita]
    );

    connection.release();
    res.status(201).json({
      mensaje: 'Consulta registrada exitosamente',
      consulta_id: consultaId,
      factura_id: facturaId,
      cita_id: id_cita,
      estado: 'completada'
    });
  } catch (error) {
    console.error('Error al crear consulta:', error);
    res.status(500).json({ mensaje: 'Error al registrar consulta', error: error.message });
  }
};

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
        u.nombre as veterinario,
        v.especialidad,
        con.id as consulta_id,
        con.diagnostico,
        con.observaciones,
        t.descripcion as tratamiento,
        t.medicamento,
        t.duracion
      FROM cita c
      LEFT JOIN veterinario v ON c.id_veterinario = v.id_usuario
      LEFT JOIN usuario u ON v.id_usuario = u.id
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
        u.nombre as veterinario,
        v.especialidad,
        t.descripcion as tratamiento,
        t.medicamento,
        t.duracion
      FROM consulta con
      JOIN cita c ON con.id_cita = c.id
      JOIN mascota m ON c.id_mascota = m.id
      JOIN veterinario v ON c.id_veterinario = v.id_usuario
      JOIN usuario u ON v.id_usuario = u.id
      LEFT JOIN tratamiento t ON con.id_tratamiento = t.id
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
