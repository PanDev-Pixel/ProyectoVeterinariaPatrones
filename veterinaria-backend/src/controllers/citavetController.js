const pool = require('../config/database');

exports.verCitas = async (req, res) => {
    try {
        const userId = req.user.id;
        const connection = await pool.getConnection();
        const [citas] = await connection.query(
            `SELECT c.id, c.fecha, c.hora, c.estado, v.especialidad, u.nombre as veterinario, m.nombre as mascotaNombre, usu.nombre as dueno_mascota, usu.tel
             FROM cita c
             JOIN veterinario v ON c.id_veterinario = v.id_usuario
             LEFT JOIN usuario u ON v.id_usuario = u.id
             JOIN mascota m ON c.id_mascota = m.id
             JOIN usuario usu ON c.id_usuario = usu.id
             WHERE c.id_veterinario = ?
             ORDER BY c.fecha DESC`,
            [userId]
        );
        connection.release();
        res.json(citas);
    } catch (error) {
        console.error('Error al obtener citas:', error);
        res.status(500).json({ mensaje: 'Error al obtener citas', error: error.message });
    }
};
exports.registrarConsulta = async (req, res) => {
    try {
        const { id } = req.params;
        const { diagnostico, observaciones, id_tratamiento } = req.body;
        const userId = req.user.id;
        const connection = await pool.getConnection();
        
        console.log('📋 [REGISTRAR CONSULTA] Datos recibidos del frontend:');
        console.log('   - id_cita:', id);
        console.log('   - diagnostico:', diagnostico);
        console.log('   - observaciones:', observaciones);
        console.log('   - id_tratamiento:', id_tratamiento);
        console.log('   - tipo de id_tratamiento:', typeof id_tratamiento);
        console.log('   - req.body completo:', req.body);

        // Validar campos requeridos
        if (!diagnostico || !observaciones) {
            connection.release();
            return res.status(400).json({
                mensaje: 'Campos requeridos: diagnostico, observaciones'
            });
        }

        // Verificar que la cita exista y pertenezca al veterinario
        const [cita] = await connection.query(
            `SELECT id FROM cita WHERE id = ? AND id_veterinario = ?`,
            [id, userId]
        );

        if (cita.length === 0) {
            connection.release();
            return res.status(404).json({
                mensaje: 'Cita no encontrada o no autorizada'
            });
        }

        // Si hay id_tratamiento, verificar que existe
        if (id_tratamiento) {
            console.log('🔍 [REGISTRAR CONSULTA] Verificando existencia de tratamiento ID:', id_tratamiento);
            const [tratamientos] = await connection.query(
                'SELECT id FROM tratamiento WHERE id = ?',
                [id_tratamiento]
            );

            if (tratamientos.length === 0) {
                console.error('❌ [REGISTRAR CONSULTA] Tratamiento no encontrado:', id_tratamiento);
                connection.release();
                return res.status(404).json({
                    mensaje: 'El tratamiento no fue encontrado'
                });
            }
            console.log('✅ [REGISTRAR CONSULTA] Tratamiento verificado exitosamente');
        } else {
            console.log('ℹ️  [REGISTRAR CONSULTA] Sin tratamiento (id_tratamiento es null/undefined)');
        }

        // Insertar la consulta con estructura correcta
        console.log('💾 [REGISTRAR CONSULTA] Insertando en BD con id_tratamiento:', id_tratamiento || null);
        
        await connection.query(
            `INSERT INTO consulta (id_cita, diagnostico, observaciones, id_tratamiento)
             VALUES (?, ?, ?, ?)`,
            [id, diagnostico, observaciones, id_tratamiento || null]
        );

        // Actualizar el estado de la cita a 'completada'
        await connection.query(
            `UPDATE cita SET estado = 'completada' WHERE id = ?`,
            [id]
        );
        
        console.log('✅ [REGISTRAR CONSULTA] Consulta registrada exitosamente en BD');
        console.log('   - ID de tratamiento guardado:', id_tratamiento || null);

        connection.release();
        res.status(201).json({
            mensaje: 'Consulta registrada exitosamente',
            cita_id: id,
            estado: 'completada',
            id_tratamiento: id_tratamiento || null
        });
    } catch (error) {
        console.error('Error al registrar consulta:', error);
        res.status(500).json({
            mensaje: 'Error al registrar consulta',
            error: error.message
        });
    }
};
exports.verConsultas = async (req, res) => {
    try {
        const userId = req.user.id;
        const connection = await pool.getConnection();
        const [consultas] = await connection.query(
            `SELECT * FROM consulta WHERE id_cita IN (SELECT id FROM cita WHERE id_veterinario = ?)`,
            [userId]
        );
        connection.release();
        res.json(consultas);
    } catch (error) {
        console.error('Error al obtener consultas:', error);
        res.status(500).json({ mensaje: 'Error al obtener consultas', error: error.message });
    }
};

exports.verConsultaDetalle = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const connection = await pool.getConnection();
        const [consulta] = await connection.query(
            `SELECT c.id, c.diagnostico, c.observaciones,
                    t.descripcion as tratamiento, t.medicamento, t.duracion,
                    ci.fecha, ci.hora, ci.estado,
                    v.especialidad, u.nombre as veterinario, m.nombre as mascota, usu.nombre as dueno_mascota, usu.tel
                FROM consulta c
                JOIN cita ci ON c.id_cita = ci.id
                JOIN veterinario v ON ci.id_veterinario = v.id_usuario
                LEFT JOIN usuario u ON v.id_usuario = u.id
                JOIN mascota m ON ci.id_mascota = m.id
                JOIN usuario usu ON ci.id_usuario = usu.id
                LEFT JOIN tratamiento t ON c.id_tratamiento = t.id
                WHERE c.id = ? AND ci.id_veterinario = ?`,
            [id, userId]
        );
        if (consulta.length === 0) {
            connection.release();
            return res.status(404).json({ mensaje: 'Consulta no encontrada o no autorizada' });
        }
        connection.release();
        res.json(consulta[0]);
    } catch (error) {
        console.error('Error al obtener detalle de consulta:', error);
        res.status(500).json({ mensaje: 'Error al obtener detalle de consulta', error: error.message });
    }
};
