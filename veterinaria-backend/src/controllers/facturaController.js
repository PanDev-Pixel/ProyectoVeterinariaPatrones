const pool = require('../config/database');

/**
 * Crear una nueva factura
 * POST /api/facturas
 */
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

        // Verificar que la consulta existe y pertenece al usuario
        const [consultas] = await connection.query(
            `SELECT con.id, c.id_usuario FROM consulta con
             JOIN cita c ON con.id_cita = c.id
             WHERE con.id = ? AND c.id_usuario = ?`,
            [id_consulta, userId]
        );

        if (consultas.length === 0) {
            connection.release();
            return res.status(404).json({
                mensaje: 'Consulta no encontrada o no autorizada'
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
                return res.status(404).json({
                    mensaje: 'Tratamiento no encontrado'
                });
            }
        }

        // Crear la factura
        const fecha = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
        
        const [resultado] = await connection.query(
            `INSERT INTO factura (id_usuario, id_consulta, id_tratamiento, fecha, total)
             VALUES (?, ?, ?, ?, ?)`,
            [userId, id_consulta, id_tratamiento || null, fecha, total]
        );

        // Obtener la factura creada con detalles
        const [facturas] = await connection.query(
            `SELECT f.id, f.id_usuario, f.id_consulta, f.id_tratamiento, f.fecha, f.total,
                    con.diagnostico, con.observaciones,
                    t.descripcion as tratamiento_desc, t.medicamento, t.duracion,
                    u.nombre as usuario_nombre, u.email
             FROM factura f
             LEFT JOIN consulta con ON f.id_consulta = con.id
             LEFT JOIN tratamiento t ON f.id_tratamiento = t.id
             JOIN usuario u ON f.id_usuario = u.id
             WHERE f.id = ?`,
            [resultado.insertId]
        );

        connection.release();
        
        console.log('✅ [CREAR FACTURA] Factura creada con ID:', resultado.insertId);
        
        res.status(201).json({
            mensaje: 'Factura creada exitosamente',
            factura: facturas[0]
        });

    } catch (error) {
        console.error('Error al crear factura:', error);
        res.status(500).json({
            mensaje: 'Error al crear factura',
            error: error.message
        });
    }
};

/**
 * Obtener todas las facturas del usuario
 * GET /api/facturas
 */
exports.obtenerFacturas = async (req, res) => {
    try {
        const userId = req.user.id;
        const connection = await pool.getConnection();

        const [facturas] = await connection.query(
            `SELECT f.id, f.fecha, f.total,
                    con.diagnostico, con.observaciones,
                    m.nombre as mascota,
                    t.descripcion as tratamiento,
                    u.nombre as usuario_nombre
             FROM factura f
             LEFT JOIN consulta con ON f.id_consulta = con.id
             LEFT JOIN cita c ON con.id_cita = c.id
             LEFT JOIN mascota m ON c.id_mascota = m.id
             LEFT JOIN tratamiento t ON f.id_tratamiento = t.id
             JOIN usuario u ON f.id_usuario = u.id
             WHERE f.id_usuario = ?
             ORDER BY f.fecha DESC`,
            [userId]
        );

        connection.release();
        res.json(facturas);

    } catch (error) {
        console.error('Error al obtener facturas:', error);
        res.status(500).json({
            mensaje: 'Error al obtener facturas',
            error: error.message
        });
    }
};

/**
 * Obtener detalle de una factura específica
 * GET /api/facturas/:id
 */
exports.obtenerFactura = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const connection = await pool.getConnection();

        const [facturas] = await connection.query(
            `SELECT f.id, f.id_usuario, f.id_consulta, f.id_tratamiento, f.fecha, f.total,
                    con.id as consulta_id, con.diagnostico, con.observaciones,
                    c.fecha as cita_fecha, c.hora as cita_hora,
                    m.id as mascota_id, m.nombre as mascota_nombre, m.especie, m.raza, m.edad,
                    v.especialidad,
                    u.nombre as veterinario_nombre,
                    dueno.nombre as dueno_nombre, dueno.email, dueno.tel,
                    t.id as tratamiento_id, t.descripcion as tratamiento_desc, t.medicamento, t.duracion,
                    usuario.nombre as usuario_nombre, usuario.email as usuario_email
             FROM factura f
             LEFT JOIN consulta con ON f.id_consulta = con.id
             LEFT JOIN cita c ON con.id_cita = c.id
             LEFT JOIN mascota m ON c.id_mascota = m.id
             LEFT JOIN veterinario v ON c.id_veterinario = v.id_usuario
             LEFT JOIN usuario u ON v.id_usuario = u.id
             LEFT JOIN usuario dueno ON c.id_usuario = dueno.id
             LEFT JOIN tratamiento t ON f.id_tratamiento = t.id
             JOIN usuario usuario ON f.id_usuario = usuario.id
             WHERE f.id = ? AND f.id_usuario = ?`,
            [id, userId]
        );

        connection.release();

        if (facturas.length === 0) {
            return res.status(404).json({
                mensaje: 'Factura no encontrada o no autorizada'
            });
        }

        res.json(facturas[0]);

    } catch (error) {
        console.error('Error al obtener factura:', error);
        res.status(500).json({
            mensaje: 'Error al obtener factura',
            error: error.message
        });
    }
};

