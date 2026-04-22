const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

exports.registro = async (req, res) => {
  try {
    const { nombre, email, contraseña, tel, dic } = req.body;

    // Validar campo requerido
    if (!nombre || !email || !contraseña || !tel || !dic) {
      return res.status(400).json({ mensaje: 'Todos los campos son requeridos' });
    }

    const connection = await pool.getConnection();

    // Verificar si el usuario ya existe
    const [usuariosExistentes] = await connection.query(
      'SELECT id FROM usuario WHERE email = ?',
      [email]
    );

    if (usuariosExistentes.length > 0) {
      connection.release();
      return res.status(400).json({ mensaje: 'El email ya está registrado' });
    }

    // Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const contraseñaHasheada = await bcrypt.hash(contraseña, salt);

    // Insertar nuevo usuario
    await connection.query(
      'INSERT INTO usuario (nombre, email, contraseña, tel, dic, rol) VALUES (?, ?, ?, ?, ?, ?)',
      [nombre, email, contraseñaHasheada, tel, dic, 'usuario']
    );

    connection.release();
    res.status(201).json({ mensaje: 'Usuario registrado exitosamente' });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ mensaje: 'Error al registrar usuario', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, contraseña } = req.body;

    if (!email || !contraseña) {
      return res.status(400).json({ mensaje: 'Email y contraseña son requeridos' });
    }

    const connection = await pool.getConnection();

    // Buscar usuario por email
    const [usuarios] = await connection.query(
      'SELECT id, email, contraseña, nombre, rol FROM usuario WHERE email = ? AND activo = 1',
      [email]
    );

    connection.release();

    if (usuarios.length === 0) {
      return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos' });
    }

    const usuario = usuarios[0];

    // Verificar contraseña
    const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña);

    if (!contraseñaValida) {
      return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos' });
    }

    // Generar JWT
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ mensaje: 'Error al iniciar sesión', error: error.message });
  }
};

exports.perfil = async (req, res) => {
  try {
    const userId = req.user.id;
    const connection = await pool.getConnection();

    const [usuarios] = await connection.query(
      'SELECT id, nombre, email, tel, dic, rol, fecha_registro FROM usuario WHERE id = ?',
      [userId]
    );

    connection.release();

    if (usuarios.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const usuario = usuarios[0];

    // Si es veterinario, agregar especialidad
    if (usuario.rol === 'veterinario') {
      const connection2 = await pool.getConnection();
      const [vets] = await connection2.query(
        'SELECT especialidad FROM veterinario WHERE id_usuario = ?',
        [userId]
      );
      connection2.release();
      
      if (vets.length > 0) {
        usuario.especialidad = vets[0].especialidad;
      }
    }

    res.json(usuario);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ mensaje: 'Error al obtener perfil', error: error.message });
  }
};
