const verificarVeterinario = (req, res, next) => {
  try {
    // Verificar si el usuario está autenticado
    if (!req.user) {
      return res.status(401).json({ 
        mensaje: 'No autorizado. Debe iniciar sesión.' 
      });
    }

    // Verificar si el usuario tiene rol de veterinario
    if (req.user.rol !== 'veterinario') {
      return res.status(403).json({ 
        mensaje: 'Acceso denegado. Solo los veterinarios pueden acceder a esta página.' 
      });
    }

    // Si pasa las validaciones, continuar al siguiente middleware/ruta
    next();
  } catch (error) {
    return res.status(500).json({ 
      mensaje: 'Error en la verificación de permisos',
      error: error.message 
    });
  }
};

module.exports = { verificarVeterinario };
