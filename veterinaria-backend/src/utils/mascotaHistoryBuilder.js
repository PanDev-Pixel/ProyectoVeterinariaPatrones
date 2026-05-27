// Builder pattern for constructing the mascota historial SQL and params
// Uso: const builder = new MascotaHistoryBuilder().forMascota(id); const { sql, params } = builder.build();

class MascotaHistoryBuilder {
  constructor() {
    this.wheres = [];
    this.params = [];
  }

  forMascota(id) {
    this.wheres.push('c.id_mascota = ?');
    this.params.push(id);
    return this;
  }

  build() {
    const whereClause = this.wheres.length ? `WHERE ${this.wheres.join(' AND ')}` : '';
    const sql = `SELECT 
                c.id as cita_id,
                c.fecha,
                c.hora,
                c.estado,
                u.nombre as veterinario,
                v.especialidad,
                con.id as consulta_id,
                con.diagnostico,
                con.observaciones,
                t.descripcion as tratamiento,
                t.medicamento,
                t.duracion
             FROM cita c
             JOIN usuario u ON c.id_veterinario = u.id
             JOIN veterinario v ON c.id_veterinario = v.id_usuario
             LEFT JOIN consulta con ON c.id = con.id_cita
             LEFT JOIN tratamiento t ON con.id_tratamiento = t.id
             ${whereClause}
             ORDER BY c.fecha DESC`;

    return { sql, params: this.params };
  }
}

module.exports = MascotaHistoryBuilder;