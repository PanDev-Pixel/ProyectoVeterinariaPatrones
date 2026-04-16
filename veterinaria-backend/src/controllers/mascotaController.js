const pool = require('../config/database');

exports.crearMascota = async (req, res) => {
  try {
    const { nombre, especie, raza, edad } = req.body;
    const userId = req.user.id;

    if (!nombre || !especie || !raza || !edad) {
      return res.status(400).json({ mensaje: 'Todos los campos son requeridos' });
    }

    const connection = await pool.getConnection();

    await connection.query(
      'INSERT INTO mascota (id_usuario, nombre, especie, raza, edad) VALUES (?, ?, ?, ?, ?)',
      [userId, nombre, especie, raza, edad]
    );

    connection.release();
    res.status(201).json({ mensaje: 'Mascota registrada exitosamente' });
  } catch (error) {
    console.error('Error al crear mascota:', error);
    res.status(500).json({ mensaje: 'Error al registrar mascota', error: error.message });
  }
};

exports.obtenerMascotas = async (req, res) => {
  try {
    const userId = req.user.id;
    const connection = await pool.getConnection();

    const [mascotas] = await connection.query(
      'SELECT id, nombre, especie, raza, edad FROM mascota WHERE id_usuario = ? ORDER BY nombre',
      [userId]
    );

    connection.release();
    res.json(mascotas);
  } catch (error) {
    console.error('Error al obtener mascotas:', error);
    res.status(500).json({ mensaje: 'Error al obtener mascotas', error: error.message });
  }
};

exports.obtenerMascota = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const connection = await pool.getConnection();

    const [mascotas] = await connection.query(
      'SELECT id, nombre, especie, raza, edad FROM mascota WHERE id = ? AND id_usuario = ?',
      [id, userId]
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

exports.actualizarMascota = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, especie, raza, edad } = req.body;
    const userId = req.user.id;

    if (!nombre || !especie || !raza || !edad) {
      return res.status(400).json({ mensaje: 'Todos los campos son requeridos' });
    }

    const connection = await pool.getConnection();

    const [mascotas] = await connection.query(
      'SELECT id FROM mascota WHERE id = ? AND id_usuario = ?',
      [id, userId]
    );

    if (mascotas.length === 0) {
      connection.release();
      return res.status(404).json({ mensaje: 'Mascota no encontrada' });
    }

    await connection.query(
      'UPDATE mascota SET nombre = ?, especie = ?, raza = ?, edad = ? WHERE id = ? AND id_usuario = ?',
      [nombre, especie, raza, edad, id, userId]
    );

    connection.release();
    res.json({ mensaje: 'Mascota actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar mascota:', error);
    res.status(500).json({ mensaje: 'Error al actualizar mascota', error: error.message });
  }
};

exports.eliminarMascota = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const connection = await pool.getConnection();

    const [mascotas] = await connection.query(
      'SELECT id FROM mascota WHERE id = ? AND id_usuario = ?',
      [id, userId]
    );

    if (mascotas.length === 0) {
      connection.release();
      return res.status(404).json({ mensaje: 'Mascota no encontrada' });
    }

    await connection.query('DELETE FROM mascota WHERE id = ? AND id_usuario = ?', [id, userId]);

    connection.release();
    res.json({ mensaje: 'Mascota eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar mascota:', error);
    res.status(500).json({ mensaje: 'Error al eliminar mascota', error: error.message });
  }
};
