const pool = require('../config/database');

// 1. Obtener todos los veterinarios
exports.obtenerVeterinarios = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [veterinarios] = await connection.query(
      // CAMBIO: Se agregó "AS id" para que Angular lo reconozca
      "SELECT v.id_usuario AS id, u.nombre, v.especialidad FROM veterinario v INNER JOIN usuario u ON v.id_usuario = u.id WHERE u.activo = true ORDER BY u.nombre ASC"
    );
    
    connection.release();
    return res.status(200).json(veterinarios);
  } catch (error) {
    if (connection) connection.release();
    console.error('Error al obtener veterinarios:', error);
    return res.status(500).json({ 
      mensaje: 'Error al obtener veterinarios',
      error: error.message 
    });
  }
};

// 2. Obtener veterinario por ID con detalles
exports.obtenerVeterinarioDetalle = async (req, res) => {
  try {
    const { id } = req.params;

    const connection = await pool.getConnection();
    const [veterinarios] = await connection.query(
      // CAMBIO: v.id NO EXISTE. Se cambió a v.id_usuario y se le puso el alias "id"
      `SELECT v.id_usuario AS id, u.nombre, u.email, u.tel, v.especialidad, u.activo
       FROM veterinario v 
       INNER JOIN usuario u ON v.id_usuario = u.id 
       WHERE v.id_usuario = ? AND u.activo = true`, 
      [id]
    );

    if (veterinarios.length === 0) {
      connection.release();
      return res.status(404).json({ mensaje: 'Veterinario no encontrado' });
    }

    connection.release();
    return res.status(200).json(veterinarios[0]);
  } catch (error) {
    if (connection) connection.release();
    console.error('Error al obtener veterinario:', error);
    return res.status(500).json({ 
      mensaje: 'Error al obtener veterinario',
      error: error.message 
    });
  }
};

// 3. Obtener horarios disponibles de un veterinario
exports.obtenerHorariosVeterinario = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha } = req.query;

    if (!fecha) {
      return res.status(400).json({ mensaje: 'Fecha requerida' });
    }

    const connection = await pool.getConnection();
    const [citas] = await connection.query(
      // Aquí estaba bien id_veterinario, pero asegúrate de que el "id" que llega sea el correcto
      `SELECT hora FROM cita 
       WHERE id_veterinario = ? AND fecha = ? AND estado != 'cancelada'
       ORDER BY hora ASC`,
      [id, fecha]
    );

    const horasDisponibles = [];
    const horasOcupadas = citas.map(c => {
        // A veces MySQL devuelve la hora como objeto Date o con segundos (08:00:00)
        // Esto asegura que la comparación funcione con tu bucle de abajo
        return c.hora.toString().substring(0, 5); 
    });

    for (let h = 8; h < 18; h++) {
      const hora = `${h.toString().padStart(2, '0')}:00`;
      if (!horasOcupadas.includes(hora)) {
        horasDisponibles.push(hora);
      }
    }

    connection.release();
    return res.status(200).json({ horas: horasDisponibles });
  } catch (error) {
    if (connection) connection.release();
    console.error('Error al obtener horarios:', error);
    return res.status(500).json({ 
      mensaje: 'Error al obtener horarios',
      error: error.message 
    });
  }
};