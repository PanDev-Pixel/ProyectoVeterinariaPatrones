const pool = require('../config/database');
const { getHorariosDisponibles, isValidHora } = require('../utils/dateUtils');

exports.crearCita = async (req, res) => {
    try { 
        const { id_mascota, id_veterinario, fecha, hora } = req.body;
        const userId = req.user.id;

        if (!id_mascota || !id_veterinario || !fecha || !hora) {
            return res.status(400).json({ mensaje: 'Todos los campos son requeridos' });
        }

        // Validar formato de hora
        if (!isValidHora(hora)) {
            return res.status(400).json({ mensaje: 'La hora debe estar en formato HH:mm' });
        }

    const connection = await pool.getConnection();
    // Verificar que la mascota pertenezca al usuario
    const [mascotas] = await connection.query(
        'SELECT id FROM mascota WHERE id = ? AND id_usuario = ?',
        [id_mascota, userId]
    );

    if (mascotas.length === 0) {
        return res.status(404).json({ mensaje: 'La mascota no fue encontrada o no pertenece al usuario' });
    }
    // Verificar que el veterinario exista
    const [veterinarios] = await connection.query(
        'SELECT id_usuario FROM veterinario WHERE id_usuario = ?',
        [id_veterinario]
    );
    if (veterinarios.length === 0) {
        return res.status(404).json({ mensaje: 'El veterinario no fue encontrado' });
    }
    // Insertar la cita
    await connection.query(
        'INSERT INTO cita (id_usuario, id_mascota, id_veterinario, fecha, hora, estado) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, id_mascota, id_veterinario, fecha, hora, 'pendiente']
    );
    connection.release();
    res.status(201).json({ mensaje: 'Cita creada exitosamente' });
    } catch (error) {
        console.error('Error al crear cita:', error);
        res.status(500).json({ mensaje: 'Error al crear cita', error: error.message });
    }
};

exports.obtenerCitas = async (req, res) => {
    try {
        const userId = req.user.id;
        const connection = await pool.getConnection();
        const [citas] = await connection.query(
            'SELECT c.id, c.fecha, c.hora, c.estado, m.nombre AS mascota, u.nombre AS veterinario FROM cita c JOIN mascota m ON c.id_mascota = m.id LEFT JOIN usuario u ON c.id_veterinario = u.id WHERE c.id_usuario = ? ORDER BY c.fecha DESC',
            [userId]
        );
        connection.release();
        res.json(citas);
    } catch (error) {
        console.error('Error al obtener citas:', error);
        res.status(500).json({ mensaje: 'Error al obtener citas', error: error.message });
    }
};

exports.cancelarCita = async (req, res) => { 
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const connection = await pool.getConnection();
        // Verificar que la cita exista y pertenezca al usuario
        const [citas] = await connection.query(
            'SELECT id FROM cita WHERE id = ? AND id_usuario = ?',
            [id, userId]
        );
        if (citas.length === 0) {
            return res.status(404).json({ mensaje: 'La cita no fue encontrada o no pertenece al usuario' });
        }
        // Actualizar el estado de la cita
        await connection.query(
            'UPDATE cita SET estado = ? WHERE id = ?',
            ['cancelada', id]
        );
        connection.release();
        res.json({ mensaje: 'Cita cancelada exitosamente' });
    } catch (error) {
        console.error('Error al cancelar cita:', error);
        res.status(500).json({ mensaje: 'Error al cancelar cita', error: error.message });
    }
};

