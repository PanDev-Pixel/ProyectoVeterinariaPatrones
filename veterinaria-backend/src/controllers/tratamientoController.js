// controllers/tratamientoController.js
const pool = require('../config/database');

/**
 * Crear un nuevo tratamiento
 * POST /api/tratamientos
 */
exports.crearTratamiento = async (req, res) => {
    try {
        const { descripcion, medicamento, duracion } = req.body;

        // Validar campos requeridos según tu BD
        if (!descripcion || !medicamento || !duracion) {
            return res.status(400).json({ 
                mensaje: 'Todos los campos son requeridos: descripcion, medicamento, duracion' 
            });
        }

        const connection = await pool.getConnection();

        const [resultado] = await connection.query(
            `INSERT INTO tratamiento (descripcion, medicamento, duracion) 
             VALUES (?, ?, ?)`,
            [descripcion, medicamento, duracion]
        );

        const [tratamientos] = await connection.query(
            'SELECT * FROM tratamiento WHERE id = ?',
            [resultado.insertId]
        );

        connection.release();

        res.status(201).json({
            mensaje: 'Tratamiento creado exitosamente',
            tratamiento: tratamientos[0]
        });

    } catch (error) {
        console.error('Error al crear tratamiento:', error);
        res.status(500).json({ 
            mensaje: 'Error al crear tratamiento', 
            error: error.message 
        });
    }
};

/**
 * Obtener todos los tratamientos
 * GET /api/tratamientos
 */
exports.obtenerTratamientos = async (req, res) => {
    try {
        const connection = await pool.getConnection();

        const [tratamientos] = await connection.query(
            `SELECT id, descripcion, medicamento, duracion 
             FROM tratamiento 
             ORDER BY descripcion ASC`
        );

        connection.release();
        res.json(tratamientos);

    } catch (error) {
        console.error('Error al obtener tratamientos:', error);
        res.status(500).json({ 
            mensaje: 'Error al obtener tratamientos', 
            error: error.message 
        });
    }
};

/**
 * Obtener un tratamiento específico
 * GET /api/tratamientos/:id
 */
exports.obtenerTratamiento = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();

        const [tratamientos] = await connection.query(
            `SELECT id, descripcion, medicamento, duracion 
             FROM tratamiento WHERE id = ?`,
            [id]
        );

        connection.release();

        if (tratamientos.length === 0) {
            return res.status(404).json({ mensaje: 'Tratamiento no encontrado' });
        }

        res.json(tratamientos[0]);

    } catch (error) {
        console.error('Error al obtener tratamiento:', error);
        res.status(500).json({ 
            mensaje: 'Error al obtener tratamiento', 
            error: error.message 
        });
    }
};

/**
 * Actualizar un tratamiento
 * PUT /api/tratamientos/:id
 */
exports.actualizarTratamiento = async (req, res) => {
    try {
        const { id } = req.params;
        const { descripcion, medicamento, duracion } = req.body;

        if (!descripcion || !medicamento || !duracion) {
            return res.status(400).json({ 
                mensaje: 'Todos los campos son requeridos: descripcion, medicamento, duracion' 
            });
        }

        const connection = await pool.getConnection();

        const [tratamientos] = await connection.query(
            'SELECT id FROM tratamiento WHERE id = ?',
            [id]
        );

        if (tratamientos.length === 0) {
            connection.release();
            return res.status(404).json({ mensaje: 'Tratamiento no encontrado' });
        }

        await connection.query(
            `UPDATE tratamiento 
             SET descripcion = ?, medicamento = ?, duracion = ? 
             WHERE id = ?`,
            [descripcion, medicamento, duracion, id]
        );

        const [tratamientoActualizado] = await connection.query(
            'SELECT * FROM tratamiento WHERE id = ?',
            [id]
        );

        connection.release();

        res.json({
            mensaje: 'Tratamiento actualizado exitosamente',
            tratamiento: tratamientoActualizado[0]
        });

    } catch (error) {
        console.error('Error al actualizar tratamiento:', error);
        res.status(500).json({ 
            mensaje: 'Error al actualizar tratamiento', 
            error: error.message 
        });
    }
};

/**
 * Eliminar un tratamiento
 * DELETE /api/tratamientos/:id
 */
exports.eliminarTratamiento = async (req, res) => {
    try {
        const { id } = req.params;
        const connection = await pool.getConnection();

        const [tratamientos] = await connection.query(
            'SELECT id FROM tratamiento WHERE id = ?',
            [id]
        );

        if (tratamientos.length === 0) {
            connection.release();
            return res.status(404).json({ mensaje: 'Tratamiento no encontrado' });
        }

        // Verificar si el tratamiento está siendo usado en consultas
        const [consultas] = await connection.query(
            'SELECT id FROM consulta WHERE id_tratamiento = ?',
            [id]
        );

        if (consultas.length > 0) {
            connection.release();
            return res.status(400).json({ 
                mensaje: 'No se puede eliminar el tratamiento porque está asociado a consultas médicas' 
            });
        }

        await connection.query('DELETE FROM tratamiento WHERE id = ?', [id]);

        connection.release();
        res.json({ mensaje: 'Tratamiento eliminado exitosamente' });

    } catch (error) {
        console.error('Error al eliminar tratamiento:', error);
        res.status(500).json({ 
            mensaje: 'Error al eliminar tratamiento', 
            error: error.message 
        });
    }
};