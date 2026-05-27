function createRepository(pool, table) {
  return {
    findAll: async () => {
      const connection = await pool.getConnection();
      const [rows] = await connection.query(
        `SELECT m.id, m.nombre, m.especie, m.raza, m.edad, u.nombre as dueno_mascota, u.tel, u.email
         FROM ${table} m
         JOIN usuario u ON m.id_usuario = u.id
         ORDER BY m.nombre`
      );
      connection.release();
      return rows;
    },

    findById: async (id) => {
      const connection = await pool.getConnection();
      const [rows] = await connection.query(
        `SELECT m.id, m.nombre, m.especie, m.raza, m.edad, u.nombre as dueno_mascota, u.tel, u.email
         FROM ${table} m
         JOIN usuario u ON m.id_usuario = u.id
         WHERE m.id = ?`,
        [id]
      );
      connection.release();
      return rows;
    },

    searchByNameOrOwner: async (q) => {
      const connection = await pool.getConnection();
      const [rows] = await connection.query(
        `SELECT m.id, m.nombre, m.especie, m.raza, m.edad, u.nombre as dueno_mascota, u.tel, u.email
         FROM ${table} m
         JOIN usuario u ON m.id_usuario = u.id
         WHERE m.nombre LIKE ? OR u.nombre LIKE ?
         ORDER BY m.nombre`,
        [`%${q}%`, `%${q}%`]
      );
      connection.release();
      return rows;
    }
  };
}

module.exports = { createRepository };