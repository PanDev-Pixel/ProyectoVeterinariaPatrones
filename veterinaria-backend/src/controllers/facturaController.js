const pool = require('../config/database');

// Crear una factura
exports.crearFactura = async (req, res) => {
  try {
    const { id_consulta, id_tratamiento, total } = req.body;
    const userId = req.user.id;
    const connection = await pool.getConnection();

    // Validar campos requeridos
    if (!id_consulta || !total) {
      connection.release();
      return res.status(400).json({
        mensaje: 'Campos requeridos: id_consulta, total'
      });
    }

    // Verificar que la consulta existe
    const [consultas] = await connection.query(
      `SELECT c.id, c.id_cita
       FROM consulta c
       INNER JOIN cita ci ON c.id_cita = ci.id
       WHERE c.id = ? AND ci.id_usuario = ?`,
      [id_consulta, userId]
    );

    if (consultas.length === 0) {
      connection.release();
      return res.status(404).json({
        mensaje: 'La consulta no fue encontrada'
      });
    }

    // Si hay tratamiento, verificar que existe
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

    // Crear la factura
    const [result] = await connection.query(
      `INSERT INTO factura (id_usuario, id_consulta, id_tratamiento, fecha, total)
       VALUES (?, ?, ?, CURDATE(), ?)`,
      [userId, id_consulta, id_tratamiento || null, total]
    );

    connection.release();
    res.status(201).json({
      id: result.insertId,
      id_usuario: userId,
      id_consulta,
      id_tratamiento: id_tratamiento || null,
      fecha: new Date().toISOString().split('T')[0],
      total,
      mensaje: 'Factura generada exitosamente'
    });
  } catch (error) {
    console.error('Error al crear factura:', error);
    res.status(500).json({ mensaje: 'Error al generar factura', error: error.message });
  }
};

// Obtener todas las facturas del usuario
exports.obtenerFacturas = async (req, res) => {
  try {
    const userId = req.user.id;
    const connection = await pool.getConnection();

    const [facturas] = await connection.query(
      `SELECT
        f.id,
        f.id_usuario,
        f.id_consulta,
        f.id_tratamiento,
        f.fecha,
        f.total,
        m.nombre as mascota_nombre,
        c.diagnostico,
        c.observaciones,
        ci.fecha as fecha_cita,
        u.nombre as veterinario_nombre,
        t.descripcion as tratamiento,
        t.medicamento,
        t.duracion
      FROM factura f
      INNER JOIN consulta c ON f.id_consulta = c.id
      INNER JOIN cita ci ON c.id_cita = ci.id
      INNER JOIN mascota m ON ci.id_mascota = m.id
      LEFT JOIN usuario u ON ci.id_veterinario = u.id
      LEFT JOIN tratamiento t ON f.id_tratamiento = t.id
      WHERE f.id_usuario = ?
      ORDER BY f.fecha DESC`,
      [userId]
    );

    connection.release();
    res.status(200).json(facturas);
  } catch (error) {
    console.error('Error al obtener facturas:', error);
    res.status(500).json({ mensaje: 'Error al obtener facturas', error: error.message });
  }
};

// Obtener una factura específica
exports.obtenerFactura = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const connection = await pool.getConnection();

    const [facturas] = await connection.query(
      `SELECT
        f.id,
        f.id_usuario,
        f.id_consulta,
        f.id_tratamiento,
        f.fecha,
        f.total,
        m.nombre as mascota_nombre,
        c.diagnostico,
        c.observaciones,
        ci.fecha as fecha_cita,
        u.nombre as veterinario_nombre,
        t.descripcion as tratamiento,
        t.medicamento,
        t.duracion
      FROM factura f
      INNER JOIN consulta c ON f.id_consulta = c.id
      INNER JOIN cita ci ON c.id_cita = ci.id
      INNER JOIN mascota m ON ci.id_mascota = m.id
      LEFT JOIN usuario u ON ci.id_veterinario = u.id
      LEFT JOIN tratamiento t ON f.id_tratamiento = t.id
      WHERE f.id = ? AND f.id_usuario = ?`,
      [id, userId]
    );

    if (facturas.length === 0) {
      connection.release();
      return res.status(404).json({ mensaje: 'Factura no encontrada' });
    }

    connection.release();
    res.status(200).json(facturas[0]);
  } catch (error) {
    console.error('Error al obtener factura:', error);
    res.status(500).json({ mensaje: 'Error al obtener factura', error: error.message });
  }
};

// Obtener facturas por consulta (admin o vet)
exports.obtenerFacturasPorConsulta = async (req, res) => {
  try {
    const { consultaId } = req.params;
    const connection = await pool.getConnection();

    const [facturas] = await connection.query(
      `SELECT * FROM factura WHERE id_consulta = ?`,
      [consultaId]
    );

    connection.release();
    res.status(200).json(facturas);
  } catch (error) {
    console.error('Error al obtener facturas:', error);
    res.status(500).json({ mensaje: 'Error al obtener facturas', error: error.message });
  }
};

// Actualizar monto de factura
exports.actualizarMontoFactura = async (req, res) => {
  try {
    const { id } = req.params;
    const { total } = req.body;
    const userId = req.user.id;

    if (!total || total < 0) {
      return res.status(400).json({
        mensaje: 'El monto debe ser un número positivo'
      });
    }

    const connection = await pool.getConnection();

    // Verificar que la factura pertenece al usuario
    const [facturas] = await connection.query(
      'SELECT id FROM factura WHERE id = ? AND id_usuario = ?',
      [id, userId]
    );

    if (facturas.length === 0) {
      connection.release();
      return res.status(404).json({ mensaje: 'Factura no encontrada' });
    }

    // Actualizar monto
    await connection.query(
      'UPDATE factura SET total = ? WHERE id = ?',
      [total, id]
    );

    connection.release();
    res.status(200).json({
      mensaje: 'Factura actualizada exitosamente',
      id,
      total
    });
  } catch (error) {
    console.error('Error al actualizar factura:', error);
    res.status(500).json({ mensaje: 'Error al actualizar factura', error: error.message });
  }
};

// Eliminar una factura (solo si no hay relaciones posteriores)
exports.eliminarFactura = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const connection = await pool.getConnection();

    // Verificar que la factura pertenece al usuario
    const [facturas] = await connection.query(
      'SELECT id FROM factura WHERE id = ? AND id_usuario = ?',
      [id, userId]
    );

    if (facturas.length === 0) {
      connection.release();
      return res.status(404).json({ mensaje: 'Factura no encontrada' });
    }

    // Eliminar la factura
    await connection.query('DELETE FROM factura WHERE id = ?', [id]);

    connection.release();
    res.status(200).json({ mensaje: 'Factura eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar factura:', error);
    res.status(500).json({ mensaje: 'Error al eliminar factura', error: error.message });
  }
};