/**
 * Actualizar una factura
 * PUT /api/facturas/:id
 */
exports.actualizarFactura = async (req, res) => {
    try {
        const { id } = req.params;
        const { total } = req.body;
        const userId = req.user.id;
        const connection = await pool.getConnection();

        if (!total) {
            connection.release();
            return res.status(400).json({
                mensaje: 'El campo total es requerido'
            });
        }

        // Verificar que la factura existe y pertenece al usuario
        const [facturas] = await connection.query(
            'SELECT id FROM factura WHERE id = ? AND id_usuario = ?',
            [id, userId]
        );

        if (facturas.length === 0) {
            connection.release();
            return res.status(404).json({
                mensaje: 'Factura no encontrada o no autorizada'
            });
        }

        // Actualizar factura
        await connection.query(
            'UPDATE factura SET total = ? WHERE id = ?',
            [total, id]
        );

        // Obtener factura actualizada
        const [facturasActualizadas] = await connection.query(
            `SELECT f.id, f.fecha, f.total, con.diagnostico
             FROM factura f
             LEFT JOIN consulta con ON f.id_consulta = con.id
             WHERE f.id = ?`,
            [id]
        );

        connection.release();

        console.log('✅ [ACTUALIZAR FACTURA] Factura actualizada con ID:', id);

        res.json({
            mensaje: 'Factura actualizada exitosamente',
            factura: facturasActualizadas[0]
        });

    } catch (error) {
        console.error('Error al actualizar factura:', error);
        res.status(500).json({
            mensaje: 'Error al actualizar factura',
            error: error.message
        });
    }
};

/**
 * Eliminar una factura
 * DELETE /api/facturas/:id
 */
exports.eliminarFactura = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const connection = await pool.getConnection();

        // Verificar que la factura existe y pertenece al usuario
        const [facturas] = await connection.query(
            'SELECT id FROM factura WHERE id = ? AND id_usuario = ?',
            [id, userId]
        );

        if (facturas.length === 0) {
            connection.release();
            return res.status(404).json({
                mensaje: 'Factura no encontrada o no autorizada'
            });
        }

        // Eliminar factura
        await connection.query(
            'DELETE FROM factura WHERE id = ?',
            [id]
        );

        connection.release();

        console.log('✅ [ELIMINAR FACTURA] Factura eliminada con ID:', id);

        res.json({
            mensaje: 'Factura eliminada exitosamente'
        });

    } catch (error) {
        console.error('Error al eliminar factura:', error);
        res.status(500).json({
            mensaje: 'Error al eliminar factura',
            error: error.message
        });
    }
};

/**
 * Obtener facturas por consulta (para generar factura desde consulta)
 * GET /api/facturas/consulta/:id_consulta
 */
exports.obtenerFacturasPorConsulta = async (req, res) => {
    try {
        const { id_consulta } = req.params;
        const userId = req.user.id;
        const connection = await pool.getConnection();

        const [facturas] = await connection.query(
            `SELECT f.id, f.fecha, f.total
             FROM factura f
             LEFT JOIN consulta con ON f.id_consulta = con.id
             LEFT JOIN cita c ON con.id_cita = c.id
             WHERE f.id_consulta = ? AND c.id_usuario = ?`,
            [id_consulta, userId]
        );

        connection.release();
        res.json(facturas);

    } catch (error) {
        console.error('Error al obtener facturas por consulta:', error);
        res.status(500).json({
            mensaje: 'Error al obtener facturas',
            error: error.message
        });
    }
};