exports.editarCita = async (req, res) => {
    try {
        const { id } = req.params;
        const { fecha, hora } = req.body;
        const userId = req.user.id;
        if (!fecha || !hora) {
            return res.status(400).json({ mensaje: 'La fecha y la hora son requeridas' });
        }
        const connection = await pool.getConnection();
        // Verificar que la cita exista y pertenezca al usuario
        const [citas] = await connection.query(
            'SELECT id FROM cita WHERE id = ? AND id_usuario = ?',
            [id, userId]
        );
        if (citas.length === 0) {
            return res.status(404).json({ mensaje: 'La cita no fue encontrada o no pertenece al usuario' });
        }
        // Actualizar la cita
        await connection.query(
            'UPDATE cita SET fecha = ?, hora = ? WHERE id = ?',
            [fecha, hora, id]
        );
        connection.release();
        res.json({ mensaje: 'Cita actualizada exitosamente' });
    } catch (error) {
        console.error('Error al editar cita:', error);
        res.status(500).json({ mensaje: 'Error al editar cita', error: error.message });
    }
};

exports.obtenerCita = async (req, res) => {
    try {
        const { id } = req.params; 
        const userId = req.user.id;
        const connection = await pool.getConnection();
        const [citas] = await connection.query(
            'SELECT c.id, c.fecha, c.hora, c.estado, m.nombre AS mascota, u.nombre AS veterinario FROM cita c JOIN mascota m ON c.id_mascota = m.id LEFT JOIN usuario u ON c.id_veterinario = u.id WHERE c.id = ? AND c.id_usuario = ?',
            [id, userId]
        );
        connection.release();
        if (citas.length === 0) {
            return res.status(404).json({ mensaje: 'La cita no fue encontrada o no pertenece al usuario' });
        }
        res.json(citas[0]);
    } catch (error) {
        console.error('Error al obtener cita:', error);
        res.status(500).json({ mensaje: 'Error al obtener cita', error: error.message });
    }
};

exports.obtenerHistorial = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const connection = await pool.getConnection(); 
        // Verificar que la cita exista y pertenezca al usuario
        const [citas] = await connection.query(
            'SELECT id FROM cita WHERE id = ? AND id_usuario = ?',
            [id, userId]
        );
        if (citas.length === 0) {
            return res.status(404).json({ mensaje: 'La cita no fue encontrada o no pertenece al usuario' });
        }
        // Obtener el historial de la cita
        const [historial] = await connection.query(
            `SELECT
                con.id as consulta_id,
                con.diagnostico,
                con.observaciones,
                t.descripcion as tratamiento,
                t.medicamento,
                t.duracion
            FROM consulta con
            LEFT JOIN tratamiento t ON con.id_tratamiento = t.id
            WHERE con.id_cita = ?`,
            [id]
        );
        connection.release();
        res.json(historial);
    } catch (error) {
        console.error('Error al obtener historial de cita:', error);
        res.status(500).json({ mensaje: 'Error al obtener historial de cita', error: error.message });
    }
};

/**
 * Obtener horarios disponibles para un veterinario en una fecha específica
 * GET /api/citas/horarios-disponibles?veterinario_id=1&fecha=2024-04-21
 */
exports.obtenerHorariosDisponibles = async (req, res) => {
    try {
        const { veterinario_id, fecha } = req.query;

        if (!veterinario_id || !fecha) {
            return res.status(400).json({ 
                mensaje: 'Los parámetros veterinario_id y fecha son requeridos' 
            });
        }

        const connection = await pool.getConnection();

        // Obtener las citas ocupadas para ese veterinario en esa fecha
        const [citasOcupadas] = await connection.query(
            `SELECT hora FROM cita 
             WHERE id_veterinario = ? 
             AND fecha = ? 
             AND estado != 'cancelada'`,
            [veterinario_id, fecha]
        );

        connection.release();

        // Horarios disponibles: 8:00 a 18:00
        const horasOcupadas = citasOcupadas.map(c => c.hora);
        const horariosDisponibles = getHorariosDisponibles(8, 18, horasOcupadas);

        res.json({
            fecha: fecha,
            horarios_disponibles: horariosDisponibles,
            total: horariosDisponibles.length
        });
    } catch (error) {
        console.error('Error al obtener horarios disponibles:', error);
        res.status(500).json({ 
            mensaje: 'Error al obtener horarios disponibles', 
            error: error.message 
        });
    }
};